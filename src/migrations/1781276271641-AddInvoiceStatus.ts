import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvoiceStatus1781276271641 implements MigrationInterface {
    name = 'AddInvoiceStatus1781276271641'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."invoices_status_enum" AS ENUM('pending', 'processing', 'paid')`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "status" "public"."invoices_status_enum" NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."invoices_status_enum"`);
    }
}
