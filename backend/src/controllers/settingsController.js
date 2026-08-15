import Settings from '../models/Settings.js';

// Get all settings
export const getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get setting by key
export const getSettingByKey = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update or create setting
export const upsertSetting = async (req, res) => {
  try {
    const { key, value, type, description } = req.body;
    
    // If file was uploaded, use the file path as value
    let settingValue = value;
    if (req.file) {
      settingValue = `/uploads/hero/${req.file.filename}`;
    }

    // Validate that we have a value
    if (!settingValue && !req.file) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const setting = await Settings.findOneAndUpdate(
      { key },
      { key, value: settingValue, type, description },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(setting);
  } catch (error) {
    console.error('Settings upsert error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete setting
export const deleteSetting = async (req, res) => {
  try {
    const setting = await Settings.findOneAndDelete({ key: req.params.key });
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
