import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvoiceFrom1781276271644 implements MigrationInterface {
    name = 'AddInvoiceFrom1781276271644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ADD "from" character varying NOT NULL DEFAULT 'Qred AB'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "from"`);
    }
}
