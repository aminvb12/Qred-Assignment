import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyPaymentProvider1781276271642 implements MigrationInterface {
    name = 'AddCompanyPaymentProvider1781276271642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "companies" ADD "payment_provider" character varying NOT NULL DEFAULT 'internal'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "payment_provider"`);
    }
}
