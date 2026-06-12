import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1781276271640 implements MigrationInterface {
    name = 'InitSchema1781276271640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cards" ALTER COLUMN "card_number" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cards" ALTER COLUMN "issue_date" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cards" ALTER COLUMN "exp_date" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cards" ALTER COLUMN "exp_date" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cards" ALTER COLUMN "issue_date" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cards" ALTER COLUMN "card_number" SET NOT NULL`);
    }

}
