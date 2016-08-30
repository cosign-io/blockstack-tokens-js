import Token from '../dist/index';
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
        console.log(sig);
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

      it('sig length', () => {
        var sig = 'eyJ0eXBlIjoiRVdUIiwiYWxnIjoiRVMyNTZrIn0.eyJlbmRvcnNlIjpbeyJ1aW50MjU2IjoiMzU3ZTQ0ZWQtYmQ5YS00MzcwLWI2Y2EtOGRlOTg0N2QxZGE4In0seyJhZGRyZXNzIjoiMHhmM2JlYWMzMGM0OThkOWUyNjg2NWYzNGZjYWE1N2RiYjkzNWIwZDc0In0seyJieXRlczMiOiJFVVIifSx7InVpbnQyNTYiOjEyMDB9LHsidWludDI1NiI6IlR1ZSBBdWcgMTYgMjAxNiAxODozNzo0NyBHTVQrMDIwMCAoQ0VTVCkifV0sInYiOjB9.6Lr5x4dXWtJ9D1H5-F1kj58We-y06NMfh-nrNxU7-ysHDobHMURIa14wt3pwjCW8PCpN3Fvqccrx9RXDgBjDBg';
        var rv = Token.parse(sig);
        expect(rv.signer == ADDR).to.be.true;
      });

      it('sig issue', () => {
        var sig = 'eyJ0eXBlIjoiRVdUIiwiYWxnIjoiRVMyNTZrIn0.eyJpc3N1ZSI6W3sidWludDEyOCI6IjNhMDYwMTMxLTFkY2EtNDY3ZC05NzI0LThmNTBlOTA2YTY0MSJ9LHsidWludDI1NiI6MjAwMH0seyJ1aW50MjU2IjoiVHVlIEF1ZyAxNiAyMDE2IDE4OjM3OjQ3IEdNVCswMjAwIChDRVNUKSJ9XSwidiI6MH0.XochLBPr_dBod3o0zQxFXKY7gcpcF-4W0wlueneiQad8Y44FZ_x4-gIYF50tRkMuwjPI4-vbPEitxa4uMdbUDQ';
        var rv = Token.parse(sig);
        console.dir(rv);
      });

    });
  });
});
