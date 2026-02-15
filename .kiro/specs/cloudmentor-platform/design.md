# CloudMentor AI Platform - Design Document

## 1. System Architecture Overview

### 1.1 High-Level Architecture

CloudMentor follows a modern serverless microservices architecture leveraging AWS cloud services for scalability, reliability, and cost-effectiveness.

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
│                    (Web Browser / Mobile)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND APPLICATION                          │
│              React/Next.js (AWS Amplify)                 │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐      │
│  │Dashboard │ Courses  │ Mentor   │Analytics │Settings  │      │
│  │   UI     │   UI     │   UI     │   UI     │   UI     │      │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS CLOUDFRONT (CDN)                          │
│              Global Content Delivery Network                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS API GATEWAY                               │
│              RESTful API Management & Routing                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND API LAYER (FastAPI)                     │
│                   AWS Lambda / ECS Fargate                       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Authentication  │  Course  │  Assessment  │  User   │       │
│  │     Service      │ Service  │   Service    │ Service │       │
│  └──────────────────────────────────────────────────────┘       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              CORE INTELLIGENCE ENGINES                           │
│  ┌──────────────┬──────────────┬──────────────┬─────────┐      │
│  │Step Mastery  │  Scenario    │ AI Mentor    │  Risk   │      │
│  │   Engine     │  Evaluation  │ Supervision  │Analyzer │      │
│  └──────────────┴──────────────┴──────────────┴─────────┘      │
│  ┌──────────────┬──────────────────────────────────────┐       │
│  │Certification │     Adaptive Learning Engine         │       │
│  │  Readiness   │                                      │       │
│  └──────────────┴──────────────────────────────────────┘       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  AI INTELLIGENCE LAYER                           │
│                    AMAZON BEDROCK                                │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Claude 3 Sonnet  │  Llama 3  │  Titan Embeddings   │       │
│  └──────────────────────────────────────────────────────┘       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DATA & STORAGE LAYER                            │
│  ┌──────────────┬──────────────┬──────────────┬─────────┐      │
│  │  DynamoDB    │   RDS        │     S3       │Cognito  │      │
│  │(User Data)   │(Relational)  │(Content)     │(Auth)   │      │
│  └──────────────┴──────────────┴──────────────┴─────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Architecture Principles

1. **Serverless-First**: Leverage AWS Lambda for compute to minimize operational overhead
2. **Microservices**: Loosely coupled services for independent scaling and deployment
3. **Event-Driven**: Asynchronous processing using AWS EventBridge and SQS
4. **Security by Design**: Zero-trust architecture with least-privilege access
5. **Cost-Optimized**: Pay-per-use model with intelligent caching and resource management

---

## 2. AWS Services Architecture

### 2.1 Detailed AWS Service Mapping


#### Frontend & Content Delivery
- **AWS Amplify**: Host React/Next.js frontend with CI/CD
- **Amazon CloudFront**: Global CDN for low-latency content delivery
- **Amazon S3**: Static asset storage (images, videos, documents)
- **AWS WAF**: Web application firewall for DDoS protection

#### API & Compute
- **Amazon API Gateway**: RESTful API management, rate limiting, API keys
- **AWS Lambda**: Serverless compute for API endpoints
- **AWS ECS Fargate** (Alternative): Container-based compute for FastAPI backend
- **AWS App Runner** (Alternative): Simplified container deployment

#### AI & Machine Learning
- **Amazon Bedrock**: Foundation models (Claude 3, Llama 3, Titan)
  - Scenario generation
  - Answer evaluation
  - Mentor chat responses
  - Risk explanation
- **Amazon SageMaker** (Future): Custom ML models for certification prediction
- **Amazon Comprehend**: Natural language understanding for answer analysis

#### Data Storage
- **Amazon DynamoDB**: NoSQL database for:
  - User profiles and progress
  - Assessment results
  - Gamification stats
  - Session data
- **Amazon RDS (PostgreSQL)**: Relational database for:
  - Course catalog
  - Lesson content
  - Question banks
  - Relationships and joins
- **Amazon S3**: Object storage for:
  - IAM policy JSON files
  - Learning content metadata
  - User-uploaded files
  - Backup archives

#### Authentication & Authorization
- **Amazon Cognito**: User authentication and authorization
  - User pools for sign-up/sign-in
  - Identity pools for AWS resource access
  - Social identity providers (Google, GitHub)
  - MFA support

#### Messaging & Events
- **Amazon EventBridge**: Event-driven architecture
  - Lesson completion events
  - Assessment submission events
  - Certification readiness updates
- **Amazon SQS**: Message queuing for:
  - Async AI processing
  - Email notifications
  - Analytics processing
- **Amazon SNS**: Push notifications and email delivery

#### Monitoring & Logging
- **Amazon CloudWatch**: Metrics, logs, and alarms
- **AWS X-Ray**: Distributed tracing for performance analysis
- **AWS CloudTrail**: Audit logging for compliance

#### Security
- **AWS Secrets Manager**: Secure storage for API keys and credentials
- **AWS KMS**: Encryption key management
- **AWS IAM**: Fine-grained access control
- **AWS Certificate Manager**: SSL/TLS certificates

#### Analytics
- **Amazon Kinesis**: Real-time data streaming
- **Amazon Athena**: SQL queries on S3 data
- **Amazon QuickSight**: Business intelligence dashboards

---

## 3. Component Design

### 3.1 Frontend Architecture (React/Next.js)


#### 3.1.1 Application Structure
```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   ├── dashboard/           # Protected dashboard routes
│   │   ├── page.tsx         # Dashboard home
│   │   ├── courses/         # Course catalog
│   │   ├── lessons/         # Lesson viewer
│   │   ├── assessments/     # Assessment interface
│   │   ├── mentor/          # AI Mentor chat
│   │   ├── progress/        # Analytics & progress
│   │   ├── collaboration/   # Study groups
│   │   └── settings/        # User settings
│   └── api/                 # API routes (if using Next.js API)
├── components/              # Reusable UI components
│   ├── ui/                  # Base UI components (shadcn/ui)
│   ├── course/              # Course-specific components
│   ├── assessment/          # Assessment components
│   ├── mentor/              # Mentor chat components
│   └── analytics/           # Chart and visualization components
├── lib/                     # Utility libraries
│   ├── api/                 # API client functions
│   ├── auth/                # Authentication helpers
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Helper functions
├── types/                   # TypeScript type definitions
└── styles/                  # Global styles and themes
```

#### 3.1.2 Key Frontend Components

**Dashboard Component**
- Overview cards: Enrolled courses, CRI score, recent activity
- Quick actions: Continue learning, take assessment, ask mentor
- Progress charts: Weekly activity, skill heatmap

**Course Catalog Component**
- Filterable course grid (level, service, certification)
- Course cards with: title, description, duration, difficulty
- Enrollment button with tier restrictions

**Lesson Viewer Component**
- Content area: Markdown/HTML rendering
- Progress sidebar: Lesson list with completion status
- Navigation: Previous/Next with mastery lock
- Interactive elements: Code snippets, diagrams, videos

**Assessment Component**
- Question display with multiple choice/scenario format
- Timer (optional for mock exams)
- Progress indicator (question X of Y)
- Submit and review functionality
- Detailed feedback with explanations

**AI Mentor Chat Component**
- Chat interface with message history
- Streaming responses for real-time feel
- Code syntax highlighting
- Voice input/output (optional)
- Context awareness (current lesson)

**Skill Heatmap Component**
- Interactive grid visualization
- Color-coded mastery levels
- Drill-down to service details
- Comparison with certification requirements

---

### 3.2 Backend API Architecture (FastAPI)

#### 3.2.1 API Structure
```
backend/
├── app/
│   ├── main.py              # FastAPI application entry
│   ├── config.py            # Configuration management
│   ├── dependencies.py      # Dependency injection
│   ├── api/                 # API endpoints
│   │   ├── v1/
│   │   │   ├── auth.py      # Authentication endpoints
│   │   │   ├── users.py     # User management
│   │   │   ├── courses.py   # Course operations
│   │   │   ├── lessons.py   # Lesson operations
│   │   │   ├── assessments.py # Assessment operations
│   │   │   ├── mentor.py    # AI Mentor endpoints
│   │   │   ├── progress.py  # Progress tracking
│   │   │   └── analytics.py # Analytics endpoints
│   ├── core/                # Core business logic
│   │   ├── engines/
│   │   │   ├── step_mastery.py
│   │   │   ├── scenario_evaluation.py
│   │   │   ├── ai_mentor.py
│   │   │   ├── certification_readiness.py
│   │   │   ├── risk_analyzer.py
│   │   │   └── adaptive_learning.py
│   ├── models/              # Data models (Pydantic)
│   ├── schemas/             # API schemas
│   ├── services/            # External service integrations
│   │   ├── bedrock.py       # Amazon Bedrock client
│   │   ├── dynamodb.py      # DynamoDB operations
│   │   ├── rds.py           # RDS operations
│   │   ├── s3.py            # S3 operations
│   │   └── cognito.py       # Cognito operations
│   └── utils/               # Utility functions
├── tests/                   # Unit and integration tests
└── requirements.txt         # Python dependencies
```


#### 3.2.2 API Endpoints

**Authentication Endpoints**
```
POST   /api/v1/auth/signup           # User registration
POST   /api/v1/auth/login            # User login
POST   /api/v1/auth/logout           # User logout
POST   /api/v1/auth/refresh          # Refresh JWT token
POST   /api/v1/auth/forgot-password  # Password reset request
POST   /api/v1/auth/reset-password   # Password reset confirmation
GET    /api/v1/auth/verify-email     # Email verification
```

**User Endpoints**
```
GET    /api/v1/users/me              # Get current user profile
PUT    /api/v1/users/me              # Update user profile
GET    /api/v1/users/me/stats        # Get user statistics
PUT    /api/v1/users/me/goals        # Update learning goals
```

**Course Endpoints**
```
GET    /api/v1/courses               # List all courses (with filters)
GET    /api/v1/courses/{id}          # Get course details
POST   /api/v1/courses/{id}/enroll   # Enroll in course
DELETE /api/v1/courses/{id}/enroll   # Unenroll from course
GET    /api/v1/courses/{id}/lessons  # Get course lessons
GET    /api/v1/courses/enrolled      # Get user's enrolled courses
```

**Lesson Endpoints**
```
GET    /api/v1/lessons/{id}          # Get lesson content
POST   /api/v1/lessons/{id}/complete # Mark lesson as complete
GET    /api/v1/lessons/{id}/progress # Get lesson progress
```

**Assessment Endpoints**
```
GET    /api/v1/assessments/{id}      # Get assessment details
POST   /api/v1/assessments/{id}/start # Start assessment attempt
POST   /api/v1/assessments/{id}/submit # Submit assessment
GET    /api/v1/assessments/{id}/results # Get assessment results
GET    /api/v1/assessments/{id}/review  # Review assessment with answers
```

**AI Mentor Endpoints**
```
POST   /api/v1/mentor/chat           # Send message to AI mentor
GET    /api/v1/mentor/history        # Get chat history
POST   /api/v1/mentor/voice          # Voice input transcription
GET    /api/v1/mentor/suggestions    # Get contextual suggestions
```

**Progress & Analytics Endpoints**
```
GET    /api/v1/progress/overview     # Overall progress summary
GET    /api/v1/progress/courses/{id} # Course-specific progress
GET    /api/v1/progress/heatmap      # Skill heatmap data
GET    /api/v1/analytics/cri         # Certification Readiness Index
GET    /api/v1/analytics/weak-areas  # Identified weak areas
GET    /api/v1/analytics/time-spent  # Time tracking analytics
```

**Collaboration Endpoints**
```
POST   /api/v1/groups                # Create study group
GET    /api/v1/groups                # List user's groups
GET    /api/v1/groups/{id}           # Get group details
POST   /api/v1/groups/{id}/invite    # Invite member to group
POST   /api/v1/groups/{id}/join      # Join group via invite
GET    /api/v1/groups/{id}/messages  # Get group messages
POST   /api/v1/groups/{id}/messages  # Send group message
```

---

## 4. Core Engine Design

### 4.1 Step Mastery Engine


#### 4.1.1 Purpose
Enforce atomic-level understanding by locking progression until competency is validated.

#### 4.1.2 Algorithm
```python
def check_lesson_mastery(user_id: str, lesson_id: str) -> bool:
    """
    Determine if user has mastered a lesson
    
    Criteria:
    - Completed all lesson content
    - Passed conceptual assessment (>= 80%)
    - Passed scenario assessment (>= 80%)
    - Minimum time spent (prevents rushing)
    """
    progress = get_user_progress(user_id, lesson_id)
    
    # Check content completion
    if not progress.content_completed:
        return False
    
    # Check conceptual assessment
    conceptual_score = get_assessment_score(user_id, lesson_id, "conceptual")
    if conceptual_score < 0.80:
        return False
    
    # Check scenario assessment
    scenario_score = get_assessment_score(user_id, lesson_id, "scenario")
    if scenario_score < 0.80:
        return False
    
    # Check minimum time spent (e.g., 80% of estimated time)
    min_time = lesson.estimated_time * 0.8
    if progress.time_spent < min_time:
        return False
    
    return True

def unlock_next_lesson(user_id: str, current_lesson_id: str):
    """
    Unlock next lesson if current lesson is mastered
    """
    if check_lesson_mastery(user_id, current_lesson_id):
        next_lesson = get_next_lesson(current_lesson_id)
        if next_lesson:
            update_lesson_status(user_id, next_lesson.id, "unlocked")
            send_notification(user_id, f"Congratulations! {next_lesson.title} unlocked!")
```

#### 4.1.3 Data Model
```python
class UserProgress(BaseModel):
    user_id: str
    lesson_id: str
    status: Literal["locked", "unlocked", "in_progress", "mastered"]
    content_completed: bool
    time_spent: int  # seconds
    conceptual_score: float
    scenario_score: float
    attempts: int
    last_accessed: datetime
    mastered_at: Optional[datetime]
```

---

### 4.2 Scenario Evaluation Engine

#### 4.2.1 Purpose
Evaluate reasoning depth through real-world AWS configuration scenarios using AI.

#### 4.2.2 Scenario Generation Flow
```
1. Identify lesson topic (e.g., "IAM Policies")
2. Generate scenario context using Bedrock
   - Real-world use case
   - Configuration requirements
   - Security considerations
3. Create question with multiple choice or open-ended format
4. Generate distractor options (common misconceptions)
5. Store scenario with correct answer and explanation
```

#### 4.2.3 Answer Evaluation Algorithm
```python
async def evaluate_scenario_answer(
    question_id: str,
    user_answer: str,
    context: dict
) -> EvaluationResult:
    """
    Use Amazon Bedrock to evaluate scenario-based answers
    """
    question = get_question(question_id)
    
    prompt = f"""
    Evaluate the following AWS scenario answer:
    
    Question: {question.text}
    Scenario Context: {question.scenario}
    Correct Answer: {question.correct_answer}
    User Answer: {user_answer}
    
    Evaluate:
    1. Is the answer technically correct?
    2. Does it demonstrate understanding of AWS concepts?
    3. Are there any misconceptions?
    4. What knowledge gaps exist?
    
    Provide:
    - Score (0-100)
    - Detailed feedback
    - Identified misconceptions
    - Suggested review topics
    """
    
    response = await bedrock_client.invoke_model(
        model_id="anthropic.claude-3-sonnet",
        prompt=prompt
    )
    
    return parse_evaluation_response(response)
```

#### 4.2.4 Adaptive Difficulty
```python
def get_next_scenario_difficulty(user_id: str, topic: str) -> str:
    """
    Adjust scenario difficulty based on user performance
    """
    recent_scores = get_recent_scores(user_id, topic, limit=5)
    avg_score = sum(recent_scores) / len(recent_scores)
    
    if avg_score >= 0.90:
        return "advanced"
    elif avg_score >= 0.75:
        return "intermediate"
    else:
        return "beginner"
```

---

### 4.3 AI Mentor Supervision Engine


#### 4.3.1 Purpose
Provide intelligent, context-aware guidance for AWS learning and console operations.

#### 4.3.2 Mentor System Prompt
```python
MENTOR_SYSTEM_PROMPT = """
You are CloudMentor AI, an expert AWS instructor and mentor.

Your role:
- Help learners understand AWS services deeply
- Explain concepts in simple, clear terms
- Provide practical examples and use cases
- Guide through AWS console operations step-by-step
- Warn about common misconfigurations and security risks
- Encourage best practices and Well-Architected principles

Context awareness:
- Current lesson: {current_lesson}
- User level: {user_level}
- Recent topics: {recent_topics}
- Weak areas: {weak_areas}

Guidelines:
- Be encouraging and supportive
- Ask clarifying questions when needed
- Provide code examples when relevant
- Reference AWS documentation
- Explain the "why" behind configurations
- Highlight security implications
"""
```

#### 4.3.3 Chat Implementation
```python
async def mentor_chat(
    user_id: str,
    message: str,
    session_id: str
) -> AsyncGenerator[str, None]:
    """
    Stream AI mentor responses using Amazon Bedrock
    """
    # Get user context
    user_context = await get_user_context(user_id)
    chat_history = await get_chat_history(session_id, limit=10)
    
    # Build context-aware prompt
    system_prompt = MENTOR_SYSTEM_PROMPT.format(
        current_lesson=user_context.current_lesson,
        user_level=user_context.level,
        recent_topics=user_context.recent_topics,
        weak_areas=user_context.weak_areas
    )
    
    # Prepare messages
    messages = [
        {"role": "system", "content": system_prompt},
        *chat_history,
        {"role": "user", "content": message}
    ]
    
    # Stream response from Bedrock
    async for chunk in bedrock_client.stream_chat(
        model_id="anthropic.claude-3-sonnet",
        messages=messages,
        temperature=0.7,
        max_tokens=2000
    ):
        yield chunk
    
    # Save conversation
    await save_chat_message(session_id, "user", message)
    await save_chat_message(session_id, "assistant", full_response)
```

#### 4.3.4 Console Operation Guidance
```python
async def guide_console_operation(
    operation: str,
    service: str,
    user_level: str
) -> dict:
    """
    Generate step-by-step console operation guide
    """
    prompt = f"""
    Provide step-by-step AWS console guidance for:
    Operation: {operation}
    Service: {service}
    User Level: {user_level}
    
    Include:
    1. Prerequisites
    2. Detailed steps with screenshots descriptions
    3. Configuration best practices
    4. Common mistakes to avoid
    5. Security considerations
    6. Verification steps
    """
    
    response = await bedrock_client.invoke_model(
        model_id="anthropic.claude-3-sonnet",
        prompt=prompt
    )
    
    return {
        "steps": parse_steps(response),
        "warnings": extract_warnings(response),
        "best_practices": extract_best_practices(response)
    }
```

---

### 4.4 Certification Readiness Predictor

#### 4.4.1 Purpose
Calculate and predict user's readiness for AWS certification exams.

#### 4.4.2 CRI Calculation Algorithm
```python
def calculate_cri(user_id: str, certification: str) -> float:
    """
    Calculate Certification Readiness Index (0-100)
    
    Factors:
    - Lesson completion (30%)
    - Assessment scores (40%)
    - Scenario performance (20%)
    - Time investment (10%)
    """
    cert_requirements = get_certification_requirements(certification)
    user_progress = get_user_progress(user_id)
    
    # Lesson completion score
    required_lessons = cert_requirements.lessons
    completed_lessons = [l for l in user_progress.lessons if l.mastered]
    completion_score = len(completed_lessons) / len(required_lessons)
    
    # Assessment score
    assessment_scores = [a.score for a in user_progress.assessments]
    avg_assessment_score = sum(assessment_scores) / len(assessment_scores)
    
    # Scenario performance
    scenario_scores = [s.score for s in user_progress.scenarios]
    avg_scenario_score = sum(scenario_scores) / len(scenario_scores)
    
    # Time investment (compared to recommended)
    time_ratio = user_progress.total_time / cert_requirements.recommended_time
    time_score = min(time_ratio, 1.0)  # Cap at 1.0
    
    # Weighted CRI
    cri = (
        completion_score * 0.30 +
        avg_assessment_score * 0.40 +
        avg_scenario_score * 0.20 +
        time_score * 0.10
    ) * 100
    
    return round(cri, 2)
```

#### 4.4.3 Domain-Level Readiness
```python
def calculate_domain_readiness(
    user_id: str,
    certification: str
) -> dict[str, float]:
    """
    Calculate readiness per exam domain
    """
    domains = get_certification_domains(certification)
    readiness = {}
    
    for domain in domains:
        domain_lessons = get_domain_lessons(domain.id)
        domain_progress = get_user_domain_progress(user_id, domain.id)
        
        # Calculate domain-specific CRI
        domain_cri = calculate_cri_for_lessons(
            user_id,
            domain_lessons
        )
        
        readiness[domain.name] = {
            "score": domain_cri,
            "status": get_readiness_status(domain_cri),
            "weak_topics": identify_weak_topics(domain_progress)
        }
    
    return readiness
```

#### 4.4.4 Exam Date Prediction
```python
def predict_exam_readiness_date(
    user_id: str,
    certification: str,
    target_cri: float = 85.0
) -> datetime:
    """
    Predict when user will be exam-ready
    """
    current_cri = calculate_cri(user_id, certification)
    
    if current_cri >= target_cri:
        return datetime.now()
    
    # Calculate learning velocity
    progress_history = get_progress_history(user_id, days=30)
    cri_growth_rate = calculate_growth_rate(progress_history)
    
    # Predict days needed
    cri_gap = target_cri - current_cri
    days_needed = cri_gap / cri_growth_rate if cri_growth_rate > 0 else None
    
    if days_needed:
        return datetime.now() + timedelta(days=days_needed)
    else:
        return None  # Unable to predict
```

---

### 4.5 Risk & Misconfiguration Analyzer


#### 4.5.1 Purpose
Detect security risks and misconfigurations in AWS scenarios and user answers.

#### 4.5.2 IAM Policy Analysis
```python
async def analyze_iam_policy(policy_json: dict) -> RiskAnalysis:
    """
    Analyze IAM policy for security risks
    """
    risks = []
    
    # Check for overly permissive actions
    for statement in policy_json.get("Statement", []):
        actions = statement.get("Action", [])
        resources = statement.get("Resource", [])
        
        # Check for wildcard permissions
        if "*" in actions:
            risks.append({
                "severity": "high",
                "type": "overly_permissive",
                "message": "Policy grants all actions (*)",
                "recommendation": "Specify only required actions"
            })
        
        # Check for wildcard resources
        if "*" in resources:
            risks.append({
                "severity": "high",
                "type": "overly_permissive",
                "message": "Policy applies to all resources (*)",
                "recommendation": "Limit to specific resource ARNs"
            })
        
        # Check for privilege escalation risks
        dangerous_actions = [
            "iam:CreatePolicyVersion",
            "iam:SetDefaultPolicyVersion",
            "iam:PassRole",
            "iam:AttachUserPolicy",
            "iam:AttachRolePolicy"
        ]
        
        for action in actions:
            if action in dangerous_actions:
                risks.append({
                    "severity": "critical",
                    "type": "privilege_escalation",
                    "message": f"Action {action} can lead to privilege escalation",
                    "recommendation": "Review necessity and add conditions"
                })
    
    # Use AI for deeper analysis
    ai_analysis = await bedrock_analyze_policy(policy_json)
    
    return RiskAnalysis(
        risks=risks,
        ai_insights=ai_analysis,
        overall_score=calculate_risk_score(risks)
    )
```

#### 4.5.3 Security Group Analysis
```python
def analyze_security_group(sg_rules: list) -> list[SecurityRisk]:
    """
    Analyze security group rules for misconfigurations
    """
    risks = []
    
    for rule in sg_rules:
        # Check for unrestricted SSH access
        if rule.port == 22 and rule.cidr == "0.0.0.0/0":
            risks.append(SecurityRisk(
                severity="critical",
                type="unrestricted_ssh",
                message="SSH port 22 open to the internet",
                recommendation="Restrict to specific IP ranges or use Systems Manager"
            ))
        
        # Check for unrestricted RDP access
        if rule.port == 3389 and rule.cidr == "0.0.0.0/0":
            risks.append(SecurityRisk(
                severity="critical",
                type="unrestricted_rdp",
                message="RDP port 3389 open to the internet",
                recommendation="Restrict to specific IP ranges or use bastion host"
            ))
        
        # Check for unrestricted database access
        db_ports = [3306, 5432, 1433, 27017]
        if rule.port in db_ports and rule.cidr == "0.0.0.0/0":
            risks.append(SecurityRisk(
                severity="high",
                type="unrestricted_database",
                message=f"Database port {rule.port} open to the internet",
                recommendation="Restrict to application security group only"
            ))
    
    return risks
```

#### 4.5.4 AI-Powered Risk Explanation
```python
async def explain_risk(risk: SecurityRisk, user_level: str) -> str:
    """
    Generate user-level-appropriate risk explanation
    """
    prompt = f"""
    Explain this AWS security risk to a {user_level} user:
    
    Risk Type: {risk.type}
    Severity: {risk.severity}
    Message: {risk.message}
    
    Provide:
    1. What this risk means in simple terms
    2. Real-world attack scenarios
    3. Potential impact
    4. Step-by-step remediation
    5. Best practices to prevent this
    
    Tone: Educational, not alarming
    """
    
    explanation = await bedrock_client.invoke_model(
        model_id="anthropic.claude-3-sonnet",
        prompt=prompt
    )
    
    return explanation
```

---

### 4.6 Adaptive Learning Engine

#### 4.6.1 Purpose
Personalize learning paths based on individual performance and goals.

#### 4.6.2 Learning Path Generation
```python
def generate_learning_path(
    user_id: str,
    target_certification: str,
    current_knowledge: dict
) -> list[Lesson]:
    """
    Generate personalized learning path
    """
    # Get certification requirements
    required_topics = get_certification_topics(target_certification)
    
    # Assess current knowledge
    knowledge_gaps = identify_knowledge_gaps(
        required_topics,
        current_knowledge
    )
    
    # Prioritize topics
    prioritized_topics = prioritize_by_importance_and_gaps(
        knowledge_gaps,
        target_certification
    )
    
    # Build lesson sequence
    learning_path = []
    for topic in prioritized_topics:
        # Check prerequisites
        prereqs = get_prerequisites(topic)
        if not all_prerequisites_met(user_id, prereqs):
            learning_path.extend(get_prerequisite_lessons(prereqs))
        
        # Add main topic lessons
        learning_path.extend(get_topic_lessons(topic))
    
    # Remove duplicates and already mastered
    learning_path = deduplicate_and_filter_mastered(
        learning_path,
        user_id
    )
    
    return learning_path
```

#### 4.6.3 Dynamic Difficulty Adjustment
```python
def adjust_content_difficulty(
    user_id: str,
    topic: str
) -> str:
    """
    Adjust content difficulty based on performance
    """
    performance = get_topic_performance(user_id, topic)
    
    # Calculate performance metrics
    avg_score = performance.average_score
    completion_speed = performance.avg_completion_time / performance.expected_time
    retry_rate = performance.retries / performance.attempts
    
    # Determine difficulty level
    if avg_score >= 0.90 and completion_speed < 1.2 and retry_rate < 0.2:
        return "advanced"  # User is excelling, increase challenge
    elif avg_score >= 0.70 and retry_rate < 0.5:
        return "intermediate"  # User is progressing well
    else:
        return "beginner"  # User needs more foundational content
```

#### 4.6.4 Recommendation Engine
```python
async def get_personalized_recommendations(
    user_id: str
) -> list[Recommendation]:
    """
    Generate personalized learning recommendations
    """
    user_context = await get_user_context(user_id)
    recommendations = []
    
    # Recommend based on weak areas
    weak_areas = identify_weak_areas(user_id)
    for area in weak_areas[:3]:  # Top 3 weak areas
        recommendations.append(Recommendation(
            type="remediation",
            priority="high",
            title=f"Strengthen {area.name}",
            description=f"Your score in {area.name} is below target",
            action="review_lessons",
            lessons=get_remediation_lessons(area)
        ))
    
    # Recommend next logical step
    next_lesson = get_next_recommended_lesson(user_id)
    if next_lesson:
        recommendations.append(Recommendation(
            type="progression",
            priority="medium",
            title=f"Continue with {next_lesson.title}",
            description="Next step in your learning path",
            action="start_lesson",
            lesson_id=next_lesson.id
        ))
    
    # Recommend practice scenarios
    if should_practice(user_id):
        recommendations.append(Recommendation(
            type="practice",
            priority="medium",
            title="Practice with scenarios",
            description="Reinforce your knowledge with real-world scenarios",
            action="start_scenarios",
            topic=user_context.current_topic
        ))
    
    return recommendations
```

---

## 5. Data Models

### 5.1 DynamoDB Tables


#### 5.1.1 Users Table
```python
{
    "TableName": "cloudmentor-users",
    "KeySchema": [
        {"AttributeName": "user_id", "KeyType": "HASH"}
    ],
    "AttributeDefinitions": [
        {"AttributeName": "user_id", "AttributeType": "S"},
        {"AttributeName": "email", "AttributeType": "S"}
    ],
    "GlobalSecondaryIndexes": [
        {
            "IndexName": "email-index",
            "KeySchema": [{"AttributeName": "email", "KeyType": "HASH"}]
        }
    ]
}

# Item Structure
{
    "user_id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "subscription_tier": "premium",  # free, premium, enterprise
    "learning_goals": ["Solutions Architect Associate"],
    "current_level": "intermediate",
    "created_at": "2026-01-15T10:00:00Z",
    "last_login": "2026-02-15T08:30:00Z",
    "preferences": {
        "theme": "dark",
        "notifications": true,
        "voice_enabled": false
    }
}
```

#### 5.1.2 User Progress Table
```python
{
    "TableName": "cloudmentor-user-progress",
    "KeySchema": [
        {"AttributeName": "user_id", "KeyType": "HASH"},
        {"AttributeName": "lesson_id", "KeyType": "RANGE"}
    ],
    "AttributeDefinitions": [
        {"AttributeName": "user_id", "AttributeType": "S"},
        {"AttributeName": "lesson_id", "AttributeType": "S"},
        {"AttributeName": "course_id", "AttributeType": "S"}
    ],
    "GlobalSecondaryIndexes": [
        {
            "IndexName": "course-progress-index",
            "KeySchema": [
                {"AttributeName": "user_id", "KeyType": "HASH"},
                {"AttributeName": "course_id", "KeyType": "RANGE"}
            ]
        }
    ]
}

# Item Structure
{
    "user_id": "uuid",
    "lesson_id": "lesson-uuid",
    "course_id": "course-uuid",
    "status": "mastered",  # locked, unlocked, in_progress, mastered
    "content_completed": true,
    "time_spent": 1800,  # seconds
    "conceptual_score": 0.85,
    "scenario_score": 0.90,
    "attempts": 2,
    "started_at": "2026-02-10T14:00:00Z",
    "completed_at": "2026-02-12T16:30:00Z",
    "last_accessed": "2026-02-15T09:00:00Z"
}
```

#### 5.1.3 Assessment Results Table
```python
{
    "TableName": "cloudmentor-assessment-results",
    "KeySchema": [
        {"AttributeName": "result_id", "KeyType": "HASH"}
    ],
    "AttributeDefinitions": [
        {"AttributeName": "result_id", "AttributeType": "S"},
        {"AttributeName": "user_id", "AttributeType": "S"},
        {"AttributeName": "completed_at", "AttributeType": "S"}
    ],
    "GlobalSecondaryIndexes": [
        {
            "IndexName": "user-results-index",
            "KeySchema": [
                {"AttributeName": "user_id", "KeyType": "HASH"},
                {"AttributeName": "completed_at", "KeyType": "RANGE"}
            ]
        }
    ]
}

# Item Structure
{
    "result_id": "uuid",
    "user_id": "uuid",
    "assessment_id": "assessment-uuid",
    "lesson_id": "lesson-uuid",
    "score": 0.85,
    "total_questions": 10,
    "correct_answers": 8,
    "time_taken": 600,  # seconds
    "answers": [
        {
            "question_id": "q1",
            "user_answer": "option_b",
            "correct": true,
            "time_spent": 45
        }
    ],
    "completed_at": "2026-02-15T10:30:00Z",
    "feedback": "Good understanding of IAM policies"
}
```

#### 5.1.4 Gamification Stats Table
```python
{
    "TableName": "cloudmentor-gamification",
    "KeySchema": [
        {"AttributeName": "user_id", "KeyType": "HASH"}
    ]
}

# Item Structure
{
    "user_id": "uuid",
    "total_points": 5420,
    "current_level": 12,
    "badges": [
        {
            "badge_id": "iam-master",
            "name": "IAM Master",
            "earned_at": "2026-02-10T12:00:00Z"
        }
    ],
    "achievements": [
        {
            "achievement_id": "perfect-score",
            "name": "Perfect Score",
            "description": "Scored 100% on an assessment",
            "earned_at": "2026-02-12T15:00:00Z"
        }
    ],
    "streak_days": 7,
    "last_activity": "2026-02-15T09:00:00Z"
}
```

#### 5.1.5 AI Sessions Table
```python
{
    "TableName": "cloudmentor-ai-sessions",
    "KeySchema": [
        {"AttributeName": "session_id", "KeyType": "HASH"},
        {"AttributeName": "timestamp", "KeyType": "RANGE"}
    ],
    "AttributeDefinitions": [
        {"AttributeName": "session_id", "AttributeType": "S"},
        {"AttributeName": "timestamp", "AttributeType": "S"},
        {"AttributeName": "user_id", "AttributeType": "S"}
    ],
    "GlobalSecondaryIndexes": [
        {
            "IndexName": "user-sessions-index",
            "KeySchema": [
                {"AttributeName": "user_id", "KeyType": "HASH"},
                {"AttributeName": "timestamp", "KeyType": "RANGE"}
            ]
        }
    ],
    "TimeToLiveSpecification": {
        "Enabled": true,
        "AttributeName": "ttl"
    }
}

# Item Structure
{
    "session_id": "uuid",
    "user_id": "uuid",
    "timestamp": "2026-02-15T10:00:00Z",
    "role": "user",  # user or assistant
    "message": "How do I create an IAM policy?",
    "context": {
        "current_lesson": "lesson-uuid",
        "topic": "IAM Policies"
    },
    "ttl": 1739635200  # Unix timestamp for auto-deletion
}
```

---

### 5.2 RDS PostgreSQL Schema

