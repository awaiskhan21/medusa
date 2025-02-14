import { Migration } from '@mikro-orm/migrations';

export class Migration20250212070216 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "verified" ("id" text not null, "isVerified" boolean not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "verified_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_verified_deleted_at" ON "verified" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "verified" cascade;`);
  }

}
