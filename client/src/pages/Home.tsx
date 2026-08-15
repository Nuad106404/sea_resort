import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Sparkles, Users, BedDouble, Search } from 'lucide-react';
import { roomAPI } from '../lib/api';
import { settingsAPI, type SiteSettings } from '../lib/settingsAPI';
import { getRates } from '../lib/pricing';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Room } from '../types/room';

const FEATURES = [
  {
    icon: Leaf,
    title: 'ดื่มด่ำธรรมชาติ',
    body: 'ล้อมรอบด้วยพืชพรรณอันเขียวชอุ่มและความงามตามธรรมชาติ วิลล่าแต่ละหลังมอบที่พักผ่อนอันเงียบสงบ ห่างจากความวุ่นวายในชีวิตประจำวัน',
  },
  {
    icon: Sparkles,
    title: 'ความสะดวกสบายระดับพรีเมียม',
    body: 'สัมผัสสิ่งอำนวยความสะดวกระดับโลกพร้อมสระว่ายน้ำส่วนตัว อ่างอาบน้ำหรูหรา และบริการอาหารเช้าในวิลล่า',
  },
  {
    icon: Users,
    title: 'เหมาะสำหรับทุกคน',
    body: 'ไม่ว่าจะเป็นการพักผ่อนแบบโรแมนติกหรือวันหยุดครอบครัว วิลล่าของเรารองรับทั้งคู่รักไปจนถึงกลุ่มใหญ่ด้วยสไตล์ที่โดดเด่น',
  },
];

export function Home() {
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [heroImage, setHeroImage] = useState<string>(
    'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1600'
  );
  const [ctaImage, setCtaImage] = useState<string>(
    'https://images.pexels.com/photos/276514/pexels-photo-276514.jpeg?auto=compress&cs=tinysrgb&w=1600'
  );
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: '',
    siteNameSecondPart: '',
    heroTitle: '',
    heroSubtitle: '',
    heroTagline: '',
    ctaTagline: '',
    siteDescription: '',
    featuredRoomsTitle: '',
    featuredRoomsDescription: '',
    roomsPageTitle: '',
    roomsPageSubtitle: '',
    roomsSectionTitle: '',
    roomsSectionDescription: '',
    contactAddress: '',
    contactPhone: '',
    contactEmail: '',
  });

  useDocumentTitle(`${settings.siteName} ${settings.siteNameSecondPart}`);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await roomAPI.getFeatured();
        setFeaturedRooms(data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    fetchRooms();

    // Images come from the same cached /api/settings payload as the text,
    // so an unconfigured image no longer costs a request that 404s.
    const fetchImages = async () => {
      const [hero, cta] = await Promise.all([
        settingsAPI.getImageUrl('hero_image'),
        settingsAPI.getImageUrl('cta_image'),
      ]);
      if (hero) setHeroImage(hero);
      if (cta) setCtaImage(cta);
    };
    fetchImages();

    const fetchSettings = async () => {
      const data = await settingsAPI.getAll();
      setSettings(data);
    };
    fetchSettings();
  }, []);

  return (
    <div className="bg-foam-100">
      {/* ================= HERO =================
          hero-h uses svh so the card is never cut off by a mobile URL bar. */}
      <section className="relative hero-h flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="h-full w-full object-cover animate-slow-zoom" />
          {/* Stronger, mostly-vertical scrim: on a small screen the card sits
              over the image, so text contrast can't depend on a side gradient. */}
          <div className="absolute inset-0 bg-gradient-to-t from-aqua-950/85 via-aqua-900/45 to-aqua-950/55" />
          <div className="absolute -right-24 -top-32 h-[24rem] w-[24rem] rounded-full bg-sun-300/30 blur-3xl animate-shimmer" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pb-7 sm:pb-20 pt-28 sm:pt-32">
          <div className="glass rounded-4xl sm:rounded-5xl p-5 sm:p-12 max-w-3xl animate-fade-up">
            <span className="eyebrow mb-3 sm:mb-5 text-[0.65rem] sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-sun-400" />
              รีสอร์ทและวิลล่าส่วนตัว
            </span>

            <h1 className="font-display text-[1.75rem] leading-[1.15] sm:text-6xl sm:leading-[1.1] font-light text-aqua-900">
              {settings.heroTitle}
              <span className="block font-medium text-aqua-600 mt-0.5 sm:mt-1">
                {settings.heroSubtitle}
              </span>
            </h1>

            {/* Clamped rather than hidden on mobile: still readable, but can't
                push the CTAs below the fold on a long tagline. */}
            <p className="mt-3 sm:mt-5 text-sm sm:text-lg leading-relaxed text-aqua-700/90 max-w-xl line-clamp-2 sm:line-clamp-none">
              {settings.heroTagline}
            </p>

            <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <Link to="/rooms" className="btn-primary !py-3.5 sm:!py-4 w-full sm:w-auto">
                <span>สำรวจวิลล่าของเรา</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/dashboard" className="btn-ghost !py-3.5 sm:!py-4 w-full sm:w-auto">
                <Search className="h-5 w-5" />
                <span>ค้นหาการจอง</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="px-4 py-12 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-6 sm:mb-12">
            <span className="eyebrow mb-2.5 sm:mb-4">ทำไมต้องเรา</span>
            <h2 className="font-display text-2xl sm:text-4xl font-light text-aqua-900 leading-snug">
              ประสบการณ์พักผ่อน
              <span className="text-aqua-500"> ที่ออกแบบมาเพื่อคุณ</span>
            </h2>
          </div>

          {/* Mobile: compact row layout (icon beside text) so three points fit
              in roughly the space one stacked card used to take.
              Desktop keeps the staggered card grid. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`card card-hover flex md:block gap-4 p-4 sm:p-8 ${
                    i === 1 ? 'md:mt-10' : i === 2 ? 'md:mt-20' : ''
                  }`}
                >
                  <span className="flex h-11 w-11 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-aqua-50 text-aqua-600 md:mb-6">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-base sm:text-xl font-medium text-aqua-900 mb-1 sm:mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-[0.8rem] sm:text-sm leading-relaxed text-aqua-600 line-clamp-3 md:line-clamp-none">
                      {feature.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FEATURED ROOMS ================= */}
      <section className="py-12 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="px-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-6 mb-5 sm:mb-12">
            <div className="max-w-xl">
              <span className="eyebrow mb-2.5 sm:mb-4">ที่พักแนะนำ</span>
              <h2 className="font-display text-2xl sm:text-4xl font-light text-aqua-900 leading-snug">
                {settings.featuredRoomsTitle}
              </h2>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-aqua-600 leading-relaxed line-clamp-2 sm:line-clamp-none">
                {settings.featuredRoomsDescription}
              </p>
            </div>
            <Link
              to="/rooms"
              className="group hidden sm:inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-aqua-600 transition-colors hover:text-sun-600"
            >
              <span>ดูวิลล่าทั้งหมด</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-aqua-200 transition-all duration-300 group-hover:border-sun-400 group-hover:bg-sun-400 group-hover:text-aqua-950">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>

          {/* Mobile: edge-to-edge snap carousel (next card peeks, so it reads as
              swipeable). Desktop: plain 3-up grid. */}
          <div
            className="
              flex snap-x snap-mandatory gap-4 overflow-x-auto no-scrollbar
              px-4 pb-2
              md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-4 md:pb-0
            "
          >
            {featuredRooms.map((room) => {
              const { weekdayRate } = getRates(room);

              return (
                <Link
                  key={room._id}
                  to={`/rooms/${room._id}`}
                  className="group card card-hover overflow-hidden snap-center shrink-0 w-[86%] md:w-auto"
                >
                  <div className="relative aspect-[16/11] sm:aspect-[4/3] overflow-hidden">
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${room.image_url}`}
                      alt={room.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-aqua-950/55 to-transparent" />

                    <div className="price-pill absolute bottom-3 left-3">
                      <span className="font-display text-base sm:text-lg font-medium text-aqua-800">
                        ฿{weekdayRate.toLocaleString()}
                      </span>
                      <span className="text-xs text-aqua-500">/ คืน</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    <h3 className="font-display text-base sm:text-lg font-medium text-aqua-900 mb-1.5 line-clamp-1">
                      {room.name}
                    </h3>
                    <p className="text-[0.8rem] sm:text-sm leading-relaxed text-aqua-600 line-clamp-2 mb-3.5 sm:mb-5">
                      {room.description}
                    </p>
                    <div className="flex items-center gap-4 border-t border-foam-200 pt-3 sm:pt-4 text-xs text-aqua-500">
                      <span className="inline-flex items-center gap-1.5">
                        <BedDouble className="h-4 w-4" />
                        {room.bedrooms} ห้องนอน
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        สูงสุด {room.capacity} ท่าน
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Mobile-only full-width link (the desktop one is inline above) */}
          <div className="px-4 mt-5 sm:hidden">
            <Link to="/rooms" className="btn-ghost w-full !py-3.5">
              <span>ดูวิลล่าทั้งหมด</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="px-4 pb-14 sm:pb-24">
        <div className="relative max-w-6xl mx-auto overflow-hidden rounded-4xl sm:rounded-5xl">
          <img src={ctaImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          {/* Vertical scrim on mobile (text sits over the whole width),
              horizontal on desktop where the text only occupies the left half. */}
          <div className="absolute inset-0 bg-gradient-to-t from-aqua-950/90 via-aqua-950/70 to-aqua-900/50 sm:bg-gradient-to-r sm:from-aqua-950/85 sm:via-aqua-900/60 sm:to-aqua-900/25" />

          <div className="relative z-10 px-5 py-12 sm:px-16 sm:py-28 max-w-2xl">
            <h2 className="font-display text-2xl sm:text-5xl font-light leading-snug sm:leading-tight text-white">
              พร้อมสำหรับ
              <span className="block font-medium text-sun-300 mt-1">
                การพักผ่อนที่สมบูรณ์แบบ?
              </span>
            </h2>
            <p className="mt-3 sm:mt-5 text-sm sm:text-base text-white/85 leading-relaxed line-clamp-3">
              {settings.ctaTagline}
            </p>
            <Link to="/rooms" className="btn-primary mt-6 sm:mt-8 w-full sm:w-auto !py-3.5 sm:!py-4">
              <span>ดูห้องพักที่ว่าง</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
