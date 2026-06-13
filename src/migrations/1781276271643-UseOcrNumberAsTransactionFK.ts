import { MigrationInterface, QueryRunner } from "typeorm";

export class UseOcrNumberAsTransactionFK1781276271643 implements MigrationInterface {
    name = 'UseOcrNumberAsTransactionFK1781276271643'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the UUID invoice_id FK and constraint
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "FK_3a12e9b258f9cd052e43cacf75b"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "REL_3a12e9b258f9cd052e43cacf75"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN IF EXISTS "invoice_id"`);

        // Add FK on ocr_number → invoices.ocr_number
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_ocr_number" FOREIGN KEY ("ocr_number") REFERENCES "invoices"("ocr_number") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "FK_transactions_ocr_number"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "invoice_id" uuid`);
    }
}
