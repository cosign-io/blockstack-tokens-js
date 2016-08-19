import EthAbi from 'ethabi-js';

import Token from './token';
import { isInstanceOf, isFunction } from './util/types';

describe('Token/Token', () => {
  const ABI = [{ type: 'function', name: 'test', inputs: [{ type: 'bool'}, { type: 'string'}]}];
  const ABI2 = [{ type: 'function', name: 'endorse', inputs: [{'type': 'uint256'},{'type': 'address'},{'type': 'bytes3'},{'type': 'uint256'},{'type': 'uint256'}]}];
  const VALUES = [true, 'johba'];
  const VALUES2 = ['357e44ed-bd9a-4370-b6ca-8de9847d1da8', '0x47244b04311eb97b381e7038a28a9e1f97c2fb7a', 'EUR', 1200, 'Tue Aug 16 2016 18:37:47 GMT+0200 (CEST)'];
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
        expect(signer.abi.functions[0].name == 'test').to.be.true;
        expect(signer.values[0] == VALUES[0]).to.be.true;
        expect(signer.values[1] == VALUES[1]).to.be.true;
        var sig = signer.sign(SIGNER);
        expect(Token.parse(sig).signer == ADDR).to.be.true;
      });

      it('endorse', () => {
        var signer = new Token(ABI2).endorse.apply(this, VALUES2);
        var sig = signer.sign(SIGNER);
        var rv = Token.parse(sig);
        expect(rv.signer == ADDR).to.be.true;
        expect(rv.values[0]).to.equal(VALUES2[0]);
        expect(rv.values[1]).to.equal(VALUES2[1]);
        expect(rv.values[2]).to.equal(VALUES2[2]);
        expect(rv.values[3]).to.equal(VALUES2[3]);
        expect(rv.values[4]).to.equal(VALUES2[4]);
      });

    });
  });
});
