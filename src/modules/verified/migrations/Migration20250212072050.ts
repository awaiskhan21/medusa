import { Migration } from '@mikro-orm/migrations';

export class Migration20250212072050 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "verified" alter column "isVerified" type boolean using ("isVerified"::boolean);`);
    this.addSql(`alter table if exists "verified" alter column "isVerified" set default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "verified" alter column "isVerified" drop default;`);
    this.addSql(`alter table if exists "verified" alter column "isVerified" type boolean using ("isVerified"::boolean);`);
  }

}
