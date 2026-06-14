import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveInvoiceType1781276271648 implements MigrationInterface {
    name = 'RemoveInvoiceType1781276271648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."invoices_type_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."invoices_type_enum" AS ENUM('statement', 'fee')`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "type" "public"."invoices_type_enum" NOT NULL DEFAULT 'statement'`);
    }
}
