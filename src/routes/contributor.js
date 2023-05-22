const express = require('express');
const router = express.Router();
const User = require("../models/user");

// Get all contributors
router.get('/contributors', async (req, res) => {
  try {
    const contributors = await User.find({ contrInfo: { $exists: true } });
    res.json(contributors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a contributor by userID
router.get('/contributors/:userID', async (req, res) => {
  const userID = req.params.userID;
  try {
    const contributor = await User.findOne({ userID, contrInfo: { $exists: true } });
    if (!contributor) {
      return res.status(404).json({ message: 'Contributor not found' });
    }
    res.json(contributor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;