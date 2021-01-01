import { Guid } from './guid';

describe('CQRS Guid (unit)', () => {
  it('can be create from BigInt', () => {
    const guid = Guid.fromBigInt(12345678901234567890n);
    expect(guid.toBigInt()).toEqual(12345678901234567890n);
  });
  it('can be create from String', () => {
    const guidStr = '01234567-89ab-cdef-0000-0123456789ab';
    const guid = Guid.fromString(guidStr);
    expect(guid.toString()).toEqual(guidStr);
  });
  it('can be cloned', () => {
    const guid = Guid.fromBigInt(12345678901234567890n);
    const cloned = guid.clone();
    expect(cloned).not.toBe(guid);
    expect(cloned.toBigInt()).toEqual(guid.toBigInt());
  });
  it('throw an error with out of range BigInt', () => {
    expect(() => Guid.fromBigInt(-1n)).toThrow('given guid is out of range');
    const tooBigNumber = BigInt('0xffffffffffffffffffffffffffffffff') + 1n;
    expect(() => Guid.fromBigInt(tooBigNumber)).toThrow(
      'given guid is out of range',
    );
  });
  it('throw an error with string which does not respect the format', () => {
    const guidStr = '000';
    expect(() => Guid.fromString(guidStr)).toThrow(
      `given guid "${guidStr}" does not respect format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
    );
  });
});
