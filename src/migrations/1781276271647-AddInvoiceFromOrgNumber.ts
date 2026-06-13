import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvoiceFromOrgNumber1781276271647 implements MigrationInterface {
    name = 'AddInvoiceFromOrgNumber1781276271647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ADD "from_org_number" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "from_org_number"`);
    }
}
