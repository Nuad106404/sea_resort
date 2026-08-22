import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Check, Users, BedDouble } from 'lucide-react';
import { DateRangePicker } from '../components/booking/DateRangePicker';
import { Step2ContactInfo } from '../components/booking/Step2ContactInfo';
import { Step3Payment } from '../components/booking/Step3Payment';
import { Step4Confirmation } from '../components/booking/Step4Confirmation';
import { Room } from '../types/room';

export interface BookingData {
  room: Room | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  bedroomsUsed?: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  paymentMethod: 'bank_transfer' | 'promptpay' | 'card' | '';
  bookingId: string;
  bookingReference: string;
  total_price?: number;
  cardDetails?: {
    card_number?: string;
    card_last4?: string;
    card_holder_name?: string;
    card_expiry?: string;
    cvv?: string;
    otp?: string;
  };
}

const STEPS = [
  { number: 1, title: 'รายละเอียดการจอง' },
  { number: 2, title: 'การชำระเงิน' },
  { number: 3, title: 'ยืนยันการจอง' },
];

export function BookingWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingReference } = useParams<{ bookingReference?: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    room: null,
    checkIn: '',
    checkOut: '',
    guests: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    paymentMethod: '',
    bookingId: '',
    bookingReference: '',
  });

  // Load booking by reference if URL contains booking reference
  useEffect(() => {
    const loadBookingByReference = async () => {
      if (bookingReference) {
        setLoading(true);
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/bookings/reference/${bookingReference}`
          );

          if (response.status === 410) {
            // Booking expired
            navigate('/', { replace: true });
            return;
          }

          if (response.ok) {
            const booking = await response.json();
            const room = booking.room_id;

            setBookingData({
              room: room,
              checkIn: new Date(booking.check_in).toISOString().split('T')[0],
              checkOut: new Date(booking.check_out).toISOString().split('T')[0],
              guests: booking.guests,
              bedroomsUsed: booking.bedrooms_used || room.bedrooms,
              guestName: booking.guest_name,
              guestEmail: booking.guest_email,
              guestPhone: booking.guest_phone,
              paymentMethod: booking.payment_method || '',
              bookingId: booking._id,
              bookingReference: booking.booking_reference,
              total_price: booking.total_price,
              cardDetails: booking.card_details || undefined,
            });

            // Go to confirmation step once the booking is paid (confirmed via
            // card, or completed via an uploaded transfer/PromptPay slip),
            // otherwise back to the payment step.
            if (booking.status === 'confirmed' || booking.status === 'completed') {
              setCurrentStep(3);
            } else {
              setCurrentStep(2);
            }
          } else {
            navigate('/rooms', { replace: true });
          }
        } catch (error) {
          console.error('Failed to load booking:', error);
          navigate('/rooms', { replace: true });
        } finally {
          setLoading(false);
        }
      }
    };

    loadBookingByReference();
  }, [bookingReference, navigate]);

  useEffect(() => {
    // Only check for selected room if not loading from booking reference
    if (!bookingReference) {
      const roomId = location.state?.roomId;
      const selectedRoom = location.state?.selectedRoom;

      if (roomId) {
        // Fetch fresh room data by ID
        const fetchRoom = async () => {
          setLoading(true);
          try {
            const response = await fetch(
              `${import.meta.env.VITE_BACKEND_URL}/api/rooms/${roomId}?_=${Date.now()}`
            );
            if (response.ok) {
              const freshRoom = await response.json();
              // Set bedroomsUsed to bedrooms (will show all bedrooms by default)
              setBookingData((prev) => ({
                ...prev,
                room: freshRoom,
                bedroomsUsed: freshRoom.bedrooms,
              }));
            } else {
              navigate('/rooms');
            }
          } catch (error) {
            console.error('Failed to load room:', error);
            navigate('/rooms');
          } finally {
            setLoading(false);
          }
        };
        fetchRoom();
      } else if (selectedRoom) {
        // Fallback to passed room object (legacy support)
        setBookingData((prev) => ({
          ...prev,
          room: selectedRoom,
          bedroomsUsed: selectedRoom.bedrooms,
        }));
      } else {
        navigate('/rooms');
      }
    }
  }, [location, navigate, bookingReference]);

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const start = new Date(bookingData.checkIn);
    const end = new Date(bookingData.checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

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
    const weekdayRate =
      room.weekday_discount_price && room.weekday_discount_price > 0
        ? room.weekday_discount_price
        : room.weekday_price;
    const weekendRate =
      room.weekend_discount_price && room.weekend_discount_price > 0
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

  const calculateTotal = () => {
    // Use total_price from database if available (e.g., when admin edits it)
    if (bookingData.total_price !== undefined) {
      return bookingData.total_price;
    }

    // Calculate based on actual weekday/weekend dates
    if (!bookingData.room || !bookingData.checkIn || !bookingData.checkOut) return 0;

    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    let totalPrice = 0;
    let currentDate = new Date(checkInDate);

    // Calculate price for each night
    while (currentDate < checkOutDate) {
      let nightPrice;

      if (isWeekend(currentDate)) {
        // Weekend: use discount price if available, otherwise regular weekend price
        nightPrice =
          bookingData.room.weekend_discount_price && bookingData.room.weekend_discount_price > 0
            ? bookingData.room.weekend_discount_price
            : bookingData.room.weekend_price;
      } else {
        // Weekday: use discount price if available, otherwise regular weekday price
        nightPrice =
          bookingData.room.weekday_discount_price && bookingData.room.weekday_discount_price > 0
            ? bookingData.room.weekday_discount_price
            : bookingData.room.weekday_price;
      }

      totalPrice += nightPrice;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Apply bedroom reduction if applicable
    if (
      bookingData.bedroomsUsed &&
      bookingData.bedroomsUsed < bookingData.room.bedrooms &&
      bookingData.room.price_reduction_per_bedroom
    ) {
      const bedroomsNotUsed = bookingData.room.bedrooms - bookingData.bedroomsUsed;
      const nights = calculateNights();
      const reduction = bedroomsNotUsed * bookingData.room.price_reduction_per_bedroom * nights;
      totalPrice -= reduction;
    }

    return totalPrice;
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-foam-100">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 rounded-full border-2 border-aqua-200 border-t-sun-400 animate-spin" />
          <p className="text-sm text-aqua-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!bookingData.room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-foam-100">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 rounded-full border-2 border-aqua-200 border-t-sun-400 animate-spin" />
          <p className="text-sm text-aqua-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-foam-100 min-h-screen pt-28 sm:pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ---------- STEPPER ---------- */}
        <div className="mb-10 sm:mb-14">
          <div className="text-center mb-8">
            <span className="eyebrow mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-sun-400" />
              ขั้นตอนที่ {currentStep} จาก {STEPS.length}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-light text-aqua-900">
              {STEPS[currentStep - 1].title}
            </h1>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {STEPS.map((step, index) => {
              const isDone = currentStep > step.number;
              const isActive = currentStep === step.number;

              return (
                <div key={step.number} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition-all duration-500 ${
                        isDone
                          ? 'bg-aqua-600 text-white'
                          : isActive
                          ? 'bg-sun-400 text-white shadow-glow scale-110'
                          : 'bg-white text-foam-500 shadow-soft'
                      }`}
                    >
                      {isDone ? <Check className="h-5 w-5" strokeWidth={3} /> : step.number}
                    </span>
                    <span
                      className={`hidden sm:block text-xs font-medium transition-colors ${
                        isActive ? 'text-aqua-800' : 'text-aqua-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  {index < STEPS.length - 1 && (
                    <span
                      className={`h-0.5 w-10 sm:w-20 rounded-full transition-all duration-500 mb-0 sm:mb-6 ${
                        currentStep > step.number ? 'bg-aqua-600' : 'bg-foam-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------- PANEL ---------- */}
        <div className="card p-6 sm:p-10 lg:p-12 animate-fade-in">
          {currentStep === 1 && (
            <div>
              {/* Selected room */}
              <div className="mb-10">
                <span className="eyebrow mb-4">ห้องพักที่เลือก</span>
                <div className="flex flex-col sm:flex-row items-start gap-5 rounded-3xl bg-foam-100 p-5">
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${bookingData.room.image_url}`}
                    alt={bookingData.room.name}
                    className="h-28 w-full sm:w-36 rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-display text-lg font-medium text-aqua-900">
                      {bookingData.room.name}
                    </p>
                    <p className="mt-1 text-sm text-aqua-500">
                      {bookingData.room.bedrooms} ห้องนอน • พักได้สูงสุด{' '}
                      {bookingData.room.capacity} ท่าน
                    </p>
                    <p className="mt-3 inline-flex items-baseline gap-1.5 rounded-full bg-white px-4 py-2 shadow-soft">
                      {bookingData.checkIn ? (
                        <>
                          <span className="text-xs text-aqua-500">
                            {isWeekend(new Date(bookingData.checkIn)) ? 'วันหยุด' : 'วันธรรมดา'}
                          </span>
                          <span className="font-display text-lg font-medium text-aqua-800">
                            ฿
                            {(isWeekend(new Date(bookingData.checkIn))
                              ? bookingData.room.weekend_discount_price &&
                                bookingData.room.weekend_discount_price > 0
                                ? bookingData.room.weekend_discount_price
                                : bookingData.room.weekend_price
                              : bookingData.room.weekday_discount_price &&
                                bookingData.room.weekday_discount_price > 0
                              ? bookingData.room.weekday_discount_price
                              : bookingData.room.weekday_price
                            ).toLocaleString()}
                          </span>
                          <span className="text-xs text-aqua-500">/ คืน</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-aqua-500">เริ่มต้น</span>
                          <span className="font-display text-lg font-medium text-aqua-800">
                            ฿
                            {(bookingData.room.weekday_discount_price &&
                            bookingData.room.weekday_discount_price > 0
                              ? bookingData.room.weekday_discount_price
                              : bookingData.room.weekday_price
                            ).toLocaleString()}
                          </span>
                          <span className="text-xs text-aqua-500">/ คืน</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="mb-10">
                <span className="eyebrow mb-4">วันที่ที่ต้องการพัก</span>
                <DateRangePicker
                  checkIn={bookingData.checkIn}
                  checkOut={bookingData.checkOut}
                  onDateChange={(checkIn, checkOut) => {
                    updateBookingData({ checkIn, checkOut });
                  }}
                />
                {bookingData.checkIn && bookingData.checkOut && (
                  <div className="mt-5 grid grid-cols-3 gap-3 rounded-3xl bg-aqua-50 p-5">
                    <div>
                      <div className="text-[0.7rem] uppercase tracking-wider text-aqua-400 mb-1">
                        เช็คอิน
                      </div>
                      <div className="text-sm font-medium text-aqua-800">
                        {new Date(bookingData.checkIn).toLocaleDateString('th-TH', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[0.7rem] uppercase tracking-wider text-aqua-400 mb-1">
                        เช็คเอาท์
                      </div>
                      <div className="text-sm font-medium text-aqua-800">
                        {new Date(bookingData.checkOut).toLocaleDateString('th-TH', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[0.7rem] uppercase tracking-wider text-aqua-400 mb-1">
                        จำนวนคืน
                      </div>
                      <div className="text-sm font-medium text-sun-500">
                        {calculateNights()} คืน
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Guests + bedrooms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                <div>
                  <label className="label">
                    <Users className="mr-1.5 inline h-4 w-4 align-[-2px]" />
                    จำนวนผู้พัก
                  </label>
                  <select
                    value={bookingData.guests}
                    onChange={(e) => updateBookingData({ guests: Number(e.target.value) })}
                    className="field"
                  >
                    {Array.from({ length: bookingData.room?.capacity || 1 }, (_, i) => i + 1).map(
                      (num) => (
                        <option key={num} value={num}>
                          {num} ท่าน
                        </option>
                      )
                    )}
                  </select>
                  {bookingData.room && (
                    <p className="mt-2 text-xs text-aqua-400">
                      พักได้สูงสุด {bookingData.room.capacity} ท่าน
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">
                    <BedDouble className="mr-1.5 inline h-4 w-4 align-[-2px]" />
                    จำนวนห้องนอน
                  </label>
                  <select
                    value={bookingData.bedroomsUsed || bookingData.room?.bedrooms || 1}
                    onChange={(e) => updateBookingData({ bedroomsUsed: Number(e.target.value) })}
                    className="field"
                  >
                    {(() => {
                      const minBedrooms = bookingData.room?.min_bedrooms || 1;
                      const maxBedrooms = bookingData.room?.bedrooms || 1;
                      const options = [];
                      for (let i = minBedrooms; i <= maxBedrooms; i++) {
                        options.push(
                          <option key={i} value={i}>
                            {i} ห้องนอน
                          </option>
                        );
                      }
                      return options;
                    })()}
                  </select>
                  {bookingData.room?.price_reduction_per_bedroom &&
                  bookingData.room.price_reduction_per_bedroom > 0 ? (
                    <p className="mt-2 text-xs text-aqua-600">
                      💰 ลด {bookingData.room.price_reduction_per_bedroom.toLocaleString()} บาท/คืน
                      ต่อห้องนอนที่ไม่ใช้
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Summary */}
              {calculateNights() > 0 && (
                <div className="mb-10 rounded-3xl bg-foam-100 p-6 sm:p-7">
                  <h3 className="font-display text-lg font-medium text-aqua-900 mb-5">
                    สรุปการจอง
                  </h3>
                  <div className="space-y-3.5 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-aqua-500">ห้องพัก</span>
                      <span className="font-medium text-aqua-800 text-right">
                        {bookingData.room.name}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-aqua-500">เช็คอิน</span>
                      <span className="font-medium text-aqua-800">
                        {bookingData.checkIn
                          ? new Date(bookingData.checkIn).toLocaleDateString('th-TH', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'วันที่ไม่ถูกต้อง'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-aqua-500">เช็คเอาท์</span>
                      <span className="font-medium text-aqua-800">
                        {bookingData.checkOut
                          ? new Date(bookingData.checkOut).toLocaleDateString('th-TH', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'วันที่ไม่ถูกต้อง'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-aqua-500">จำนวนผู้พัก</span>
                      <span className="font-medium text-aqua-800">
                        {bookingData.guests} ท่าน
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-aqua-500">จำนวนห้องนอน</span>
                      <span className="font-medium text-aqua-800">
                        {bookingData.bedroomsUsed || bookingData.room.bedrooms} ห้องนอน
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-aqua-500">จำนวนคืน</span>
                      <span className="font-medium text-aqua-800">{calculateNights()} คืน</span>
                    </div>

                    {/* Weekday/Weekend Breakdown */}
                    {(() => {
                      const breakdown = calculateNightsBreakdown();
                      const bedroomsUsed = bookingData.bedroomsUsed || bookingData.room.bedrooms;
                      const bedroomReduction =
                        bedroomsUsed < bookingData.room.bedrooms &&
                        bookingData.room.price_reduction_per_bedroom
                          ? (bookingData.room.bedrooms - bedroomsUsed) *
                            bookingData.room.price_reduction_per_bedroom *
                            calculateNights()
                          : 0;

                      return (
                        <>
                          {breakdown.weekdayNights > 0 && (
                            <div className="flex justify-between gap-4 pl-4">
                              <span className="text-aqua-400">
                                • วันธรรมดา ({breakdown.weekdayNights} คืน)
                              </span>
                              <span className="text-aqua-600">
                                ฿{breakdown.weekdayPrice.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {breakdown.weekendNights > 0 && (
                            <div className="flex justify-between gap-4 pl-4">
                              <span className="text-aqua-400">
                                • วันหยุด ({breakdown.weekendNights} คืน)
                              </span>
                              <span className="text-aqua-600">
                                ฿{breakdown.weekendPrice.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {bedroomReduction > 0 && (
                            <div className="flex justify-between gap-4 pl-4">
                              <span className="text-aqua-500">
                                • ส่วนลดห้องนอน ({bookingData.room.bedrooms - bedroomsUsed} ห้อง)
                              </span>
                              <span className="font-medium text-sun-500">
                                -฿{bedroomReduction.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </>
                      );
                    })()}

                    <div className="flex items-center justify-between border-t border-foam-300 pt-4">
                      <span className="font-display text-base font-medium text-aqua-900">
                        ยอดรวม
                      </span>
                      <span className="font-display text-3xl font-medium text-aqua-800">
                        ฿{calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Step2ContactInfo
                bookingData={bookingData}
                updateBookingData={updateBookingData}
                nextStep={nextStep}
                prevStep={() => navigate('/rooms')}
                calculateTotal={calculateTotal}
              />
            </div>
          )}

          {currentStep === 2 && (
            <Step3Payment
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              nextStep={nextStep}
              prevStep={prevStep}
              calculateTotal={calculateTotal}
              calculateNights={calculateNights}
              hideBackButton={!!bookingReference}
            />
          )}

          {currentStep === 3 && (
            <Step4Confirmation
              bookingData={bookingData}
              calculateTotal={calculateTotal}
              calculateNights={calculateNights}
            />
          )}
        </div>
      </div>
    </div>
  );
}
