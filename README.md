# Ether Token JS

bundling Ethereum function-calls into JWT-like tokens.

## Use Sign

```javascript
var ABI = [{
  type: 'function', name: 'test',
  inputs: [{ type: 'bool' }, { type: 'string' }]
}];
var priv = '...';

new Token(ABI).test(true, 'string').sign(priv);

=> 'aaaaaa.bbbbbb.cccccc'
```

## Use Parse

```javascript
Token.parse('aaaaaa.bbbbbb.cccccc');

=> {
  values: [true, 'string'],
  signer: '...' //should match address of priv
}
```
