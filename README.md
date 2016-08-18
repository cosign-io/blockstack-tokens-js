# Etherem Web Token

EWT bundles Ethereum function-calls into [JWT](https://jwt.io/)-like tokens. It simplifies the use of ECDSA signatures for webapps and the development of [Smart Oracles](https://github.com/codius/codius/wiki/Smart-Oracles:-A-Simple,-Powerful-Approach-to-Smart-Contracts).

## Create and Sign a Token

```javascript
var ABI = [{
  type: 'function', name: 'test',
  inputs: [{ type: 'bool' }, { type: 'string' }]
}];
var priv = '...';

new Token(ABI).test(true, 'string').sign(priv);

=> 'aaaaaa.bbbbbb.cccccc'
```

## Signed Token Example

`eyJ0eXBlIjoiRVdUIiwiYWxnIjoiRVMyNTZrIn0`.`eyJ0ZXN0IjpbeyJib29sIjp0cnVlfSx7InN0cmluZyI6ImpvaGJhIn1dfQ`.`Xm0gkO3-jeAxsLU35g60hALU3CrIYQRFnyGv5vbdCDRlB1yABF8Qu8B9pjbIDwh7hfI_d_O5aQoZNib7WqOeLA` 

encodes

```js
{
  header: { type: 'EWT', alg: 'ES256k' },
  payload: { test: [ { bool: true }, { string: 'johba' } ] },
  sig: {
    v: 27,
    r: '5e6d2090edfe8de031b0b537e60eb48402d4dc2ac86104459f21afe6f6dd0834',
    s: '65075c80045f10bbc07da636c80f087b85f23f77f3b9690a193626fb5aa39e2c'
  }
}
```


## Parse a Token

```javascript
Token.parse('aaaaaa.bbbbbb.cccccc');

=> {
  values: [true, 'string'],
  signer: '...' //should match address of priv
}
```

