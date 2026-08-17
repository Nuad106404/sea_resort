import { useState, useEffect, useRef, useCallback } from 'react';
import { CreditCard, Building2, Smartphone, ArrowLeft, Lock, Copy, Check, Upload, X, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { bookingAPI, bankAPI } from '../../lib/api';
import { BookingData } from '../../pages/BookingWizard';

interface Props {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  calculateTotal: () => number;
  calculateNights: () => number;
  hideBackButton?: boolean;
}

const PAYMENT_METHODS = [
  {
    id: 'bank_transfer',
    name: 'โอนเงินผ่านธนาคาร',
    description: 'โอนเงินตรงเข้าบัญชีธนาคารของเรา',
    icon: Building2,
  },
  {
    id: 'promptpay',
    name: 'พร้อมเพย์ QR',
    description: 'สแกน QR เพื่อจ่ายเงินทันที',
    icon: Smartphone,
  },
  {
    id: 'card',
    name: 'บัตรเดบิตหรือเครดิต',
    description: 'จ่ายเงินด้วยบัตรอย่างปลอดภัย',
    icon: CreditCard,
  },
];

export function Step3Payment({
  bookingData,
  updateBookingData,
  nextStep,
  prevStep,
  calculateTotal,
  calculateNights,
  hideBackButton = false,
}: Props) {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    otp: '',
  });
  const [showOtpStep, setShowOtpStep] = useState(false);

  // Helper function to check if a date is a weekend (Friday or Saturday)
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 5 || day === 6; // Friday = 5, Saturday = 6
  };

  // Calculate weekday and weekend nights breakdown
  const calculateNightsBreakdown = () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !bookingData.room) {
      return { weekdayNights: 0, weekendNights: 0, weekdayPrice: 0, weekendPrice: 0 };
    }

    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    let weekdayNights = 0;
    let weekendNights = 0;
    let weekdayPrice = 0;
    let weekendPrice = 0;
    let currentDate = new Date(checkInDate);

    const room = bookingData.room;
    const weekdayRate = (room.weekday_discount_price && room.weekday_discount_price > 0) 
      ? room.weekday_discount_price 
      : room.weekday_price;
    const weekendRate = (room.weekend_discount_price && room.weekend_discount_price > 0)
      ? room.weekend_discount_price
      : room.weekend_price;

    while (currentDate < checkOutDate) {
      if (isWeekend(currentDate)) {
        weekendNights++;
        weekendPrice += weekendRate;
      } else {
        weekdayNights++;
        weekdayPrice += weekdayRate;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { weekdayNights, weekendNights, weekdayPrice, weekendPrice };
  };
  
  // Parse OTP expire time from env (e.g., "2m" -> 120 seconds)
  const getOtpExpireSeconds = () => {
    const timeStr = import.meta.env.VITE_OTP_EXPIRE_TIME || '2m';
    const match = timeStr.match(/(\d+)([smh])/);
    if (!match) return 120; // default 2 minutes
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      default: return 120;
    }
  };
  
  const [otpCountdown, setOtpCountdown] = useState(getOtpExpireSeconds());
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [paymentSlipPreview, setPaymentSlipPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  // Show expiration alert and redirect to home
  const handleExpiration = useCallback(async () => {
    try {
      await Swal.fire({
        icon: 'error',
        title: 'การจองหมดอายุ',
        text: 'การจองของคุณหมดอายุและถูกลบแล้ว กรุณาสร้างการจองใหม่',
        confirmButtonText: 'กลับหน้าหลัก',
        confirmButtonColor: '#d97706',
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      navigate('/');
    } catch (error) {
      console.error('Error showing alert:', error);
    }
  }, [navigate]);

  // Fetch booking details and start countdown
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (bookingData.bookingId) {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bookings/reference/${bookingData.bookingReference}`);
          
          // Handle 410 Gone - booking expired and deleted
          if (response.status === 410) {
            setIsExpired(true);
            setTimeRemaining(0);
            await handleExpiration();
            return;
          }
          
          if (response.ok) {
            const data = await response.json();
            
            // Calculate initial time remaining
            const expiresAt = new Date(data.expires_at).getTime();
            const now = Date.now();
            const remaining = expiresAt - now; // Don't use Math.max, keep negative value
            
            if (remaining <= 0) {
              setIsExpired(true);
              setTimeRemaining(0);
              await handleExpiration();
            } else {
              setTimeRemaining(remaining);
            }
          }
        } catch (error) {
          console.error('Failed to fetch booking details:', error);
        }
      }
    };

    fetchBookingDetails();
  }, [bookingData.bookingId, bookingData.bookingReference, handleExpiration]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null) return;
    
    // If already expired, trigger immediately
    if (timeRemaining <= 0 && !isExpired) {
      setIsExpired(true);
      handleExpiration();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1000) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isExpired, handleExpiration]);

  // Handle expiration when isExpired changes to true
  useEffect(() => {
    if (isExpired && (timeRemaining === 0 || timeRemaining === null || timeRemaining <= 0)) {
      handleExpiration();
    }
  }, [isExpired, timeRemaining, handleExpiration]);

  // OTP countdown timer
  useEffect(() => {
    if (!showOtpStep) return;

    const timer = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          setShowOtpStep(false);
          setError('OTP expired. Please try again.');
          return getOtpExpireSeconds();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showOtpStep]);

  // Fetch bank accounts
  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const accounts = await bankAPI.getActive();
        setBankAccounts(accounts);
      } catch (error) {
        console.error('Failed to fetch bank accounts:', error);
      } finally {
        setLoadingBanks(false);
      }
    };

    fetchBankAccounts();
  }, []);

  // Get available payment methods based on bank accounts
  const getAvailablePaymentMethods = () => {
    return PAYMENT_METHODS.filter(method => {
      // Hide bank_transfer if loading or no active bank transfer accounts
      if (method.id === 'bank_transfer') {
        const hasBankTransferAccounts = bankAccounts.some(
          account => account.type === 'bank_transfer' && account.is_active
        );
        if (loadingBanks || !hasBankTransferAccounts) {
          return false;
        }
      }
      
      // Hide promptpay if loading or no active promptpay accounts
      if (method.id === 'promptpay') {
        const hasPromptPayAccounts = bankAccounts.some(
          account => account.type === 'promptpay' && account.is_active
        );
        if (loadingBanks || !hasPromptPayAccounts) {
          return false;
        }
      }
      
      // Hide card if loading or no active card payment enabled
      if (method.id === 'card') {
        const hasCardPaymentEnabled = bankAccounts.some(
          account => account.type === 'card' && account.is_active
        );
        if (loadingBanks || !hasCardPaymentEnabled) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Automatically select first payment method if none selected
  useEffect(() => {
    // Only auto-select after bank accounts are loaded
    if (loadingBanks) return;
    
    const availableMethods = getAvailablePaymentMethods();
    if (!bookingData.paymentMethod && availableMethods.length > 0) {
      updateBookingData({ paymentMethod: availableMethods[0].id as any });
    }
  }, [bookingData.paymentMethod, updateBookingData, bankAccounts, loadingBanks]);

  const formatTimeRemaining = () => {
    if (timeRemaining === null) return '--:--';
    if (timeRemaining <= 0) return '00:00';

    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const copyAccountNumber = () => {
    const bankTransferAccount = bankAccounts.find(acc => acc.type === 'bank_transfer');
    if (bankTransferAccount) {
      navigator.clipboard.writeText(bankTransferAccount.account_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Card formatting functions
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 16) {
      setCardData({ ...cardData, cardNumber: formatCardNumber(value) });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCardData({ ...cardData, expiryDate: formatExpiryDate(value) });
    }
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCardData({ ...cardData, cvv: value });
    }
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setCardData({ ...cardData, otp: value });
    }
  };

  // Payment slip upload handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image (JPG, PNG, WEBP) or PDF file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setPaymentSlip(file);
      setError('');

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPaymentSlipPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPaymentSlipPreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setPaymentSlip(null);
    setPaymentSlipPreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePayment = async () => {
    setError('');

    if (isExpired) {
      await handleExpiration();
      return;
    }

    if (!bookingData.paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if (!bookingData.bookingId) {
      setError('Booking not found. Please go back and try again.');
      return;
    }

    // Validate card details if card payment
    if (bookingData.paymentMethod === 'card') {
      if (!cardData.cardNumber || !cardData.cardName || !cardData.expiryDate || !cardData.cvv) {
        setError('Please fill in all card details');
        return;
      }
      
      // Basic card number validation (must be 16 digits)
      const cardNumberClean = cardData.cardNumber.replace(/\s/g, '');
      if (cardNumberClean.length < 15 || cardNumberClean.length > 16) {
        setError('Invalid card number');
        return;
      }
      
      // Expiry date validation (MM/YY format)
      if (!/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
        setError('Invalid expiry date format (MM/YY)');
        return;
      }
      
      // CVV validation (3-4 digits)
      if (cardData.cvv.length < 3 || cardData.cvv.length > 4) {
        setError('Invalid CVV');
        return;
      }

      // If OTP step is not shown yet, show it and return
      if (!showOtpStep) {
        setShowOtpStep(true);
        setOtpCountdown(getOtpExpireSeconds()); // Reset countdown from env
        setError('');
        return;
      }

      // If OTP step is shown, validate OTP
      if (!cardData.otp || cardData.otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        return;
      }
    }

    setProcessing(true);

    try {
      // Prepare update data
      const updateData: any = {
        payment_method: bookingData.paymentMethod,
      };

      // If card payment, add card details. Only the last 4 digits are ever
      // sent to the server — the full number, CVV, and OTP stay in the
      // browser and are discarded once this request completes.
      if (bookingData.paymentMethod === 'card') {
        const cardNumberClean = cardData.cardNumber.replace(/\s/g, '');

        updateData.card_details = {
          card_last4: cardNumberClean.slice(-4),
          card_holder_name: cardData.cardName,
          card_expiry: cardData.expiryDate,
        };
      }

      // Update booking with payment method and card details
      try {
        const updatedBooking = await bookingAPI.update(bookingData.bookingId, updateData);
        // Update local state with the latest data from server (including total_price if admin changed it)
        if (updatedBooking.total_price !== undefined) {
          updateBookingData({ total_price: updatedBooking.total_price });
        }
      } catch (updateError: any) {
        // Check if booking was deleted due to expiration
        if (updateError.message?.includes('expired') || updateError.message?.includes('410')) {
          setIsExpired(true);
          setTimeRemaining(0);
          setProcessing(false);
          await handleExpiration();
          return;
        }
        throw updateError;
      }

      // Upload payment slip if provided
      if (paymentSlip && (bookingData.paymentMethod === 'bank_transfer' || bookingData.paymentMethod === 'promptpay')) {
        const formData = new FormData();
        formData.append('paymentSlip', paymentSlip);
        formData.append('bookingId', bookingData.bookingId);

        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bookings/${bookingData.bookingId}/payment-slip`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            console.error('Failed to upload payment slip');
          }
        } catch (uploadErr) {
          console.error('Payment slip upload error:', uploadErr);
          // Don't block booking completion if upload fails
        }
      }

      nextStep();
    } catch (err) {
      setError('ไม่สามารถดำเนินการชำระเงินได้ กรุณาลองใหม่อีกครั้ง');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <span className="eyebrow mb-3">การชำระเงิน</span>
        <h2 className="font-display text-2xl sm:text-3xl font-light text-aqua-900">
          เลือกวิธีชำระเงิน
        </h2>
        <p className="mt-2 text-sm text-aqua-600">
          เลือกวิธีการชำระเงินที่คุณต้องการเพื่อทำการจองให้เสร็จสมบูรณ์
        </p>
      </div>

      {/* Expiration Timer */}
      {timeRemaining !== null && (
        <div
          className={`mb-8 rounded-3xl p-5 sm:p-6 ${
            isExpired
              ? 'bg-coral-50 border border-coral-200'
              : timeRemaining < 60000
              ? 'bg-coral-50 border border-coral-300 animate-pulse'
              : 'bg-aqua-50 border border-aqua-100'
          }`}
        >
          <div className="flex items-center gap-4">
            <span
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${
                isExpired || timeRemaining < 60000
                  ? 'bg-coral-100 text-coral-600'
                  : 'bg-white text-aqua-600'
              }`}
            >
              <Clock className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`text-sm font-semibold ${
                    isExpired || timeRemaining < 60000 ? 'text-coral-800' : 'text-aqua-800'
                  }`}
                >
                  {isExpired ? 'การจองหมดอายุ' : 'เวลาที่เหลือ'}
                </span>
                <span
                  className={`font-display text-2xl sm:text-3xl font-medium tabular-nums ${
                    isExpired || timeRemaining < 60000 ? 'text-coral-600' : 'text-aqua-700'
                  }`}
                >
                  {formatTimeRemaining()}
                </span>
              </div>
              <p
                className={`mt-1 text-xs sm:text-sm ${
                  isExpired || timeRemaining < 60000 ? 'text-coral-700' : 'text-aqua-600'
                }`}
              >
                {isExpired
                  ? 'การจองนี้หมดอายุแล้ว กรุณาสร้างการจองใหม่'
                  : timeRemaining < 60000
                  ? 'รีบทำรายการ! ชำระเงินก่อนเวลาหมด'
                  : 'ชำระเงินภายในเวลาที่กำหนดเพื่อยืนยันการจองของคุณ'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl bg-foam-100 p-6 sm:p-7 mb-8">
        <h3 className="font-display text-lg font-medium text-aqua-900 mb-5">สรุปการจอง</h3>
        <div className="space-y-3.5 text-sm mb-4">
          <div className="flex justify-between gap-4">
            <span className="text-aqua-500">ห้องพัก</span>
            <span className="font-medium text-aqua-800 text-right">{bookingData.room?.name}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-aqua-500">วันที่</span>
            <span className="font-medium text-aqua-800 text-right">
              {new Date(bookingData.checkIn).toLocaleDateString('th-TH', {
                month: 'short',
                day: 'numeric',
              })}{' - '}{new Date(bookingData.checkOut).toLocaleDateString('th-TH', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-aqua-500">จำนวนผู้พัก</span>
            <span className="font-medium text-aqua-800">{bookingData.guests} ท่าน</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-aqua-500">จำนวนห้องนอน</span>
            <span className="font-medium text-aqua-800">{bookingData.bedroomsUsed || bookingData.room?.bedrooms || 1} ห้องนอน</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-aqua-500">จำนวนคืน</span>
            <span className="font-medium text-aqua-800">{calculateNights()} คืน</span>
          </div>

          {/* Weekday/Weekend Breakdown */}
          {(() => {
            const breakdown = calculateNightsBreakdown();
            const bedroomsUsed = bookingData.bedroomsUsed || bookingData.room?.bedrooms || 1;
            const bedroomReduction = (bookingData.room && bedroomsUsed < bookingData.room.bedrooms && bookingData.room.price_reduction_per_bedroom)
              ? (bookingData.room.bedrooms - bedroomsUsed) * bookingData.room.price_reduction_per_bedroom * calculateNights()
              : 0;
            
            return (
              <>
                {breakdown.weekdayNights > 0 && (
                  <div className="flex justify-between gap-4 pl-4">
                    <span className="text-aqua-400">• วันธรรมดา ({breakdown.weekdayNights} คืน)</span>
                    <span className="text-aqua-600">฿{breakdown.weekdayPrice.toLocaleString()}</span>
                  </div>
                )}
                {breakdown.weekendNights > 0 && (
                  <div className="flex justify-between gap-4 pl-4">
                    <span className="text-aqua-400">• วันหยุด ({breakdown.weekendNights} คืน)</span>
                    <span className="text-aqua-600">฿{breakdown.weekendPrice.toLocaleString()}</span>
                  </div>
                )}
                {bedroomReduction > 0 && (
                  <div className="flex justify-between gap-4 pl-4">
                    <span className="text-aqua-500">• ส่วนลดห้องนอน ({bookingData.room!.bedrooms - bedroomsUsed} ห้อง)</span>
                    <span className="font-medium text-sun-500">-฿{bedroomReduction.toLocaleString()}</span>
                  </div>
                )}
              </>
            );
          })()}

          <div className="flex justify-between gap-4">
            <span className="text-aqua-500">ชื่อผู้จอง</span>
            <span className="font-medium text-aqua-800 text-right">{bookingData.guestName}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-aqua-500">อีเมล</span>
            <span className="font-medium text-aqua-800 text-right break-all">{bookingData.guestEmail}</span>
          </div>

          {/* Reflects the card form the guest just filled in, live. This is
              local component state only (cardData) — it never leaves the
              browser beyond the masked last-4 that handlePayment() already
              sends. Appears the moment "ขอรหัส OTP" succeeds (showOtpStep),
              and the OTP row fills in as they type it, since the actual
              submit immediately advances to the confirmation step. */}
          {bookingData.paymentMethod === 'card' && showOtpStep && (
            <div className="border-t border-foam-200 pt-3.5 mt-1 space-y-3.5">
              <p className="text-[0.7rem] uppercase tracking-wider text-aqua-400">
                รายละเอียดบัตรที่ใช้ชำระเงิน
              </p>
              <div className="flex justify-between gap-4">
                <span className="text-aqua-500">หมายเลขบัตร</span>
                <span className="font-medium text-aqua-800 font-mono tracking-wide">
                  •••• •••• •••• {cardData.cardNumber.replace(/\s/g, '').slice(-4)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-aqua-500">ชื่อผู้ถือบัตร</span>
                <span className="font-medium text-aqua-800 text-right">{cardData.cardName || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-aqua-500">วันหมดอายุ</span>
                <span className="font-medium text-aqua-800 font-mono">{cardData.expiryDate || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-aqua-500">CVV</span>
                <span className="font-medium text-aqua-800 font-mono tracking-widest">
                  {cardData.cvv ? '•'.repeat(cardData.cvv.length) : '-'}
                </span>
              </div>
              {cardData.otp && (
                <div className="flex justify-between gap-4">
                  <span className="text-aqua-500">รหัส OTP</span>
                  <span className="font-medium text-sun-600 font-mono tracking-[0.3em]">
                    {cardData.otp}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="pt-4 border-t border-foam-300">
          <div className="flex items-center justify-between">
            <span className="font-display text-base font-medium text-aqua-900">ยอดรวม</span>
            <span className="font-display text-3xl sm:text-4xl font-medium text-aqua-800">
              ฿{calculateTotal().toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <span className="eyebrow mb-4">เลือกวิธีชำระเงิน</span>
        <div className="grid gap-3">
          {getAvailablePaymentMethods().map((method) => {
            const Icon = method.icon;
            const isSelected = bookingData.paymentMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => {
                  updateBookingData({ paymentMethod: method.id as any });
                  // Switching away from card mid-OTP would otherwise leave
                  // showOtpStep stuck true — the summary would keep showing
                  // stale card details, and the button label would jump
                  // straight to "ยืนยันการชำระเงิน" if they pick card again.
                  if (method.id !== 'card') {
                    setShowOtpStep(false);
                  }
                }}
                className={`w-full rounded-3xl border p-5 text-left transition-all duration-300 ${
                  isSelected
                    ? 'border-sun-300 bg-sun-50 shadow-soft'
                    : 'border-foam-300 bg-white hover:border-aqua-300 hover:bg-aqua-50/40'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-colors ${
                      isSelected ? 'bg-sun-400 text-white' : 'bg-foam-100 text-aqua-500'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-aqua-900">{method.name}</h4>
                    <p className="text-sm text-aqua-500">{method.description}</p>
                  </div>

                  <span
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isSelected ? 'border-sun-400 bg-sun-400' : 'border-foam-300 bg-white'
                    }`}
                  >
                    {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {bookingData.paymentMethod === 'bank_transfer' && (
        <div className="rounded-3xl bg-aqua-50 border border-aqua-100 p-5 sm:p-7 mb-8">
          <h4 className="font-display text-lg font-medium text-aqua-900 mb-5 flex items-center gap-2.5">
            <Building2 className="h-5 w-5 flex-shrink-0 text-aqua-500" />
            รายละเอียดการโอนเงิน
          </h4>

          <div className="rounded-2xl bg-white p-5 sm:p-6 space-y-5 shadow-soft">
            {loadingBanks ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <span className="h-8 w-8 rounded-full border-2 border-aqua-200 border-t-sun-400 animate-spin" />
                <p className="text-sm text-aqua-500">กำลังโหลดข้อมูลธนาคาร...</p>
              </div>
            ) : (
              (() => {
                const bankTransferAccount = bankAccounts.find(acc => acc.type === 'bank_transfer');
                if (!bankTransferAccount) {
                  return (
                    <div className="py-4 text-center text-sm text-aqua-500">
                      ข้อมูลการโอนเงินไม่พร้อมใช้งาน กรุณาติดต่อฝ่ายสนับสนุน
                    </div>
                  );
                }
                return (
                  <>
                    {/* Bank */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
                      <span className="text-sm text-aqua-500">ธนาคาร</span>
                      <span className="font-medium text-aqua-900">{bankTransferAccount.bank_name}</span>
                    </div>

                    {/* Account Name */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
                      <span className="text-sm text-aqua-500 whitespace-nowrap">ชื่อบัญชี</span>
                      <span className="font-medium text-aqua-900 text-left sm:text-right">
                        {bankTransferAccount.account_name}
                      </span>
                    </div>

                    {/* Account Number */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
                      <span className="text-sm text-aqua-500 whitespace-nowrap">เลขที่บัญชี</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-semibold tracking-wide text-aqua-900">
                          {bankTransferAccount.account_number}
                        </span>
                        <button
                          onClick={copyAccountNumber}
                          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-aqua-50 flex-shrink-0"
                          title="คัดลอกเลขที่บัญชี"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-aqua-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-aqua-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    {bankTransferAccount.notes && (
                      <div className="rounded-2xl bg-foam-100 p-4 text-sm text-aqua-600">
                        <strong className="font-medium text-aqua-800">หมายเหตุ:</strong>{' '}
                        {bankTransferAccount.notes}
                      </div>
                    )}
                  </>
                );
              })()
            )}
            
            {/* Amount to Transfer */}
            <div className="pt-5 border-t border-foam-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
                <span className="text-sm font-medium text-aqua-700">ยอดโอน</span>
                <span className="font-display text-3xl font-medium text-aqua-800">
                  ฿{calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/70 border border-aqua-100 p-4">
            <p className="text-xs sm:text-sm leading-relaxed text-aqua-700">
              <span className="font-semibold">💡 สำคัญ:</span> หลังจากทำการจองเสร็จสิ้น กรุณาใช้หมายเลขอ้างอิงการจองของคุณเมื่อโอนเงิน เพื่อช่วยให้เราดำเนินการชำระเงินของคุณได้อย่างรวดเร็ว
            </p>
          </div>

          {/* Payment Slip Upload */}
          <div className="mt-4 sm:mt-5">
            <h5 className="mb-3 text-sm font-medium text-aqua-800">อัปโหลดสลิปการชำระเงิน (ไม่บังคับ)</h5>
            <div className="rounded-2xl bg-white border-2 border-dashed border-foam-300 p-5 sm:p-6 transition-colors hover:border-aqua-300">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!paymentSlip ? (
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-aqua-50">
                      <Upload className="h-6 w-6 text-aqua-500" />
                    </div>
                  </div>
                  <p className="mb-1 text-sm font-medium text-aqua-800">
                    อัปโหลดสลิปการชำระเงินของคุณ
                  </p>
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="btn-primary !px-6 !py-3 !text-sm"
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentSlipPreview && (
                    <div className="flex justify-center">
                      <img
                        src={paymentSlipPreview}
                        alt="Payment slip preview"
                        className="max-h-48 sm:max-h-64 rounded-2xl border border-foam-200 object-contain"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between rounded-2xl bg-foam-100 p-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-aqua-500">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-aqua-900">
                          {paymentSlip.name}
                        </p>
                        <p className="text-xs text-aqua-500">
                          {(paymentSlip.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="ml-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-coral-500 transition-colors hover:bg-coral-50"
                      title="ลบไฟล์"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="h-2 w-full rounded-full bg-foam-200">
                      <div
                        className="h-2 rounded-full bg-sun-400 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="w-full text-center text-sm font-medium text-aqua-500 transition-colors hover:text-sun-500"
                  >
                    อัปโหลดใหม่
                  </button>
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-aqua-400">
              💡 อัปโหลดหลักฐานการชำระเงินเพื่อเร่งการตรวจสอบ
            </p>
          </div>
        </div>
      )}

      {bookingData.paymentMethod === 'promptpay' && (
        <div className="rounded-3xl bg-aqua-50 border border-aqua-100 p-5 sm:p-7 mb-8">
          <h4 className="font-display text-lg font-medium text-aqua-900 mb-5 flex items-center gap-2.5">
            <Smartphone className="h-5 w-5 text-aqua-500" />
            ชำระเงินผ่านพร้อมเพย์
          </h4>
          <div className="rounded-2xl bg-white p-5 sm:p-7 text-center shadow-soft">
            {loadingBanks ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <span className="h-10 w-10 rounded-full border-2 border-aqua-200 border-t-sun-400 animate-spin" />
                <p className="text-sm text-aqua-500">กำลังโหลด QR Code พร้อมเพย์...</p>
              </div>
            ) : (() => {
              const promptpayAccount = bankAccounts.find(acc => acc.type === 'promptpay');
              if (!promptpayAccount || !promptpayAccount.qr_code_url) {
                return (
                  <div className="py-10 text-center text-sm text-aqua-500">
                    QR Code พร้อมเพย์ไม่พร้อมใช้งาน กรุณาใช้การโอนเงินผ่านธนาคารหรือติดต่อฝ่ายสนับสนุน
                  </div>
                );
              }
              const qrCodeUrl = `${import.meta.env.VITE_BACKEND_URL}${promptpayAccount.qr_code_url}`;
              return (
                <>
                  <p className="mb-5 text-sm text-aqua-600">
                    สแกน QR Code นี้ด้วยแอปธนาคารบนมือถือของคุณเพื่อจ่ายเงินทันที
                  </p>
                  <div className="inline-block rounded-3xl border border-foam-200 bg-white p-4 shadow-soft">
                    <img
                      src={qrCodeUrl}
                      alt="PromptPay QR Code"
                      className="h-48 w-48 sm:h-60 sm:w-60 object-contain"
                    />
                  </div>
                  <div className="mt-5 space-y-3">
                    {promptpayAccount.promptpay_id && (
                      <p className="text-sm text-aqua-500">
                        PromptPay ID:{' '}
                        <span className="font-mono font-semibold text-aqua-800">
                          {promptpayAccount.promptpay_id}
                        </span>
                      </p>
                    )}
                    <div className="inline-flex items-baseline gap-2 rounded-full bg-aqua-50 px-5 py-2.5">
                      <span className="text-sm text-aqua-600">ยอดเงิน</span>
                      <span className="font-display text-2xl font-medium text-aqua-800">
                        ฿{calculateTotal().toLocaleString()}
                      </span>
                    </div>
                    {promptpayAccount.notes && (
                      <div className="rounded-2xl bg-foam-100 p-4 text-sm text-aqua-600">
                        <strong className="font-medium text-aqua-800">หมายเหตุ:</strong>{' '}
                        {promptpayAccount.notes}
                      </div>
                    )}
                  </div>
                  <p className="mt-5 text-xs text-aqua-400">
                    💡 บันทึก QR Code นี้เพื่อจ่ายภายหลัง หรือแชร์ให้คนอื่นจ่ายแทนคุณ
                  </p>
                </>
              );
            })()}
          </div>

          {/* Payment Slip Upload */}
          <div className="mt-4 sm:mt-5">
            <h5 className="mb-3 text-sm font-medium text-aqua-800">อัปโหลดหลักฐานการชำระเงิน (ไม่บังคับ)</h5>
            <div className="rounded-2xl bg-white border-2 border-dashed border-foam-300 p-5 sm:p-6 transition-colors hover:border-aqua-300">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!paymentSlip ? (
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-aqua-50">
                      <Upload className="h-6 w-6 text-aqua-500" />
                    </div>
                  </div>
                  <p className="mb-1 text-sm font-medium text-aqua-800">
                    อัปโหลดหลักฐานการชำระเงินของคุณ
                  </p>
                  <p className="mb-4 text-xs text-aqua-400">
                    JPG, PNG, WEBP หรือ PDF (ไม่เกิน 5MB)
                  </p>
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="btn-primary !px-6 !py-3 !text-sm"
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    Choose File
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentSlipPreview && (
                    <div className="flex justify-center">
                      <img
                        src={paymentSlipPreview}
                        alt="Payment confirmation preview"
                        className="max-h-48 sm:max-h-64 rounded-2xl border border-foam-200 object-contain"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between rounded-2xl bg-foam-100 p-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-aqua-500">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-aqua-900">
                          {paymentSlip.name}
                        </p>
                        <p className="text-xs text-aqua-500">
                          {(paymentSlip.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="ml-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-coral-500 transition-colors hover:bg-coral-50"
                      title="ลบไฟล์"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="h-2 w-full rounded-full bg-foam-200">
                      <div
                        className="h-2 rounded-full bg-sun-400 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="w-full text-center text-sm font-medium text-aqua-500 transition-colors hover:text-sun-500"
                  >
                    อัปโหลดใหม่
                  </button>
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-aqua-400">
              💡 อัปโหลดภาพหน้าจอการชำระเงินเพื่อเร่งการตรวจสอบ
            </p>
          </div>
        </div>
      )}

      {bookingData.paymentMethod === 'card' && (
        <div className="rounded-3xl bg-foam-100 border border-foam-200 p-5 sm:p-7 mb-8">
          <h4 className="font-display text-lg font-medium text-aqua-900 mb-5 flex items-center gap-2.5">
            <CreditCard className="h-5 w-5 text-aqua-500" />
            ชำระเงินด้วยบัตร
          </h4>
          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-soft">
            <div className="space-y-5">
              {/* Card Number */}
              <div>
                <label className="label">
                  หมายเลขบัตร <span className="text-coral-500">*</span>
                </label>
                <input
                  type="text"
                  value={cardData.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  className="field font-mono text-lg tracking-wide"
                  maxLength={19}
                  autoComplete="off"
                />
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="label">
                  ชื่อผู้ถือบัตร <span className="text-coral-500">*</span>
                </label>
                <input
                  type="text"
                  value={cardData.cardName}
                  onChange={(e) => setCardData({ ...cardData, cardName: e.target.value.toUpperCase() })}
                  placeholder="JOHN DOE"
                  className="field uppercase tracking-wide"
                  autoComplete="off"
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    วันหมดอายุ <span className="text-coral-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardData.expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    className="field font-mono tracking-wide"
                    maxLength={5}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="label">
                    CVV <span className="text-coral-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardData.cvv}
                    onChange={handleCVVChange}
                    placeholder="123"
                    className="field font-mono tracking-wide"
                    maxLength={3}
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* OTP Step */}
              {showOtpStep && (
                <div className="-mx-5 sm:-mx-6 rounded-2xl border-t border-aqua-100 bg-aqua-50 px-5 sm:px-6 py-5">
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <label className="label !mb-0">
                        รหัส OTP <span className="text-coral-500">*</span>
                      </label>
                      <span className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold tabular-nums text-aqua-700">
                        {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={cardData.otp}
                      onChange={handleOTPChange}
                      placeholder="123456"
                      className="field text-center font-mono text-2xl tracking-[0.5em]"
                      maxLength={6}
                      autoComplete="off"
                    />
                    <p className="mt-3 text-xs text-aqua-500">
                      กรุณากรอกรหัส OTP 6 หลักที่ส่งไปยังหมายเลขโทรศัพท์ที่ลงทะเบียนไว้
                    </p>
                  </div>
                </div>
              )}

              {/* Amount */}
              <div className="border-t border-foam-200 pt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-aqua-700">ยอดเงินที่ต้องชำระ</span>
                  <span className="font-display text-3xl font-medium text-aqua-800">
                    ฿{calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/70 border border-foam-200 p-4">
            <div className="flex items-start gap-2.5">
              <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-aqua-500" />
              <p className="text-xs leading-relaxed text-aqua-600">
                <span className="font-semibold text-aqua-800">🔒 การชำระเงินที่ปลอดภัย:</span>{' '}
                หมายเลขบัตรแบบเต็มและรหัส CVV/OTP ของคุณจะไม่ถูกส่งออกจากอุปกรณ์นี้เลย
                เราเก็บเพียงเลข 4 ตัวท้ายไว้สำหรับใบเสร็จเท่านั้น
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-coral-50 border border-coral-200 px-5 py-4">
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-coral-500" />
          <p className="text-sm text-coral-700">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {!hideBackButton && (
          <button
            onClick={prevStep}
            disabled={processing}
            className="btn-ghost w-full sm:flex-1"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>ย้อนกลับ</span>
          </button>
        )}
        <button
          onClick={handlePayment}
          disabled={processing || isExpired}
          className={`btn-primary ${hideBackButton ? 'w-full' : 'w-full sm:flex-1'}`}
        >
          <Lock className="h-5 w-5" />
          <span>
            {isExpired 
              ? 'การจองหมดอายุ' 
              : processing 
              ? 'กำลังดำเนินการ...' 
              : bookingData.paymentMethod === 'card' && !showOtpStep
              ? 'ขอรหัส OTP'
              : bookingData.paymentMethod === 'card' && showOtpStep
              ? 'ยืนยันการชำระเงิน'
              : 'ชำระเงิน'}
          </span>
        </button>
      </div>
    </div>
  );
}
