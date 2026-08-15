import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  BedDouble,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { roomAPI } from '../lib/api';
import { getRates } from '../lib/pricing';
import { Room } from '../types/room';

export function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Get all images (main image + gallery images)
  const getAllImages = () => {
    if (!room) return [];
    const images = [room.image_url];
    if (room.images && room.images.length > 0) {
      images.push(...room.images);
    }
    return images;
  };

  // Auto-slide effect
  useEffect(() => {
    if (!room || !isAutoPlaying || getAllImages().length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === getAllImages().length - 1 ? 0 : prev + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [room, isAutoPlaying, currentImageIndex]);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) return;

      try {
        const data = await roomAPI.getById(id);
        setRoom(data);
      } catch (error) {
        console.error('Error fetching room:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleBookRoom = () => {
    if (room) {
      navigate('/book', { state: { roomId: room._id } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-foam-100">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 rounded-full border-2 border-aqua-200 border-t-sun-400 animate-spin" />
          <p className="text-sm text-aqua-500">กำลังโหลดรายละเอียดวิลล่า...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-foam-100 px-4">
        <h2 className="font-display text-2xl font-light text-aqua-900 mb-4">ไม่พบห้องพัก</h2>
        <Link to="/rooms" className="btn-secondary">
          กลับไปห้องทั้งหมด
        </Link>
      </div>
    );
  }

  const images = getAllImages();
  const { weekdayRate: weekdayPrice, weekendRate: weekendPrice } = getRates(room);
  // A "discount" only counts when the effective rate is actually cheaper
  const weekdayHasDiscount = weekdayPrice < room.weekday_price;
  const weekendHasDiscount = weekendPrice < room.weekend_price;

  return (
    <div className="bg-foam-100 min-h-screen">
      {/* ---------- GALLERY ---------- */}
      <section className="relative h-[65vh] min-h-[420px] overflow-hidden group">
        <img
          src={`${import.meta.env.VITE_BACKEND_URL}${images[currentImageIndex]}`}
          alt={room.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-aqua-950/75 via-transparent to-aqua-950/40" />

        {/* Back link */}
        <div className="absolute top-28 left-0 right-0 z-20">
          <div className="max-w-6xl mx-auto px-4">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/30"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>กลับไปห้องทั้งหมด</span>
            </Link>
          </div>
        </div>

        {/* Title over image */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-10">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="font-display text-4xl sm:text-6xl font-light text-white max-w-3xl">
              {room.name}
            </h1>
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
              }}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 p-3 text-white opacity-0 transition-all duration-300 hover:bg-white/35 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 p-3 text-white opacity-0 transition-all duration-300 hover:bg-white/35 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="absolute top-28 right-4 z-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 p-3 text-white opacity-0 transition-all duration-300 hover:bg-white/35 group-hover:opacity-100"
              title={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>

            {/* Indicators */}
            <div className="absolute bottom-6 right-4 z-20 flex gap-2 sm:right-8">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentImageIndex(index);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? 'w-8 bg-sun-400' : 'w-1.5 bg-white/60 hover:bg-white'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ---------- CONTENT ---------- */}
      <section className="px-4 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-aqua-600 shadow-soft">
                <BedDouble className="h-4 w-4" />
                {room.bedrooms} ห้องนอน
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-aqua-600 shadow-soft">
                <Users className="h-4 w-4" />
                รองรับสูงสุด {room.capacity} ท่าน
              </span>
            </div>

            <div className="mb-12">
              <span className="eyebrow mb-4">เกี่ยวกับวิลล่านี้</span>
              <p className="text-base leading-[1.9] text-aqua-700">{room.description}</p>
            </div>

            <div>
              <span className="eyebrow mb-5">สิ่งอำนวยความสะดวก</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-soft"
                  >
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-aqua-100 text-aqua-600">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="text-sm text-aqua-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky booking card */}
          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-28">
              <div className="card p-7 sm:p-8">
                <div className="space-y-5 pb-6 border-b border-foam-200">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[0.7rem] uppercase tracking-wider text-aqua-400 mb-1">
                        วันธรรมดา
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-3xl font-medium text-aqua-800">
                          ฿{weekdayPrice.toLocaleString()}
                        </span>
                        <span className="text-sm text-aqua-500">/ คืน</span>
                      </div>
                    </div>
                    {weekdayHasDiscount && (
                      <span className="text-sm text-foam-500 line-through">
                        ฿{room.weekday_price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[0.7rem] uppercase tracking-wider text-aqua-400 mb-1">
                        วันหยุด
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-3xl font-medium text-aqua-800">
                          ฿{weekendPrice.toLocaleString()}
                        </span>
                        <span className="text-sm text-aqua-500">/ คืน</span>
                      </div>
                    </div>
                    {weekendHasDiscount && (
                      <span className="text-sm text-foam-500 line-through">
                        ฿{room.weekend_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {room.price_reduction_per_bedroom && room.price_reduction_per_bedroom > 0 ? (
                  <p className="mt-5 rounded-2xl bg-aqua-50 px-4 py-3 text-xs leading-relaxed text-aqua-600">
                    💰 ลด {room.price_reduction_per_bedroom.toLocaleString()} บาท/คืน
                    ต่อห้องนอนที่ไม่ใช้
                  </p>
                ) : null}

                <button onClick={handleBookRoom} className="btn-primary w-full mt-6">
                  จองห้องนี้
                </button>
                <Link to="/rooms" className="btn-ghost w-full mt-3">
                  ดูห้องทั้งหมด
                </Link>

                <div className="mt-6 flex items-start gap-2.5 border-t border-foam-200 pt-5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-aqua-400" />
                  <p className="text-xs leading-relaxed text-aqua-500">
                    ยกเลิกได้ฟรีภายใน 48 ชั่วโมงก่อนเช็คอิน
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
