import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1781276271640 implements MigrationInterface {
    name = 'InitSchema1781276271640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ocr_number" character varying NOT NULL, "amount" numeric(12,2) NOT NULL, "date" date NOT NULL, "paid_date" date, "invoice_id" uuid NOT NULL, CONSTRAINT "UQ_d85c9eccedded26a37fa7ebb60a" UNIQUE ("ocr_number"), CONSTRAINT "REL_3a12e9b258f9cd052e43cacf75" UNIQUE ("invoice_id"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ocr_number" character varying NOT NULL, "issue_date" date NOT NULL, "due_date" date NOT NULL, "amount" numeric(12,2) NOT NULL, "address" character varying, "company_id" uuid NOT NULL, CONSTRAINT "UQ_dadf42366bff6a1852d0e702667" UNIQUE ("ocr_number"), CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."cards_status_enum" AS ENUM('under_review', 'active', 'inactive', 'blocked')`);
        await queryRunner.query(`CREATE TABLE "cards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "card_number" character varying UNIQUE, "issue_date" date, "exp_date" date, "max_credit" numeric(12,2) NOT NULL, "current_credit" numeric(12,2) NOT NULL, "status" "public"."cards_status_enum" NOT NULL DEFAULT 'inactive', "company_id" uuid NOT NULL, CONSTRAINT "PK_5f3269634705fdff4a9935860fc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "org_number" character varying NOT NULL, "logo" character varying, CONSTRAINT "UQ_86a3a7b37df4ec3028eba0a64a7" UNIQUE ("org_number"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_companies_role_enum" AS ENUM('owner', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user_companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "company_id" uuid NOT NULL, "role" "public"."user_companies_role_enum" NOT NULL DEFAULT 'owner', CONSTRAINT "UQ_ca73b87c901966a9fb8960916df" UNIQUE ("user_id", "company_id"), CONSTRAINT "PK_f41bd3ea569c8c877b9a9063abb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "personal_number" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_3a12e9b258f9cd052e43cacf75b" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_42385e42f092f26bd38df549717" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cards" ADD CONSTRAINT "FK_7f70f6c4f1aedaf0ab35ae3e844" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_companies" ADD CONSTRAINT "FK_50c7d6aeb4ab214ad9fff29ab68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_companies" ADD CONSTRAINT "FK_9e735e90e4fd3bbb4268ed96d94" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_companies" DROP CONSTRAINT "FK_9e735e90e4fd3bbb4268ed96d94"`);
        await queryRunner.query(`ALTER TABLE "user_companies" DROP CONSTRAINT "FK_50c7d6aeb4ab214ad9fff29ab68"`);
        await queryRunner.query(`ALTER TABLE "cards" DROP CONSTRAINT "FK_7f70f6c4f1aedaf0ab35ae3e844"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_42385e42f092f26bd38df549717"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_3a12e9b258f9cd052e43cacf75b"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "user_companies"`);
        await queryRunner.query(`DROP TYPE "public"."user_companies_role_enum"`);
        await queryRunner.query(`DROP TABLE "companies"`);
        await queryRunner.query(`DROP TABLE "cards"`);
        await queryRunner.query(`DROP TYPE "public"."cards_status_enum"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
    }

}
