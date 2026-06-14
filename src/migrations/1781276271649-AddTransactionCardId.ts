import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTransactionCardId1781276271649 implements MigrationInterface {
    name = 'AddTransactionCardId1781276271649'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "card_id" uuid`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_card_id" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE SET NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_card_id"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "card_id"`);
    }
}
