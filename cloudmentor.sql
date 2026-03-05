--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assessment_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment_attempts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    assessment_id uuid NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    passed boolean DEFAULT false NOT NULL,
    attempted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.assessment_attempts OWNER TO postgres;

--
-- Name: assessment_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment_results (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    assessment_id uuid NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    total_points integer DEFAULT 100 NOT NULL,
    passed boolean DEFAULT false NOT NULL,
    time_spent_minutes integer DEFAULT 0 NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.assessment_results OWNER TO postgres;

--
-- Name: assessments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    course_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    passing_score integer DEFAULT 70 NOT NULL,
    time_limit_minutes integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.assessments OWNER TO postgres;

--
-- Name: collaboration_rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collaboration_rooms (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    topic character varying(255) DEFAULT 'AWS Study Group'::character varying NOT NULL,
    created_by uuid NOT NULL,
    max_participants integer DEFAULT 10 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    members jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.collaboration_rooms OWNER TO postgres;

--
-- Name: collaboration_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collaboration_sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    room_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    left_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.collaboration_sessions OWNER TO postgres;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    category character varying(100) NOT NULL,
    level character varying(50) NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: gamification_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gamification_stats (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    total_points integer DEFAULT 0 NOT NULL,
    total_badges integer DEFAULT 0 NOT NULL,
    current_streak integer DEFAULT 0 NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.gamification_stats OWNER TO postgres;

--
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_progress (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    lesson_id text NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL,
    section_name text,
    submodule_name text,
    completed boolean DEFAULT true NOT NULL
);


ALTER TABLE public.lesson_progress OWNER TO postgres;

--
-- Name: lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lessons (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    course_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    order_index integer NOT NULL,
    estimated_duration integer DEFAULT 30 NOT NULL,
    objectives text[] DEFAULT '{}'::text[] NOT NULL,
    video_url text,
    resources text[] DEFAULT '{}'::text[] NOT NULL,
    parent_lesson_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lessons OWNER TO postgres;

--
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_attempts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    section_id uuid NOT NULL,
    mode character varying(20) DEFAULT 'exam'::character varying NOT NULL,
    score integer NOT NULL,
    total_questions integer NOT NULL,
    percentage integer NOT NULL,
    easy_correct integer DEFAULT 0 NOT NULL,
    medium_correct integer DEFAULT 0 NOT NULL,
    hard_correct integer DEFAULT 0 NOT NULL,
    attempted_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT quiz_attempts_mode_check CHECK (((mode)::text = ANY ((ARRAY['practice'::character varying, 'exam'::character varying])::text[])))
);


ALTER TABLE public.quiz_attempts OWNER TO postgres;

--
-- Name: quiz_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_options (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    question_id uuid NOT NULL,
    option_text text NOT NULL,
    is_correct boolean DEFAULT false NOT NULL,
    order_index integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.quiz_options OWNER TO postgres;

--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_questions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    assessment_id uuid NOT NULL,
    question_text text NOT NULL,
    question_type character varying(50) DEFAULT 'multiple_choice'::character varying NOT NULL,
    order_index integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.quiz_questions OWNER TO postgres;

--
-- Name: section_quiz_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.section_quiz_questions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    section_id uuid NOT NULL,
    question text NOT NULL,
    options jsonb NOT NULL,
    correct_answer_index integer NOT NULL,
    explanation text DEFAULT ''::text NOT NULL,
    difficulty character varying(20) NOT NULL,
    order_index integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT section_quiz_questions_difficulty_check CHECK (((difficulty)::text = ANY ((ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying])::text[])))
);


ALTER TABLE public.section_quiz_questions OWNER TO postgres;

--
-- Name: sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sections (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    course_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    order_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sections OWNER TO postgres;

--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_progress (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    lessons_completed integer DEFAULT 0 NOT NULL,
    total_lessons integer DEFAULT 0 NOT NULL,
    progress_percentage integer DEFAULT 0 NOT NULL,
    status character varying(50) DEFAULT 'in_progress'::character varying NOT NULL,
    completed_lesson_ids uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_progress OWNER TO postgres;

--
-- Data for Name: assessment_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessment_attempts (id, user_id, assessment_id, score, passed, attempted_at) FROM stdin;
986d8f61-35eb-4b83-bae0-516c2dec35c7	00000000-0000-0000-0000-000000000001	03a995a9-fab1-4894-8ad4-79f291c5a651	50	f	2026-02-28 14:45:33.567672+05:30
87dbbfb4-6814-45cd-89b8-611cea0d2837	00000000-0000-0000-0000-000000000001	03a995a9-fab1-4894-8ad4-79f291c5a651	100	t	2026-02-28 14:47:15.499313+05:30
\.


--
-- Data for Name: assessment_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessment_results (id, user_id, assessment_id, score, total_points, passed, time_spent_minutes, completed_at) FROM stdin;
af1656e3-52a7-41fa-81e9-e17e94452de3	00000000-0000-0000-0000-000000000001	03a995a9-fab1-4894-8ad4-79f291c5a651	100	100	t	0	2026-02-28 14:23:04.537689+05:30
19d4e878-c597-4d15-9631-ecb2acd3d5f6	00000000-0000-0000-0000-000000000001	03a995a9-fab1-4894-8ad4-79f291c5a651	50	100	f	0	2026-02-28 17:25:30.432732+05:30
\.


--
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessments (id, course_id, title, description, passing_score, time_limit_minutes, created_at, updated_at) FROM stdin;
03a995a9-fab1-4894-8ad4-79f291c5a651	7d534401-e128-4640-bc1a-e8a51204fe80	Cloud Practitioner Fundamentals Quiz	Quick check on core AWS foundation concepts.	70	20	2026-02-27 18:05:47.571656+05:30	2026-02-27 18:05:47.571656+05:30
\.


--
-- Data for Name: collaboration_rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collaboration_rooms (id, title, topic, created_by, max_participants, is_active, members, created_at, updated_at) FROM stdin;
53c17b92-45eb-4c92-ba43-1d1332549de3	lets crack Associate	AWS Study Group	00000000-0000-0000-0000-000000000001	10	t	[{"user_id": "00000000-0000-0000-0000-000000000001", "joined_at": "2026-02-28T09:17:33.271Z"}, {"email": "sinhasam05@gmail.com", "user_id": "invite:sinhasam05@gmail.com", "joined_at": "2026-03-02T11:05:48.906Z"}]	2026-02-28 14:47:33.278486+05:30	2026-03-02 16:35:29.943572+05:30
\.


--
-- Data for Name: collaboration_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collaboration_sessions (id, room_id, user_id, joined_at, left_at, is_active, created_at) FROM stdin;
bc9f3244-480c-464f-a43b-0d4a0295d86b	53c17b92-45eb-4c92-ba43-1d1332549de3	00000000-0000-0000-0000-000000000001	2026-02-28 14:47:33.33915+05:30	\N	t	2026-02-28 14:47:33.33915+05:30
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, title, description, category, level, is_published, created_at, updated_at) FROM stdin;
7d534401-e128-4640-bc1a-e8a51204fe80	AWS Certified Cloud Practitioner	Foundational AWS certification covering core cloud concepts, services, and best practices. Perfect for beginners.	AWS Fundamentals	practitioner	t	2026-02-27 18:05:47.539977+05:30	2026-02-27 18:05:47.539977+05:30
8d4b1106-95fc-4082-92cc-d797555eaf3d	AWS Certified AI Practitioner	Get started with AI and machine learning on AWS. Learn core AI/ML concepts and AWS AI services.	Artificial Intelligence	practitioner	t	2026-02-27 18:05:47.539977+05:30	2026-02-27 18:05:47.539977+05:30
36572f36-e5ee-436d-9480-bd9d9c4df7f5	AWS Certified Solutions Architect - Associate	Design secure, scalable, and cost-effective applications on AWS. Essential for solution architects.	Architecture	associate	t	2026-02-27 18:05:47.539977+05:30	2026-02-27 18:05:47.539977+05:30
15964e4c-4961-45c9-a456-856d7aeb6b37	AWS Certified Developer - Associate	Master AWS development practices. Learn to build, deploy, and debug cloud applications.	Development	associate	t	2026-02-27 18:05:47.539977+05:30	2026-02-27 18:05:47.539977+05:30
b406cc91-d33f-4d00-a3f0-9dd8729ee152	AWS Certified Machine Learning Engineer - Associate	Build and train machine learning models on AWS. Learn SageMaker and ML pipelines.	Machine Learning	associate	t	2026-02-27 18:05:47.539977+05:30	2026-02-27 18:05:47.539977+05:30
764cd346-0052-4c1b-8dfb-070618fa600e	AWS Certified Data Engineer - Associate	Design data pipelines and analytics solutions. Master data lakes, ETL, and big data services.	Data Engineering	associate	t	2026-02-27 18:05:47.539977+05:30	2026-02-27 18:05:47.539977+05:30
34de0361-03f2-4539-bd55-6b95baf4ee33	AWS Certified CloudOps Engineer - Associate	Manage and automate AWS infrastructure. Learn deployment automation and monitoring.	Operations	associate	t	2026-02-27 18:05:47.539977+05:30	2026-02-27 18:05:47.539977+05:30
4b8e89a8-7c8b-49aa-8f1a-ac0430adbfec	AWS Certified Solutions Architect - Professional	Advanced AWS architecture design. Design complex, multi-account, global-scale applications.	Architecture	advanced	t	2026-02-27 18:05:47.539977+05:30	2026-02-27 18:05:47.539977+05:30
38edd42c-dc2a-4f7a-add6-8bbbc54cf3bc	AWS Certified DevOps Engineer - Professional	Master DevOps on AWS. CI/CD, infrastructure as code, monitoring, and automation at scale.	DevOps	advanced	t	2026-02-27 18:05:47.539977+05:30	2026-02-27 18:05:47.539977+05:30
4261092e-9b49-4426-a93f-1d859997468e	AWS Certified Generative AI Developer - Professional	Build generative AI applications on AWS. Learn LLMs, RAG, and foundation models.	Artificial Intelligence	advanced	t	2026-02-27 18:05:47.539977+05:30	2026-02-27 18:05:47.539977+05:30
5ca5f38a-da46-4984-ad4d-58dfe452ef44	AWS Certified Security - Specialty	Master AWS security. IAM, encryption, compliance, incident response, and security best practices.	Security	advanced	t	2026-02-27 18:05:47.539977+05:30	2026-02-27 18:05:47.539977+05:30
a09e6d92-7755-4559-8e9c-d8cb00d33638	AWS Certified Advanced Networking - Specialty	Expert-level networking on AWS. VPC, routing, hybrid connectivity, and network optimization.	Networking	advanced	t	2026-02-27 18:05:47.539977+05:30	2026-02-27 18:05:47.539977+05:30
2e53c7f1-c29f-454c-9580-be6fbda1edf4	AWS Certified Machine Learning - Specialty	Advanced ML concepts and implementation. Deep learning, feature engineering, and production ML.	Machine Learning	advanced	t	2026-02-27 18:05:47.539977+05:30	2026-02-27 18:05:47.539977+05:30
\.


--
-- Data for Name: gamification_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gamification_stats (id, user_id, total_points, total_badges, current_streak, level, created_at, updated_at) FROM stdin;
90793847-a779-4947-95cb-186430c25087	00000000-0000-0000-0000-000000000001	0	0	0	1	2026-02-27 18:05:46.670972+05:30	2026-02-27 18:05:46.670972+05:30
\.


--
-- Data for Name: lesson_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_progress (id, user_id, course_id, lesson_id, completed_at, section_name, submodule_name, completed) FROM stdin;
bd51cee0-5259-411e-98d4-fe2f250496ec	00000000-0000-0000-0000-000000000001	36572f36-e5ee-436d-9480-bd9d9c4df7f5	cf-1	2026-02-28 14:40:51.263983+05:30	\N	\N	t
5928f6c4-03a4-45c3-9bbd-e849cc8c2a9b	00000000-0000-0000-0000-000000000001	36572f36-e5ee-436d-9480-bd9d9c4df7f5	cf-2	2026-02-28 14:40:52.883171+05:30	\N	\N	t
14d1c730-6a14-4614-9a9c-9131a2128db6	00000000-0000-0000-0000-000000000001	36572f36-e5ee-436d-9480-bd9d9c4df7f5	cf-3	2026-02-28 14:40:54.048672+05:30	\N	\N	t
bf88d198-6cad-4f4f-8fdc-19f604f123c0	00000000-0000-0000-0000-000000000001	36572f36-e5ee-436d-9480-bd9d9c4df7f5	cf-4	2026-02-28 14:40:55.251142+05:30	\N	\N	t
664c9547-abb4-429b-b406-085b1eb2cadf	00000000-0000-0000-0000-000000000001	36572f36-e5ee-436d-9480-bd9d9c4df7f5	cf-5	2026-02-28 14:40:56.392087+05:30	\N	\N	t
4dc4f70a-7c3e-4ba9-b1d2-51c06705fa25	00000000-0000-0000-0000-000000000001	36572f36-e5ee-436d-9480-bd9d9c4df7f5	iam-1	2026-02-28 14:48:12.589329+05:30	\N	\N	t
ae516726-dc5e-4467-b764-9f501db929da	00000000-0000-0000-0000-000000000001	36572f36-e5ee-436d-9480-bd9d9c4df7f5	iam-2	2026-02-28 14:48:14.590134+05:30	\N	\N	t
abbe8802-8070-4215-a609-3001a30c544e	00000000-0000-0000-0000-000000000001	36572f36-e5ee-436d-9480-bd9d9c4df7f5	iam-3	2026-02-28 14:48:17.764698+05:30	\N	\N	t
24c91405-3227-472f-9879-51168963943c	00000000-0000-0000-0000-000000000001	36572f36-e5ee-436d-9480-bd9d9c4df7f5	iam-4	2026-02-28 14:48:19.426557+05:30	\N	\N	t
7fe07133-1156-450f-95c7-36cafba6ddb2	00000000-0000-0000-0000-000000000001	36572f36-e5ee-436d-9480-bd9d9c4df7f5	iam-5	2026-02-28 14:48:20.381276+05:30	\N	\N	t
2b2fa6e1-2429-4b3d-8912-725d1b46a3bd	00000000-0000-0000-0000-000000000001	36572f36-e5ee-436d-9480-bd9d9c4df7f5	db-1	2026-02-28 15:22:39.728457+05:30	\N	\N	t
88eeba56-82af-4f01-9155-994d64e0f93b	00000000-0000-0000-0000-000000000001	36572f36-e5ee-436d-9480-bd9d9c4df7f5	db-6	2026-02-28 15:22:43.48325+05:30	\N	\N	t
\.


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lessons (id, course_id, title, content, order_index, estimated_duration, objectives, video_url, resources, parent_lesson_id, created_at, updated_at) FROM stdin;
edfa6aa4-8a18-4f08-bc98-36d445346662	7d534401-e128-4640-bc1a-e8a51204fe80	Getting Started with AWS	Introduction to AWS cloud platform, account setup, and core concepts.	1	120	{"Understand AWS basics","Set up AWS account"}	\N	{}	\N	2026-02-27 18:05:47.571656+05:30	2026-02-27 18:05:47.571656+05:30
215e681e-6ae1-4865-b38f-ef171f6f2f52	7d534401-e128-4640-bc1a-e8a51204fe80	AWS Core Services	Deep dive into EC2, S3, RDS, and Lambda.	2	180	{"Learn EC2 instances","Master S3 buckets","Understand RDS"}	\N	{}	\N	2026-02-27 18:05:47.571656+05:30	2026-02-27 18:05:47.571656+05:30
7981dccd-7ae5-42e2-9a7b-849f11045873	8d4b1106-95fc-4082-92cc-d797555eaf3d	Introduction to AI/ML on AWS	Overview of SageMaker and AWS AI services.	1	150	{"Understand AI concepts","Learn SageMaker basics"}	\N	{}	\N	2026-02-27 18:05:47.571656+05:30	2026-02-27 18:05:47.571656+05:30
84df8bd5-6581-4b63-a844-bacd48542e56	36572f36-e5ee-436d-9480-bd9d9c4df7f5	Architecture Fundamentals	Design principles and architectural patterns for AWS.	1	200	{"Learn design patterns","Understand scalability"}	\N	{}	\N	2026-02-27 18:05:47.571656+05:30	2026-02-27 18:05:47.571656+05:30
e00139ec-b669-455c-950e-01fb93b4a517	4b8e89a8-7c8b-49aa-8f1a-ac0430adbfec	Advanced Architecture	Complex multi-region and multi-account designs.	1	300	{"Master complex designs","Learn high availability"}	\N	{}	\N	2026-02-27 18:05:47.571656+05:30	2026-02-27 18:05:47.571656+05:30
bc8fc3c6-7806-4af1-a70f-c5203faa4b7a	7d534401-e128-4640-bc1a-e8a51204fe80	Identity and Access Management (IAM)	Master AWS IAM: users, groups, policies, roles, and best practices for secure cloud access control.	3	600	{"Understand IAM fundamentals","Manage users, groups, and roles","Create and manage policies","Implement least privilege"}	\N	{}	\N	2026-02-27 18:05:47.634953+05:30	2026-02-27 18:05:47.634953+05:30
8012b31b-5968-4fba-8531-88c94703c535	7d534401-e128-4640-bc1a-e8a51204fe80	Introduction to IAM	IAM fundamentals and architecture overview.	31	60	{"Understand IAM basics","Learn IAM architecture"}	\N	{}	bc8fc3c6-7806-4af1-a70f-c5203faa4b7a	2026-02-27 18:05:47.634953+05:30	2026-02-27 18:05:47.634953+05:30
af599870-6f33-4c77-964c-ebdce85de1e0	7d534401-e128-4640-bc1a-e8a51204fe80	IAM Users	Create and manage IAM users, credentials, and MFA.	32	75	{"Create IAM users","Set up MFA"}	\N	{}	bc8fc3c6-7806-4af1-a70f-c5203faa4b7a	2026-02-27 18:05:47.634953+05:30	2026-02-27 18:05:47.634953+05:30
643118dc-3d18-406a-b298-142a17619a3f	7d534401-e128-4640-bc1a-e8a51204fe80	IAM Groups	Use groups for scalable permission management.	33	60	{"Create groups","Attach policies to groups"}	\N	{}	bc8fc3c6-7806-4af1-a70f-c5203faa4b7a	2026-02-27 18:05:47.634953+05:30	2026-02-27 18:05:47.634953+05:30
3abced96-09e5-4323-a90c-e203d949840c	7d534401-e128-4640-bc1a-e8a51204fe80	IAM Policies: Managed vs Custom	Understand policy types and JSON policy structure.	34	90	{"Understand policy types","Create custom policies"}	\N	{}	bc8fc3c6-7806-4af1-a70f-c5203faa4b7a	2026-02-27 18:05:47.634953+05:30	2026-02-27 18:05:47.634953+05:30
25ebde64-6cf4-43fa-9c47-09a03cb666ac	7d534401-e128-4640-bc1a-e8a51204fe80	IAM Roles	Use IAM roles, trust policies, and temporary credentials.	35	90	{"Create IAM roles","Understand trust policies"}	\N	{}	bc8fc3c6-7806-4af1-a70f-c5203faa4b7a	2026-02-27 18:05:47.634953+05:30	2026-02-27 18:05:47.634953+05:30
766103df-f59a-4249-8acf-89e2cce57ebf	7d534401-e128-4640-bc1a-e8a51204fe80	Least Privilege Principle	Apply least privilege and reduce over-permissioning.	36	80	{"Design minimal permissions","Audit IAM access"}	\N	{}	bc8fc3c6-7806-4af1-a70f-c5203faa4b7a	2026-02-27 18:05:47.634953+05:30	2026-02-27 18:05:47.634953+05:30
71792256-62c3-42db-b4eb-1e84a78487fb	7d534401-e128-4640-bc1a-e8a51204fe80	IAM Best Practices	Apply AWS IAM security and governance best practices.	37	85	{"Apply security best practices","Strengthen account security"}	\N	{}	bc8fc3c6-7806-4af1-a70f-c5203faa4b7a	2026-02-27 18:05:47.634953+05:30	2026-02-27 18:05:47.634953+05:30
\.


--
-- Data for Name: quiz_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_attempts (id, user_id, course_id, section_id, mode, score, total_questions, percentage, easy_correct, medium_correct, hard_correct, attempted_at) FROM stdin;
\.


--
-- Data for Name: quiz_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_options (id, question_id, option_text, is_correct, order_index) FROM stdin;
afc0d025-cfb3-4d27-8ea7-d35615b68e14	941b2208-f2ff-4a7e-8d85-4d932dab1f19	Amazon S3	t	1
1eb4a96a-81a6-4d86-a87d-ff4f236bf0b7	941b2208-f2ff-4a7e-8d85-4d932dab1f19	Amazon EC2	f	2
fcac1412-35c5-49ce-b277-c9927cdb501d	941b2208-f2ff-4a7e-8d85-4d932dab1f19	Amazon RDS	f	3
32dda4bd-f957-4ee1-bce6-de376a2e0dac	1a132dfe-72c5-4c47-9895-c5b6fb479b6f	Managing AWS access permissions	t	1
3454eeac-4330-4589-b0aa-eb3285d64bd1	1a132dfe-72c5-4c47-9895-c5b6fb479b6f	Deploying containers	f	2
4730b6a7-3f2f-4f73-9576-3c0061d4e9e3	1a132dfe-72c5-4c47-9895-c5b6fb479b6f	Streaming logs	f	3
\.


--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_questions (id, assessment_id, question_text, question_type, order_index, created_at) FROM stdin;
941b2208-f2ff-4a7e-8d85-4d932dab1f19	03a995a9-fab1-4894-8ad4-79f291c5a651	Which AWS service is object storage?	multiple_choice	1	2026-02-27 18:05:47.571656+05:30
1a132dfe-72c5-4c47-9895-c5b6fb479b6f	03a995a9-fab1-4894-8ad4-79f291c5a651	What is IAM primarily used for?	multiple_choice	2	2026-02-27 18:05:47.571656+05:30
\.


--
-- Data for Name: section_quiz_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.section_quiz_questions (id, section_id, question, options, correct_answer_index, explanation, difficulty, order_index, created_at) FROM stdin;
\.


--
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sections (id, course_id, name, order_index, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_progress (id, user_id, course_id, lessons_completed, total_lessons, progress_percentage, status, completed_lesson_ids, created_at, updated_at) FROM stdin;
03fb396e-0ed5-4f79-95cf-272757ca5585	00000000-0000-0000-0000-000000000001	5ca5f38a-da46-4984-ad4d-58dfe452ef44	0	0	0	in_progress	{}	2026-02-27 18:20:24.280013+05:30	2026-02-27 18:20:24.280013+05:30
376211dc-8b52-4f37-a08c-0066114c7b97	00000000-0000-0000-0000-000000000001	2e53c7f1-c29f-454c-9580-be6fbda1edf4	0	0	0	in_progress	{}	2026-02-27 18:20:25.798655+05:30	2026-02-27 18:20:25.798655+05:30
fb927649-d454-4781-ad97-0d6c4e2322bd	00000000-0000-0000-0000-000000000001	4b8e89a8-7c8b-49aa-8f1a-ac0430adbfec	0	1	0	in_progress	{}	2026-02-28 14:08:10.873164+05:30	2026-02-28 14:08:10.873164+05:30
fea8e4b9-106b-46f5-8b0e-6e52323dd0a6	00000000-0000-0000-0000-000000000001	36572f36-e5ee-436d-9480-bd9d9c4df7f5	12	51	24	in_progress	{}	2026-02-27 18:19:37.290034+05:30	2026-02-28 15:22:43.503865+05:30
\.


--
-- Name: assessment_attempts assessment_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_attempts
    ADD CONSTRAINT assessment_attempts_pkey PRIMARY KEY (id);


--
-- Name: assessment_results assessment_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_results
    ADD CONSTRAINT assessment_results_pkey PRIMARY KEY (id);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: collaboration_rooms collaboration_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collaboration_rooms
    ADD CONSTRAINT collaboration_rooms_pkey PRIMARY KEY (id);


--
-- Name: collaboration_sessions collaboration_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collaboration_sessions
    ADD CONSTRAINT collaboration_sessions_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: gamification_stats gamification_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamification_stats
    ADD CONSTRAINT gamification_stats_pkey PRIMARY KEY (id);


--
-- Name: gamification_stats gamification_stats_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamification_stats
    ADD CONSTRAINT gamification_stats_user_id_key UNIQUE (user_id);


--
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (id);


--
-- Name: lesson_progress lesson_progress_user_id_course_id_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_user_id_course_id_lesson_id_key UNIQUE (user_id, course_id, lesson_id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id);


--
-- Name: quiz_options quiz_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_options
    ADD CONSTRAINT quiz_options_pkey PRIMARY KEY (id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- Name: section_quiz_questions section_quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_quiz_questions
    ADD CONSTRAINT section_quiz_questions_pkey PRIMARY KEY (id);


--
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (id);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);


--
-- Name: user_progress user_progress_user_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_course_id_key UNIQUE (user_id, course_id);


--
-- Name: idx_assessment_attempts_user_assessment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessment_attempts_user_assessment ON public.assessment_attempts USING btree (user_id, assessment_id);


--
-- Name: idx_assessment_results_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessment_results_user_id ON public.assessment_results USING btree (user_id);


--
-- Name: idx_assessments_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessments_course_id ON public.assessments USING btree (course_id);


--
-- Name: idx_collaboration_sessions_room_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_collaboration_sessions_room_id ON public.collaboration_sessions USING btree (room_id);


--
-- Name: idx_courses_level; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courses_level ON public.courses USING btree (level);


--
-- Name: idx_lesson_progress_user_course; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lesson_progress_user_course ON public.lesson_progress USING btree (user_id, course_id);


--
-- Name: idx_lessons_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lessons_course_id ON public.lessons USING btree (course_id);


--
-- Name: idx_lessons_parent_lesson_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lessons_parent_lesson_id ON public.lessons USING btree (parent_lesson_id);


--
-- Name: idx_quiz_options_question_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quiz_options_question_id ON public.quiz_options USING btree (question_id);


--
-- Name: idx_quiz_questions_assessment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quiz_questions_assessment_id ON public.quiz_questions USING btree (assessment_id);


--
-- Name: idx_sections_course_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_sections_course_name ON public.sections USING btree (course_id, name);


--
-- Name: idx_user_progress_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_progress_user_id ON public.user_progress USING btree (user_id);


--
-- Name: assessment_attempts assessment_attempts_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_attempts
    ADD CONSTRAINT assessment_attempts_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessment_results assessment_results_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_results
    ADD CONSTRAINT assessment_results_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessments assessments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: collaboration_sessions collaboration_sessions_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collaboration_sessions
    ADD CONSTRAINT collaboration_sessions_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.collaboration_rooms(id) ON DELETE CASCADE;


--
-- Name: lesson_progress lesson_progress_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: lessons lessons_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: lessons lessons_parent_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_parent_lesson_id_fkey FOREIGN KEY (parent_lesson_id) REFERENCES public.lessons(id) ON DELETE SET NULL;


--
-- Name: quiz_attempts quiz_attempts_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: quiz_attempts quiz_attempts_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE CASCADE;


--
-- Name: quiz_options quiz_options_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_options
    ADD CONSTRAINT quiz_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id) ON DELETE CASCADE;


--
-- Name: quiz_questions quiz_questions_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: section_quiz_questions section_quiz_questions_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_quiz_questions
    ADD CONSTRAINT section_quiz_questions_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE CASCADE;


--
-- Name: sections sections_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

