import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { User as UserIcon, Mail, Phone, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { bookingAPI } from '../../lib/api';
import { BookingData } from '../../pages/BookingWizard';

interface Props {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  calculateTotal: () => number;
}

export function Step2ContactInfo({
  bookingData,
  updateBookingData,
  nextStep,
  prevStep,
  calculateTotal,
}: Props) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [creating, setCreating] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\d\s\+\-\(\)]{8,}$/;
    return phoneRegex.test(phone);
  };

  const handleContinue = async () => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
    };

    if (!bookingData.guestName.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ-นามสกุล';
    } else if (bookingData.guestName.trim().length < 2) {
      newErrors.name = 'กรุณากรอกชื่อที่ถูกต้อง';
    }

    if (!bookingData.guestEmail.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!validateEmail(bookingData.guestEmail)) {
      newErrors.email = 'กรุณากรอกอีเมลที่ถูกต้อง';
    }

    if (!bookingData.guestPhone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (!validatePhone(bookingData.guestPhone)) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (อย่างน้อย 8 หลัก)';
    }

    setErrors(newErrors);

    if (!newErrors.name && !newErrors.email && !newErrors.phone) {
      // Create booking in database immediately
      setCreating(true);
      try {
        const bookingPayload = {
          room_id: bookingData.room?._id,
          check_in: bookingData.checkIn,
          check_out: bookingData.checkOut,
          guests: bookingData.guests,
          bedrooms_used: bookingData.bedroomsUsed || bookingData.room?.bedrooms,
          guest_name: bookingData.guestName,
          guest_email: bookingData.guestEmail.toLowerCase().trim(),
          guest_phone: bookingData.guestPhone,
          total_price: calculateTotal(),
          payment_method: '', // Will be updated in payment step
        };
        const data = await bookingAPI.create(bookingPayload);

        // Store booking ID, reference, and total_price from database
        updateBookingData({
          bookingId: data._id,
          bookingReference: data.booking_reference,
          total_price: data.total_price,
        });

        // Change URL to shareable booking link and proceed to payment step
        navigate(`/book/${data.booking_reference}`, { replace: true });
        nextStep();
      } catch (error) {
        console.error('Failed to create booking:', error);
        const message = error instanceof Error ? error.message : '';
        setErrors({
          ...newErrors,
          name: message.includes('no longer available')
            ? 'ห้องนี้เพิ่งถูกจองไปโดยผู้อื่น กรุณาย้อนกลับไปเลือกวันหรือห้องอื่น'
            : 'ไม่สามารถสร้างการจองได้ กรุณาลองใหม่อีกครั้ง',
        });
      } finally {
        setCreating(false);
      }
    }
  };

  return (
    <div>
      <div className="mb-8">
        <span className="eyebrow mb-3">ข้อมูลติดต่อ</span>
        <h2 className="font-display text-2xl sm:text-3xl font-light text-aqua-900">
          กรอกข้อมูลของคุณเพื่อยืนยันการจอง
        </h2>
      </div>

      <div className="mb-8 flex items-start gap-4 rounded-3xl bg-aqua-50 p-5">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-aqua-600">
          <Mail className="h-4 w-4" />
        </span>
        <div>
          <h3 className="font-medium text-aqua-800 mb-1">ยืนยันการจอง</h3>
          <p className="text-sm leading-relaxed text-aqua-600">
            เราจะส่งรายละเอียดการจองและการยืนยันไปยังอีเมลที่คุณระบุด้านล่าง
          </p>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        <div>
          <label className="label">
            <UserIcon className="mr-1.5 inline h-4 w-4 align-[-2px]" />
            ชื่อ-นามสกุล <span className="text-coral-500">*</span>
          </label>
          <input
            type="text"
            required
            value={bookingData.guestName}
            onChange={(e) => {
              updateBookingData({ guestName: e.target.value });
              setErrors({ ...errors, name: '' });
            }}
            placeholder="กรอกชื่อของคุณ"
            className={`field ${errors.name ? 'field-error' : ''}`}
          />
          {errors.name && (
            <p className="mt-2 flex items-center gap-2 text-sm text-coral-600">
              <span className="h-1.5 w-1.5 rounded-full bg-coral-500" />
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className="label">
            <Mail className="mr-1.5 inline h-4 w-4 align-[-2px]" />
            อีเมล <span className="text-coral-500">*</span>
          </label>
          <input
            type="email"
            required
            value={bookingData.guestEmail}
            onChange={(e) => {
              updateBookingData({ guestEmail: e.target.value });
              setErrors({ ...errors, email: '' });
            }}
            placeholder="you@example.com"
            className={`field ${errors.email ? 'field-error' : ''}`}
          />
          {errors.email ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-coral-600">
              <span className="h-1.5 w-1.5 rounded-full bg-coral-500" />
              {errors.email}
            </p>
          ) : (
            <p className="mt-2 text-sm text-aqua-400">
              การยืนยันการจองจะถูกส่งไปยังอีเมลนี้
            </p>
          )}
        </div>

        <div>
          <label className="label">
            <Phone className="mr-1.5 inline h-4 w-4 align-[-2px]" />
            เบอร์โทรศัพท์ <span className="text-coral-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={bookingData.guestPhone}
            onChange={(e) => {
              updateBookingData({ guestPhone: e.target.value });
              setErrors({ ...errors, phone: '' });
            }}
            placeholder="+66 123 456 789"
            className={`field ${errors.phone ? 'field-error' : ''}`}
          />
          {errors.phone ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-coral-600">
              <span className="h-1.5 w-1.5 rounded-full bg-coral-500" />
              {errors.phone}
            </p>
          ) : (
            <p className="mt-2 text-sm text-aqua-400">เราอาจติดต่อคุณเกี่ยวกับการจองของคุณ</p>
          )}
        </div>
      </div>

      <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-foam-100 px-5 py-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-aqua-400" />
        <p className="text-xs leading-relaxed text-aqua-500">
          ข้อมูลของคุณถูกใช้เพื่อยืนยันการจองเท่านั้น และจะไม่ถูกเปิดเผยต่อบุคคลที่สาม
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={prevStep} className="btn-ghost w-full sm:flex-1">
          <ArrowLeft className="h-5 w-5" />
          <span>ย้อนกลับ</span>
        </button>
        <button
          onClick={handleContinue}
          disabled={creating}
          className="btn-primary w-full sm:flex-1"
        >
          <span>{creating ? 'กำลังสร้างการจอง...' : 'ดำเนินการต่อไปชำระเงิน'}</span>
          {!creating && <ArrowRight className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
