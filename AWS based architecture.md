# CloudMentor AI — AWS Architecture

> **AI-Powered AWS Certification Learning Platform**
> Learn → Practice → Supervise → Evaluate → Predict → Improve

![Architecture Diagram](./architecture-diagram.png)

---

## Architecture Overview

CloudMentor AI leverages a modern serverless-first AWS architecture to deliver a scalable, secure, and intelligent learning platform. Below is a detailed mapping of every AWS service to its role in the platform.

---

## 1. Users & Edge Layer

| AWS Service | Purpose |
|---|---|
| **Amazon Route 53** | DNS management — routes `cloudmentor.ai` to CloudFront with health checks and failover |
| **Amazon CloudFront** | Global CDN — caches static assets (JS bundles, images, course media) at 450+ edge locations for low-latency delivery worldwide |
| **AWS WAF** | Web Application Firewall — protects against SQL injection, XSS, DDoS, and bot attacks on the frontend and API endpoints |

---

## 2. Frontend Tier

| AWS Service | Purpose |
|---|---|
| **AWS Amplify Hosting** | Hosts the Next.js application with SSR/SSG support, automatic CI/CD from Git, preview deployments, and custom domain management |
| **Amazon S3** | Stores static assets — course thumbnails, user uploads, downloadable study materials, and pre-rendered pages |

### How it maps to CloudMentor:
- The **Next.js 16 App Router** runs on Amplify with server-side rendering for dynamic dashboard pages
- Static course catalog pages are pre-rendered (SSG) for fast initial loads
- Dark/light theme assets and UI component bundles are cached via CloudFront

---

## 3. API & Compute Tier

| AWS Service | Purpose |
|---|---|
| **Amazon API Gateway** | Central API management — REST APIs for CRUD operations + WebSocket APIs for real-time mentor chat streaming |
| **AWS Lambda** | Serverless compute for all API handlers — auto-scales from 0 to thousands of concurrent learners |
| **Amazon ECS Fargate** | Runs the AI Mentor streaming service as a container — needed for long-running WebSocket connections that exceed Lambda's timeout |

### Lambda Functions (Microservices):

| Function | Responsibility |
|---|---|
| `course-api` | Course catalog CRUD, lesson retrieval, enrollment management |
| `assessment-api` | Quiz generation, answer evaluation, score calculation, mastery checks |
| `progress-api` | Step mastery tracking, CRI (Certification Readiness Index) calculation, analytics |
| `collaboration-api` | Study group creation, invitation handling, session management |
| `auth-api` | Token validation, session management, user profile updates |
| `gamification-api` | Points calculation, badge awards, streak tracking, leaderboard updates |
| `notification-api` | Trigger emails, push notifications, and in-app alerts |

---

## 4. Authentication & Security

| AWS Service | Purpose |
|---|---|
| **Amazon Cognito** | User authentication — email/password sign-up, email verification, JWT token management, user pools for learners and admins |
| **AWS IAM** | Service-to-service authorization — fine-grained roles and policies for Lambda, ECS, and database access |
| **AWS Secrets Manager** | Securely stores API keys (OpenAI/Bedrock), database credentials, and third-party service tokens with automatic rotation |
| **AWS KMS** | Encryption key management — encrypts data at rest in Aurora, S3, and DynamoDB |

### How it maps to CloudMentor:
- **Cognito User Pools** replace Supabase Auth for production-grade auth with MFA support
- **Cognito Identity Pools** provide temporary AWS credentials for direct S3 access from the client
- IAM roles enforce **least privilege** — each Lambda has only the permissions it needs

---

## 5. AI/ML Services (Core Intelligence Layer)

| AWS Service | Purpose |
|---|---|
| **Amazon Bedrock** | Powers the AI Mentor — uses Claude 3.5 Sonnet or GPT-4o for context-aware AWS certification guidance, scenario evaluation, and adaptive tutoring |
| **Amazon Transcribe** | Real-time voice-to-text — converts learner voice queries into text for the AI Mentor chat |
| **Amazon Polly** | Text-to-speech — reads AI Mentor responses aloud with natural-sounding voices for accessibility |
| **Amazon Comprehend** | NLP analysis — evaluates free-form assessment answers, detects sentiment, and extracts key AWS concepts from learner responses |
| **Amazon Personalize** | Adaptive learning engine — generates personalized learning paths based on learner behavior, assessment performance, and knowledge gaps |

### AI Mentor Architecture:

```
Learner Voice Input
    │
    ▼
Amazon Transcribe (STT)
    │
    ▼
Amazon API Gateway (WebSocket)
    │
    ▼
ECS Fargate (Mentor Service)
    │
    ├──► Amazon Bedrock (Claude/GPT) ──► Streaming Response
    │
    ├──► Amazon Comprehend (Concept Extraction)
    │
    └──► Amazon Personalize (Next Recommendation)
    │
    ▼
Amazon Polly (TTS)
    │
    ▼
Learner Hears Response
```

### Key AI Features Powered by AWS:

| Feature | AWS Service | Description |
|---|---|---|
| QnA Chatbot | Bedrock | Answers AWS certification questions with context from course materials |
| Live Mentoring | Bedrock + Comprehend | Real-time supervision during AWS console practice — checks steps and guides learners |
| Assessment Evaluation | Comprehend + Bedrock | Evaluates free-form answers, scores scenario-based responses |
| Readiness Prediction | Personalize + Bedrock | Predicts certification exam readiness with confidence scores |
| Adaptive Paths | Personalize | Recommends next lessons/topics based on learner's strengths and weaknesses |

---

## 6. Database Tier

| AWS Service | Purpose |
|---|---|
| **Amazon Aurora PostgreSQL** | Primary relational database — stores users, courses, lessons, assessments, quiz questions, progress, gamification, and collaboration data (13 tables) |
| **Amazon DynamoDB** | NoSQL store for high-throughput, low-latency data — AI chat sessions, real-time collaboration events, and event logs |
| **Amazon ElastiCache (Redis)** | In-memory cache — session data, leaderboard rankings, frequently accessed course metadata, and rate limiting |

### Database Mapping:

| Table | Database | Reason |
|---|---|---|
| `users`, `courses`, `lessons` | Aurora PostgreSQL | Relational data with complex joins |
| `assessments`, `quiz_questions`, `quiz_options` | Aurora PostgreSQL | Structured assessment data |
| `user_progress`, `assessment_results` | Aurora PostgreSQL | Transactional progress tracking |
| `gamification` | Aurora PostgreSQL + ElastiCache | Persistent storage + cached leaderboards |
| `ai_sessions` | DynamoDB | High-write chat history, TTL-based cleanup |
| `collaboration_rooms`, `collaboration_sessions` | DynamoDB | Real-time collaboration with low latency |
| `notifications` | DynamoDB | High-volume, time-series notification data |

---

## 7. Storage & Analytics

| AWS Service | Purpose |
|---|---|
| **Amazon S3** | Object storage — course videos, PDF materials, diagrams, user-generated content |
| **Amazon Kinesis Data Streams** | Real-time event streaming — captures learning events (lesson views, quiz attempts, time spent) for analytics |
| **Amazon QuickSight** | Business intelligence — admin dashboards showing platform-wide analytics, course completion rates, and learner engagement metrics |
| **AWS Glue** | ETL service — transforms raw learning event data for analytics and ML model training |

### Analytics Pipeline:

```
Learner Activity
    │
    ▼
Amazon Kinesis (Event Stream)
    │
    ├──► AWS Glue (Transform) ──► Amazon S3 (Data Lake)
    │                                    │
    │                                    ▼
    │                            Amazon QuickSight (BI Dashboards)
    │
    └──► Amazon Personalize (Real-time Recommendations)
```

---

## 8. Notifications

| AWS Service | Purpose |
|---|---|
| **Amazon SES** | Transactional emails — welcome emails, email verification, assessment results, study group invitations, weekly progress summaries |
| **Amazon SNS** | Push notifications — mobile/browser notifications for study reminders, badge awards, and mentor availability |
| **Amazon EventBridge** | Event orchestration — triggers workflows when learners complete milestones, fail assessments, or achieve certifications |

### Notification Triggers:

| Event | Action | AWS Service |
|---|---|---|
| User signs up | Send welcome email | EventBridge → SES |
| Assessment passed | Award badge + notify | EventBridge → Lambda → SNS + SES |
| 3-day inactivity | Send reminder | EventBridge (scheduled) → SES |
| Study group invite | Send email with link | Lambda → SES |
| Certification ready | Congratulations notification | EventBridge → SNS + SES |

---

## 9. Monitoring & DevOps

| AWS Service | Purpose |
|---|---|
| **Amazon CloudWatch** | Centralized monitoring — logs, metrics, alarms for all services. Tracks API latency, Lambda errors, and database performance |
| **AWS X-Ray** | Distributed tracing — traces requests across API Gateway → Lambda → Aurora → Bedrock to identify bottlenecks |
| **AWS CodePipeline** | CI/CD — automated build, test, and deploy pipeline triggered by Git pushes |
| **AWS CodeBuild** | Build service — runs `npm run build` for Next.js, executes tests, and creates deployment artifacts |
| **AWS CloudFormation / CDK** | Infrastructure as Code — defines entire architecture as code for reproducible deployments |

### CI/CD Pipeline:

```
Git Push (GitHub)
    │
    ▼
AWS CodePipeline
    │
    ├──► AWS CodeBuild (Build & Test)
    │       ├── npm install
    │       ├── npm run lint
    │       ├── npm run test
    │       └── npm run build
    │
    ├──► Deploy to Amplify (Frontend)
    │
    ├──► Deploy Lambda Functions
    │
    └──► Deploy ECS Fargate (AI Mentor)
```

---

## 10. Cost Optimization Strategy

| Strategy | AWS Service | Benefit |
|---|---|---|
| **Serverless-first** | Lambda, DynamoDB, S3 | Pay only for actual usage — $0 when no learners are active |
| **Auto-scaling** | Aurora Serverless v2, Lambda | Scales from 0 to 10,000+ concurrent users automatically |
| **Caching** | CloudFront, ElastiCache | Reduces database load by 60-80% |
| **Reserved capacity** | Aurora, ElastiCache | 30-50% savings for baseline workloads |
| **S3 Intelligent Tiering** | S3 | Automatically moves old course materials to cheaper storage |

### Estimated Monthly Cost (1,000 active learners):

| Service | Estimated Cost |
|---|---|
| Amplify Hosting | ~$15 |
| CloudFront | ~$10 |
| API Gateway | ~$5 |
| Lambda | ~$20 |
| ECS Fargate (Mentor) | ~$50 |
| Aurora Serverless v2 | ~$60 |
| DynamoDB | ~$15 |
| ElastiCache | ~$25 |
| Bedrock (AI) | ~$100 |
| S3 + Transcribe + Polly | ~$20 |
| Other (SES, SNS, etc.) | ~$10 |
| **Total** | **~$330/month** |

---

## Service Count Summary

| Category | Count | Services |
|---|---|---|
| Edge & CDN | 3 | Route 53, CloudFront, WAF |
| Frontend | 2 | Amplify, S3 |
| Compute | 3 | API Gateway, Lambda, ECS Fargate |
| Auth & Security | 4 | Cognito, IAM, Secrets Manager, KMS |
| AI/ML | 5 | Bedrock, Transcribe, Polly, Comprehend, Personalize |
| Database | 3 | Aurora PostgreSQL, DynamoDB, ElastiCache |
| Analytics | 3 | Kinesis, QuickSight, Glue |
| Notifications | 3 | SES, SNS, EventBridge |
| DevOps | 5 | CloudWatch, X-Ray, CodePipeline, CodeBuild, CloudFormation |
| **Total** | **31** | **Real AWS services** |

---

## Quick Reference: Current Stack → AWS Migration

| Current (Dev) | AWS (Production) |
|---|---|
| Supabase Auth | Amazon Cognito |
| Supabase PostgreSQL | Amazon Aurora PostgreSQL |
| Supabase Realtime | DynamoDB Streams + AppSync |
| Vercel Hosting | AWS Amplify Hosting |
| OpenAI API | Amazon Bedrock |
| Vercel AI SDK | AWS SDK + Bedrock Runtime |
| Browser Web Speech API | Amazon Transcribe + Polly |
| Environment Variables | AWS Secrets Manager |

---

*Architecture designed for the AI For Bharat Hackathon — CloudMentor AI Team*
