const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../data/system_settings.json');

// Initialize settings file if it doesn't exist
async function initializeSettings() {
  try {
    await fs.access(SETTINGS_FILE);
  } catch (error) {
    const defaultSettings = {
      weekendDays: ['Friday', 'Saturday'],
      holidays: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
  }
}

// Get system settings
router.get('/system', async (req, res) => {
  try {
    await initializeSettings();
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    const settings = JSON.parse(data);
    res.json(settings);
  } catch (error) {
    console.error('Error reading system settings:', error);
    res.status(500).json({ error: 'Failed to load system settings' });
  }
});

// Update system settings
router.post('/system', async (req, res) => {
  try {
    await initializeSettings();
    const { weekendDays, holidays } = req.body;
    
    const settings = {
      weekendDays: weekendDays || ['Friday', 'Saturday'],
      holidays: holidays || [],
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    res.json({ message: 'Settings saved successfully', settings });
  } catch (error) {
    console.error('Error saving system settings:', error);
    res.status(500).json({ error: 'Failed to save system settings' });
  }
});

module.exports = router;