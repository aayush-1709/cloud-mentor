# CloudMentor Full AWS Deployment Guide

This document is a complete deployment direction for running CloudMentor fully on AWS using:

- EC2
- ECS
- RDS (PostgreSQL)
- S3
- Lambda
- Bedrock

It is written so you can give it to ChatGPT and ask for step-by-step execution phase by phase.

---

## 1) Target Architecture (All Requested Services)

- **ECS on EC2** runs the Next.js app container (uses both ECS and EC2 together).
- **RDS PostgreSQL** stores application data.
- **S3** stores app assets/uploads and optional DB export backups.
- **Bedrock** provides LLM inference for mentor/chat/evaluation features.
- **Lambda** acts as Bedrock adapter and async utility jobs (scheduled tasks).

---

## 2) Current Project Facts You Must Respect

- App is Next.js App Router (`npm run dev`, `npm run build`, `npm run start`).
- DB connection uses `DATABASE_URL`.
- Current AI code reads Gemini env vars (`GEMINI_API_KEY*`, `GOOGLE_GENERATIVE_AI_API_KEY`) in `lib/gemini.ts`.
- Project has SQL setup scripts in `scripts/` and a full dump in `cloudmentor.sql`.
- There is no auth flow; app uses a demo user.

---

## 3) Deployment Strategy (Recommended)

Use this order:

1. AWS account baseline + IAM
2. Networking (VPC/subnets/security groups)
3. RDS setup
4. S3 buckets
5. Bedrock model access
6. Lambda Bedrock proxy
7. Containerize app + push to ECR
8. ECS on EC2 deployment + ALB
9. Import DB schema/data
10. Domain + TLS
11. CI/CD + monitoring + backups

---

## 4) Prerequisites

- AWS account with admin access initially
- Domain name in Route 53 (optional but recommended)
- AWS CLI configured locally (`aws configure`)
- Docker installed locally
- `psql` client installed for DB import
- Node.js 20+ locally for build checks
- Region chosen (example below uses `ap-south-1`, change as needed)

---

## 5) Phase A - Prepare Repository for AWS Runtime

### A1. Add container support

Create:

- `Dockerfile`
- `.dockerignore`

Use a multi-stage Docker build for Next.js production runtime.

### A2. Enable standalone output in Next.js

Update `next.config.mjs`:

- add `output: "standalone"` for smaller production image

### A3. Environment variables plan

App task env vars:

- `NODE_ENV=production`
- `PORT=3000`
- `DATABASE_URL` (from Secrets Manager)
- `BEDROCK_REGION`
- `BEDROCK_MODEL_ID`
- `AWS_REGION`
- `LAMBDA_BEDROCK_FN` (if app calls Lambda proxy)

Important: remove dependency on Gemini API keys in production path.

---

## 6) Phase B - Networking Foundation

Create one VPC:

- CIDR: `10.0.0.0/16`
- 2 public subnets (ALB, NAT if needed)
- 2 private app subnets (ECS EC2 instances)
- 2 private DB subnets (RDS)
- Internet Gateway
- NAT Gateway (if private subnets need outbound internet)

Security groups:

- `alb-sg`: allow 80/443 from internet
- `ecs-sg`: allow 3000 from `alb-sg`; allow outbound
- `rds-sg`: allow 5432 only from `ecs-sg` and admin/bastion SG

---

## 7) Phase C - RDS PostgreSQL

Create RDS PostgreSQL:

- Engine: PostgreSQL 16/17 compatible
- Multi-AZ if production
- DB subnet group: private DB subnets
- Attach `rds-sg`
- Enable automated backups (7-30 days)
- Enable Performance Insights

Store DB credentials in Secrets Manager.

Build `DATABASE_URL`:

`postgresql://<user>:<password>@<rds-endpoint>:5432/<dbname>`

---

## 8) Phase D - S3

Create buckets:

1. `cloudmentor-assets-<env>-<account>` for app files/static uploads
2. `cloudmentor-db-backups-<env>-<account>` for SQL exports

Enable:

- Block public access (default)
- Versioning on backup bucket
- Lifecycle policy (move old backups to Glacier)
- SSE-S3 or SSE-KMS encryption

---

## 9) Phase E - Bedrock + Lambda Integration

## E1. Bedrock model access

In Bedrock console:

- request model access for chosen model (example: Claude Sonnet)
- note model ID and region availability

## E2. Lambda Bedrock proxy (recommended)

Create Lambda function (Node.js 20):

- receives prompt/context from app
- calls Bedrock Runtime `InvokeModel` or `Converse`
- returns normalized response JSON

Why use Lambda:

- centralizes prompt and model logic
- easier IAM control and logging
- easy retries/throttling and future async workflows

## E3. Lambda IAM permissions

Lambda role needs:

- `bedrock:InvokeModel` (scoped to allowed model ARNs)
- CloudWatch logs write
- optional S3 read/write if storing prompts/results

## E4. App-side AI switch

Refactor app AI helper:

- replace Gemini SDK path with Lambda invocation (AWS SDK v3 `LambdaClient`)
- OR call Bedrock directly from app container role

For this project, Lambda proxy is cleaner and satisfies the Lambda requirement.

---

## 10) Phase F - ECS on EC2 (Uses ECS + EC2 Together)

## F1. ECR repository

Create ECR repo:

- `cloudmentor-web`

Build and push image:

```bash
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker build -t cloudmentor-web:latest .
docker tag cloudmentor-web:latest <account>.dkr.ecr.<region>.amazonaws.com/cloudmentor-web:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/cloudmentor-web:latest
```

## F2. ECS cluster with EC2 capacity

Create ECS cluster with EC2 capacity provider:

- ECS-optimized AMI launch template
- Auto Scaling Group across private app subnets
- instance profile with:
  - `AmazonEC2ContainerRegistryReadOnly`
  - `AmazonSSMManagedInstanceCore`
  - CloudWatch agent/log permissions

## F3. ECS task definition

Container config:

- image: ECR URI
- container port: 3000
- health check: `GET /`
- env vars + secrets from Secrets Manager
- awslogs driver to CloudWatch log group

Task role permissions:

- read Secrets Manager secret
- invoke Lambda Bedrock function
- S3 access as needed for assets

## F4. ECS service + ALB

Create:

- ECS service (desired count >= 2 for HA)
- ALB target group on port 3000
- listener 80 -> redirect to 443
- listener 443 -> target group

Enable ALB health check path `/`.

---

## 11) Phase G - Domain, TLS, and DNS

- Request ACM certificate for domain/subdomain (`app.example.com`)
- Validate cert via DNS
- Attach cert to ALB 443 listener
- Route 53 A/ALIAS record -> ALB DNS

---

## 12) Phase H - Initialize Database

From a trusted machine with network access to RDS:

Option 1 (full import preferred for this project):

```bash
psql "postgresql://<user>:<password>@<rds-endpoint>:5432/<dbname>" -f cloudmentor.sql
```

Option 2 (scripts):

```bash
psql "<DATABASE_URL>" -f scripts/01-create-schema.sql
psql "<DATABASE_URL>" -f scripts/03-seed-courses.sql
psql "<DATABASE_URL>" -f scripts/04-add-course-duration.sql
psql "<DATABASE_URL>" -f scripts/05-add-iam-module.sql
```

After script-only setup, verify `lesson_progress` exists (app routes use it).

---

## 13) Phase I - Lambda Scheduled Jobs (Operational)

Add EventBridge scheduled Lambdas:

- nightly RDS logical backup to S3 (`pg_dump` via secure runner pattern)
- optional daily analytics aggregation
- stale collaboration cleanup

Store schedule config in IaC for reproducibility.

---

## 14) Phase J - CI/CD Pipeline (Suggested)

Use GitHub Actions or CodePipeline:

1. run lint/build
2. build Docker image
3. push to ECR
4. update ECS service (new task definition revision)
5. run smoke test endpoint

For zero/low downtime:

- rolling update with min healthy percent
- optionally enable blue/green via CodeDeploy

---

## 15) Security Hardening Checklist

- Never store secrets in repo or task plain env; use Secrets Manager
- Use least-privilege IAM for ECS task role and Lambda role
- Keep RDS private (no public access)
- Restrict SG rules to exact sources only
- Enable CloudTrail, GuardDuty, Security Hub (if available)
- Enable WAF on ALB for internet-facing production
- Rotate DB password and access keys regularly

---

## 16) Monitoring and Reliability

- CloudWatch alarms:
  - ALB 5XX count
  - ECS service CPU/memory
  - ECS task restart count
  - RDS free storage, CPU, connections
  - Lambda errors/throttles/duration
- Centralized app logs in CloudWatch
- Enable ALB access logs to S3
- Backup and restore drill monthly

---

## 17) Cost Controls

- Use smaller EC2 instance types in non-prod
- Use ECS desired count 1 in dev
- Turn off non-prod at night (ASG schedule)
- S3 lifecycle policies for logs/backups
- RDS storage autoscaling + right-sized instance
- Bedrock token limits/guardrails in Lambda

---

## 18) Production Go-Live Checklist

- [ ] App reachable via HTTPS domain
- [ ] ECS health checks stable
- [ ] DB migration/import complete
- [ ] Mentor endpoints return Bedrock responses
- [ ] CloudWatch alarms configured
- [ ] Backups verified (RDS + S3 exports)
- [ ] Runbook written for rollback and incident response

---

## 19) What to Ask ChatGPT Next (Copy/Paste)

Use this exact prompt with ChatGPT:

```text
I am deploying the CloudMentor Next.js app on AWS.
Use my AWS-readme as the source of truth.

Give me an execution plan in strict order with:
1) exact AWS Console steps
2) AWS CLI commands for each phase
3) IAM policies JSON where needed
4) validation checks after each step
5) rollback steps if a step fails

Start with Phase A and wait for my confirmation before moving to the next phase.
```

---

## 20) Notes Specific to This Repository

- Current AI layer is Gemini-based in code; migration to Bedrock is required for full AWS-native AI.
- Prefer importing `cloudmentor.sql` for fastest environment parity.
- Keep staging and production as separate ECS services + separate RDS instances.

