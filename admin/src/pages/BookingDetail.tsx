import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Mail, Phone, CreditCard, Building2, Smartphone, Edit, Trash2, X, Download } from 'lucide-react';
import { bookingAPI, roomAPI } from '../lib/api';

interface Booking {
  _id: string;
  booking_reference: string;
  room_id: {
    _id: string;
    name: string;
    image_url: string;
    bedrooms: number;
    capacity: number;
  };
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  status: string;
  payment_method: string;
  payment_status: string;
  payment_slip_url?: string;
  payment_slip_uploaded_at?: string;
  card_details?: {
    card_last4?: string;
    card_holder_name?: string;
    card_expiry?: string;
  };
  total_price: number;
  createdAt: string;
}

export function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    guests: 1,
    check_in: '',
    check_out: '',
    room_id: '',
    total_price: 0,
  });

  useEffect(() => {
    if (id) {
      loadBooking();
      loadRooms();
    }
  }, [id]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const data = await bookingAPI.getById(id!);
      setBooking(data);
      setEditForm({
        guest_name: data.guest_name,
        guest_email: data.guest_email,
        guest_phone: data.guest_phone,
        guests: data.guests,
        check_in: data.check_in.split('T')[0],
        check_out: data.check_out.split('T')[0],
        room_id: data.room_id._id,
        total_price: data.total_price,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลดข้อมูลการจองไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const data = await roomAPI.getAll();
      setRooms(data);
    } catch (err) {
      // Failed to load rooms
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking || !confirm(`คุณแน่ใจหรือไม่ที่จะเปลี่ยนสถานะเป็น ${newStatus}?`)) {
      return;
    }

    try {
      setUpdating(true);
      await bookingAPI.updateStatus(booking._id, newStatus);
      setBooking({ ...booking, status: newStatus });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'อัปเดตสถานะไม่สำเร็จ');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking || !confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกการจองนี้?')) {
      return;
    }

    try {
      setUpdating(true);
      await bookingAPI.cancel(booking._id);
      setBooking({ ...booking, status: 'cancelled' });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ยกเลิกการจองไม่สำเร็จ');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditBooking = async () => {
    if (!booking) return;

    try {
      setUpdating(true);
      await bookingAPI.update(booking._id, editForm);
      // Reload booking to get updated room details with populated data
      await loadBooking();
      setShowEditModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'อัปเดตการจองไม่สำเร็จ');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!booking || !confirm('คุณแน่ใจหรือไม่ที่จะลบการจองนี้? การกระทำนี้ไม่สามารถย้อนกลับได้!')) {
      return;
    }

    try {
      setUpdating(true);
      await bookingAPI.delete(booking._id);
      alert('ลบการจองสำเร็จ!');
      navigate('/bookings');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ลบการจองไม่สำเร็จ');
      setUpdating(false);
    }
  };

  const handleDownloadSlip = async () => {
    if (!booking?.payment_slip_url) return;

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}${booking.payment_slip_url}`;
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `payment-slip-${booking.booking_reference}.${booking.payment_slip_url.split('.').pop()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert('ดาวน์โหลดสลิปการชำระเงินไม่สำเร็จ');
    }
  };

  const getPaymentMethodDetails = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return { name: 'โอนเงินผ่านธนาคาร', icon: Building2 };
      case 'promptpay':
        return { name: 'พร้อมเพย์ QR', icon: Smartphone };
      case 'card':
        return { name: 'บัตรเดบิตหรือเครดิต', icon: CreditCard };
      default:
        return { name: method, icon: CreditCard };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลการจอง...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/bookings')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับไปหน้าการจอง
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'ไม่พบการจอง'}</p>
        </div>
      </div>
    );
  }

  const paymentMethod = getPaymentMethodDetails(booking.payment_method);
  const PaymentIcon = paymentMethod.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/bookings')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            ย้อนกลับ
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">รายละเอียดการจอง</h1>
            <p className="text-gray-600 mt-1">หมายเลขอ้างอิง: {booking.booking_reference}</p>
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowEditModal(true)}
          disabled={updating}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          แก้ไขรายละเอียด
        </button>
        {booking.status !== 'confirmed' && (
          <button
            onClick={() => handleStatusUpdate('confirmed')}
            disabled={updating}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            ยืนยันการจอง
          </button>
        )}
        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <button
            onClick={() => handleStatusUpdate('completed')}
            disabled={updating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            ทำเครื่องหมายเสร็จสมบูรณ์
          </button>
        )}
        {booking.status !== 'cancelled' && (
          <button
            onClick={handleCancelBooking}
            disabled={updating}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            ยกเลิกการจอง
          </button>
        )}
        <button
          onClick={handleDeleteBooking}
          disabled={updating}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          ลบการจอง
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">รายละเอียดห้องพัก</h2>
            <div className="flex items-start gap-4">
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}${booking.room_id?.image_url}`}
                alt={booking.room_id?.name}
                className="w-32 h-32 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-medium text-gray-900 text-lg">{booking.room_id?.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {booking.room_id?.bedrooms} ห้องนอน • รองรับสูงสุด {booking.room_id?.capacity} ท่าน
                </p>
              </div>
            </div>
          </div>

          {/* Stay Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">รายละเอียดการเข้าพัก</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">เช็คอิน</p>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.check_in).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">เช็คเอาท์</p>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.check_out).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{booking.guests} ท่าน</span>
            </div>
          </div>

          {/* Guest Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ข้อมูลผู้จอง</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">{booking.guest_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">{booking.guest_email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">{booking.guest_phone}</span>
              </div>
            </div>
          </div>

          {/* Payment Slip */}
          {booking.payment_slip_url && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">สลิปการชำระเงิน</h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  อัปโหลดเมื่อ: {new Date(booking.payment_slip_uploaded_at!).toLocaleString('th-TH')}
                </p>
                
                {/* Display the payment slip image */}
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${booking.payment_slip_url}`}
                    alt="Payment Slip"
                    className="w-full h-auto max-h-[600px] object-contain bg-gray-50"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="p-8 text-center text-gray-500">ไม่สามารถโหลดรูปภาพสลิปได้</div>';
                      }
                    }}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleDownloadSlip}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    ดาวน์โหลดสลิป
                  </button>
                  <a
                    href={`${import.meta.env.VITE_BACKEND_URL}${booking.payment_slip_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    เปิดในแท็บใหม่
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">สรุปการชำระเงิน</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <PaymentIcon className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">{paymentMethod.name}</span>
              </div>
              {booking.payment_method === 'card' && booking.card_details && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">รายละเอียดบัตร:</p>
                  <p className="text-sm font-mono text-gray-900">**** **** **** {booking.card_details.card_last4}</p>
                  <p className="text-sm text-gray-600">{booking.card_details.card_holder_name}</p>
                  <p className="text-xs text-gray-500">หมดอายุ: {booking.card_details.card_expiry}</p>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">ยอดรวม</span>
                  <span className="text-2xl font-bold text-amber-700">
                    ฿{booking.total_price.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">สถานะการชำระเงิน</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    booking.payment_status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.payment_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ข้อมูลการจอง</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">สร้างเมื่อ</p>
                <p className="font-medium text-gray-900">
                  {new Date(booking.createdAt).toLocaleString('th-TH')}
                </p>
              </div>
              <div>
                <p className="text-gray-600">รหัสการจอง</p>
                <p className="font-mono text-xs text-gray-900">{booking._id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">แก้ไขรายละเอียดการจอง</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อผู้จอง
                </label>
                <input
                  type="text"
                  value={editForm.guest_name}
                  onChange={(e) => setEditForm({ ...editForm, guest_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล
                </label>
                <input
                  type="email"
                  value={editForm.guest_email}
                  onChange={(e) => setEditForm({ ...editForm, guest_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={editForm.guest_phone}
                  onChange={(e) => setEditForm({ ...editForm, guest_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จำนวนผู้พัก
                </label>
                <input
                  type="number"
                  min="1"
                  value={editForm.guests}
                  onChange={(e) => setEditForm({ ...editForm, guests: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันเช็คอิน
                  </label>
                  <input
                    type="date"
                    value={editForm.check_in}
                    onChange={(e) => setEditForm({ ...editForm, check_in: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันเช็คเอาท์
                  </label>
                  <input
                    type="date"
                    value={editForm.check_out}
                    onChange={(e) => setEditForm({ ...editForm, check_out: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ห้องพัก
                </label>
                <select
                  value={editForm.room_id}
                  onChange={(e) => setEditForm({ ...editForm, room_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {rooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.name} - {room.bedrooms} ห้องนอน (รองรับสูงสุด {room.capacity} ท่าน)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ยอดรวม (บาท)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.total_price}
                  onChange={(e) => setEditForm({ ...editForm, total_price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleEditBooking}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {updating ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { label: 'รอดำเนินการ', class: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'ยืนยันแล้ว', class: 'bg-green-100 text-green-800' },
    cancelled: { label: 'ยกเลิกแล้ว', class: 'bg-red-100 text-red-800' },
    completed: { label: 'เสร็จสมบูรณ์', class: 'bg-blue-100 text-blue-800' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    class: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${config.class}`}>
      {config.label}
    </span>
  );
}
