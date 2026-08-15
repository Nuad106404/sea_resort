import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Upload, Save, Image as ImageIcon } from 'lucide-react';

interface Setting {
  _id: string;
  key: string;
  value: string;
  type: string;
  description?: string;
}

export function Settings() {
  const [heroImage, setHeroImage] = useState<Setting | null>(null);
  const [ctaImage, setCtaImage] = useState<Setting | null>(null);
  const [roomsImage, setRoomsImage] = useState<Setting | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [ctaImageFile, setCtaImageFile] = useState<File | null>(null);
  const [roomsImageFile, setRoomsImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string>('');
  const [ctaImagePreview, setCtaImagePreview] = useState<string>('');
  const [roomsImagePreview, setRoomsImagePreview] = useState<string>('');
  const [siteName, setSiteName] = useState<string>('Asili');
  const [siteNameSecondPart, setSiteNameSecondPart] = useState<string>('Village');
  const [heroTitle, setHeroTitle] = useState<string>("Escape to Nature's");
  const [heroSubtitle, setHeroSubtitle] = useState<string>('Luxury Embrace');
  const [heroTagline, setHeroTagline] = useState<string>('Where warm wood meets wild nature. Experience boutique luxury at Asili Village.');
  const [ctaTagline, setCtaTagline] = useState<string>('Discover the harmony of nature and luxury at Asili Village.');
  const [siteDescription, setSiteDescription] = useState<string>('A luxury boutique resort nestled in nature, offering an unforgettable escape with warm hospitality and premium amenities.');
  const [featuredRoomsTitle, setFeaturedRoomsTitle] = useState<string>('Our Signature Villas');
  const [featuredRoomsDescription, setFeaturedRoomsDescription] = useState<string>('Each villa is designed to provide an unforgettable experience, blending natural elements with modern luxury.');
  const [roomsPageTitle, setRoomsPageTitle] = useState<string>('Our Luxury Villas');
  const [roomsPageSubtitle, setRoomsPageSubtitle] = useState<string>('Choose from our collection of thoughtfully designed villas, each offering a unique blend of comfort and natural beauty.');
  const [roomsSectionTitle, setRoomsSectionTitle] = useState<string>('Our Signature Villas');
  const [roomsSectionDescription, setRoomsSectionDescription] = useState<string>('Each villa is designed to provide an unforgettable experience, blending natural elements with modern luxury.');
  const [contactAddress, setContactAddress] = useState<string>('123 Nature Road, Thailand');
  const [contactPhone, setContactPhone] = useState<string>('+66 123 456 789');
  const [contactEmail, setContactEmail] = useState<string>('hello@asilivillage.com');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      // Load hero image
      const heroResponse = await fetch(`${API_URL}/api/settings/hero_image`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (heroResponse.ok) {
        const data = await heroResponse.json();
        setHeroImage(data);
        setHeroImagePreview(`${API_URL}${data.value}`);
      }

      // Load CTA image
      const ctaResponse = await fetch(`${API_URL}/api/settings/cta_image`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (ctaResponse.ok) {
        const data = await ctaResponse.json();
        setCtaImage(data);
        setCtaImagePreview(`${API_URL}${data.value}`);
      }

      // Load Rooms page image
      const roomsResponse = await fetch(`${API_URL}/api/settings/rooms_header_image`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (roomsResponse.ok) {
        const data = await roomsResponse.json();
        setRoomsImage(data);
        setRoomsImagePreview(`${API_URL}${data.value}`);
      }

      // Load text settings
      const siteNameResponse = await fetch(`${API_URL}/api/settings/site_name`);
      if (siteNameResponse.ok) {
        const data = await siteNameResponse.json();
        setSiteName(data.value);
      }

      const siteNameSecondPartResponse = await fetch(`${API_URL}/api/settings/site_name_second_part`);
      if (siteNameSecondPartResponse.ok) {
        const data = await siteNameSecondPartResponse.json();
        setSiteNameSecondPart(data.value);
      }

      const heroTitleResponse = await fetch(`${API_URL}/api/settings/hero_title`);
      if (heroTitleResponse.ok) {
        const data = await heroTitleResponse.json();
        setHeroTitle(data.value);
      }

      const heroSubtitleResponse = await fetch(`${API_URL}/api/settings/hero_subtitle`);
      if (heroSubtitleResponse.ok) {
        const data = await heroSubtitleResponse.json();
        setHeroSubtitle(data.value);
      }

      const heroTaglineResponse = await fetch(`${API_URL}/api/settings/hero_tagline`);
      if (heroTaglineResponse.ok) {
        const data = await heroTaglineResponse.json();
        setHeroTagline(data.value);
      }

      const ctaTaglineResponse = await fetch(`${API_URL}/api/settings/cta_tagline`);
      if (ctaTaglineResponse.ok) {
        const data = await ctaTaglineResponse.json();
        setCtaTagline(data.value);
      }

      const siteDescriptionResponse = await fetch(`${API_URL}/api/settings/site_description`);
      if (siteDescriptionResponse.ok) {
        const data = await siteDescriptionResponse.json();
        setSiteDescription(data.value);
      }

      const featuredRoomsTitleResponse = await fetch(`${API_URL}/api/settings/featured_rooms_title`);
      if (featuredRoomsTitleResponse.ok) {
        const data = await featuredRoomsTitleResponse.json();
        setFeaturedRoomsTitle(data.value);
      }

      const featuredRoomsDescriptionResponse = await fetch(`${API_URL}/api/settings/featured_rooms_description`);
      if (featuredRoomsDescriptionResponse.ok) {
        const data = await featuredRoomsDescriptionResponse.json();
        setFeaturedRoomsDescription(data.value);
      }

      const contactAddressResponse = await fetch(`${API_URL}/api/settings/contact_address`);
      if (contactAddressResponse.ok) {
        const data = await contactAddressResponse.json();
        setContactAddress(data.value);
      }

      const contactPhoneResponse = await fetch(`${API_URL}/api/settings/contact_phone`);
      if (contactPhoneResponse.ok) {
        const data = await contactPhoneResponse.json();
        setContactPhone(data.value);
      }

      const contactEmailResponse = await fetch(`${API_URL}/api/settings/contact_email`);
      if (contactEmailResponse.ok) {
        const data = await contactEmailResponse.json();
        setContactEmail(data.value);
      }

      const roomsPageTitleResponse = await fetch(`${API_URL}/api/settings/rooms_page_title`);
      if (roomsPageTitleResponse.ok) {
        const data = await roomsPageTitleResponse.json();
        setRoomsPageTitle(data.value);
      }

      const roomsPageSubtitleResponse = await fetch(`${API_URL}/api/settings/rooms_page_subtitle`);
      if (roomsPageSubtitleResponse.ok) {
        const data = await roomsPageSubtitleResponse.json();
        setRoomsPageSubtitle(data.value);
      }

      const roomsSectionTitleResponse = await fetch(`${API_URL}/api/settings/rooms_section_title`);
      if (roomsSectionTitleResponse.ok) {
        const data = await roomsSectionTitleResponse.json();
        setRoomsSectionTitle(data.value);
      }

      const roomsSectionDescriptionResponse = await fetch(`${API_URL}/api/settings/rooms_section_description`);
      if (roomsSectionDescriptionResponse.ok) {
        const data = await roomsSectionDescriptionResponse.json();
        setRoomsSectionDescription(data.value);
      }
    } catch (err) {
      // Error loading settings
    } finally {
      setLoading(false);
    }
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCtaImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCtaImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCtaImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoomsImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRoomsImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRoomsImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveHero = async () => {
    if (!heroImageFile && !heroImage) {
      setError('Please select a hero image');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('key', 'hero_image');
      formData.append('type', 'image');
      formData.append('description', 'Home page hero background image');
      
      if (heroImageFile) {
        formData.append('file', heroImageFile);
      }

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save hero image');

      const data = await response.json();
      setHeroImage(data);
      setHeroImageFile(null);
      setSuccess('Hero image updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save hero image');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCta = async () => {
    if (!ctaImageFile && !ctaImage) {
      setError('Please select a CTA image');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('key', 'cta_image');
      formData.append('type', 'image');
      formData.append('description', 'Home page CTA section background image');
      
      if (ctaImageFile) {
        formData.append('file', ctaImageFile);
      }

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save CTA image');

      const data = await response.json();
      setCtaImage(data);
      setCtaImageFile(null);
      setSuccess('CTA image updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save CTA image');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRooms = async () => {
    if (!roomsImageFile && !roomsImage) {
      setError('Please select a rooms header image');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('key', 'rooms_header_image');
      formData.append('type', 'image');
      formData.append('description', 'Rooms page header background image');
      
      if (roomsImageFile) {
        formData.append('file', roomsImageFile);
      }

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save rooms header image');

      const data = await response.json();
      setRoomsImage(data);
      setRoomsImageFile(null);
      setSuccess('Rooms header image updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rooms header image');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-amber-600" />
          การตั้งค่าเว็บไซต์
        </h1>
        <p className="text-gray-600 mt-2">จัดการการตั้งค่าและรูปลักษณ์ของเว็บไซต์ของคุณ</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Hero Image Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-amber-600" />
          รูปภาพพื้นหลังหน้าแรก
        </h2>
        <p className="text-gray-600 mb-6">
          อัปโหลดรูปภาพคุณภาพสูงสำหรับส่วนหีโร่ของหน้าแรก (แนะนำ: 1920x1080px หรือใหญ่กว่า)
        </p>

        <div className="space-y-4">
          {/* Current Image Preview */}
          {heroImagePreview && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {heroImageFile ? 'ตัวอย่างรูปภาพใหม่' : 'รูปภาพหีโร่ปัจจุบัน'}
              </label>
              <div className="relative aspect-[21/9] overflow-hidden rounded-lg border-2 border-gray-200">
                <img
                  src={heroImagePreview}
                  alt="Hero preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-4xl font-light mb-2">ตัวอย่าง</h3>
                    <p className="text-lg">นี่คือวิธีที่จะแสดงบนหน้าแรก</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {heroImage ? 'แทนที่รูปภาพหีโร่' : 'อัปโหลดรูปภาพหีโร่'}
            </label>
            <label className="cursor-pointer">
              <div className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 transition-colors bg-gray-50 hover:bg-amber-50">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-gray-600">
                  {heroImageFile ? heroImageFile.name : 'คลิกเพื่ออัปโหลดรูปภาพใหม่'}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroImageChange}
                className="hidden"
              />
            </label>
            <p className="mt-2 text-xs text-gray-500">
              รูปแบบที่รองรับ: JPG, PNG, GIF, WebP (สูงสุด 10MB)
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveHero}
              disabled={saving || (!heroImageFile && !heroImage)}
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-5 h-5" />
              {saving ? 'กำลังบันทึก...' : 'บันทึกรูปภาพหีโร่'}
            </button>
          </div>
        </div>
      </div>

      {/* CTA Image Section */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-amber-600" />
          รูปภาพพื้นหลังส่วน CTA
        </h2>
        <p className="text-gray-600 mb-6">
          อัปโหลดรูปภาพคุณภาพสูงสำหรับส่วนเรียกให้ดำเนินการ (แนะนำ: 1920x1080px หรือใหญ่กว่า)
        </p>

        <div className="space-y-4">
          {/* Current Image Preview */}
          {ctaImagePreview && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {ctaImageFile ? 'ตัวอย่างรูปภาพใหม่' : 'รูปภาพ CTA ปัจจุบัน'}
              </label>
              <div className="relative aspect-[21/9] overflow-hidden rounded-lg border-2 border-gray-200">
                <img
                  src={ctaImagePreview}
                  alt="CTA preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-4xl font-light mb-2">พร้อมสำหรับการพักผ่อนอันสมบูรณ์แบบแล้วหรือยัง?</h3>
                    <p className="text-lg">ค้นพบความกลมกลืนของธรรมชาติและความหรูหรา</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {ctaImage ? 'แทนที่รูปภาพ CTA' : 'อัปโหลดรูปภาพ CTA'}
            </label>
            <label className="cursor-pointer">
              <div className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 transition-colors bg-gray-50 hover:bg-amber-50">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-gray-600">
                  {ctaImageFile ? ctaImageFile.name : 'คลิกเพื่ออัปโหลดรูปภาพใหม่'}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleCtaImageChange}
                className="hidden"
              />
            </label>
            <p className="mt-2 text-xs text-gray-500">
              รูปแบบที่รองรับ: JPG, PNG, GIF, WebP (สูงสุด 10MB)
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveCta}
              disabled={saving || (!ctaImageFile && !ctaImage)}
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-5 h-5" />
              {saving ? 'กำลังบันทึก...' : 'บันทึกรูปภาพ CTA'}
            </button>
          </div>
        </div>
      </div>

      {/* Rooms Header Image Section */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-amber-600" />
          รูปภาพพื้นหลังหัวข้อหน้าห้องพัก
        </h2>
        <p className="text-gray-600 mb-6">
          อัปโหลดรูปภาพคุณภาพสูงสำหรับหัวข้อหน้ารายการห้องพัก (แนะนำ: 1920x1080px หรือใหญ่กว่า)
        </p>

        <div className="space-y-4">
          {/* Current Image Preview */}
          {roomsImagePreview && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {roomsImageFile ? 'ตัวอย่างรูปภาพใหม่' : 'รูปภาพหัวข้อห้องพักปัจจุบัน'}
              </label>
              <div className="relative aspect-[21/9] overflow-hidden rounded-lg border-2 border-gray-200">
                <img
                  src={roomsImagePreview}
                  alt="Rooms header preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-4xl font-light mb-2">วิลล่าหรูหราของเรา</h3>
                    <p className="text-lg">เลือกจากคอลเล็กชั่นวิลล่าที่ออกแบบอย่างพิถีพิถัน</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {roomsImage ? 'แทนที่รูปภาพหัวข้อห้องพัก' : 'อัปโหลดรูปภาพหัวข้อห้องพัก'}
            </label>
            <label className="cursor-pointer">
              <div className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 transition-colors bg-gray-50 hover:bg-amber-50">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-gray-600">
                  {roomsImageFile ? roomsImageFile.name : 'คลิกเพื่ออัปโหลดรูปภาพใหม่'}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleRoomsImageChange}
                className="hidden"
              />
            </label>
            <p className="mt-2 text-xs text-gray-500">
              รูปแบบที่รองรับ: JPG, PNG, GIF, WebP (สูงสุด 10MB)
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveRooms}
              disabled={saving || (!roomsImageFile && !roomsImage)}
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-5 h-5" />
              {saving ? 'กำลังบันทึก...' : 'บันทึกรูปภาพหัวข้อห้องพัก'}
            </button>
          </div>
        </div>
      </div>

      {/* Text Settings Section */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-amber-600" />
          การตั้งค่าข้อความเว็บไซต์
        </h2>
        <p className="text-gray-600 mb-6">
          ปรับแต่งชื่อเว็บไซต์และสโลแกนที่แสดงทั่วทั้งเว็บไซต์
        </p>

        <div className="space-y-6">
          {/* Site Name - First Part */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อเว็บไซต์ (ส่วนแรก - สไตล์บาง)
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Asili"
            />
            <p className="mt-1 text-xs text-gray-500">
              แสดงในรูปแบบฟอนต์บาง (เช่น "Asili")
            </p>
          </div>

          {/* Site Name - Second Part */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อเว็บไซต์ (ส่วนที่สอง - สไตล์หนาสีเหลืองอำพัน)
            </label>
            <input
              type="text"
              value={siteNameSecondPart}
              onChange={(e) => setSiteNameSecondPart(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Village"
            />
            <p className="mt-1 text-xs text-gray-500">
              แสดงในรูปแบบฟอนต์หนาสีเหลืองอำพัน (เช่น "Village")
            </p>
          </div>

          {/* Hero Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หัวข้อส่วนหีโร่ (บรรทัดแรก)
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Escape to Nature's"
            />
            <p className="mt-1 text-xs text-gray-500">
              บรรทัดแรกของหัวข้อส่วนหีโร่ (น้ำหนักบาง)
            </p>
          </div>

          {/* Hero Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หัวข้อส่วนหีโร่ (บรรทัดที่สอง)
            </label>
            <input
              type="text"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Luxury Embrace"
            />
            <p className="mt-1 text-xs text-gray-500">
              บรรทัดที่สองของหัวข้อส่วนหีโร่ (หนาสีเหลืองอำพัน แสดงด้านล่างบรรทัดแรก)
            </p>
          </div>

          {/* Hero Tagline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สโลแกนส่วนหีโร่
            </label>
            <textarea
              value={heroTagline}
              onChange={(e) => setHeroTagline(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Where warm wood meets wild nature..."
            />
            <p className="mt-1 text-xs text-gray-500">
              แสดงในส่วนหีโร่ของหน้าแรก
            </p>
          </div>

          {/* CTA Tagline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สโลแกนส่วน CTA
            </label>
            <textarea
              value={ctaTagline}
              onChange={(e) => setCtaTagline(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Discover the harmony of nature and luxury..."
            />
            <p className="mt-1 text-xs text-gray-500">
              แสดงในส่วนเรียกให้ดำเนินการของหน้าแรก
            </p>
          </div>

          {/* Site Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คำอธิบายเว็บไซต์
            </label>
            <textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="A luxury boutique resort nestled in nature..."
            />
            <p className="mt-1 text-xs text-gray-500">
              แสดงในส่วนท้ายด้านล่างชื่อเว็บไซต์
            </p>
          </div>

          {/* Featured Rooms Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หัวข้อส่วนห้องพักแนะนำ (หน้าแรก)
            </label>
            <input
              type="text"
              value={featuredRoomsTitle}
              onChange={(e) => setFeaturedRoomsTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Our Signature Villas"
            />
            <p className="mt-1 text-xs text-gray-500">
              แสดงในส่วนห้องพักแนะนำของหน้าแรก
            </p>
          </div>

          {/* Featured Rooms Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คำอธิบายส่วนห้องพักแนะนำ (หน้าแรก)
            </label>
            <textarea
              value={featuredRoomsDescription}
              onChange={(e) => setFeaturedRoomsDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Each villa is designed to provide..."
            />
            <p className="mt-1 text-xs text-gray-500">
              แสดงด้านล่างหัวข้อในส่วนห้องพักแนะนำของหน้าแรก
            </p>
          </div>

          {/* Contact Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ที่อยู่ติดต่อ
            </label>
            <input
              type="text"
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="123 Nature Road, Thailand"
            />
            <p className="mt-1 text-xs text-gray-500">
              แสดงในส่วนติดต่อของส่วนท้าย
            </p>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เบอร์โทรศัพท์ติดต่อ
            </label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="+66 123 456 789"
            />
            <p className="mt-1 text-xs text-gray-500">
              แสดงในส่วนติดต่อของส่วนท้าย
            </p>
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              อีเมลติดต่อ
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="hello@asilivillage.com"
            />
            <p className="mt-1 text-xs text-gray-500">
              แสดงในส่วนติดต่อของส่วนท้าย
            </p>
          </div>

          {/* Rooms Page Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หัวข้อหัวข้อหน้าห้องพัก
            </label>
            <input
              type="text"
              value={roomsPageTitle}
              onChange={(e) => setRoomsPageTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Our Luxury Villas"
            />
            <p className="mt-1 text-xs text-gray-500">
              แสดงในส่วนหัวข้อของหน้าห้องพัก
            </p>
          </div>

          {/* Rooms Page Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คำบรรยายหัวข้อหน้าห้องพัก
            </label>
            <textarea
              value={roomsPageSubtitle}
              onChange={(e) => setRoomsPageSubtitle(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Choose from our collection..."
            />
            <p className="mt-1 text-xs text-gray-500">
              แสดงด้านล่างหัวข้อในหน้าห้องพัก
            </p>
          </div>

          {/* Rooms Section Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หัวข้อส่วนห้องพัก
            </label>
            <input
              type="text"
              value={roomsSectionTitle}
              onChange={(e) => setRoomsSectionTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Our Signature Villas"
            />
            <p className="mt-1 text-xs text-gray-500">
              แสดงด้านบนรายการห้องพัก
            </p>
          </div>

          {/* Rooms Section Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คำอธิบายส่วนห้องพัก
            </label>
            <textarea
              value={roomsSectionDescription}
              onChange={(e) => setRoomsSectionDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Each villa is designed to provide..."
            />
            <p className="mt-1 text-xs text-gray-500">
              แสดงด้านล่างหัวข้อส่วน ด้านบนรายการห้องพัก
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={async () => {
                try {
                  setSaving(true);
                  setError('');
                  setSuccess('');

                  const token = localStorage.getItem('adminToken');
                  
                  // Save site name (first part)
                  await fetch(`${API_URL}/api/settings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      key: 'site_name',
                      value: siteName,
                      type: 'text',
                      description: 'Site name (first part)',
                    }),
                  });

                  // Save site name (second part)
                  await fetch(`${API_URL}/api/settings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      key: 'site_name_second_part',
                      value: siteNameSecondPart,
                      type: 'text',
                      description: 'Site name second part',
                    }),
                  });

                  // Save hero title
                  await fetch(`${API_URL}/api/settings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      key: 'hero_title',
                      value: heroTitle,
                      type: 'text',
                      description: 'Hero section title first line',
                    }),
                  });

                  // Save hero subtitle
                  await fetch(`${API_URL}/api/settings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      key: 'hero_subtitle',
                      value: heroSubtitle,
                      type: 'text',
                      description: 'Hero section title second line',
                    }),
                  });

                  // Save hero tagline
                  await fetch(`${API_URL}/api/settings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      key: 'hero_tagline',
                      value: heroTagline,
                      type: 'text',
                      description: 'Hero section tagline',
                    }),
                  });

                  // Save CTA tagline
                  await fetch(`${API_URL}/api/settings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      key: 'cta_tagline',
                      value: ctaTagline,
                      type: 'text',
                      description: 'CTA section tagline',
                    }),
                  });

                  // Save site description
                  await fetch(`${API_URL}/api/settings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      key: 'site_description',
                      value: siteDescription,
                      type: 'text',
                      description: 'Site description',
                    }),
                  });

                  // Save featured rooms title
                  await fetch(`${API_URL}/api/settings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      key: 'featured_rooms_title',
                      value: featuredRoomsTitle,
                      type: 'text',
                      description: 'Featured rooms section title',
                    }),
                  });

                  // Save featured rooms description
                  await fetch(`${API_URL}/api/settings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      key: 'featured_rooms_description',
                      value: featuredRoomsDescription,
                      type: 'text',
                      description: 'Featured rooms section description',
                    }),
                  });

                  // Save contact address
                  await fetch(`${API_URL}/api/settings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      key: 'contact_address',
                      value: contactAddress,
                      type: 'text',
                      description: 'Contact address',
                    }),
                  });

                  // Save contact phone
                  await fetch(`${API_URL}/api/settings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      key: 'contact_phone',
                      value: contactPhone,
                      type: 'text',
                      description: 'Contact phone',
                    }),
                  });

                  // Save contact email
                  await fetch(`${API_URL}/api/settings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      key: 'contact_email',
                      value: contactEmail,
                      type: 'text',
                      description: 'Contact email',
                    }),
                  });

                  // Save rooms page title
                  await fetch(`${API_URL}/api/settings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      key: 'rooms_page_title',
                      value: roomsPageTitle,
                      type: 'text',
                      description: 'Rooms page header title',
                    }),
                  });

                  // Save rooms page subtitle
                  await fetch(`${API_URL}/api/settings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      key: 'rooms_page_subtitle',
                      value: roomsPageSubtitle,
                      type: 'text',
                      description: 'Rooms page header subtitle',
                    }),
                  });

                  // Save rooms section title
                  await fetch(`${API_URL}/api/settings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      key: 'rooms_section_title',
                      value: roomsSectionTitle,
                      type: 'text',
                      description: 'Rooms section title',
                    }),
                  });

                  // Save rooms section description
                  await fetch(`${API_URL}/api/settings`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      key: 'rooms_section_description',
                      value: roomsSectionDescription,
                      type: 'text',
                      description: 'Rooms section description',
                    }),
                  });

                  setSuccess('Text settings updated successfully!');
                  setTimeout(() => setSuccess(''), 3000);
                } catch (err) {
                  setError('Failed to save text settings');
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-5 h-5" />
              {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าข้อความ'}
            </button>
          </div>
        </div>
      </div>

      {/* Additional Settings Section (Future) */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
        <h3 className="text-lg font-medium text-gray-700 mb-2">การตั้งค่าเพิ่มเติมเร็วๆ นี้</h3>
        <p className="text-gray-600">
          การตั้งค่าเว็บไซต์เพิ่มเติม เช่น ข้อมูลติดต่อ ลิงก์โซเชียลมีเดีย และอื่นๆ จะพร้อมให้บริการที่นี่
        </p>
      </div>
    </div>
  );
}
