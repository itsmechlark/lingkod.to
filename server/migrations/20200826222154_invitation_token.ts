import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  const hasExpireIn = await knex.schema.hasColumn("users", "invitation_token");
  if (!hasExpireIn) {
    await knex.schema.alterTable("users", table => {
      table.string("invitation_token");
    });
  }
}

export async function down(): Promise<any> {
  return null;
}
