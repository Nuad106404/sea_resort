import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  BedDouble,
  ArrowRight,
  Check,
  SlidersHorizontal,
  Images,
  X,
  ChevronDown,
} from 'lucide-react';
import { roomAPI } from '../lib/api';
import { settingsAPI } from '../lib/settingsAPI';
import { getRates } from '../lib/pricing';
import { Room } from '../types/room';

type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'capacity-desc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: 'แนะนำ' },
  { value: 'price-asc', label: 'ราคาต่ำ → สูง' },
  { value: 'price-desc', label: 'ราคาสูง → ต่ำ' },
  { value: 'capacity-desc', label: 'รองรับคนได้มากสุด' },
];

export function Rooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomsHeaderImage, setRoomsHeaderImage] = useState<string>('');
  const [roomsPageTitle, setRoomsPageTitle] = useState<string>('');
  const [roomsPageSubtitle, setRoomsPageSubtitle] = useState<string>('');
  const [roomsSectionDescription, setRoomsSectionDescription] = useState<string>('');

  // Filters
  const [minGuests, setMinGuests] = useState(0);
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [sortBy, setSortBy] = useState<SortKey>('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false); // mobile only

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await roomAPI.getAll();
        setRooms(data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();

    // Read from the shared /api/settings payload — no extra request, and no
    // 404 when no header image has been uploaded.
    const fetchRoomsHeaderImage = async () => {
      const url = await settingsAPI.getImageUrl('rooms_header_image');
      if (url) setRoomsHeaderImage(url);
    };
    fetchRoomsHeaderImage();

    const fetchRoomsText = async () => {
      try {
        const settings = await settingsAPI.getAll();
        setRoomsPageTitle(settings.roomsPageTitle);
        setRoomsPageSubtitle(settings.roomsPageSubtitle);
        setRoomsSectionDescription(settings.roomsSectionDescription);
      } catch (error) {
        console.error('Error fetching rooms text settings:', error);
      }
    };
    fetchRoomsText();
  }, []);

  const handleBookRoom = (room: Room) => {
    navigate('/book', { state: { roomId: room._id } });
  };

  // Capacity/bedroom ranges drive the filter options, so they always match
  // what actually exists rather than being hardcoded
  const { maxCapacity, maxBedrooms } = useMemo(
    () => ({
      maxCapacity: rooms.reduce((m, r) => Math.max(m, r.capacity), 0),
      maxBedrooms: rooms.reduce((m, r) => Math.max(m, r.bedrooms), 0),
    }),
    [rooms]
  );

  const visibleRooms = useMemo(() => {
    const filtered = rooms.filter(
      (room) => room.capacity >= minGuests && room.bedrooms >= minBedrooms
    );

    const priceOf = (room: Room) => getRates(room).weekdayRate;

    switch (sortBy) {
      case 'price-asc':
        return [...filtered].sort((a, b) => priceOf(a) - priceOf(b));
      case 'price-desc':
        return [...filtered].sort((a, b) => priceOf(b) - priceOf(a));
      case 'capacity-desc':
        return [...filtered].sort((a, b) => b.capacity - a.capacity);
      default:
        return filtered;
    }
  }, [rooms, minGuests, minBedrooms, sortBy]);

  const activeFilterCount = (minGuests > 0 ? 1 : 0) + (minBedrooms > 0 ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;
  const resetFilters = () => {
    setMinGuests(0);
    setMinBedrooms(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-foam-100">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 rounded-full border-2 border-aqua-200 border-t-sun-400 animate-spin" />
          <p className="text-sm text-aqua-500">กำลังโหลดวิลล่า...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-foam-100 min-h-screen">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-aqua-900">
        {/* Photo when configured; otherwise a designed gradient + dot field so
            an unset rooms_header_image still looks intentional, not broken */}
        {roomsHeaderImage ? (
          <>
            <img src={roomsHeaderImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
            {/* deep water on the left fading to sunlit shallows on the right */}
            <div className="absolute inset-0 bg-gradient-to-br from-aqua-950/85 via-aqua-800/55 to-aqua-500/35" />
            <div className="absolute -right-20 -top-24 h-96 w-96 rounded-full bg-sun-300/25 blur-3xl animate-shimmer" />
          </>
        ) : (
          <>
            {/* Bright tropical water: deep on one corner, sunlit shallows on the other */}
            <div className="absolute inset-0 bg-gradient-to-br from-aqua-900 via-aqua-600 to-aqua-400" />
            <div
              className="absolute inset-0 opacity-[0.16]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at center, #FFFFFF 1.5px, transparent 1.5px)',
                backgroundSize: '26px 26px',
              }}
            />
            {/* sunlight breaking over the water */}
            <div className="absolute -right-16 -top-28 h-96 w-96 rounded-full bg-sun-300/45 blur-3xl animate-shimmer" />
            <div className="absolute right-10 top-4 h-40 w-40 rounded-full bg-sun-200/50 blur-2xl" />
            <div className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-aqua-200/30 blur-3xl" />
          </>
        )}

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-32 pb-14 sm:pt-40 sm:pb-20">
          <div className="max-w-2xl animate-fade-up">
            <span className="eyebrow !text-aqua-200 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-sun-400" />
              ที่พักทั้งหมด
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-light leading-[1.15] text-white">
              {roomsPageTitle}
            </h1>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-white/80">
              {roomsPageSubtitle}
            </p>

            {/* At-a-glance stats replace the dead space the old hero left */}
            <div className="mt-7 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 text-sm text-white">
                <span className="font-display font-medium">{rooms.length}</span> วิลล่า
              </span>
              {maxCapacity > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 text-sm text-white">
                  <Users className="h-3.5 w-3.5" />
                  รองรับสูงสุด {maxCapacity} ท่าน
                </span>
              )}
              {maxBedrooms > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 text-sm text-white">
                  <BedDouble className="h-3.5 w-3.5" />
                  สูงสุด {maxBedrooms} ห้องนอน
                </span>
              )}
            </div>
          </div>
        </div>

        {/* wave transition into the page canvas */}
        <div className="absolute inset-x-0 bottom-0 leading-none" aria-hidden="true">
          <svg className="block w-full h-8 sm:h-12 text-foam-100" viewBox="0 0 1440 60" preserveAspectRatio="none" fill="currentColor">
            <path d="M0,32 C240,68 480,4 720,22 C960,40 1200,60 1440,28 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* ================= FILTER BAR =================
          Deliberately NOT sticky: pinned, it floated over the cards while
          scrolling, and on mobile the stacked selects covered most of the
          screen. Solid background (no glass) so nothing shows through. */}
      <div className="px-4 pt-8">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl bg-white border border-foam-200 shadow-soft p-3 sm:p-4">
            {/* Mobile: collapsed summary row that toggles the controls */}
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              className="flex w-full items-center justify-between gap-3 px-2 py-1.5 lg:hidden"
            >
              <span className="flex items-center gap-2 text-aqua-700">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm font-medium">ตัวกรอง</span>
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-sun-400 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-sm text-aqua-500">
                  พบ <span className="font-medium text-aqua-800">{visibleRooms.length}</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-aqua-400 transition-transform duration-300 ${
                    filtersOpen ? 'rotate-180' : ''
                  }`}
                />
              </span>
            </button>

            {/* min-w-0 throughout: a <select> is sized by its longest option,
                and grid/flex tracks default to min-width:auto. */}
            <div
              className={`${filtersOpen ? 'block' : 'hidden'} lg:block mt-3 lg:mt-0`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 min-w-0">
                <div className="hidden lg:flex items-center gap-2 text-aqua-700 px-1">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="text-sm font-medium whitespace-nowrap">ตัวกรอง</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 min-w-0">
                <label className="relative min-w-0">
                  <span className="sr-only">จำนวนผู้เข้าพัก</span>
                  <select
                    value={minGuests}
                    onChange={(e) => setMinGuests(Number(e.target.value))}
                    className="w-full appearance-none rounded-2xl border border-foam-300 bg-white px-4 py-3 text-sm text-aqua-800 focus:outline-none focus:border-aqua-400 focus:ring-4 focus:ring-aqua-100 transition"
                  >
                    <option value={0}>ผู้เข้าพัก · ทั้งหมด</option>
                    {[2, 4, 6, 8].filter((n) => n <= maxCapacity).map((n) => (
                      <option key={n} value={n}>
                        {n} ท่านขึ้นไป
                      </option>
                    ))}
                  </select>
                </label>

                <label className="relative min-w-0">
                  <span className="sr-only">จำนวนห้องนอน</span>
                  <select
                    value={minBedrooms}
                    onChange={(e) => setMinBedrooms(Number(e.target.value))}
                    className="w-full appearance-none rounded-2xl border border-foam-300 bg-white px-4 py-3 text-sm text-aqua-800 focus:outline-none focus:border-aqua-400 focus:ring-4 focus:ring-aqua-100 transition"
                  >
                    <option value={0}>ห้องนอน · ทั้งหมด</option>
                    {Array.from({ length: maxBedrooms }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} ห้องนอนขึ้นไป
                      </option>
                    ))}
                  </select>
                </label>

                <label className="relative min-w-0">
                  <span className="sr-only">เรียงลำดับ</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                    className="w-full appearance-none rounded-2xl border border-foam-300 bg-white px-4 py-3 text-sm text-aqua-800 focus:outline-none focus:border-aqua-400 focus:ring-4 focus:ring-aqua-100 transition"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        เรียง · {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                </div>

                {/* Desktop: count + reset inline */}
                <div className="hidden lg:flex items-center justify-end gap-3 px-1">
                  <span className="text-sm text-aqua-500 whitespace-nowrap">
                    พบ <span className="font-medium text-aqua-800">{visibleRooms.length}</span>{' '}
                    วิลล่า
                  </span>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center gap-1.5 rounded-full bg-foam-100 px-3.5 py-2 text-xs font-medium text-aqua-600 transition-colors hover:bg-foam-200"
                    >
                      <X className="h-3.5 w-3.5" />
                      ล้างตัวกรอง
                    </button>
                  )}
                </div>

                {/* Mobile: reset only — the count already sits in the toggle row */}
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="lg:hidden inline-flex items-center justify-center gap-1.5 rounded-2xl bg-foam-100 px-4 py-3 text-xs font-medium text-aqua-600 transition-colors hover:bg-foam-200"
                  >
                    <X className="h-3.5 w-3.5" />
                    ล้างตัวกรอง
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ROOM GRID ================= */}
      <section className="px-4 pt-8 pb-20 sm:pb-24">
        <div className="max-w-6xl mx-auto">
          {roomsSectionDescription && (
            <p className="max-w-2xl mb-8 text-sm sm:text-base leading-relaxed text-aqua-600">
              {roomsSectionDescription}
            </p>
          )}

          {visibleRooms.length === 0 ? (
            <div className="card p-12 sm:p-16 text-center">
              <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-aqua-50 text-aqua-400">
                <SlidersHorizontal className="h-7 w-7" />
              </span>
              <h3 className="font-display text-xl font-light text-aqua-900 mb-2">
                ไม่พบวิลล่าที่ตรงกับเงื่อนไข
              </h3>
              <p className="text-sm text-aqua-600 mb-7">
                ลองลดจำนวนผู้เข้าพักหรือห้องนอนที่ต้องการลง
              </p>
              <button onClick={resetFilters} className="btn-secondary">
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-7">
              {visibleRooms.map((room) => {
                const { weekdayRate, weekendRate } = getRates(room);
                const galleryCount = (room.images?.length || 0) + 1;

                // Only treat it as a discount when the effective rate is
                // genuinely cheaper — a discount_price that is equal to or
                // higher than the base price is bad data, not a saving.
                const weekdayHasDiscount = weekdayRate < room.weekday_price;
                const weekendHasDiscount = weekendRate < room.weekend_price;
                const discountPct = weekdayHasDiscount
                  ? Math.round((1 - weekdayRate / room.weekday_price) * 100)
                  : weekendHasDiscount
                  ? Math.round((1 - weekendRate / room.weekend_price) * 100)
                  : 0;

                return (
                  <article key={room._id} className="group card card-hover flex flex-col overflow-hidden">
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${room.image_url}`}
                        alt={room.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-aqua-950/60 via-transparent to-transparent" />

                      {(weekdayHasDiscount || weekendHasDiscount) && (
                        <span className="absolute top-4 left-4 rounded-full bg-sun-400 px-3.5 py-1.5 text-xs font-semibold text-white shadow-glow">
                          {discountPct > 0 ? `ลด ${discountPct}%` : 'ราคาพิเศษ'}
                        </span>
                      )}

                      {galleryCount > 1 && (
                        <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-aqua-950/45 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white">
                          <Images className="h-3.5 w-3.5" />
                          {galleryCount}
                        </span>
                      )}

                      {/* specs sit over the image bottom, freeing body space */}
                      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-aqua-700">
                          <BedDouble className="h-3.5 w-3.5" />
                          {room.bedrooms} ห้องนอน
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-aqua-700">
                          <Users className="h-3.5 w-3.5" />
                          {room.capacity} ท่าน
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col p-6 sm:p-7">
                      <h2 className="font-display text-xl sm:text-2xl font-medium text-aqua-900 mb-2.5">
                        {room.name}
                      </h2>
                      <p className="text-sm leading-relaxed text-aqua-600 line-clamp-2 mb-5">
                        {room.description}
                      </p>

                      {room.features.length > 0 && (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-6">
                          {room.features.slice(0, 4).map((feature, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-aqua-100 text-aqua-600">
                                <Check className="h-2.5 w-2.5" strokeWidth={3} />
                              </span>
                              <span className="text-xs text-aqua-700 line-clamp-1">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Pricing pinned to the card bottom so cards align */}
                      <div className="mt-auto border-t border-foam-200 pt-5">
                        <div className="flex items-end justify-between gap-4 mb-5">
                          <div>
                            <div className="text-[0.7rem] uppercase tracking-wider text-aqua-400 mb-1">
                              วันธรรมดา
                            </div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-display text-2xl font-medium text-aqua-800">
                                ฿{weekdayRate.toLocaleString()}
                              </span>
                              {weekdayHasDiscount && (
                                <span className="text-xs text-foam-500 line-through">
                                  ฿{room.weekday_price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[0.7rem] uppercase tracking-wider text-aqua-400 mb-1">
                              วันหยุด
                            </div>
                            <div className="flex items-baseline justify-end gap-1.5">
                              <span className="font-display text-2xl font-medium text-aqua-800">
                                ฿{weekendRate.toLocaleString()}
                              </span>
                              {weekendHasDiscount && (
                                <span className="text-xs text-foam-500 line-through">
                                  ฿{room.weekend_price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {room.price_reduction_per_bedroom && room.price_reduction_per_bedroom > 0 ? (
                          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-aqua-50 px-3.5 py-1.5 text-xs text-aqua-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-aqua-400" />
                            ลด {room.price_reduction_per_bedroom.toLocaleString()} บาท/คืน
                            ต่อห้องนอนที่ไม่ใช้
                          </p>
                        ) : null}

                        <div className="flex items-center gap-3">
                          <Link
                            to={`/rooms/${room._id}`}
                            className="btn-ghost flex-1 !px-4 !py-3 !text-sm"
                          >
                            รายละเอียด
                          </Link>
                          <button
                            onClick={() => handleBookRoom(room)}
                            className="btn-primary flex-1 !px-4 !py-3 !text-sm"
                          >
                            <span>จองเลย</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
