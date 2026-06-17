import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPassword1781276271650 implements MigrationInterface {
  name = 'AddUserPassword1781276271650';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password" character varying NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
  }
}
