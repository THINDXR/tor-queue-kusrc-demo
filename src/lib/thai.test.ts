import { describe, expect, it } from 'vitest';
import { baht, padQueueNo, thaiWords } from './thai';

describe('คำอ่านเลขไทย', () => {
  it('อ่านหลักหน่วยได้', () => {
    expect(thaiWords(0)).toBe('ศูนย์');
    expect(thaiWords(7)).toBe('เจ็ด');
  });

  it('อ่านหลักสิบได้ รวมกรณี "ยี่สิบ" และ "เอ็ด"', () => {
    expect(thaiWords(10)).toBe('สิบ');
    expect(thaiWords(11)).toBe('สิบเอ็ด');
    expect(thaiWords(20)).toBe('ยี่สิบ');
    expect(thaiWords(21)).toBe('ยี่สิบเอ็ด');
    expect(thaiWords(34)).toBe('สามสิบสี่');
  });

  it('อ่านหลักร้อยได้', () => {
    expect(thaiWords(100)).toBe('หนึ่งร้อย');
    expect(thaiWords(101)).toBe('หนึ่งร้อยเอ็ด');
    expect(thaiWords(256)).toBe('สองร้อยห้าสิบหก');
  });

  it('จัดรูปแบบเลขคิวและราคา', () => {
    expect(padQueueNo(34)).toBe('034');
    expect(padQueueNo(7)).toBe('007');
    expect(baht(90)).toBe('฿90');
  });
});
