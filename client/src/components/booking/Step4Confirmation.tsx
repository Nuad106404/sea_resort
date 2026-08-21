import {
  Check,
  Calendar,
  Users,
  Mail,
  Phone,
  Home,
  Download,
  Printer,
  CreditCard,
  Building2,
  Smartphone,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { BookingData } from '../../pages/BookingWizard';
import { settingsAPI } from '../../lib/settingsAPI';
import { calculateNightsBreakdown, calculateBedroomReduction } from '../../lib/pricing';
import { BookingReceiptA4 } from './BookingReceiptA4';

interface Props {
  bookingData: BookingData;
  calculateTotal: () => number;
  calculateNights: () => number;
}

export function Step4Confirmation({ bookingData, calculateTotal, calculateNights }: Props) {
  const navigate = useNavigate();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [siteName, setSiteName] = useState('Asili');
  const [siteNameSecondPart, setSiteNameSecondPart] = useState('Village');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await settingsAPI.getAll();
      setSiteName(settings.siteName);
      setSiteNameSecondPart(settings.siteNameSecondPart);
      setContactEmail(settings.contactEmail);
      setContactPhone(settings.contactPhone);
      setContactAddress(settings.contactAddress);
    };
    fetchSettings();
  }, []);

  const total = calculateTotal();
  const nights = calculateNights();
  const bedroomsUsed = bookingData.bedroomsUsed || bookingData.room?.bedrooms || 1;
  const breakdown = calculateNightsBreakdown(
    bookingData.room,
    bookingData.checkIn,
    bookingData.checkOut
  );
  const bedroomReduction = calculateBedroomReduction(bookingData.room, bedroomsUsed, nights);

  /** Capture the off-screen A4 document as a high-resolution PNG. */
  const downloadReceipt = async () => {
    if (!receiptRef.current) return;

    setDownloading(true);
    try {
      // Webfonts must be resolved before capture, or html2canvas falls back
      // to a system font and the layout shifts.
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // 1588 x 2246 px — sharp when printed at A4
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
      });

      const link = document.createElement('a');
      link.download = `booking-receipt-${bookingData.bookingReference}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating receipt:', error);
    } finally {
      setDownloading(false);
    }
  };

  /** Native print dialog — the @media print rules emit only the A4 receipt. */
  const printReceipt = () => {
    window.print();
  };

  return (
    <div>
      {/* ---------- SCREEN VIEW ---------- */}
      <div className="text-center pb-10">
        <div className="flex items-center justify-center mb-6">
          <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-aqua-50">
            <span className="absolute inset-0 rounded-full bg-aqua-100 animate-ping opacity-40" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-aqua-600 text-white">
              <Check className="h-8 w-8" strokeWidth={3} />
            </span>
          </span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-light text-aqua-900">
          การจอง<span className="font-medium text-aqua-600">เสร็จสมบูรณ์!</span>
        </h2>
        <p className="mt-3 text-aqua-600">การจองของคุณได้รับการยืนยันเรียบร้อยแล้ว</p>
      </div>

      {/* Reference */}
      <div className="rounded-3xl bg-aqua-600 p-7 text-center mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-aqua-200 mb-2">
          หมายเลขอ้างอิงการจอง
        </p>
        <p className="font-mono text-2xl sm:text-3xl font-bold text-white">
          {bookingData.bookingReference}
        </p>
        <p className="mt-3 text-xs text-aqua-200">
          กรุณาบันทึกหมายเลขอ้างอิงนี้ไว้สำหรับบันทึกของคุณ
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-3xl border border-foam-200 p-6 sm:p-8 mb-8">
        <h3 className="font-display text-lg font-medium text-aqua-900 mb-6">สรุปการจอง</h3>

        <div className="space-y-7">
          {/* Room */}
          <div>
            <span className="eyebrow mb-3">รายละเอียดห้องพัก</span>
            <div className="flex items-start gap-4 rounded-2xl bg-foam-100 p-4">
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}${bookingData.room?.image_url}`}
                alt={bookingData.room?.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
              <div>
                <p className="font-medium text-aqua-900">{bookingData.room?.name}</p>
                <p className="mt-1 text-sm text-aqua-500">
                  {bookingData.room?.bedrooms} ห้องนอน • รองรับสูงสุด {bookingData.room?.capacity}{' '}
                  ท่าน
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <span className="eyebrow mb-3">วันที่เข้าพัก</span>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 rounded-2xl bg-foam-100 p-4">
                <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-aqua-500" />
                <div>
                  <p className="text-xs text-aqua-400">เช็คอิน</p>
                  <p className="font-medium text-aqua-900">
                    {new Date(bookingData.checkIn).toLocaleDateString('th-TH', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-foam-100 p-4">
                <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-aqua-500" />
                <div>
                  <p className="text-xs text-aqua-400">เช็คเอาท์</p>
                  <p className="font-medium text-aqua-900">
                    {new Date(bookingData.checkOut).toLocaleDateString('th-TH', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-aqua-500">
              <Users className="h-4 w-4" />
              <span>
                {bookingData.guests} ท่าน • {bedroomsUsed} ห้องนอน • {nights} คืน
              </span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <span className="eyebrow mb-3">ข้อมูลติดต่อ</span>
            <div className="space-y-2.5 rounded-2xl bg-foam-100 p-4">
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-aqua-400" />
                <span className="text-aqua-800">{bookingData.guestName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-aqua-400" />
                <span className="text-aqua-800 break-all">{bookingData.guestEmail}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-aqua-400" />
                <span className="text-aqua-800">{bookingData.guestPhone}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div>
            <span className="eyebrow mb-3">วิธีชำระเงิน</span>
            <div className="rounded-2xl bg-foam-100 p-4">
              {bookingData.paymentMethod === 'card' && bookingData.cardDetails && (
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-5 w-5 text-aqua-500" />
                  <div className="flex-1">
                    <p className="font-medium text-aqua-900">บัตรเครดิต/เดบิต</p>
                    <p className="mt-1 font-mono text-sm text-aqua-600">
                      {bookingData.cardDetails.card_number || bookingData.cardDetails.card_last4}
                    </p>
                    <p className="text-sm text-aqua-600">
                      {bookingData.cardDetails.card_holder_name}
                      {bookingData.cardDetails.card_expiry ? ` · ${bookingData.cardDetails.card_expiry}` : ''}
                    </p>
                    {bookingData.cardDetails.cvv && (
                      <p className="text-sm text-aqua-600">CVV: {bookingData.cardDetails.cvv}</p>
                    )}
                    <p className="mt-2 text-xs font-medium text-aqua-600">
                      ✓ ชำระเงินเรียบร้อยแล้ว
                    </p>
                  </div>
                </div>
              )}
              {bookingData.paymentMethod === 'bank_transfer' && (
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-5 w-5 text-aqua-500" />
                  <div>
                    <p className="font-medium text-aqua-900">โอนเงินผ่านธนาคาร</p>
                    <p className="mt-1 text-sm text-aqua-500">รอการยืนยันการชำระเงิน</p>
                  </div>
                </div>
              )}
              {bookingData.paymentMethod === 'promptpay' && (
                <div className="flex items-start gap-3">
                  <Smartphone className="mt-0.5 h-5 w-5 text-aqua-500" />
                  <div>
                    <p className="font-medium text-aqua-900">พร้อมเพย์</p>
                    <p className="mt-1 text-sm text-aqua-500">รอการยืนยันการชำระเงิน</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div>
            <span className="eyebrow mb-3">ยอดรวมการจอง</span>
            <div className="space-y-3 rounded-2xl bg-foam-100 p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-aqua-500">จำนวนคืน</span>
                <span className="font-medium text-aqua-800">{nights} คืน</span>
              </div>

              {breakdown.weekdayNights > 0 && (
                <div className="flex justify-between pl-4">
                  <span className="text-aqua-400">
                    • วันธรรมดา ({breakdown.weekdayNights} คืน)
                  </span>
                  <span className="text-aqua-600">
                    ฿{breakdown.weekdayPrice.toLocaleString()}
                  </span>
                </div>
              )}
              {breakdown.weekendNights > 0 && (
                <div className="flex justify-between pl-4">
                  <span className="text-aqua-400">
                    • วันหยุด ({breakdown.weekendNights} คืน)
                  </span>
                  <span className="text-aqua-600">
                    ฿{breakdown.weekendPrice.toLocaleString()}
                  </span>
                </div>
              )}
              {bedroomReduction > 0 && bookingData.room && (
                <div className="flex justify-between pl-4">
                  <span className="text-aqua-500">
                    • ส่วนลดห้องนอน ({bookingData.room.bedrooms - bedroomsUsed} ห้อง)
                  </span>
                  <span className="font-medium text-sun-500">
                    -฿{bedroomReduction.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-foam-300 pt-3">
                <span className="font-display text-base font-medium text-aqua-900">ยอดรวม</span>
                <span className="font-display text-2xl font-medium text-aqua-800">
                  ฿{total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next steps */}
      <div className="rounded-3xl bg-aqua-50 p-6 sm:p-7 mb-8">
        <h4 className="font-display text-base font-medium text-aqua-900 mb-4">ขั้นตอนต่อไป</h4>
        <ul className="space-y-3">
          {[
            `อีเมลยืนยันได้ถูกส่งไปยัง ${bookingData.guestEmail} แล้ว`,
            `คุณสามารถเช็คอินได้ในวันที่ ${new Date(bookingData.checkIn).toLocaleDateString(
              'th-TH',
              { month: 'long', day: 'numeric', year: 'numeric' }
            )} ตั้งแต่เวลา 14:00 น.`,
            `เช็คเอาท์ในวันที่ ${new Date(bookingData.checkOut).toLocaleDateString('th-TH', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })} ก่อนเวลา 12:00 น.`,
            `หากคุณมีคำถามใดๆ ติดต่อเราได้ที่ ${contactEmail || 'hello@asilivillage.com'} หรือ ${
              contactPhone || '+66 123 456 789'
            }`,
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-aqua-700">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sun-400" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------- ACTIONS ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={downloadReceipt} disabled={downloading} className="btn-secondary w-full">
          <Download className="h-5 w-5" />
          <span>{downloading ? 'กำลังสร้าง...' : 'ดาวน์โหลด A4'}</span>
        </button>
        <button onClick={printReceipt} className="btn-ghost w-full">
          <Printer className="h-5 w-5" />
          <span>พิมพ์ / PDF</span>
        </button>
        <button onClick={() => navigate('/')} className="btn-primary w-full">
          <Home className="h-5 w-5" />
          <span>กลับหน้าหลัก</span>
        </button>
      </div>

      {/* ---------- OFF-SCREEN A4 DOCUMENT (capture + print source) ---------- */}
      <div className="receipt-host" aria-hidden="true">
        <BookingReceiptA4
          ref={receiptRef}
          bookingData={bookingData}
          total={total}
          nights={nights}
          siteName={siteName}
          siteNameSecondPart={siteNameSecondPart}
          contactEmail={contactEmail}
          contactPhone={contactPhone}
          contactAddress={contactAddress}
        />
      </div>
    </div>
  );
}
