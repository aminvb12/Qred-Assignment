import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvoiceType1781276271645 implements MigrationInterface {
    name = 'AddInvoiceType1781276271645'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."invoices_type_enum" AS ENUM('statement', 'fee')`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "type" "public"."invoices_type_enum" NOT NULL DEFAULT 'statement'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."invoices_type_enum"`);
    }
}
