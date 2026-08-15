import BankAccount from '../models/BankAccount.js';

// Get all bank accounts
export const getAllBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find().sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get active bank accounts (public)
export const getActiveBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find({ is_active: true }).sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bank account by ID
export const getBankAccountById = async (req, res) => {
  try {
    const account = await BankAccount.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create bank account
export const createBankAccount = async (req, res) => {
  try {
    const accountData = req.body;
    
    // If QR code file is uploaded, add the URL
    if (req.file) {
      accountData.qr_code_url = `/uploads/qr-codes/${req.file.filename}`;
    }
    
    const account = new BankAccount(accountData);
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    console.error('Bank account creation error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update bank account
export const updateBankAccount = async (req, res) => {
  try {
    const updateData = req.body;
    
    // If QR code file is uploaded, add the URL
    if (req.file) {
      updateData.qr_code_url = `/uploads/qr-codes/${req.file.filename}`;
    }
    
    const account = await BankAccount.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!account) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    
    res.json(account);
  } catch (error) {
    console.error('Bank account update error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete bank account
export const deleteBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findByIdAndDelete(req.params.id);
    
    if (!account) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    
    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle active status
export const toggleBankAccountStatus = async (req, res) => {
  try {
    const account = await BankAccount.findById(req.params.id);
    
    if (!account) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    
    account.is_active = !account.is_active;
    await account.save();
    
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
