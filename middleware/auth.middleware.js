const jwt = require('jsonwebtoken');
const config = require("../config/auth.config.js");
const JWT_SECRET = config.secret; 
const db = require('../config/db');
const knex = require('knex');
const config_db = require('../config/db.config.js');

const authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const verifyToken = (token, secret) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });
  };
  
  try {
    const decoded = await verifyToken(token, JWT_SECRET);
    const db_name = decoded.gps_tracking.db_name

    const dynamicDbConfig = {
      development: {
        client: 'pg',
        connection: {
          host: '45.13.132.226', 
          port: 5432,
          user: 'fms',
          password: 'fms', 
          database: db_name,
        },
        dialect: 'postgres',
        pool: {
          min: 1,
          max: 3
        },
        logging: false,
      },
    };
    const dynamicDb = knex(dynamicDbConfig['development']);
    delete decoded.gps_tracking;
    req.userData = { ...decoded };
    req.userConn = dynamicDb ;
    req.token = token;

    res.on('finish', () => {
      req.userConn.destroy()
        .then(() => {
          console.log('Knex connection destroyed', db_name);
        })
        .catch((error) => {
          console.error(`Error destroying Knex connection: ${db_name}`, error);
        });
    });
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ message: 'Invalid token or token expired.' });
  }
};

module.exports = authMiddleware;
