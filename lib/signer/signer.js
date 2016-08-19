import EthAbi from 'ethabi-js';
import ethUtil from 'ethereumjs-util';
import Signature from '../util/signature';
import sigFormatter from 'ecdsa-sig-formatter';
import base64url  from 'base64url';
import { checkConversion } from '../util/types';

export default class Token {
  constructor(values, functionAbi) {
    this._header = {
      type: 'EWT',
      alg: 'ES256k'
    }
    this._abi = new EthAbi([functionAbi]);
    this._values = values;

    var body = {};
    body[functionAbi.name] = [];
    functionAbi.inputs.forEach( (input, index) => {
      var item = {};
      item[input.type] = values[index];
      body[functionAbi.name].push(item);

      //improve some mappings for convenience
      values[index] = checkConversion(values[index], input.type);
    });
    this._body = body;
  }


  get values() {
    return this._values;
  }

  get abi() {
    return this._abi;
  }

  sign(signerKey) {
    var tokenParts = [];

    // add in the header
    var encodedHeader = base64url.encode(JSON.stringify(this._header));
    tokenParts.push(encodedHeader);
    
    // add the sig
    var priv = new Buffer(signerKey.replace('0x',''), 'hex');
    const tokens = this._abi.encodeTokens(this._abi.functions[0].inputParamTypes(), this._values);
    var encoded = new Buffer(this._abi.functions[0].encodeCall(tokens), 'hex');
    var hash = ethUtil.sha3(encoded);
    var sig = ethUtil.ecsign(hash, priv);
    var signature = new Signature({
      r: sig.r,
      s: sig.s,
      recoveryParam: sig.v - 27
    }, 'secp256k1');
    var derSignature = new Buffer(signature.toDER());

    // add the body
    this._body.v = sig.v - 27;
    var encodedBody = base64url.encode(JSON.stringify(this._body));
    tokenParts.push(encodedBody);

    tokenParts.push(sigFormatter.derToJose(derSignature, 'ES256'));

    // return the token
    return tokenParts.join('.');
  }

}
