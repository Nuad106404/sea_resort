import Settings from '../models/Settings.js';

/**
 * Default site content.
 *
 * These mirror the fallback values the frontends already use, so seeding
 * changes nothing visually — it just makes the rows exist so the API stops
 * returning 404 and the admin panel has something to edit.
 *
 * Image keys (hero_image, cta_image, rooms_header_image) are intentionally
 * NOT seeded: they hold uploaded file paths, and a placeholder would render
 * a broken image. The frontends fall back gracefully when they are absent.
 */
const DEFAULT_SETTINGS = [
  { key: 'site_name', value: 'Asili', description: 'ชื่อเว็บไซต์ (ส่วนแรก)' },
  { key: 'site_name_second_part', value: 'Village', description: 'ชื่อเว็บไซต์ (ส่วนที่สอง)' },
  {
    key: 'hero_title',
    value: "Escape to Nature's",
    description: 'หัวข้อหลักหน้าแรก',
  },
  { key: 'hero_subtitle', value: 'Luxury Embrace', description: 'หัวข้อรองหน้าแรก' },
  {
    key: 'hero_tagline',
    value: 'Where warm wood meets wild nature. Experience boutique luxury at Asili Village.',
    description: 'คำโปรยหน้าแรก',
  },
  {
    key: 'cta_tagline',
    value: 'Discover the harmony of nature and luxury at Asili Village.',
    description: 'คำโปรยส่วนชวนจอง',
  },
  {
    key: 'site_description',
    value:
      'A luxury boutique resort nestled in nature, offering an unforgettable escape with warm hospitality and premium amenities.',
    description: 'คำอธิบายเว็บไซต์ (ใช้ใน footer)',
  },
  {
    key: 'featured_rooms_title',
    value: 'Our Signature Villas',
    description: 'หัวข้อส่วนห้องพักแนะนำ',
  },
  {
    key: 'featured_rooms_description',
    value:
      'Each villa is designed to provide an unforgettable experience, blending natural elements with modern luxury.',
    description: 'คำอธิบายส่วนห้องพักแนะนำ',
  },
  { key: 'rooms_page_title', value: 'Our Luxury Villas', description: 'หัวข้อหน้าห้องพัก' },
  {
    key: 'rooms_page_subtitle',
    value:
      'Choose from our collection of thoughtfully designed villas, each offering a unique blend of comfort and natural beauty.',
    description: 'คำโปรยหน้าห้องพัก',
  },
  {
    key: 'rooms_section_title',
    value: 'Our Signature Villas',
    description: 'หัวข้อส่วนรายการห้องพัก',
  },
  {
    key: 'rooms_section_description',
    value:
      'Each villa is designed to provide an unforgettable experience, blending natural elements with modern luxury.',
    description: 'คำอธิบายส่วนรายการห้องพัก',
  },
  { key: 'contact_address', value: '123 Nature Road, Thailand', description: 'ที่อยู่ติดต่อ' },
  { key: 'contact_phone', value: '+66 123 456 789', description: 'เบอร์โทรติดต่อ' },
  { key: 'contact_email', value: 'hello@asilivillage.com', description: 'อีเมลติดต่อ' },
];

/**
 * Insert any missing settings rows.
 *
 * Uses $setOnInsert so values edited through the admin panel are never
 * overwritten on restart — only absent keys get created.
 *
 * @returns {Promise<{created: number, total: number}>}
 */
export const seedDefaultSettings = async () => {
  const operations = DEFAULT_SETTINGS.map(({ key, value, description }) => ({
    updateOne: {
      filter: { key },
      update: { $setOnInsert: { key, value, type: 'text', description } },
      upsert: true,
    },
  }));

  const result = await Settings.bulkWrite(operations, { ordered: false });

  return {
    created: result.upsertedCount || 0,
    total: DEFAULT_SETTINGS.length,
  };
};

export default seedDefaultSettings;
