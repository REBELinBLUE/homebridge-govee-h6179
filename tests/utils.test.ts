import { normalisedMacCompare, normalisedUuidCompare } from '../src/utils';

describe('Utils', () => {
  describe('normalisedMacCompare', () => {
    it('Different Case', () => {
      const actual = normalisedMacCompare('a2:3e:5f:7a:c7:78', 'A2:3E:5F:7A:C7:78');

      expect(actual).toBeTruthy();
    });

    it('Identical', () => {
      const actual = normalisedMacCompare('A2:3E:5F:7A:C7:78', 'A2:3E:5F:7A:C7:78');

      expect(actual).toBeTruthy();
    });

    it('Without Colons', () => {
      const actual = normalisedMacCompare('A23E5F7AC778', 'A2:3E:5F:7A:C7:78');

      expect(actual).toBeTruthy();
    });

    it('Different', () => {
      const actual = normalisedMacCompare('B2:3E:5F:7A:C7:78', 'A2:3E:5F:7A:C7:78');

      expect(actual).toBeFalsy();
    });
  });

  describe('normalisedUuidCompare', () => {
  it('Different Case', () => {
      const actual = normalisedUuidCompare('00010203-0405-0607-0809-0a0b0c0d2b11', '00010203-0405-0607-0809-0A0B0C0D2B11');

      expect(actual).toBeTruthy();
    });

    it('Identical', () => {
      const actual = normalisedUuidCompare('00010203-0405-0607-0809-0a0b0c0d2b11', '00010203-0405-0607-0809-0a0b0c0d2b11');

      expect(actual).toBeTruthy();
    });

  it('UWithout Dashes', () => {
      const actual = normalisedUuidCompare('00010203-0405-0607-0809-0a0b0c0d2b11', '000102030405060708090a0b0c0d2b11');

      expect(actual).toBeTruthy();
    });

    it('Different', () => {
      const actual = normalisedUuidCompare('00010205-0405-0607-0809-0a0b0c0d2b11', '000102030405060708090a0b0c0d2b11');

      expect(actual).toBeFalsy();
    });
  });


});
