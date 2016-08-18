import EthAbi from 'ethabi-js';

import Token from './token';
import { isInstanceOf, isFunction } from './util/types';

describe('Token/Token', () => {
  const ABI = [{ type: 'function', name: 'test', inputs: [{ type: 'bool' }, { type: 'string' }]}];
  const VALUES = [true, 'johba'];
  const EWT = 'eyJ0eXBlIjoiRVdUIiwiYWxnIjoiRVMyNTZrIn0.eyJ0ZXN0IjpbeyJib29sIjp0cnVlfSx7InN0cmluZyI6ImpvaGJhIn1dfQ.Xm0gkO3-jeAxsLU35g60hALU3CrIYQRFnyGv5vbdCDRlB1yABF8Qu8B9pjbIDwh7hfI_d_O5aQoZNib7WqOeLA';
  const SIGNER = '0x278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f';
  const ADDR = '0xf3beac30c498d9e26865f34fcaa57dbb935b0d74';

  describe('constructor', () => {

    it('needs an ABI', () => {
      expect(() => new Token()).to.throw(/Object ABI needs/);
    });

    describe('internal setup', () => {
      const token = new Token(ABI);

      it('sets parsed interface', () => {
        expect(isInstanceOf(token.abi, EthAbi)).to.be.ok;
      });

    });
  });

  describe('bindings', () => {
    let token;
    let func;

    beforeEach(() => {
      token = new Token(ABI);
    });

    describe('attachments', () => {

      it('attaches .test to Token', () => {
        expect(isFunction(token.test)).to.be.true;
      });

    });

    describe('invocation', () => {
      it('values passed', () => {
        var signer = token.test(VALUES[0], VALUES[1]);
        expect(signer.abi.functions[0].name == 'test');
        expect(signer.values[0] == VALUES[0]);
        expect(signer.values[1] == VALUES[1]);
        var sig = signer.sign(SIGNER);
        expect(sig = EWT);
        expect(Token.parse(sig).signer == ADDR);
      });

    });
  });
});
