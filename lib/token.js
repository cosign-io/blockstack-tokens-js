import EthAbi from './ethAbi';
import Signer from './signer';
import ethUtil from 'ethereumjs-util';
import base64url  from 'base64url';
import sigFormatter from 'ecdsa-sig-formatter';
import Signature from './util/signature';
import BN from 'bn.js';
import { checkConversion } from './util/types';

export default class Token {
  constructor(abi) {
    if (!abi) {
      throw new Error('Object ABI needs to be provided to Token instance');
    }

    this._abi = new EthAbi(abi);
    this._abiObj = abi;

    this._abi.functions.forEach( (func) => {
      var functionAbi;
      this._abiObj.forEach( (elem) => {
        if (elem.name == func.name)
          functionAbi = elem;
      });
      this[func.name] = function() {
        return new Signer(arguments, functionAbi);
      }.bind(this);
    });
  }

  get functions() {
    return this._functions;
  }

  get abi() {
    return this._abi;
  }

  static concat(address, amount) {
    var addr = new Buffer(address.replace('0x',''), 'hex');
    return Buffer.concat([addr, ethUtil.setLength(amount, 12)]);
  }

  static separate(bytes32String) {
    var val = new Buffer(bytes32String.replace('0x',''), 'hex');
    return {
      address: '0x' + val.slice(0, 20).toString('hex'),
      amount: new BN(val.slice(21, 32)).toNumber()
    }
  }

  static parseToHex(token) {
    //parse payload
    var tokenParts = token.split('.'),
      payload = JSON.parse(base64url.decode(tokenParts[1])),
      byteValues = [], values = [],
      abiObj = {
        type: 'function', 
        name: Object.keys(payload)[0],
        inputs: []
      };

    //rebuild abi and values
    payload[abiObj.name].forEach( (entry) => {
      var input = {};
      input.type = Object.keys(entry)[0];
      abiObj.inputs.push(input);
      values.push(entry[Object.keys(entry)[0]]);
      byteValues.push(checkConversion(entry[Object.keys(entry)[0]], input.type));
    });

    //rebuild signed data
    var abi = new EthAbi([abiObj]),
      tokens = abi.encodeTokens(abi.functions[0].inputParamTypes(), byteValues),
      encoded = new Buffer(abi.functions[0].encodeCall(tokens), 'hex');

    //parse signature
    var derSignature = sigFormatter.joseToDer(tokenParts[2], 'ES256'),
      sig = new Signature(derSignature, 'ES256'),
      r = sig.r.toBuffer('be', 32),
      s = sig.s.toBuffer('be', 32),
      v = payload.v + 27;
    return {
      rec: encoded.toString('hex'),
      sig: Buffer.concat([r, s]).toString('hex') + v.toString(16)
    }
  }

  static parse(token) {
    //parse payload
    var tokenParts = token.split('.'),
      payload = JSON.parse(base64url.decode(tokenParts[1])),
      byteValues = [], values = [],
      abiObj = {
        type: 'function', 
        name: Object.keys(payload)[0],
        inputs: []
      };

    //rebuild abi and values
    payload[abiObj.name].forEach( (entry) => {
      var input = {};
      input.type = Object.keys(entry)[0];
      abiObj.inputs.push(input);
      values.push(entry[Object.keys(entry)[0]]);
      byteValues.push(checkConversion(entry[Object.keys(entry)[0]], input.type));
    });

    //rebuild signed data
    var abi = new EthAbi([abiObj]),
      tokens = abi.encodeTokens(abi.functions[0].inputParamTypes(), byteValues),
      encoded = new Buffer(abi.functions[0].encodeCall(tokens), 'hex'),
      hash = ethUtil.sha3(encoded);

    //parse signature
    var derSignature = sigFormatter.joseToDer(tokenParts[2], 'ES256'),
      sig = new Signature(derSignature, 'ES256'),
      r = sig.r.toBuffer('be', 32),
      s = sig.s.toBuffer('be', 32),
      pub = ethUtil.ecrecover(hash, payload.v + 27, r, s),
      signer = '0x' + ethUtil.pubToAddress(pub).toString('hex');

    return {
      header: JSON.parse(base64url.decode(tokenParts[0])),
      abi: [abiObj],
      values: values,
      signer: signer
    }
  }
}
