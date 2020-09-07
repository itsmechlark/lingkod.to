import { connection } from "./server/knex";

module.exports = {
  production: {
    client: "postgresql",
    connection: connection,
    migrations: {
      tableName: "knex_migrations",
      directory: "server/migrations"
    }
  }
};
