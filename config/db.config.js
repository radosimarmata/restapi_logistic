module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: '45.13.132.226',
      port: 5432,
      user: 'fms',
      password: 'fms',
      database: 'db_master_fms',
    },
    dialect: 'postgres',
    pool: {
      min: 1,
      max: 3
    },
    logging: false,
  },
};
