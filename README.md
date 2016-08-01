# Ethereum Web Token JS

node.js library for signing, decoding, and verifying an Ethereum Web Token (EWT)

### Installation

```
npm install ether-token
```

### Signing Token

```js
var TokenSigner = require('ether-token').TokenSigner,
    rawPrivateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f',
    tokenPayload = {"exp": 1440713414, "iss": "7cd9ed5e-bb0e-49ea-a323-f28bde3a0549"},
    token = new TokenSigner('ES256k', rawPrivateKey).sign(tokenPayload)
```

##### Example output:

```js
> console.log(token)
tbd
```

### Decoding Tokens

```js
$ var decodeToken = require('ether-token').decodeToken;
$ decodeToken(token);
{ header: { alg: 'ES256', typ: 'EWT' },
  payload: { "exp": 1440713414, "iss": "7cd9ed5e-bb0e-49ea-a323-f28bde3a0549" },
  signature: 'tbd' }
```

### Verifying Tokens

```js
$ var TokenVerifier = require('ether-token').TokenVerifier;
$ rawPublicKey = 'tbd';
$ new TokenVerifier('ES256k', rawPublicKey).verify(token);
true
```
