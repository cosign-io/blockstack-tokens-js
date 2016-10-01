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

  get body() {
    var types = this._abi.functions[0].inputParamTypes();
    var tokens = this._abi.encodeTokens(types, this._values);
    var raw = this._abi.functions[0].encodeCall(tokens);
    return {
      raw: raw,
      length: raw.length / 2,
      body: JSON.stringify(this._body)
    }     
  }

  get compressed() {
    var types = this._abi.functions[0].inputParamTypes();
    const tokens = this._abi.encodeTokens(types, this._values);
    var encoded = this._abi.functions[0].encodeCall(tokens);
    var newLength = 4;
    for (var i = 0; i < types.length; i++ ) {
      if (types[i]._type == 'address') {
        newLength += 20;
        types[i]._length = 20;
      } else if (types[i]._type == 'uint' || types[i]._type == 'int') {
        newLength += types[i]._length / 8;
        types[i]._length = types[i]._length / 8;
      } else if (types[i]._length) {
        newLength += types[i]._length;
      } else {
        newLength += 32;
      }
    }
    var nonceBuffer = new Buffer(newLength);
    nonceBuffer.fill(0);
    nonceBuffer.write(encoded.substring(0, 8), 'hex');
    
    var pos = 8, writePos = 4;
    for (i = 0; i < types.length; i++ ) {
      pos += (32 - types[i]._length) * 2;
      var write = encoded.substring(pos, pos + (types[i]._length * 2));
      pos += types[i]._length * 2;
      nonceBuffer.write(write, writePos, types[i]._length, 'hex');
      writePos += types[i]._length;
    }
    return tokens;
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
      s: sig.s
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
