import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Mail, Search, ArrowRight, Compass } from 'lucide-react';
import { bookingAPI } from '../lib/api';

interface Booking {
  _id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  createdAt: string;
  guest_name?: string;
  guest_email?: string;
  booking_reference?: string;
  room_id: {
    name: string;
    image_url: string;
  };
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'ยืนยันแล้ว', className: 'bg-aqua-100 text-aqua-700' },
  pending: { label: 'รอดำเนินการ', className: 'bg-sun-100 text-sun-700' },
  cancelled: { label: 'ยกเลิกแล้ว', className: 'bg-foam-200 text-foam-700' },
  completed: { label: 'เสร็จสมบูรณ์', className: 'bg-aqua-600 text-white' },
};

export function Dashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleGuestSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setIsSearching(true);
    setLoading(true);

    try {
      const data = await bookingAPI.getByEmail(guestEmail.toLowerCase().trim());

      if (!data || data.length === 0) {
        setSearchError('ไม่พบการจองสำหรับอีเมลนี้');
        setBookings([]);
      } else {
        setBookings(data);
        setSearchError('');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setSearchError('ไม่พบการจองสำหรับอีเมลนี้');
      setBookings([]);
    } finally {
      setIsSearching(false);
      setLoading(false);
      setHasSearched(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-foam-100 min-h-screen pt-32 pb-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* ---------- HEADER + SEARCH ---------- */}
        <div className="mb-12">
          <span className="eyebrow mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-sun-400" />
            การจองของคุณ
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-light text-aqua-900">
            ค้นหาการจอง
            <span className="text-aqua-500"> ของคุณ</span>
          </h1>
          <p className="mt-3 text-aqua-600">กรอกอีเมลที่ใช้ตอนจองเพื่อดูรายละเอียดการเข้าพัก</p>
        </div>

        <div className="card p-6 sm:p-8 mb-10">
          <form onSubmit={handleGuestSearch}>
            <label htmlFor="guest-email" className="label">
              <Mail className="mr-1.5 inline h-4 w-4 align-[-2px]" />
              อีเมล
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="guest-email"
                type="email"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="you@example.com"
                className="field flex-1"
              />
              <button type="submit" disabled={isSearching} className="btn-primary sm:!px-9">
                <Search className="h-4 w-4" />
                <span>{isSearching ? 'กำลังค้นหา...' : 'ค้นหา'}</span>
              </button>
            </div>
            {searchError && (
              <p className="mt-3 flex items-center gap-2 text-sm text-coral-600">
                <span className="h-1.5 w-1.5 rounded-full bg-coral-500" />
                {searchError}
              </p>
            )}
          </form>
        </div>

        {/* ---------- LOADING ---------- */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <span className="h-10 w-10 rounded-full border-2 border-aqua-200 border-t-sun-400 animate-spin" />
            <p className="text-sm text-aqua-500">กำลังโหลดการจองของคุณ...</p>
          </div>
        )}

        {/* ---------- EMPTY STATE ---------- */}
        {!loading && bookings.length === 0 && (
          <div className="card p-12 sm:p-16 text-center">
            <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-aqua-50 text-aqua-400">
              {hasSearched ? <Search className="h-8 w-8" /> : <Compass className="h-8 w-8" />}
            </span>
            <h2 className="font-display text-2xl font-light text-aqua-900 mb-2">
              {hasSearched ? 'ไม่พบการจอง' : 'เริ่มค้นหาการจองของคุณ'}
            </h2>
            <p className="text-aqua-600 mb-8 max-w-md mx-auto">
              {hasSearched
                ? 'ลองตรวจสอบอีเมลอีกครั้ง หรือเริ่มวางแผนการพักผ่อนครั้งใหม่ของคุณ'
                : 'กรอกอีเมลด้านบนเพื่อดูการจอง หรือสำรวจวิลล่าของเราเพื่อเริ่มต้น'}
            </p>
            <button onClick={() => navigate('/rooms')} className="btn-secondary">
              <span>สำรวจวิลล่า</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ---------- RESULTS ---------- */}
        {!loading && bookings.length > 0 && (
          <div className="space-y-5">
            {bookings.map((booking) => {
              const status = STATUS_STYLES[booking.status] ?? {
                label: booking.status,
                className: 'bg-foam-200 text-foam-700',
              };

              return (
                <article key={booking._id} className="card card-hover overflow-hidden">
                  <div className="grid sm:grid-cols-3">
                    <div className="relative aspect-[4/3] sm:aspect-auto overflow-hidden">
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${booking.room_id.image_url}`}
                        alt={booking.room_id.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="sm:col-span-2 p-6 sm:p-8">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                        <div>
                          <h3 className="font-display text-xl sm:text-2xl font-medium text-aqua-900">
                            {booking.room_id.name}
                          </h3>
                          {booking.guest_name && (
                            <p className="mt-1 text-sm text-aqua-500">{booking.guest_name}</p>
                          )}
                        </div>
                        <span
                          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {booking.booking_reference && (
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-foam-100 px-4 py-2">
                          <span className="text-[0.7rem] uppercase tracking-wider text-aqua-400">
                            อ้างอิง
                          </span>
                          <span className="font-mono text-sm font-medium text-aqua-800">
                            {booking.booking_reference}
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-6">
                        <div>
                          <div className="mb-1 flex items-center gap-1.5 text-[0.7rem] uppercase tracking-wider text-aqua-400">
                            <Calendar className="h-3.5 w-3.5" />
                            เช็คอิน
                          </div>
                          <div className="text-sm font-medium text-aqua-800">
                            {formatDate(booking.check_in)}
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 flex items-center gap-1.5 text-[0.7rem] uppercase tracking-wider text-aqua-400">
                            <Calendar className="h-3.5 w-3.5" />
                            เช็คเอาท์
                          </div>
                          <div className="text-sm font-medium text-aqua-800">
                            {formatDate(booking.check_out)}
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 flex items-center gap-1.5 text-[0.7rem] uppercase tracking-wider text-aqua-400">
                            <Users className="h-3.5 w-3.5" />
                            ผู้เข้าพัก
                          </div>
                          <div className="text-sm font-medium text-aqua-800">
                            {booking.guests} ท่าน
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end justify-between border-t border-foam-200 pt-5">
                        <span className="text-sm text-aqua-500">
                          {calculateNights(booking.check_in, booking.check_out)} คืน
                        </span>
                        <span className="font-display text-2xl font-medium text-aqua-800">
                          ฿{booking.total_price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
