import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactionCompanyId1781276271651 implements MigrationInterface {
  name = 'AddTransactionCompanyId1781276271651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transactions" ADD "company_id" uuid`);

    // Backfill from linked invoice
    await queryRunner.query(`
      UPDATE "transactions" t
      SET "company_id" = i."company_id"
      FROM "invoices" i
      WHERE i."ocr_number" = t."ocr_number"
    `);

    await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "company_id" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_company_id" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_company_id"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "company_id"`);
  }
}
