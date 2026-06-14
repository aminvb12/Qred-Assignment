# Qred Backend API

A REST API for managing companies, users, cards, invoices, and transactions — built as a take-home assignment for Qred.

---

## Tech Stack

- **NestJS 10** — framework (modules, controllers, services, pipes)
- **TypeORM 0.3** — ORM with migration support
- **PostgreSQL** — primary database
- **class-validator / class-transformer** — DTO validation
- **@nestjs/swagger** — auto-generated OpenAPI docs at `/api`
- **Jest + Supertest** — unit tests and e2e controller tests
- **Docker / docker-compose** — local development
- **AWS** — production infrastructure (see below)

---

## Design Patterns

**Strategy pattern — payment providers**
Each company has a `payment_provider` field (`internal`, `stripe`, `adyen`, `nets`). A `TransactionSourceFactory` picks the right `ITransactionSource` implementation at runtime. Swapping providers requires no changes to the API layer.

**Repository pattern**
TypeORM repositories are injected into services. Services never touch the database directly — they go through the repository.

**ACID transactions with pessimistic locking**
Invoice payments use a `QueryRunner` to wrap the status update and card credit restore in a single transaction, with `FOR UPDATE` locks to prevent race conditions.

**Module-per-domain**
Each domain (user, company, card, invoice, transaction) lives in its own NestJS module with its own controller, service, entity, and DTOs. Modules import only what they need.

**Dual controller for admin vs. company-scoped routes**
`InvoiceAdminController` handles `POST /invoices` (Qred creates invoices). `InvoiceController` handles the company-scoped reads and status updates under `companies/:companyId/invoices`.

---

## Database Tables

### `User`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| first_name | varchar | |
| last_name | varchar | |
| email | varchar | |
| personal_number | varchar UNIQUE | Swedish personal number |

### `Company`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| name | varchar | |
| org_number | varchar UNIQUE | Swedish org number |
| logo | varchar | nullable |
| payment_provider | varchar | `internal` \| `stripe` \| `adyen` \| `nets` |

### `User_Company`
Join table linking users to companies with a role.

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| company_id | uuid FK → companies | |
| role | enum | `owner` \| `admin` |

Unique constraint on `(user_id, company_id)`.

### `Card`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| card_number | varchar UNIQUE | nullable, set on apply |
| issue_date | date | nullable |
| exp_date | date | nullable |
| max_credit | decimal(12,2) | |
| current_credit | decimal(12,2) | |
| status | enum | `under_review` \| `active` \| `inactive` \| `blocked` |
| company_id | uuid FK → companies | |

### `Invoice`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| ocr_number | varchar UNIQUE | |
| issue_date | date | |
| due_date | date | |
| amount | decimal(12,2) | |
| address | varchar | nullable |
| from | varchar | sender name, defaults to `Qred AB` |
| from_org_number | varchar | nullable |
| status | enum | `pending` \| `paid` \| `overdue` |
| company_id | uuid FK → companies | |

### `transactions`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| ocr_number | varchar UNIQUE | FK → `invoices.ocr_number` |
| amount | decimal(12,2) | |
| date | date | |
| paid_date | date | nullable |
| card_id | uuid FK → cards | nullable |

---

## API Routes

```
GET    /users
POST   /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
POST   /users/:id/companies/:companyId

GET    /companies/:companyId/cards
POST   /companies/:companyId/cards          # apply for card
PATCH  /companies/:companyId/cards/:id      # update limits/status
DELETE /companies/:companyId/cards/:id
PATCH  /companies/:companyId/cards/:id/activate

POST   /invoices                            # admin: Qred creates invoice
GET    /companies/:companyId/invoices
GET    /companies/:companyId/invoices/:id
PATCH  /companies/:companyId/invoices/:id/status

GET    /companies/:companyId/transactions
POST   /companies/:companyId/transactions   # pay by card

GET    /health
```

Swagger UI is available at `/api` when the server is running.

---

## Running Locally

```bash
cp .env.example .env
docker-compose up
```

The API starts on `http://localhost:3000`. Migrations run automatically on startup.

To run migrations manually:

```bash
npm run migration:run
```

---

## Tests

```bash
npm test           # unit tests (Jest, mocked repos)
npm run test:e2e   # e2e tests (Supertest, mocked services, no DB)
```

---

## Infrastructure

Production runs on AWS, defined as CloudFormation in `infrastructure/`.

**`infrastructure.yml`** — networking and database:
- VPC with public subnets (ALB) and private subnets (ECS + RDS)
- Internet Gateway + route tables
- RDS PostgreSQL in private subnets
- Secrets Manager secret auto-attached to the RDS instance
- Security groups scoping traffic between ALB → ECS → RDS

**`app.yml`** — application layer:
- ECR repository for Docker images
- ECS Fargate cluster, task definition, and service
- Application Load Balancer with HTTP listener and target group
- IAM role for the ECS task (ECR pull, Secrets Manager read, CloudWatch Logs)
- CloudWatch Log Group

**CI/CD** (`.github/workflows/deploy.yml`):
- Every push to `main` runs unit and e2e tests first
- Deploy job only runs if tests pass
- Builds a multi-arch Docker image, pushes to ECR, triggers `ecs update-service`
- Waits for the deployment to stabilise before the workflow goes green

**Frontend** is deployed separately via S3 + CloudFront. CloudFront proxies `/api/*` to the ALB to avoid mixed-content issues. See `Qred-frontend/infrastructure/frontend.yml`.
