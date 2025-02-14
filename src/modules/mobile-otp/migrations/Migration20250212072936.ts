import { Migration } from '@mikro-orm/migrations';

export class Migration20250212072936 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "mobile_otp" drop constraint if exists "mobile_otp_phone_unique";`);
    this.addSql(`create table if not exists "mobile_otp" ("id" text not null, "phone" text not null, "token" text null, "otp_hash" text not null, "attempt_count" integer not null default 0, "expires_at" timestamptz not null, "last_attempt_at" timestamptz not null, "is_valid" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "mobile_otp_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_mobile_otp_phone_unique" ON "mobile_otp" (phone) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_mobile_otp_deleted_at" ON "mobile_otp" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "mobile_otp" cascade;`);
  }

}
