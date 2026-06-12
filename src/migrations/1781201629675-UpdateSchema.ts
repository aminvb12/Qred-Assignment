import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchema1781201629675 implements MigrationInterface {
    name = 'UpdateSchema1781201629675'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_3a12e9b258f9cd052e43cacf75b"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "REL_3a12e9b258f9cd052e43cacf75"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "invoice_id"`);
        await queryRunner.query(`CREATE TYPE "public"."invoices_status_enum" AS ENUM('pending', 'processing', 'paid')`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "status" "public"."invoices_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "cards" ADD "current_credit" numeric(12,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "personal_number" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_3f7680b4e3d65966baf246cc1d3" UNIQUE ("personal_number")`);
        await queryRunner.query(`ALTER TYPE "public"."cards_status_enum" RENAME TO "cards_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."cards_status_enum" AS ENUM('under_review', 'active', 'inactive', 'blocked')`);
        await queryRunner.query(`ALTER TABLE "cards" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "cards" ALTER COLUMN "status" TYPE "public"."cards_status_enum" USING "status"::"text"::"public"."cards_status_enum"`);
        await queryRunner.query(`ALTER TABLE "cards" ALTER COLUMN "status" SET DEFAULT 'inactive'`);
        await queryRunner.query(`DROP TYPE "public"."cards_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_d85c9eccedded26a37fa7ebb60a" FOREIGN KEY ("ocr_number") REFERENCES "invoices"("ocr_number") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_d85c9eccedded26a37fa7ebb60a"`);
        await queryRunner.query(`CREATE TYPE "public"."cards_status_enum_old" AS ENUM('active', 'inactive', 'blocked')`);
        await queryRunner.query(`ALTER TABLE "cards" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "cards" ALTER COLUMN "status" TYPE "public"."cards_status_enum_old" USING "status"::"text"::"public"."cards_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "cards" ALTER COLUMN "status" SET DEFAULT 'inactive'`);
        await queryRunner.query(`DROP TYPE "public"."cards_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."cards_status_enum_old" RENAME TO "cards_status_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_3f7680b4e3d65966baf246cc1d3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "personal_number"`);
        await queryRunner.query(`ALTER TABLE "cards" DROP COLUMN "current_credit"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."invoices_status_enum"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "invoice_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "REL_3a12e9b258f9cd052e43cacf75" UNIQUE ("invoice_id")`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_3a12e9b258f9cd052e43cacf75b" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
