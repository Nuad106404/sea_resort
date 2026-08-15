import { forwardRef } from 'react';
import { BookingData } from '../../pages/BookingWizard';
import { calculateNightsBreakdown, calculateBedroomReduction } from '../../lib/pricing';

interface Props {
  bookingData: BookingData;
  total: number;
  nights: number;
  siteName: string;
  siteNameSecondPart: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
}

const fmtDate = (value: string) =>
  new Date(value).toLocaleDateString('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const fmtShortDate = (value: string | Date) =>
  new Date(value).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const PAYMENT_LABELS: Record<string, string> = {
  bank_transfer: 'โอนเงินผ่านธนาคาร',
  promptpay: 'พร้อมเพย์ (PromptPay QR)',
  card: 'บัตรเครดิต / เดบิต',
};

/**
 * Print-ready A4 booking receipt (794 x 1123 px = A4 @ 96dpi).
 *
 * Rendered off-screen and captured by html2canvas, or printed directly via
 * the @media print rules in index.css. Deliberately avoids gradients,
 * backdrop-filter and shadows, which html2canvas renders unreliably.
 *
 * The body uses a flex-1 spacer so the footer stays pinned to the page
 * bottom, and overflow-hidden clips at the page edge rather than ever
 * producing a taller-than-A4 capture. Verified to fit at 1123px including
 * a two-line room name (measured in a headless browser).
 */
export const BookingReceiptA4 = forwardRef<HTMLDivElement, Props>(function BookingReceiptA4(
  {
    bookingData,
    total,
    nights,
    siteName,
    siteNameSecondPart,
    contactEmail,
    contactPhone,
    contactAddress,
  },
  ref
) {
  const room = bookingData.room;
  const bedroomsUsed = bookingData.bedroomsUsed || room?.bedrooms || 1;
  const breakdown = calculateNightsBreakdown(room, bookingData.checkIn, bookingData.checkOut);
  const bedroomReduction = calculateBedroomReduction(room, bedroomsUsed, nights);

  // Card payments are settled immediately; transfer/PromptPay await admin review
  const isSettled = bookingData.paymentMethod === 'card';
  const paymentLabel = PAYMENT_LABELS[bookingData.paymentMethod] || '-';

  return (
    <div
      ref={ref}
      id="receipt-a4"
      className="receipt-a4 flex flex-col overflow-hidden bg-white text-aqua-900"
      style={{ width: '794px', height: '1123px', fontFamily: "'IBM Plex Sans Thai', sans-serif" }}
    >
      {/* ---------------- HEADER ---------------- */}
      <div className="flex items-start justify-between bg-aqua-900 px-12 py-6 text-white">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-[26px] font-medium leading-none"
              style={{ fontFamily: "'Prompt', sans-serif" }}
            >
              {siteName}
            </span>
            <span
              className="text-[26px] font-light leading-none text-aqua-300"
              style={{ fontFamily: "'Prompt', sans-serif" }}
            >
              {siteNameSecondPart}
            </span>
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-[0.28em] text-aqua-400">
            Resort &amp; Private Villas
          </p>
        </div>

        <div className="text-right">
          <p
            className="text-[19px] font-medium leading-none"
            style={{ fontFamily: "'Prompt', sans-serif" }}
          >
            ใบยืนยันการจอง
          </p>
          <p className="mt-2 text-[9px] uppercase tracking-[0.28em] text-aqua-400">
            Booking Confirmation
          </p>
        </div>
      </div>

      {/* ---------------- REFERENCE STRIP ---------------- */}
      <div className="flex items-center justify-between border-b-2 border-aqua-900 bg-foam-100 px-12 py-4">
        <div>
          <p className="mb-1 text-[9px] uppercase tracking-[0.2em] text-aqua-500">
            หมายเลขอ้างอิง / Reference
          </p>
          <p className="font-mono text-[22px] font-bold leading-none tracking-wide text-aqua-900">
            {bookingData.bookingReference}
          </p>
        </div>
        <div className="text-right">
          <p className="mb-1 text-[9px] uppercase tracking-[0.2em] text-aqua-500">
            วันที่ออกเอกสาร
          </p>
          <p className="text-[13px] font-medium text-aqua-800">{fmtShortDate(new Date())}</p>
        </div>
      </div>

      {/* ---------------- BODY ---------------- */}
      <div className="flex flex-1 flex-col px-12 py-5">
        {/* Room */}
        <div className="mb-5 flex items-center gap-5 rounded-xl border border-foam-300 p-3.5">
          {room?.image_url && (
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}${room.image_url}`}
              alt=""
              crossOrigin="anonymous"
              className="h-[70px] w-[102px] flex-shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[9px] uppercase tracking-[0.2em] text-aqua-500">ห้องพัก</p>
            <p
              className="text-[20px] font-medium leading-tight text-aqua-900"
              style={{ fontFamily: "'Prompt', sans-serif" }}
            >
              {room?.name}
            </p>
            <p className="mt-1.5 text-[12px] text-aqua-600">
              {bedroomsUsed} ห้องนอน · เข้าพัก {bookingData.guests} ท่าน · รองรับสูงสุด{' '}
              {room?.capacity} ท่าน
            </p>
          </div>
        </div>

        {/* Guest + stay */}
        <div className="mb-5 grid grid-cols-2 gap-5">
          <div className="rounded-xl border border-foam-300 p-4">
            <p className="mb-2.5 border-b border-foam-200 pb-2 text-[9px] uppercase tracking-[0.2em] text-aqua-500">
              ข้อมูลผู้เข้าพัก
            </p>
            <table className="w-full text-[12px]">
              <tbody>
                <tr>
                  <td className="py-1 align-top text-aqua-500">ชื่อ</td>
                  <td className="py-1 text-right font-medium text-aqua-900">
                    {bookingData.guestName}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 align-top text-aqua-500">อีเมล</td>
                  <td className="break-all py-1 text-right font-medium text-aqua-900">
                    {bookingData.guestEmail}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 align-top text-aqua-500">โทรศัพท์</td>
                  <td className="py-1 text-right font-medium text-aqua-900">
                    {bookingData.guestPhone}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-foam-300 p-4">
            <p className="mb-2.5 border-b border-foam-200 pb-2 text-[9px] uppercase tracking-[0.2em] text-aqua-500">
              รายละเอียดการเข้าพัก
            </p>
            <table className="w-full text-[12px]">
              <tbody>
                <tr>
                  <td className="py-1 align-top text-aqua-500">เช็คอิน</td>
                  <td className="py-1 text-right font-medium text-aqua-900">
                    {fmtShortDate(bookingData.checkIn)}
                    <span className="ml-1 text-aqua-500">14:00</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-1 align-top text-aqua-500">เช็คเอาท์</td>
                  <td className="py-1 text-right font-medium text-aqua-900">
                    {fmtShortDate(bookingData.checkOut)}
                    <span className="ml-1 text-aqua-500">12:00</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-1 align-top text-aqua-500">ระยะเวลา</td>
                  <td className="py-1 text-right font-medium text-aqua-900">{nights} คืน</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Charges */}
        <div>
          <p className="mb-3 text-[9px] uppercase tracking-[0.2em] text-aqua-500">
            รายละเอียดค่าบริการ
          </p>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b-2 border-aqua-800">
                <th className="pb-2 text-left font-medium text-aqua-700">รายการ</th>
                <th className="pb-2 text-center font-medium text-aqua-700">จำนวน</th>
                <th className="pb-2 text-right font-medium text-aqua-700">ราคา</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.weekdayNights > 0 && (
                <tr className="border-b border-foam-200">
                  <td className="py-2 text-aqua-800">ค่าห้องพัก · วันธรรมดา</td>
                  <td className="py-2 text-center text-aqua-600">
                    {breakdown.weekdayNights} คืน
                  </td>
                  <td className="py-2 text-right font-medium text-aqua-900">
                    ฿{breakdown.weekdayPrice.toLocaleString()}
                  </td>
                </tr>
              )}
              {breakdown.weekendNights > 0 && (
                <tr className="border-b border-foam-200">
                  <td className="py-2 text-aqua-800">ค่าห้องพัก · วันหยุด (ศุกร์–เสาร์)</td>
                  <td className="py-2 text-center text-aqua-600">
                    {breakdown.weekendNights} คืน
                  </td>
                  <td className="py-2 text-right font-medium text-aqua-900">
                    ฿{breakdown.weekendPrice.toLocaleString()}
                  </td>
                </tr>
              )}
              {bedroomReduction > 0 && room && (
                <tr className="border-b border-foam-200">
                  <td className="py-2 text-aqua-800">
                    ส่วนลดห้องนอนที่ไม่ใช้ ({room.bedrooms - bedroomsUsed} ห้อง)
                  </td>
                  <td className="py-2 text-center text-aqua-600">-</td>
                  <td className="py-2 text-right font-medium text-sun-600">
                    -฿{bedroomReduction.toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Total */}
          <div className="mt-3.5 flex items-center justify-between rounded-xl bg-aqua-900 px-6 py-3.5 text-white">
            <div>
              <p
                className="text-[15px] font-medium leading-none"
                style={{ fontFamily: "'Prompt', sans-serif" }}
              >
                ยอดรวมทั้งสิ้น
              </p>
              <p className="mt-1.5 text-[9px] uppercase tracking-[0.2em] text-aqua-400">
                Total Amount
              </p>
            </div>
            <p
              className="text-[30px] font-medium leading-none"
              style={{ fontFamily: "'Prompt', sans-serif" }}
            >
              ฿{total.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Payment */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-foam-300 px-6 py-3.5">
          <div>
            <p className="mb-1 text-[9px] uppercase tracking-[0.2em] text-aqua-500">
              วิธีชำระเงิน
            </p>
            <p className="text-[13px] font-medium text-aqua-900">{paymentLabel}</p>
          </div>
          <div className="text-right">
            <p className="mb-1 text-[9px] uppercase tracking-[0.2em] text-aqua-500">
              สถานะการชำระเงิน
            </p>
            <span
              className={`inline-block rounded-full px-3.5 py-1 text-[11px] font-semibold ${
                isSettled ? 'bg-aqua-100 text-aqua-800' : 'bg-sun-100 text-sun-700'
              }`}
            >
              {isSettled ? 'ชำระเงินเรียบร้อยแล้ว' : 'รอตรวจสอบการชำระเงิน'}
            </span>
          </div>
        </div>

        {/* Fills remaining height so the footer sits at the page bottom */}
        <div className="flex-1" />

        {/* Notes */}
        <div className="rounded-xl bg-foam-100 px-6 py-3.5">
          <p className="mb-1.5 text-[9px] uppercase tracking-[0.2em] text-aqua-500">เงื่อนไข</p>
          <ul className="space-y-0.5 text-[10.5px] leading-relaxed text-aqua-600">
            <li>• กรุณาแสดงหมายเลขอ้างอิงนี้ในวันเช็คอิน</li>
            <li>• เช็คอินตั้งแต่เวลา 14:00 น. และเช็คเอาท์ก่อนเวลา 12:00 น.</li>
            <li>• ยกเลิกได้ฟรีภายใน 48 ชั่วโมงก่อนวันเช็คอิน</li>
            {!isSettled && (
              <li>• การจองจะได้รับการยืนยันสมบูรณ์หลังเจ้าหน้าที่ตรวจสอบการชำระเงินแล้ว</li>
            )}
          </ul>
        </div>
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <div className="border-t-2 border-aqua-900 px-12 py-4">
        <div className="flex items-end justify-between">
          <div className="text-[10px] leading-relaxed text-aqua-600">
            <p className="mb-0.5 font-medium text-aqua-800">
              {siteName} {siteNameSecondPart}
            </p>
            <p>{contactAddress}</p>
            <p>
              {contactPhone} · {contactEmail}
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-[13px] font-medium text-aqua-700"
              style={{ fontFamily: "'Prompt', sans-serif" }}
            >
              ขอบคุณที่เลือกพักกับเรา
            </p>
            <p className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-aqua-400">
              Thank you for your stay
            </p>
          </div>
        </div>
        <p className="mt-3 border-t border-foam-200 pt-2.5 text-center text-[8.5px] text-aqua-400">
          เอกสารนี้ออกโดยระบบอัตโนมัติ · {fmtDate(bookingData.checkIn)} ·{' '}
          {bookingData.bookingReference}
        </p>
      </div>
    </div>
  );
});
