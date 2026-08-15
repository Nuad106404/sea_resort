import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Building2, Smartphone, CreditCard } from 'lucide-react';
import { bankAPI } from '../lib/bankAPI';

interface BankAccount {
  _id: string;
  type: 'bank_transfer' | 'promptpay' | 'card';
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  promptpay_id?: string;
  qr_code_url?: string;
  is_active: boolean;
  notes?: string;
  createdAt: string;
}

export function BankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await bankAPI.getAll();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลดข้อมูลบัญชีธนาคารไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await bankAPI.toggleStatus(id);
      loadAccounts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'เปลี่ยนสถานะไม่สำเร็จ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบบัญชีธนาคารนี้?')) {
      return;
    }

    try {
      await bankAPI.delete(id);
      loadAccounts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ลบบัญชีธนาคารไม่สำเร็จ');
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingAccount(null);
    setShowModal(true);
  };

  const handleToggleCardPayment = async () => {
    try {
      const cardAccount = accounts.find(acc => acc.type === 'card');
      
      if (cardAccount) {
        // Toggle existing card account
        await bankAPI.toggleStatus(cardAccount._id);
      } else {
        // Create new card account entry
        await bankAPI.create({
          type: 'card',
          is_active: true,
          notes: 'Card payment method'
        });
      }
      loadAccounts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'เปลี่ยนการชำระเงินด้วยบัตรไม่สำเร็จ');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลบัญชีธนาคาร...</p>
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

  const cardAccount = accounts.find(acc => acc.type === 'card');
  const isCardEnabled = cardAccount?.is_active || false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">บัญชีธนาคาร</h1>
          <p className="text-gray-600 mt-1">จัดการวิธีการชำระเงินสำหรับการจอง</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleToggleCardPayment}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isCardEnabled
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            ชำระด้วยบัตร: {isCardEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            เพิ่มบัญชี
          </button>
        </div>
      </div>

      {/* Bank Transfer Accounts */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            โอนเงินผ่านธนาคารไทย
          </h2>
        </div>
        <div className="p-6">
          {accounts.filter(a => a.type === 'bank_transfer').length === 0 ? (
            <p className="text-gray-500 text-center py-8">ไม่มีบัญชีโอนเงินผ่านธนาคาร</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.filter(a => a.type === 'bank_transfer').map((account) => (
                <BankCard
                  key={account._id}
                  account={account}
                  onToggle={handleToggleStatus}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PromptPay Accounts */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-600" />
            พร้อมเพย์ QR ไทย
          </h2>
        </div>
        <div className="p-6">
          {accounts.filter(a => a.type === 'promptpay').length === 0 ? (
            <p className="text-gray-500 text-center py-8">ไม่มีบัญชีพร้อมเพย์</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.filter(a => a.type === 'promptpay').map((account) => (
                <PromptPayCard
                  key={account._id}
                  account={account}
                  onToggle={handleToggleStatus}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <BankAccountModal
          account={editingAccount}
          onClose={() => {
            setShowModal(false);
            setEditingAccount(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingAccount(null);
            loadAccounts();
          }}
        />
      )}
    </div>
  );
}

interface CardProps {
  account: BankAccount;
  onToggle: (id: string) => void;
  onEdit: (account: BankAccount) => void;
  onDelete: (id: string) => void;
}

function BankCard({ account, onToggle, onEdit, onDelete }: CardProps) {
  return (
    <div className={`border-2 rounded-lg p-4 ${account.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-amber-600" />
          <span className="font-semibold text-gray-900">{account.bank_name}</span>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${account.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {account.is_active ? 'ใช้งานอยู่' : 'ไม่ใช้งาน'}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">ชื่อบัญชี:</span>
          <p className="font-medium text-gray-900">{account.account_name}</p>
        </div>
        <div>
          <span className="text-gray-600">เลขที่บัญชี:</span>
          <p className="font-mono font-medium text-gray-900">{account.account_number}</p>
        </div>
        {account.notes && (
          <div>
            <span className="text-gray-600">หมายเหตุ:</span>
            <p className="text-gray-700">{account.notes}</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => onToggle(account._id)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          {account.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          {account.is_active ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
        </button>
        <button
          onClick={() => onEdit(account)}
          className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
        >
          <Edit className="w-4 h-4" />
          แก้ไข
        </button>
        <button
          onClick={() => onDelete(account._id)}
          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
          ลบ
        </button>
      </div>
    </div>
  );
}

function PromptPayCard({ account, onToggle, onEdit, onDelete }: CardProps) {
  return (
    <div className={`border-2 rounded-lg p-4 ${account.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-amber-600" />
          <span className="font-semibold text-gray-900">พร้อมเพย์</span>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${account.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {account.is_active ? 'ใช้งานอยู่' : 'ไม่ใช้งาน'}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        {account.qr_code_url && (
          <div>
            <span className="text-gray-600">QR Code:</span>
            <img 
              src={`${import.meta.env.VITE_BACKEND_URL}${account.qr_code_url}`} 
              alt="PromptPay QR Code" 
              className="mt-2 w-48 h-48 object-contain border border-gray-200 rounded"
            />
          </div>
        )}
        {account.notes && (
          <div>
            <span className="text-gray-600">หมายเหตุ:</span>
            <p className="text-gray-700">{account.notes}</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => onToggle(account._id)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          {account.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          {account.is_active ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
        </button>
        <button
          onClick={() => onEdit(account)}
          className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
        >
          <Edit className="w-4 h-4" />
          แก้ไข
        </button>
        <button
          onClick={() => onDelete(account._id)}
          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
          ลบ
        </button>
      </div>
    </div>
  );
}

interface ModalProps {
  account: BankAccount | null;
  onClose: () => void;
  onSave: () => void;
}

function BankAccountModal({ account, onClose, onSave }: ModalProps) {
  const [type, setType] = useState<'bank_transfer' | 'promptpay' | 'card'>(account?.type || 'bank_transfer');
  const [formData, setFormData] = useState({
    bank_name: account?.bank_name || '',
    account_name: account?.account_name || '',
    account_number: account?.account_number || '',
    promptpay_id: account?.promptpay_id || '',
    notes: account?.notes || '',
  });
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string>(account?.qr_code_url ? `${import.meta.env.VITE_BACKEND_URL}${account.qr_code_url}` : '');
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrCodeFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('type', type);
      
      // Add fields based on type
      if (type === 'bank_transfer') {
        formDataToSend.append('bank_name', formData.bank_name);
        formDataToSend.append('account_name', formData.account_name);
        formDataToSend.append('account_number', formData.account_number);
      } else {
        // PromptPay only needs QR code
        if (qrCodeFile) {
          formDataToSend.append('qrCode', qrCodeFile);
        }
      }
      
      if (formData.notes) {
        formDataToSend.append('notes', formData.notes);
      }

      if (account) {
        await bankAPI.updateWithFile(account._id, formDataToSend);
      } else {
        await bankAPI.createWithFile(formDataToSend);
      }

      onSave();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'บันทึกบัญชีธนาคารไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {account ? 'แก้ไขบัญชีธนาคาร' : 'เพิ่มบัญชีธนาคาร'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ประเภทการชำระเงิน
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('bank_transfer')}
                className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 ${
                  type === 'bank_transfer'
                    ? 'border-amber-600 bg-amber-50 text-amber-900'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <Building2 className="w-5 h-5" />
                โอนเงินผ่านธนาคาร
              </button>
              <button
                type="button"
                onClick={() => setType('promptpay')}
                className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 ${
                  type === 'promptpay'
                    ? 'border-amber-600 bg-amber-50 text-amber-900'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                พร้อมเพย์
              </button>
            </div>
          </div>

          {/* Bank Transfer Fields */}
          {type === 'bank_transfer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อธนาคาร *
                </label>
                <input
                  type="text"
                  required
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="เช่น ธนาคารกรุงเทพ"
                />
              </div>
            </>
          )}

          {/* PromptPay Fields */}
          {type === 'promptpay' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รูปภาพ QR Code *
              </label>
              <input
                type="file"
                accept="image/*"
                required={!account}
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">อัปโหลดรูปภาพ QR Code พร้อมเพย์ (สูงสุด 5MB)</p>
              {qrCodePreview && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">ตัวอย่าง:</p>
                  <img 
                    src={qrCodePreview} 
                    alt="QR Code Preview" 
                    className="w-48 h-48 object-contain border border-gray-200 rounded"
                  />
                </div>
              )}
            </div>
          )}

          {/* Bank Transfer Common Fields */}
          {type === 'bank_transfer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อบัญชี *
                </label>
                <input
                  type="text"
                  required
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="เช่น บริษัท Asili Village Resort จำกัด"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลขทู่บัญชี *
                </label>
                <input
                  type="text"
                  required
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="เช่น 123-4-56789-0"
                />
              </div>
            </>
          )}

          {/* Notes - Optional for both types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเหตุ (ไม่บังคับ)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="ข้อมูลเพิ่มเติม..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors font-semibold disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : account ? 'อัปเดตบัญชี' : 'สร้างบัญชี'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
