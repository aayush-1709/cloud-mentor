'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ChevronDown, ChevronRight, PlayCircle } from 'lucide-react'
import { VideoSidebar, type RoadmapLesson } from '@/components/video-sidebar'
import { SectionQuiz, type SectionQuizQuestion } from '@/components/section-quiz'

type RoadmapSection = {
  id: string
  order: number
  title: string
  lessons: RoadmapLesson[]
  quizQuestions: SectionQuizQuestion[]
}

const DAILY_COMPLETION_DATES_KEY = 'cloudmentor-daily-completion-dates'

type RoadmapTrack = {
  heading: string
  description: string
  completionStorageKey: string
  quizStorageKey: string
  sections: RoadmapSection[]
}

const makeQuiz = (prefix: string, questions: Array<Omit<SectionQuizQuestion, 'id'>>): SectionQuizQuestion[] =>
  questions.map((question, index) => ({ ...question, id: `${prefix}-${index + 1}` }))

const associateQuizTemplate: Array<Omit<SectionQuizQuestion, 'id'>> = [
  {
    question: 'Which AWS design choice most improves fault tolerance across data centers within one Region?',
    options: ['Single subnet', 'Multi-AZ architecture', 'Bigger instance size', 'Single NAT gateway only'],
    correctIndex: 1,
    explanation: 'Multi-AZ architecture improves availability by using isolated Availability Zones.',
  },
  {
    question: 'Which service is best for global edge caching of static and dynamic content?',
    options: ['CloudFront', 'CloudTrail', 'SQS', 'IAM'],
    correctIndex: 0,
    explanation: 'CloudFront uses edge locations to reduce latency and improve global delivery.',
  },
  {
    question: 'What IAM principle should you apply by default for production workloads?',
    options: ['Root-first access', 'Least privilege', 'Shared admin user', 'Public policies for speed'],
    correctIndex: 1,
    explanation: 'Least privilege reduces blast radius and aligns with AWS security best practices.',
  },
  {
    question: 'For infrequently accessed S3 objects, which is a recommended cost strategy?',
    options: ['Keep all objects in S3 Standard forever', 'Use lifecycle transitions', 'Move to EBS only', 'Disable versioning always'],
    correctIndex: 1,
    explanation: 'Lifecycle transitions move data to lower-cost storage classes based on access patterns.',
  },
  {
    question: 'Which metric-driven service helps you scale EC2 capacity automatically?',
    options: ['Auto Scaling Group', 'IAM', 'Route 53 Resolver', 'CloudFormation drift only'],
    correctIndex: 0,
    explanation: 'Auto Scaling Groups scale EC2 fleets using target tracking and policy-based scaling.',
  },
]

const roadmapByTrack: Record<'associate' | 'practitioner' | 'professional', RoadmapTrack> = {
  associate: {
    heading: 'AWS Certified Solutions Architect - Associate Roadmap',
    description: '9 sections • 51 lessons • 5 quiz questions per section',
    completionStorageKey: 'cloudmentor-saa-completed',
    quizStorageKey: 'cloudmentor-saa-quiz-passed',
    sections: [
      {
        id: 'assoc-cloud-foundations',
        order: 1,
        title: 'Cloud Foundations',
        lessons: [
          { id: 'assoc-cf-1', title: 'What is Cloud Computing', youtubeId: 'M988_fsOSWo' },
          { id: 'assoc-cf-2', title: 'AWS Global Infrastructure', youtubeId: 'Z3SYDTMP3ME' },
          { id: 'assoc-cf-3', title: 'Shared Responsibility Model', youtubeId: 'M1l7nX8pB4Q' },
          { id: 'assoc-cf-4', title: 'AWS Well-Architected Framework', youtubeId: 'Pp4N9Q8xwJU' },
          { id: 'assoc-cf-5', title: 'AWS Pricing & Support Plans', youtubeId: 'x5Y0w5JfQfI' },
        ],
        quizQuestions: makeQuiz('assoc-1', associateQuizTemplate),
      },
      {
        id: 'assoc-iam',
        order: 2,
        title: 'IAM',
        lessons: [
          { id: 'assoc-iam-1', title: 'IAM Users, Groups, Policies', youtubeId: 'ulprqHHWlng' },
          { id: 'assoc-iam-2', title: 'IAM Roles & Trust Policies', youtubeId: 'YQsK4MtsELU' },
          { id: 'assoc-iam-3', title: 'Permission Boundaries', youtubeId: 'lF5M_3qR9hI' },
          { id: 'assoc-iam-4', title: 'IAM Best Practices', youtubeId: '2z7R7l5fC7w' },
          { id: 'assoc-iam-5', title: 'AWS Organizations & SCP', youtubeId: 'nN4uRx5EJf4' },
        ],
        quizQuestions: makeQuiz('assoc-2', associateQuizTemplate),
      },
      {
        id: 'assoc-compute',
        order: 3,
        title: 'Compute',
        lessons: [
          { id: 'assoc-compute-1', title: 'EC2 Fundamentals', youtubeId: 'iHX_jtU2xL4' },
          { id: 'assoc-compute-2', title: 'EC2 Instance Types', youtubeId: 'vQ5JfM5T2b4' },
          { id: 'assoc-compute-3', title: 'AMIs & Snapshots', youtubeId: '6x7fJ6t5iN0' },
          { id: 'assoc-compute-4', title: 'Auto Scaling Groups', youtubeId: 'Yy2w8XQ5nO8' },
          { id: 'assoc-compute-5', title: 'Elastic Load Balancer', youtubeId: '8mR5fQ9Kj5M' },
          { id: 'assoc-compute-6', title: 'Placement Groups', youtubeId: 'rY9a0Q6cH0Q' },
        ],
        quizQuestions: makeQuiz('assoc-3', associateQuizTemplate),
      },
      {
        id: 'assoc-storage',
        order: 4,
        title: 'Storage',
        lessons: [
          { id: 'assoc-storage-1', title: 'S3 Deep Dive', youtubeId: '77lMCiiMilo' },
          { id: 'assoc-storage-2', title: 'S3 Storage Classes', youtubeId: 'Yb3D0kFJ8tI' },
          { id: 'assoc-storage-3', title: 'EBS Volumes', youtubeId: 'G5N5D5FfQmQ' },
          { id: 'assoc-storage-4', title: 'EFS vs FSx', youtubeId: '9N8T9Q3xS2o' },
          { id: 'assoc-storage-5', title: 'Backup & Lifecycle Policies', youtubeId: '9Q3mKjI6V3s' },
        ],
        quizQuestions: makeQuiz('assoc-4', associateQuizTemplate),
      },
      {
        id: 'assoc-networking',
        order: 5,
        title: 'Networking',
        lessons: [
          { id: 'assoc-net-1', title: 'VPC Basics', youtubeId: 'bGDMe0Jg6GY' },
          { id: 'assoc-net-2', title: 'Subnets (Public vs Private)', youtubeId: 'xM7S8vO8m9Q' },
          { id: 'assoc-net-3', title: 'Route Tables', youtubeId: 'W5kP8xjZgEI' },
          { id: 'assoc-net-4', title: 'Internet Gateway & NAT Gateway', youtubeId: 'mQ1Q3bQ7eYk' },
          { id: 'assoc-net-5', title: 'Security Groups vs NACL', youtubeId: 'aN1k4D2j0Js' },
          { id: 'assoc-net-6', title: 'VPC Peering', youtubeId: 'xjFfV3O2m6Y' },
          { id: 'assoc-net-7', title: 'Transit Gateway', youtubeId: 'D2mI7W3vN0k' },
        ],
        quizQuestions: makeQuiz('assoc-5', associateQuizTemplate),
      },
      {
        id: 'assoc-databases',
        order: 6,
        title: 'Databases',
        lessons: [
          { id: 'assoc-db-1', title: 'RDS Overview', youtubeId: 'P6x7wJ4QxwQ' },
          { id: 'assoc-db-2', title: 'Multi-AZ vs Read Replica', youtubeId: 'iN6Q7m4V0eU' },
          { id: 'assoc-db-3', title: 'Aurora', youtubeId: '9tN9oY3x5mQ' },
          { id: 'assoc-db-4', title: 'DynamoDB', youtubeId: 'HaEPXoXVf2k' },
          { id: 'assoc-db-5', title: 'ElastiCache', youtubeId: 'wN9Q3fL3sLQ' },
          { id: 'assoc-db-6', title: 'Database Migration Service', youtubeId: 'u7sP2mQ6N1U' },
        ],
        quizQuestions: makeQuiz('assoc-6', associateQuizTemplate),
      },
      {
        id: 'assoc-serverless',
        order: 7,
        title: 'Serverless',
        lessons: [
          { id: 'assoc-sv-1', title: 'Lambda', youtubeId: 'eOBq__h4OJ4' },
          { id: 'assoc-sv-2', title: 'API Gateway', youtubeId: 's6MKZqV_4VQ' },
          { id: 'assoc-sv-3', title: 'SQS', youtubeId: '3OeV0V6k2I8' },
          { id: 'assoc-sv-4', title: 'SNS', youtubeId: 'JtlR4xNf1kA' },
          { id: 'assoc-sv-5', title: 'EventBridge', youtubeId: 'A6f7kK8Qv9I' },
          { id: 'assoc-sv-6', title: 'Step Functions', youtubeId: 'TFO9nqRr8kM' },
        ],
        quizQuestions: makeQuiz('assoc-7', associateQuizTemplate),
      },
      {
        id: 'assoc-monitoring-security',
        order: 8,
        title: 'Monitoring & Security',
        lessons: [
          { id: 'assoc-ms-1', title: 'CloudWatch', youtubeId: '6Q9fS3wYxqE' },
          { id: 'assoc-ms-2', title: 'CloudTrail', youtubeId: 'hQ9w8Xb4U2o' },
          { id: 'assoc-ms-3', title: 'AWS Config', youtubeId: 'mQ4v7Nn2fIY' },
          { id: 'assoc-ms-4', title: 'KMS', youtubeId: 'A7yN4eF2lUo' },
          { id: 'assoc-ms-5', title: 'WAF', youtubeId: 'vN8Q3mI5sTo' },
          { id: 'assoc-ms-6', title: 'Shield', youtubeId: 'gQ6mN9eI4wA' },
        ],
        quizQuestions: makeQuiz('assoc-8', associateQuizTemplate),
      },
      {
        id: 'assoc-architecture-patterns',
        order: 9,
        title: 'Architecture Patterns',
        lessons: [
          { id: 'assoc-ap-1', title: 'Multi-AZ Architecture', youtubeId: 'V9qj0f5f7sY' },
          { id: 'assoc-ap-2', title: 'Multi-Region Architecture', youtubeId: 'S6hF9jM9N3k' },
          { id: 'assoc-ap-3', title: 'Fault Tolerance', youtubeId: 'qQ4x8bN6sY8' },
          { id: 'assoc-ap-4', title: 'Disaster Recovery (RTO / RPO)', youtubeId: 'C7mT8nJ2vP0' },
          { id: 'assoc-ap-5', title: 'Cost Optimization Patterns', youtubeId: 'zD6N4wQ8mLQ' },
        ],
        quizQuestions: makeQuiz('assoc-9', associateQuizTemplate),
      },
    ],
  },
  practitioner: {
    heading: 'AWS Certified Cloud Practitioner Roadmap',
    description: 'Same roadmap format as Associate • 3 demo sections',
    completionStorageKey: 'cloudmentor-practitioner-completed',
    quizStorageKey: 'cloudmentor-practitioner-quiz-passed',
    sections: [
      {
        id: 'prac-cloud',
        order: 1,
        title: 'Cloud Basics',
        lessons: [
          { id: 'prac-1-1', title: 'Cloud Computing Value and Benefits', youtubeId: 'M988_fsOSWo' },
          { id: 'prac-1-2', title: 'AWS Global Infrastructure Basics', youtubeId: 'Z3SYDTMP3ME' },
          { id: 'prac-1-3', title: 'Shared Responsibility Model', youtubeId: 'M1l7nX8pB4Q' },
        ],
        quizQuestions: makeQuiz('prac-1', [
          {
            question: 'Which is a primary cloud benefit?',
            options: ['High upfront capex', 'Agility', 'No internet needed', 'Manual scaling only'],
            correctIndex: 1,
            explanation: 'Cloud improves agility and speed of delivery.',
          },
          {
            question: 'An AWS Region contains what?',
            options: ['One AZ only', 'Multiple AZs', 'Only edge locations', 'Only VPCs'],
            correctIndex: 1,
            explanation: 'Regions are made up of multiple Availability Zones.',
          },
          {
            question: 'Who secures physical data centers in AWS?',
            options: ['Customer', 'AWS', 'Partner', 'Both equally'],
            correctIndex: 1,
            explanation: 'AWS secures infrastructure; customers secure workloads.',
          },
          {
            question: 'Which service helps estimate costs before deployment?',
            options: ['Cost Explorer', 'Pricing Calculator', 'Trusted Advisor', 'Budgets'],
            correctIndex: 1,
            explanation: 'Pricing Calculator is meant for pre-deployment estimation.',
          },
          {
            question: 'Which support plan includes only docs/forums and no technical support?',
            options: ['Basic', 'Developer', 'Business', 'Enterprise'],
            correctIndex: 0,
            explanation: 'Basic has limited support options.',
          },
        ]),
      },
      {
        id: 'prac-services',
        order: 2,
        title: 'Core AWS Services',
        lessons: [
          { id: 'prac-2-1', title: 'Compute with EC2 and Lambda', youtubeId: 'eOBq__h4OJ4' },
          { id: 'prac-2-2', title: 'Storage with S3 and EBS', youtubeId: '77lMCiiMilo' },
          { id: 'prac-2-3', title: 'Databases with RDS and DynamoDB', youtubeId: 'HaEPXoXVf2k' },
        ],
        quizQuestions: makeQuiz('prac-2', [
          {
            question: 'Which service is serverless compute?',
            options: ['EC2', 'Lambda', 'EBS', 'RDS'],
            correctIndex: 1,
            explanation: 'Lambda runs code without server management.',
          },
          {
            question: 'Which service is object storage?',
            options: ['S3', 'EBS', 'EFS', 'RDS'],
            correctIndex: 0,
            explanation: 'S3 is object storage.',
          },
          {
            question: 'Which service is managed relational DB?',
            options: ['DynamoDB', 'RDS', 'ElastiCache', 'SQS'],
            correctIndex: 1,
            explanation: 'RDS provides managed relational databases.',
          },
          {
            question: 'Which service is NoSQL key-value/document?',
            options: ['Aurora', 'DynamoDB', 'RDS PostgreSQL', 'Redshift'],
            correctIndex: 1,
            explanation: 'DynamoDB is AWS managed NoSQL.',
          },
          {
            question: 'Which service is used for content delivery with edge caching?',
            options: ['CloudFront', 'CloudTrail', 'Config', 'S3 Glacier'],
            correctIndex: 0,
            explanation: 'CloudFront uses edge locations for faster delivery.',
          },
        ]),
      },
      {
        id: 'prac-security-billing',
        order: 3,
        title: 'Security, Billing & Governance',
        lessons: [
          { id: 'prac-3-1', title: 'IAM Fundamentals', youtubeId: 'ulprqHHWlng' },
          { id: 'prac-3-2', title: 'Cost Management: Budgets & Cost Explorer', youtubeId: 'x5Y0w5JfQfI' },
          { id: 'prac-3-3', title: 'Governance with Organizations', youtubeId: 'nN4uRx5EJf4' },
        ],
        quizQuestions: makeQuiz('prac-3', [
          {
            question: 'Which IAM best practice is recommended?',
            options: ['Use root daily', 'Enable MFA', 'Share access keys', 'Use one admin user'],
            correctIndex: 1,
            explanation: 'MFA improves account security significantly.',
          },
          {
            question: 'Which tool sets spending thresholds with alerts?',
            options: ['Trusted Advisor', 'AWS Budgets', 'CloudTrail', 'Inspector'],
            correctIndex: 1,
            explanation: 'AWS Budgets is designed for spend alerts and controls.',
          },
          {
            question: 'Which service gives account-level governance across multiple AWS accounts?',
            options: ['Organizations', 'Route 53', 'CloudFormation', 'IAM Identity Center only'],
            correctIndex: 0,
            explanation: 'AWS Organizations manages account groups and guardrails.',
          },
          {
            question: 'What does least privilege mean?',
            options: ['No permissions', 'Only required permissions', 'Admin for everyone', 'Temporary root'],
            correctIndex: 1,
            explanation: 'Grant only the minimal permissions required.',
          },
          {
            question: 'Which service provides usage/cost analysis over time?',
            options: ['Cost Explorer', 'Config', 'CloudWatch', 'ECR'],
            correctIndex: 0,
            explanation: 'Cost Explorer shows spend and usage trends.',
          },
        ]),
      },
    ],
  },
  professional: {
    heading: 'AWS Certified Solutions Architect - Professional Roadmap',
    description: 'Harder than Associate • advanced architecture scenarios',
    completionStorageKey: 'cloudmentor-sap-completed',
    quizStorageKey: 'cloudmentor-sap-quiz-passed',
    sections: [
      {
        id: 'pro-multi-account',
        order: 1,
        title: 'Multi-Account & Governance at Scale',
        lessons: [
          { id: 'pro-1-1', title: 'Enterprise Multi-Account Landing Zones', youtubeId: 'nN4uRx5EJf4' },
          { id: 'pro-1-2', title: 'SCP Strategy and Delegated Admin', youtubeId: 'YQsK4MtsELU' },
          { id: 'pro-1-3', title: 'Cross-Account Access Patterns', youtubeId: '2z7R7l5fC7w' },
        ],
        quizQuestions: makeQuiz('pro-1', [
          {
            question: 'What is the primary purpose of Service Control Policies?',
            options: ['Grant permissions', 'Set maximum permission guardrails', 'Replace IAM roles', 'Encrypt S3'],
            correctIndex: 1,
            explanation: 'SCPs restrict what can be granted in member accounts.',
          },
          {
            question: 'For centralized security tooling across org accounts, what pattern is common?',
            options: ['Single root account use', 'Delegated admin account', 'One IAM user shared everywhere', 'No Organizations'],
            correctIndex: 1,
            explanation: 'Delegated admin allows scoped centralized management.',
          },
          {
            question: 'Which method is preferred for app-to-app cross-account auth?',
            options: ['Long-term keys', 'AssumeRole STS', 'Root credentials', 'Static shared password'],
            correctIndex: 1,
            explanation: 'STS AssumeRole provides temporary credentials.',
          },
          {
            question: 'What is a key reason to isolate workloads by account?',
            options: ['Faster boot time', 'Blast-radius isolation', 'Cheaper NAT', 'Avoid IAM'],
            correctIndex: 1,
            explanation: 'Account boundaries improve governance and isolation.',
          },
          {
            question: 'Which service helps manage account creation and hierarchy?',
            options: ['Organizations', 'CloudTrail', 'CodeBuild', 'Auto Scaling'],
            correctIndex: 0,
            explanation: 'AWS Organizations manages account hierarchy and policies.',
          },
        ]),
      },
      {
        id: 'pro-resilience',
        order: 2,
        title: 'Resilience, Multi-Region & Disaster Recovery',
        lessons: [
          { id: 'pro-2-1', title: 'RTO/RPO Driven DR Architectures', youtubeId: 'C7mT8nJ2vP0' },
          { id: 'pro-2-2', title: 'Active-Active and Active-Passive Patterns', youtubeId: 'S6hF9jM9N3k' },
          { id: 'pro-2-3', title: 'Cross-Region Data Replication Tradeoffs', youtubeId: 'qQ4x8bN6sY8' },
        ],
        quizQuestions: makeQuiz('pro-2', [
          {
            question: 'Which DR model usually has the lowest RTO and RPO?',
            options: ['Backup & restore', 'Pilot light', 'Warm standby', 'Multi-site active-active'],
            correctIndex: 3,
            explanation: 'Active-active generally offers fastest recovery with highest cost/complexity.',
          },
          {
            question: 'What is the key architectural tradeoff of active-active multi-region?',
            options: ['No complexity', 'Higher cost and conflict complexity', 'No latency concerns', 'No DNS needed'],
            correctIndex: 1,
            explanation: 'Active-active increases cost and consistency/operations complexity.',
          },
          {
            question: 'If business mandates near-zero data loss, what should architect prioritize?',
            options: ['Weekly snapshots', 'Cross-region synchronous-like patterns where possible', 'Single AZ DB', 'Larger EC2 instance'],
            correctIndex: 1,
            explanation: 'Low RPO requires replication and resilient failover design.',
          },
          {
            question: 'Which AWS service helps route users to healthy regional endpoints?',
            options: ['Route 53', 'SQS', 'SNS', 'CloudTrail'],
            correctIndex: 0,
            explanation: 'Route 53 supports health-check based DNS routing.',
          },
          {
            question: 'What should drive DR pattern selection first?',
            options: ['Engineer preference', 'RTO/RPO and business criticality', 'Only cost', 'Only team size'],
            correctIndex: 1,
            explanation: 'Business recovery objectives should drive architecture decisions.',
          },
        ]),
      },
      {
        id: 'pro-performance-cost',
        order: 3,
        title: 'Performance and Cost at Enterprise Scale',
        lessons: [
          { id: 'pro-3-1', title: 'High-Scale Performance Patterns', youtubeId: 'V9qj0f5f7sY' },
          { id: 'pro-3-2', title: 'Observability for Complex Systems', youtubeId: '6Q9fS3wYxqE' },
          { id: 'pro-3-3', title: 'FinOps and Advanced Cost Controls', youtubeId: 'zD6N4wQ8mLQ' },
        ],
        quizQuestions: makeQuiz('pro-3', [
          {
            question: 'What is a common enterprise FinOps control?',
            options: ['No tagging', 'Cost allocation tags + budgets + anomaly detection', 'Only on-demand everywhere', 'Disable monitoring'],
            correctIndex: 1,
            explanation: 'FinOps relies on tagging, governance, and proactive controls.',
          },
          {
            question: 'For read-heavy global workloads, which improves latency?',
            options: ['Single-region monolith only', 'Regional caching and read replicas', 'Bigger NAT gateway', 'Disable CDN'],
            correctIndex: 1,
            explanation: 'Distributed read paths reduce latency and improve scale.',
          },
          {
            question: 'Which is a practical way to reduce observability blind spots?',
            options: ['Only logs', 'Unified metrics, logs, traces correlation', 'No alarms', 'Manual weekly checks'],
            correctIndex: 1,
            explanation: 'Correlating telemetry improves incident triage and root cause speed.',
          },
          {
            question: 'What is the best statement about architectural tradeoffs at Professional level?',
            options: ['Always optimize one pillar only', 'Balance reliability, performance, security, and cost by context', 'Cost is irrelevant', 'Ignore operations'],
            correctIndex: 1,
            explanation: 'Professional-level design is about contextual tradeoff decisions.',
          },
          {
            question: 'Which savings mechanism can flex across EC2/Fargate/Lambda usage?',
            options: ['Reserved capacity only', 'Compute Savings Plans', 'Spot only', 'Dedicated Hosts only'],
            correctIndex: 1,
            explanation: 'Compute Savings Plans provide broad flexibility across compute services.',
          },
        ]),
      },
    ],
  },
}

export function SAARoadmapViewer({
  track = 'associate',
}: {
  track?: 'associate' | 'practitioner' | 'professional'
}) {
  const roadmap = roadmapByTrack[track]
  const sections = roadmap.sections
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [selectedLesson, setSelectedLesson] = useState<RoadmapLesson | null>(null)
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set())
  const [passedSectionIds, setPassedSectionIds] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarMinimized, setSidebarMinimized] = useState(false)

  useEffect(() => {
    const STORAGE_KEY = roadmap.completionStorageKey
    const QUIZ_STORAGE_KEY = roadmap.quizStorageKey
    const initialExpanded = sections.reduce<Record<string, boolean>>((acc, section, index) => {
      acc[section.id] = index === 0
      return acc
    }, {})
    setExpanded(initialExpanded)

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setCompletedLessonIds(new Set(JSON.parse(stored) as string[]))
    }
    const storedQuizPassed = localStorage.getItem(QUIZ_STORAGE_KEY)
    if (storedQuizPassed) {
      setPassedSectionIds(new Set(JSON.parse(storedQuizPassed) as string[]))
    }
  }, [sections, roadmap.completionStorageKey, roadmap.quizStorageKey])

  const allLessons = useMemo(() => sections.flatMap((section) => section.lessons), [sections])
  const totalLessons = allLessons.length
  const completedCount = allLessons.filter((lesson) => completedLessonIds.has(lesson.id)).length
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const sectionCompleteMap = useMemo(() => {
    return sections.reduce<Record<string, boolean>>((acc, section) => {
      acc[section.id] =
        passedSectionIds.has(section.id) ||
        (section.lessons.length > 0 &&
          section.lessons.every((lesson) => completedLessonIds.has(lesson.id)))
      return acc
    }, {})
  }, [sections, completedLessonIds, passedSectionIds])

  const shouldShiftContent = sidebarOpen && !sidebarMinimized

  return (
    <div
      className={`space-y-6 transition-[padding] duration-300 ${
        shouldShiftContent ? 'xl:pr-[36rem]' : 'xl:pr-0'
      }`}
    >
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>{roadmap.heading}</CardTitle>
          <CardDescription>{completedCount}/{totalLessons} lessons completed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold">{progressPercentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progressPercentage}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Lessons (Roadmap View)</CardTitle>
            <CardDescription>{roadmap.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-8">
              <div className="absolute left-3 top-0 h-full w-px bg-border" />
              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id} className="relative">
                    <div className="absolute -left-8 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-background">
                      {sectionCompleteMap[section.id] ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      className="h-auto w-full justify-between px-2 py-2"
                      onClick={() => setExpanded((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
                    >
                      <span className="text-left font-semibold">
                        Section {section.order}: {section.title}
                      </span>
                      {expanded[section.id] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>

                    {expanded[section.id] && (
                      <div className="space-y-2 pl-2 pt-2">
                        {section.lessons.map((lesson, index) => {
                          const isSelected = selectedLesson?.id === lesson.id
                          const isComplete = completedLessonIds.has(lesson.id)
                          return (
                            <div
                              key={lesson.id}
                              className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                                isSelected ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'
                              }`}
                            >
                              <button
                                className="flex flex-1 items-center gap-2 text-left"
                                onClick={() => {
                                  setSelectedLesson(lesson)
                                  setSidebarOpen(true)
                                  setSidebarMinimized(false)
                                }}
                              >
                                <PlayCircle className="h-4 w-4 text-primary" />
                                <span>
                                  {index + 1}. {lesson.title}
                                </span>
                                {isComplete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                              </button>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setCompletedLessonIds((prev) => {
                                      const STORAGE_KEY = roadmap.completionStorageKey
                                      const next = new Set(prev)
                                      if (next.has(lesson.id)) {
                                        next.delete(lesson.id)
                                      } else {
                                        next.add(lesson.id)
                                        const today = new Date().toISOString().slice(0, 10)
                                        const rawDates = localStorage.getItem(DAILY_COMPLETION_DATES_KEY)
                                        const dateSet = new Set<string>(
                                          rawDates ? (JSON.parse(rawDates) as string[]) : [],
                                        )
                                        dateSet.add(today)
                                        localStorage.setItem(
                                          DAILY_COMPLETION_DATES_KEY,
                                          JSON.stringify(Array.from(dateSet)),
                                        )
                                      }
                                      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)))
                                      return next
                                    })
                                  }
                                >
                                  {isComplete ? 'Completed' : 'Mark Complete'}
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                        <SectionQuiz
                          sectionName={section.title}
                          moduleTitles={section.lessons.map((lesson) => lesson.title)}
                          questions={section.quizQuestions}
                          onComplete={(passed) => {
                            if (!passed) return
                            setPassedSectionIds((prev) => {
                              const QUIZ_STORAGE_KEY = roadmap.quizStorageKey
                              const next = new Set(prev)
                              next.add(section.id)
                              localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(Array.from(next)))
                              return next
                            })
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {!sidebarOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setSidebarOpen(true)}
            className="shadow-lg"
            disabled={!selectedLesson}
          >
            {selectedLesson ? 'Open Player' : 'Select a lesson to play'}
          </Button>
        </div>
      )}

      <VideoSidebar
        lesson={selectedLesson}
        isOpen={sidebarOpen}
        isMinimized={sidebarMinimized}
        onClose={() => setSidebarOpen(false)}
        onToggleMinimize={() => setSidebarMinimized((prev) => !prev)}
      />
    </div>
  )
}
