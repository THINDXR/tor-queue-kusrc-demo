/**
 * ที่มาของรูปอาหาร — ทุกรูปมาจาก Wikimedia Commons ใช้ได้ตามสัญญาอนุญาตที่ระบุ
 * รูป CC BY / CC BY-SA ต้องให้เครดิตผู้ถ่าย จึงแสดงรายการนี้ในหน้าบัญชี
 * ตอนใช้งานจริงควรเปลี่ยนเป็นรูปถ่ายเมนูจริงของแต่ละร้าน
 */
export interface PhotoCredit {
  dish: string;
  title: string;
  license: string;
  artist: string;
  page: string;
}

export const PHOTO_CREDITS: PhotoCredit[] = [
  { dish: "kaprao", title: "Kao Rad Pad Kra-pao with chicken and fried egg - Unithai 2025-07-30.jpg", license: "CC0", artist: "Andy Li", page: "https://commons.wikimedia.org/wiki/File:Kao_Rad_Pad_Kra-pao_with_chicken_and_fried_egg_-_Unithai_2025-07-30.jpg" },
  { dish: "seeew", title: "Pad See Ew - Bangkok.jpg", license: "CC BY-SA 4.0", artist: "Vee Satayamas", page: "https://commons.wikimedia.org/wiki/File:Pad_See_Ew_-_Bangkok.jpg" },
  { dish: "krob", title: "Khao mu daeng mu krop - Ratchaburi - 2017-04-16 (002).jpg", license: "CC0", artist: "Iudexvivorum", page: "https://commons.wikimedia.org/wiki/File:Khao_mu_daeng_mu_krop_-_Ratchaburi_-_2017-04-16_(002).jpg" },
  { dish: "kanajub", title: "Phat khana mu krop.jpg", license: "CC BY-SA 3.0", artist: "Takeaway", page: "https://commons.wikimedia.org/wiki/File:Phat_khana_mu_krop.jpg" },
  { dish: "gaeng", title: "Thai green chicken curry at Highgate Cricket Club, Crouch End, London 3.jpg", license: "CC BY-SA 4.0", artist: "Acabashi", page: "https://commons.wikimedia.org/wiki/File:Thai_green_chicken_curry_at_Highgate_Cricket_Club,_Crouch_End,_London_3.jpg" },
  { dish: "tomyum", title: "Tom Yum Goong Noodle Soup - Nok Nok Kitchen at The Cow 2024-03-28.jpg", license: "CC0", artist: "Andy Li", page: "https://commons.wikimedia.org/wiki/File:Tom_Yum_Goong_Noodle_Soup_-_Nok_Nok_Kitchen_at_The_Cow_2024-03-28.jpg" },
  { dish: "pladuk", title: "Pla duk phat phet.jpg", license: "CC BY-SA 3.0", artist: "Takeaway", page: "https://commons.wikimedia.org/wiki/File:Pla_duk_phat_phet.jpg" },
  { dish: "kaijeaw", title: "酿豆腐 2.jpg", license: "CC0", artist: "Mx. Granger", page: "https://commons.wikimedia.org/wiki/File:%E9%85%BF%E8%B1%86%E8%85%90_2.jpg" },
  { dish: "kmg", title: "Hainanese chicken rice.jpg", license: "CC BY 4.0", artist: "Misaochan", page: "https://commons.wikimedia.org/wiki/File:Hainanese_chicken_rice.jpg" },
  { dish: "kmgtod", title: "Hainanese chicken rice in Singapore.jpg", license: "CC BY-SA 4.0", artist: "Pauloleong2002", page: "https://commons.wikimedia.org/wiki/File:Hainanese_chicken_rice_in_Singapore.jpg" },
  { dish: "kmgmix", title: "Hainanese chicken rice (in Macau).jpg", license: "CC BY-SA 4.0", artist: "Pauloleong2002", page: "https://commons.wikimedia.org/wiki/File:Hainanese_chicken_rice_(in_Macau).jpg" },
  { dish: "ntok", title: "Pathumthani Boat noodles restaurant Philippines3.jpg", license: "CC BY-SA 4.0", artist: "ไม่ระบุ (ดูหน้าต้นฉบับ)", page: "https://commons.wikimedia.org/wiki/File:Pathumthani_Boat_noodles_restaurant_Philippines3.jpg" },
  { dish: "tomyumn", title: "Cuisine 2026-09-09 Thailand 01.jpg", license: "CC BY 4.0", artist: "P1898", page: "https://commons.wikimedia.org/wiki/File:Cuisine_2026-09-09_Thailand_01.jpg" },
  { dish: "yen", title: "Yong tau foo sweet.jpg", license: "CC BY-SA 3.0", artist: "Chensiyuan", page: "https://commons.wikimedia.org/wiki/File:Yong_tau_foo_sweet.jpg" },
  { dish: "kapraog", title: "Kao Rad Pad Kra-pao - Unithai 2023-07-08.jpg", license: "CC0", artist: "Andy Li", page: "https://commons.wikimedia.org/wiki/File:Kao_Rad_Pad_Kra-pao_-_Unithai_2023-07-08.jpg" },
  { dish: "khimao", title: "Sen yai phat khi mao.jpg", license: "CC BY-SA 3.0", artist: "Takeaway", page: "https://commons.wikimedia.org/wiki/File:Sen_yai_phat_khi_mao.jpg" },
  { dish: "promt", title: "American fried rice.jpg", license: "CC BY 2.0", artist: "Biyu Lau", page: "https://commons.wikimedia.org/wiki/File:American_fried_rice.jpg" },
  { dish: "prik", title: "Phat Khi Mao Raan Jay Fai.jpg", license: "CC BY 2.0", artist: "Krista", page: "https://commons.wikimedia.org/wiki/File:Phat_Khi_Mao_Raan_Jay_Fai.jpg" },
  { dish: "tamthai", title: "Som Tom (Papaya Salad) - Little Thai 2024-06-14.jpg", license: "CC0", artist: "Andy Li", page: "https://commons.wikimedia.org/wiki/File:Som_Tom_(Papaya_Salad)_-_Little_Thai_2024-06-14.jpg" },
  { dish: "tampu", title: "Tam som-o nam pu.JPG", license: "CC BY-SA 3.0", artist: "Takeaway", page: "https://commons.wikimedia.org/wiki/File:Tam_som-o_nam_pu.JPG" },
  { dish: "gaiyang", title: "Kai yang 1.jpg", license: "CC BY 2.0", artist: "lazy fri13th", page: "https://commons.wikimedia.org/wiki/File:Kai_yang_1.jpg" },
];
