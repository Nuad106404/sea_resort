import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['bank_transfer', 'promptpay', 'card'],
  },
  bank_name: {
    type: String,
    required: function() {
      return this.type === 'bank_transfer';
    },
  },
  account_name: {
    type: String,
    required: function() {
      return this.type === 'bank_transfer';
    },
  },
  account_number: {
    type: String,
    required: function() {
      return this.type === 'bank_transfer';
    },
  },
  promptpay_id: {
    type: String,
  },
  qr_code_url: {
    type: String,
    required: function() {
      return this.type === 'promptpay';
    },
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for faster queries
bankAccountSchema.index({ type: 1, is_active: 1 });

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

export default BankAccount;
