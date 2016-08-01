
var expect = require('chai').expect;

var TokenSigner = require('./index').TokenSigner;
var TokenVerifier = require('./index').TokenVerifier;
var decodeToken = require('./index').decodeToken;
var MissingParametersError = require('./index').MissingParametersError;

var rawPrivateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f';
//this priv key should belong to => addr: 0xf3beac30c498d9e26865f34fcaa57dbb935b0d74
var sampleDecodedToken = {
    header : {
      alg: 'ES256K',
      typ: 'EWT'
    },
    payload : {
        nonce: 1234,
        val: 'test'
    }
    //this should produce:
    //sha3(1234, "test");
    //-> 0x5cd5ad1ce00bed4f85eec5d63baac2ce09a5ddc4918aaa5dcc1551d81527d4f7

};
var sampleSig = 'fuDmK0boDu4O7VFdb7FaW1_0HmBksOTMD6gU1nz0wlkKIqMMKL2162x7okbwrVneSPOPZTat1X_mUI6Zw7kBoQ';
// encoded in JOSE
//r = 0x7ee0e62b46e80eee0eed515d6fb15a5b5ff41e6064b0e4cc0fa814d67cf4c259
//s = 0x0a22a30c28bdb5eb6c7ba246f0ad59de48f38f6536add57fe6508e99c3b901a1
//v = 27

var sampleDecodedToken2 = {
    header : {
      alg: 'ES256K',
      typ: 'EWT'
    },
    payload : {
        val: '0x692a70d2e424a56d2c6c27aa97d1a86395877b3a',
        nonce: 123456789
    }
    //this should produce:
    //sha3(123456789, "0x692a70d2e424a56d2c6c27aa97d1a86395877b3a");
    //-> 0xe7665252ce46375d48da614659f990aa95d574b8c281047fa5d5dc4d9858c424
};
var sampleSig2 = 'rAZ-20Co5mF2Gq8LksSLZAfKB0aszMtSX-RC0Y8mRkY6G9Giy--XB_1yQ6nf2c0FIPbgpmTI8ySnGqXX3cbBQQ';
//r = ac067edb40a8e661761aaf0b92c48b6407ca0746accccb525fe442d18f264646
//s = 3a1bd1a2cbef9707fd7243a9dfd9cd0520f6e0a664c8f324a71aa5d7ddc6c141
//v = 28

describe('TokenSigner', function() {

  it('should sign a message so it can be verified in solidity.', function(done) {
    var tokenSigner = new TokenSigner('ES256K', rawPrivateKey);
    var token = tokenSigner.sign(sampleDecodedToken.payload);
    var decodedToken = decodeToken(token);
    expect(decodedToken.signature).to.eql(sampleSig);
    expect(decodedToken.payload).to.eql(sampleDecodedToken.payload);
    expect(decodedToken.header).to.eql(sampleDecodedToken.header);
    done();
  });

  it('should sign a setup request so it can be verified in solidity.', function(done) {
    var tokenSigner = new TokenSigner('ES256K', rawPrivateKey);
    var token = tokenSigner.sign(sampleDecodedToken2.payload);
    var decodedToken = decodeToken(token);
    expect(decodedToken.signature).to.eql(sampleSig2);
    expect(decodedToken.payload).to.eql(sampleDecodedToken2.payload);
    expect(decodedToken.header).to.eql(sampleDecodedToken2.header);
    done();
  });
});

// test('TokenVerifier', function(t) {
//     t.plan(2)

//     var tokenVerifier = new TokenVerifier('ES256K', rawPublicKey)
//     t.ok(tokenVerifier, 'token verifier should have been created')
    
//     var verified = tokenVerifier.verify(sampleToken)
//     t.equal(verified, true, 'token should have been verified')
// })

// test('decodeToken', function(t) {
//     t.plan(2)

//     var decodedToken = decodeToken(sampleToken)
//     t.ok(decodedToken, 'token should have been decoded')
//     t.equal(JSON.stringify(decodedToken.payload), JSON.stringify(sampleDecodedToken.payload), 'decodedToken payload should match the reference payload')
// })

// test('SECP256K1Client', function(t) {
//     t.plan(2)

//     var derivedRawPublicKey = SECP256K1Client.privateKeyToPublicKey(rawPrivateKey)
//     t.ok(derivedRawPublicKey, 'raw public key should have been derived')
//     t.equal(derivedRawPublicKey, rawPublicKey, 'derived raw public key should match the reference value')
// })
