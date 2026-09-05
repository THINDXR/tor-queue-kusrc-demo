/* ระบบระบุตัวบัตรคิว — สี + รูปทรง เสมอ ห้ามใช้สีอย่างเดียว
   เพราะผู้ชายไทยราว 8% ตาบอดสี และโรงอาหารแสงจ้าจนสีเพี้ยน
   รูปทรงทำให้แม่ค้าเหลือบตาแล้วแมตช์ได้โดยไม่ต้องอ่านเลข */
window.Identity = (function () {

  var LIST = [
    { key: 'mango',  color: '#F5A524', fg: '#fff', chipFg: '#4A2C00', shape: 'circle'   },
    { key: 'chili',  color: '#E5484D', fg: '#fff', chipFg: '#fff',    shape: 'triangle' },
    { key: 'grass',  color: '#46A758', fg: '#fff', chipFg: '#06280E', shape: 'square'   },
    { key: 'sky',    color: '#0090FF', fg: '#fff', chipFg: '#fff',    shape: 'star'     },
    { key: 'grape',  color: '#8E4EC6', fg: '#fff', chipFg: '#fff',    shape: 'hexagon'  },
    { key: 'coral',  color: '#F76808', fg: '#fff', chipFg: '#fff',    shape: 'droplet'  },
    { key: 'teal',   color: '#12A594', fg: '#fff', chipFg: '#fff',    shape: 'cross'    },
    { key: 'cocoa',  color: '#7C5C42', fg: '#fff', chipFg: '#fff',    shape: 'heart'    }
  ];

  var PATHS = {
    circle:   '<circle cx="12" cy="12" r="9"/>',
    triangle: '<path d="M12 3.2 21 20.2 3 20.2Z"/>',
    square:   '<rect x="3.8" y="3.8" width="16.4" height="16.4" rx="2.4"/>',
    star:     '<path d="M12 2.5 14.6 9.2 21.5 9.5 16.1 13.9 17.9 20.6 12 16.8 6.1 20.6 7.9 13.9 2.5 9.5 9.4 9.2Z"/>',
    hexagon:  '<path d="M12 2.5 20.2 7.2 20.2 16.8 12 21.5 3.8 16.8 3.8 7.2Z"/>',
    droplet:  '<path d="M12 2.5C12 2.5 19.5 10 19.5 14.5A7.5 7.5 0 0 1 4.5 14.5C4.5 10 12 2.5 12 2.5Z"/>',
    cross:    '<path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5Z"/>',
    heart:    '<path d="M12 20.8C12 20.8 3 15 3 8.9A4.9 4.9 0 0 1 12 6.3A4.9 4.9 0 0 1 21 8.9C21 15 12 20.8 12 20.8Z"/>'
  };

  /* เลขคิวติดกันต้องไม่ได้อัตลักษณ์ซ้ำกันเด็ดขาด การหารเอาเศษด้วย 8 รับประกันข้อนี้ */
  function of(queueNo) { return LIST[(queueNo + 1) % LIST.length]; }

  /** วาดรูปทรง; filled = true ทึบ, false = เส้นขอบ */
  function svg(shape, size, color, filled) {
    var fill = filled ? color : 'none';
    var stroke = filled ? 'none' : color;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true" ' +
      'fill="' + fill + '" stroke="' + stroke + '" stroke-width="2" ' +
      'stroke-linejoin="round">' + PATHS[shape] + '</svg>';
  }

  return { list: LIST, of: of, svg: svg };
})();
