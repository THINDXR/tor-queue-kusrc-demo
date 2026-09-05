import { describe, expect, it } from 'vitest';
import { IDENTITIES, identityOf } from './identity';

describe('อัตลักษณ์บัตรคิว', () => {
  it('เลขคิวที่ติดกันต้องไม่ได้อัตลักษณ์ซ้ำกัน', () => {
    for (let n = 0; n < 500; n++) {
      expect(identityOf(n).key).not.toBe(identityOf(n + 1).key);
    }
  });

  it('รูปทรงไม่ซ้ำกันเลยทั้ง 8 แบบ', () => {
    const shapes = new Set(IDENTITIES.map((i) => i.shape));
    expect(shapes.size).toBe(IDENTITIES.length);
  });

  it('ตรงกับดีไซน์ที่ตกลงกันไว้', () => {
    expect(identityOf(34).key).toBe('sky');
    expect(identityOf(34).shape).toBe('star');
    expect(identityOf(35).key).toBe('grape');
    expect(identityOf(36).key).toBe('coral');
    expect(identityOf(37).key).toBe('teal');
    expect(identityOf(38).key).toBe('cocoa');
  });
});
