const MAX_GUID = BigInt('0xffffffffffffffffffffffffffffffff');
const MIN_GUID = 0n;

export class Guid {
  private constructor(private _guid: bigint) {}

  public static fromBigInt(guid: bigint): Guid {
    if (guid < MIN_GUID || guid > MAX_GUID) {
      throw new RangeError(`given guid is out of range`);
    }
    return new Guid(guid);
  }

  public static fromString(guid: string): Guid {
    const regExp = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    if (!regExp.test(guid)) {
      const msg = `given guid "${guid}" does not respect format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`;
      throw new RangeError(msg);
    }
    return new Guid(BigInt(`0x${guid.replace(/-/g, '')}`));
  }

  public toBigInt(): bigint {
    return this._guid;
  }

  public toString(): string {
    const hexGuid = this._guid.toString(16).padStart(32, '0');
    const guidParts = [
      hexGuid.substr(0, 8),
      hexGuid.substr(8, 4),
      hexGuid.substr(12, 4),
      hexGuid.substr(16, 4),
      hexGuid.substr(20, 12),
    ];
    return guidParts.join('-');
  }

  public clone(): Guid {
    return new Guid(this._guid);
  }
}
