import EthAbi from 'ethabi-js';
import Signer from './signer';
import ethUtil from 'ethereumjs-util';
import base64url  from 'base64url';
import sigFormatter from 'ecdsa-sig-formatter';
import Signature from './util/signature';

export default class EthApi {
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

  static parse(token) {
    //parse payload
    var tokenParts = token.split('.'),
      payload = JSON.parse(base64url.decode(tokenParts[1])),
      values = [],
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
      values.push(entry[Object.keys(entry)[0]])
    });

    //rebuild signed data
    var abi = new EthAbi([abiObj]),
      tokens = abi.encodeTokens(abi.functions[0].inputParamTypes(), values),
      encoded = new Buffer(abi.functions[0].encodeCall(tokens), 'hex'),
      hash = ethUtil.sha3(encoded);

    //parse signature
    var derSignature = sigFormatter.joseToDer(tokenParts[2], 'ES256'),
      sig = new Signature(derSignature, 'ES256'),
      r = new Buffer(sig.r.toString('hex'), 'hex'),
      s = new Buffer(sig.s.toString('hex'), 'hex'),
      pub = ethUtil.ecrecover(hash, sig.recoveryParam + 27, r, s),
      signer = '0x' + ethUtil.pubToAddress(pub).toString('hex');

    return {
      header: JSON.parse(base64url.decode(tokenParts[0])),
      abi: [abiObj],
      values: values,
      signer: signer
    }
  }
}
