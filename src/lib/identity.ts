export type ShapeName =
  | 'circle' | 'triangle' | 'square' | 'star'
  | 'hexagon' | 'droplet' | 'cross' | 'heart';

export interface TicketIdentity {
  key: string;
  color: string;
  /** สีตัวอักษรบนชิปเล็ก บางสีอ่อนเกินกว่าจะใช้ตัวหนังสือขาว */
  chipFg: string;
  shape: ShapeName;
}

/**
 * อัตลักษณ์บัตรคิว — สี + รูปทรง เสมอ ห้ามใช้สีอย่างเดียว
 * เพราะผู้ชายไทยราว 8% ตาบอดสี และโรงอาหารแสงจ้าจนสีเพี้ยน
 * รูปทรงทำให้แม่ค้าเหลือบตาแล้วแมตช์ได้โดยไม่ต้องอ่านเลข
 */
export const IDENTITIES: readonly TicketIdentity[] = [
  { key: 'mango',  color: '#F5A524', chipFg: '#4A2C00', shape: 'circle'   },
  { key: 'chili',  color: '#E5484D', chipFg: '#ffffff', shape: 'triangle' },
  { key: 'grass',  color: '#46A758', chipFg: '#06280E', shape: 'square'   },
  { key: 'sky',    color: '#0090FF', chipFg: '#ffffff', shape: 'star'     },
  { key: 'grape',  color: '#8E4EC6', chipFg: '#ffffff', shape: 'hexagon'  },
  { key: 'coral',  color: '#F76808', chipFg: '#ffffff', shape: 'droplet'  },
  { key: 'teal',   color: '#12A594', chipFg: '#ffffff', shape: 'cross'    },
  { key: 'cocoa',  color: '#7C5C42', chipFg: '#ffffff', shape: 'heart'    },
];

/** การหารเอาเศษด้วย 8 รับประกันว่าเลขคิวที่ติดกันจะไม่ได้อัตลักษณ์ซ้ำกัน */
export function identityOf(no: number): TicketIdentity {
  const len = IDENTITIES.length;
  const i = (((no + 1) % len) + len) % len;
  return IDENTITIES[i] as TicketIdentity;
}

export const SHAPE_PATHS: Record<ShapeName, string> = {
  circle:   'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18Z',
  triangle: 'M12 3.2 21 20.2 3 20.2Z',
  square:   'M6.2 3.8h11.6a2.4 2.4 0 0 1 2.4 2.4v11.6a2.4 2.4 0 0 1-2.4 2.4H6.2a2.4 2.4 0 0 1-2.4-2.4V6.2a2.4 2.4 0 0 1 2.4-2.4Z',
  star:     'M12 2.5 14.6 9.2 21.5 9.5 16.1 13.9 17.9 20.6 12 16.8 6.1 20.6 7.9 13.9 2.5 9.5 9.4 9.2Z',
  hexagon:  'M12 2.5 20.2 7.2 20.2 16.8 12 21.5 3.8 16.8 3.8 7.2Z',
  droplet:  'M12 2.5C12 2.5 19.5 10 19.5 14.5A7.5 7.5 0 0 1 4.5 14.5C4.5 10 12 2.5 12 2.5Z',
  cross:    'M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5Z',
  heart:    'M12 20.8C12 20.8 3 15 3 8.9A4.9 4.9 0 0 1 12 6.3A4.9 4.9 0 0 1 21 8.9C21 15 12 20.8 12 20.8Z',
};
