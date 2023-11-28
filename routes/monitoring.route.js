const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

router.get('/monitoring', authMiddleware, async (req, res) => {
  try {
    const userData = req.userData;
    const knex = req.userConn;
    res.json({
      message: 'Retrieved monitoring data',
      data : userData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/monitoring/detail', authMiddleware, async (req, res) => {
  try {
    const userData = req.userData;
    const knex = req.userConn;
    const logistic_delivery_order = await knex('logistic_delivery_order')
      .where('truck_id', userData.vehicle.id)
      .first();
    
    userData.logistic_delivery_order = logistic_delivery_order ? logistic_delivery_order : null ;
    delete userData.gps_tracking;
    delete userData.iat;
    delete userData.exp;
    res.json({
      message: 'Retrieved monitoring detail data',
      data: userData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
