import knex from "knex";

import env from "./env";

const ssl = {
  rejectUnauthorized: env.DB_SSL_REJECTUNAUTH,
  ...(env.DB_SSL_CA && { ca: env.DB_SSL_CA }),
  ...(env.DB_SSL_KEY && { key: env.DB_SSL_KEY }),
  ...(env.DB_SSL_CERT && { cert: env.DB_SSL_CERT })
};

export const connection = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  pool: {
    min: env.DB_POOL_MIN,
    max: env.DB_POOL_MAX
  },
  ...(env.DB_SSL && { ssl: ssl })
};

const db = knex({
  client: "postgres",
  connection: connection
});

export default db;
