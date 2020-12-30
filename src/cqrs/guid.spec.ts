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
    expect(cloned === guid).toBeFalsy();
    expect(cloned.toBigInt()).toEqual(guid.toBigInt());
  });
});
