'use strict'

var base64url = require('base64url');
var ethUtil = require('ethereumjs-util');
var decodeToken = require('./decode');
var Signature = require('./signature');
var sigFormatter = require('ecdsa-sig-formatter');
var Web3 = require('web3');

function TokenSigner(signingAlgorithm, rawPrivateKey) {
  if (!(signingAlgorithm && rawPrivateKey)) {
    throw new MissingParametersError('a signing algorithm and private key are required');
  }
  if (typeof signingAlgorithm !== 'string') {
    throw 'signing algorithm parameter must be a string';
  }
  signingAlgorithm = signingAlgorithm.toUpperCase();
  this.tokenType = 'EWT';
  this.algorithmName = 'ES256K';
  this.privKey = new Buffer(rawPrivateKey, 'hex');
  if (!ethUtil.isValidPrivate(this.privKey)) {
    throw 'priv key invalid';
  }
}

TokenSigner.prototype.header = function() {
  return {typ: this.tokenType, alg: this.algorithmName};
}

TokenSigner.prototype.padLeft = function (string, chars, sign) {
  return new Array(chars - string.length + 1).join(sign ? sign : "0") + string;
};

TokenSigner.prototype.createHash = function(payload) {
  var values = [];
  for (var property in payload) {
    if (payload.hasOwnProperty(property)) {
      var prop = payload[property];
      //number
      if (Number(prop) === prop && prop % 1 === 0) {
        var web3 = new Web3();
        var val = this.padLeft(web3.toBigNumber(prop).round().toString(16), 64);
        values.push(new Buffer(val, 'hex'));
      //string
      } else if (typeof prop == 'string') {
        if (prop.indexOf('0x') == 0 && prop.length == 42) {
          //most likely an address
          prop = prop.replace('0x', '');
          //var addr = this.padLeft(prop, 64);
          var addr = prop;
          values.push(new Buffer(addr, 'hex'));
        } else {
          values.push(new Buffer(prop, 'utf-8'));
        }
      } else {
        throw 'type not implemented';
      }
    }
  }
  console.dir(values);
  return ethUtil.sha3( Buffer.concat(values));
}

TokenSigner.prototype.sign = function(payload) {
  var tokenParts = [];

  // add in the header
  var encodedHeader = base64url.encode(JSON.stringify(this.header()))
  tokenParts.push(encodedHeader)

  // add in the payload
  var encodedPayload = base64url.encode(JSON.stringify(payload))
  tokenParts.push(encodedPayload)

  // prepare the message
  var opHash = this.createHash(payload);
  console.log(opHash.toString('hex'));

  // sign the message and add in the signature
  var sig = ethUtil.ecsign(opHash, this.privKey);
  console.log(sig.r.toString('hex'));
  console.log(sig.s.toString('hex'));
  console.log(sig.v);
  var signature = new Signature({
    r: sig.r,
    s: sig.s,
    recoveryParam: sig.v - 27
  }, 'secp256k1');
  var derSignature = new Buffer(signature.toDER());

  tokenParts.push(sigFormatter.derToJose(derSignature, 'ES256'));

  // return the token
  return tokenParts.join('.');
}

module.exports = TokenSigner