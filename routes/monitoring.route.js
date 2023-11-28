const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const db = require('../config/db');

router.get('/monitoring', authMiddleware, async (req, res) => {
  try {
    const requestingUser = req.userData.dynamicDb;
    console.log(requestingUser)
    res.json({
      message: 'Monitoring'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
