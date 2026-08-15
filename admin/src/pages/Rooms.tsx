import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Home, Users, Bed, DollarSign, Image as ImageIcon, X } from 'lucide-react';
import { roomAPI } from '../lib/api';

interface Room {
  _id: string;
  name: string;
  description: string;
  weekday_price: number;
  weekend_price: number;
  weekday_discount_price?: number;
  weekend_discount_price?: number;
  price_reduction_per_bedroom?: number;
  capacity: number;
  bedrooms: number;
  min_bedrooms?: number;
  image_url: string;
  images: string[];
  features: string[];
  available: boolean;
  createdAt: string;
}

export function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await roomAPI.getAll();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลดข้อมูลห้องพักไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      await roomAPI.toggleAvailability(id);
      loadRooms();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'เปลี่ยนสถานะไม่สำเร็จ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบห้องพักนี้? การกระทำนี้ไม่สามารถย้อนกลับได้!')) {
      return;
    }

    try {
      await roomAPI.delete(id);
      loadRooms();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ลบห้องพักไม่สำเร็จ');
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingRoom(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลห้องพัก...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการห้องพัก</h1>
          <p className="text-gray-600 mt-1">จัดการห้องพักและสถานะว่างของรีสอร์ท</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          เพิ่มห้องพัก
        </button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room._id} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Room Image */}
            <div className="relative h-48 bg-gray-200">
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}${room.image_url}`}
                alt={room.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
              <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium ${
                room.available
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {room.available ? 'ว่าง' : 'ไม่ว่าง'}
              </div>
            </div>

            {/* Room Details */}
            <div className="p-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.description}</p>

              {/* Room Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Bed className="w-4 h-4" />
                  <span>{room.bedrooms} BR</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{room.capacity} ท่าน</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-amber-600 font-semibold">
                  <DollarSign className="w-4 h-4" />
                  <span>
                    {(room.weekday_discount_price && room.weekday_discount_price > 0 ? room.weekday_discount_price : room.weekday_price || 0).toLocaleString()} / {(room.weekend_discount_price && room.weekend_discount_price > 0 ? room.weekend_discount_price : room.weekend_price || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Features */}
              {room.features.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {room.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded"
                      >
                        {feature}
                      </span>
                    ))}
                    {room.features.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{room.features.length - 3} เพิ่มเติม
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleToggleAvailability(room._id)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  {room.available ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                  <span>{room.available ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}</span>
                </button>
                <button
                  onClick={() => handleEdit(room)}
                  className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
                >
                  <Edit className="w-4 h-4" />
                  <span>แก้ไข</span>
                </button>
                <button
                  onClick={() => handleDelete(room._id)}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ลบ</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีห้องพัก</h3>
          <p className="text-gray-600 mb-4">เริ่มต้นโดยการเพิ่มห้องพักแรกของคุณ</p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            เพิ่มห้องพักแรกของคุณ
          </button>
        </div>
      )}

      {/* Room Modal */}
      {showModal && (
        <RoomModal
          room={editingRoom}
          onClose={() => {
            setShowModal(false);
            setEditingRoom(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingRoom(null);
            loadRooms();
          }}
        />
      )}
    </div>
  );
}

interface ModalProps {
  room: Room | null;
  onClose: () => void;
  onSave: () => void;
}

function RoomModal({ room, onClose, onSave }: ModalProps) {
  const [formData, setFormData] = useState({
    name: room?.name || '',
    description: room?.description || '',
    weekday_price: room?.weekday_price || 0,
    weekend_price: room?.weekend_price || 0,
    weekday_discount_price: room?.weekday_discount_price || 0,
    weekend_discount_price: room?.weekend_discount_price || 0,
    price_reduction_per_bedroom: room?.price_reduction_per_bedroom || 0,
    capacity: room?.capacity || 1,
    bedrooms: room?.bedrooms || 1,
    min_bedrooms: room?.min_bedrooms || 1,
    features: room?.features || [],
    available: room?.available ?? true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(room?.image_url ? `${import.meta.env.VITE_BACKEND_URL}${room.image_url}` : '');
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(room?.images?.map(img => `${import.meta.env.VITE_BACKEND_URL}${img}`) || []);
  const [existingImages, setExistingImages] = useState<string[]>(room?.images || []);
  const [newFeature, setNewFeature] = useState('');
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setGalleryFiles(prev => [...prev, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    if (index < existingImages.length) {
      // Remove from existing images
      setExistingImages(prev => prev.filter((_, i) => i !== index));
      setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove from new files
      const fileIndex = index - existingImages.length;
      setGalleryFiles(prev => prev.filter((_, i) => i !== fileIndex));
      setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      alert('กรุณากรอกข้อมูลที่จำเป็นทั้งหมด');
      return;
    }

    if (!room && !imageFile) {
      alert('กรุณาอัปโหลดรูปภาพห้องพัก');
      return;
    }

    try {
      setSaving(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('weekday_price', formData.weekday_price.toString());
      formDataToSend.append('weekend_price', formData.weekend_price.toString());
      formDataToSend.append('weekday_discount_price', formData.weekday_discount_price.toString());
      formDataToSend.append('weekend_discount_price', formData.weekend_discount_price.toString());
      formDataToSend.append('price_reduction_per_bedroom', formData.price_reduction_per_bedroom.toString());
      formDataToSend.append('capacity', formData.capacity.toString());
      formDataToSend.append('bedrooms', formData.bedrooms.toString());
      formDataToSend.append('min_bedrooms', formData.min_bedrooms.toString());
      formDataToSend.append('features', JSON.stringify(formData.features));
      formDataToSend.append('available', formData.available.toString());
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      // Add gallery images
      galleryFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      // Add existing images (for update)
      if (room && existingImages.length > 0) {
        formDataToSend.append('existingImages', JSON.stringify(existingImages));
      }

      if (room) {
        await roomAPI.update(room._id, formDataToSend);
      } else {
        await roomAPI.create(formDataToSend);
      }
      onSave();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'บันทึกห้องพักไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {room ? 'แก้ไขห้องพัก' : 'เพิ่มห้องพักใหม่'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Room Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อห้องพัก *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="เช่น วิลล่าวิวทะเลดีลักซ์"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คำอธิบาย *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="อธิบายห้องพัก สิ่งอำนวยความสะดวก และคุณสมบัติพิเศษ..."
              required
            />
          </div>

          {/* Pricing Section */}
          <div className="bg-amber-50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900">ราคาห้อง</h3>
            
            {/* Weekday Prices */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">ราคาวันจันท์-ศุกร์</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    ราคาปกติ
                  </label>
                  <input
                    type="number"
                    value={formData.weekday_price}
                    onChange={(e) => setFormData({ ...formData, weekday_price: Number(e.target.value) })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="21000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    ราคาที่ลดแล้ว
                  </label>
                  <input
                    type="number"
                    value={formData.weekday_discount_price}
                    onChange={(e) => setFormData({ ...formData, weekday_discount_price: Number(e.target.value) })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="1000"
                  />
                </div>
              </div>
            </div>

            {/* Weekend Prices */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">ราคาเสาร์-อาทิตย์</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    ราคาปกติ
                  </label>
                  <input
                    type="number"
                    value={formData.weekend_price}
                    onChange={(e) => setFormData({ ...formData, weekend_price: Number(e.target.value) })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="21000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    ราคาที่ลดแล้ว
                  </label>
                  <input
                    type="number"
                    value={formData.weekend_discount_price}
                    onChange={(e) => setFormData({ ...formData, weekend_discount_price: Number(e.target.value) })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="1000"
                  />
                </div>
              </div>
            </div>

            {/* Bedroom Reduction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ส่วนลดต่อห้องนอน
              </label>
              <input
                type="number"
                value={formData.price_reduction_per_bedroom}
                onChange={(e) => setFormData({ ...formData, price_reduction_per_bedroom: Number(e.target.value) })}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="2800"
              />
              <p className="text-xs text-gray-500 mt-1">จำนวนเงินที่ลดต่อห้องนอนที่ไม่ใช้ (บาท/คืน)</p>
            </div>
          </div>

          {/* Capacity and Bedrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                จำนวนผู้พัก *
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                จำนวนห้องนอน *
              </label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Minimum Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              จำนวนห้องนอนขั้นต่ำที่ต้องจอง *
            </label>
            <input
              type="number"
              value={formData.min_bedrooms}
              onChange={(e) => setFormData({ ...formData, min_bedrooms: Number(e.target.value) })}
              min="1"
              max={formData.bedrooms}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">ลูกค้าต้องจองอย่างน้อยจำนวนห้องนอนนี้ (ตั้งแต่ 1 ถึง {formData.bedrooms} ห้อง)</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รูปภาพห้องพัก * {room && !imageFile && '(อัปโหลดรูปใหม่เพื่อแทนที่)'}
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 transition-colors">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {imageFile ? imageFile.name : 'คลิกเพื่ออัปโหลดรูปภาพ'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required={!room}
                />
              </label>
            </div>
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              รูปแบบที่รองรับ: JPG, PNG, GIF, WebP (สูงสุด 10MB)
            </p>
          </div>

          {/* Gallery Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รูปภาพแกลเลอรี่ (ไม่บังคับ) - สำหรับสไลด์โชว์
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 transition-colors">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    คลิกเพื่ออัปโหลดรูปภาพแกลเลอรี่ (สูงสุด 10 รูป)
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                  className="hidden"
                />
              </label>
            </div>
            {galleryPreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              อัปโหลดหลายรูปภาพสำหรับสไลด์โชว์ห้องพัก สูงสุด 10 รูป รูปละ 10MB
            </p>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คุณสมบัติและสิ่งอำนวยความสะดวก
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="เช่น ไวไฟ, สระว่ายน้ำ, ครัว"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                เพิ่ม
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="hover:text-amber-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
            />
            <label htmlFor="available" className="text-sm font-medium text-gray-700">
              เปิดให้จองได้
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'กำลังบันทึก...' : room ? 'อัปเดตห้องพัก' : 'สร้างห้องพัก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
