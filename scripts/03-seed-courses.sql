-- Seed sample AWS certification courses
-- Practitioner Level
INSERT INTO courses (title, description, topic, level)
VALUES
  ('AWS Certified Cloud Practitioner', 'Foundational AWS certification covering core cloud concepts, services, and best practices. Perfect for beginners.', 'AWS Fundamentals', 'practitioner'),
  ('AWS Certified AI Practitioner', 'Get started with AI and machine learning on AWS. Learn core AI/ML concepts and AWS AI services.', 'Artificial Intelligence', 'practitioner');

-- Associate Level
INSERT INTO courses (title, description, topic, level)
VALUES
  ('AWS Certified Solutions Architect - Associate', 'Design secure, scalable, and cost-effective applications on AWS. Essential for solution architects.', 'Architecture', 'associate'),
  ('AWS Certified Developer - Associate', 'Master AWS development practices. Learn to build, deploy, and debug cloud applications.', 'Development', 'associate'),
  ('AWS Certified Machine Learning Engineer - Associate', 'Build and train machine learning models on AWS. Learn SageMaker and ML pipelines.', 'Machine Learning', 'associate'),
  ('AWS Certified Data Engineer - Associate', 'Design data pipelines and analytics solutions. Master data lakes, ETL, and big data services.', 'Data Engineering', 'associate'),
  ('AWS Certified CloudOps Engineer - Associate', 'Manage and automate AWS infrastructure. Learn deployment automation and monitoring.', 'Operations', 'associate');

-- Advanced Level (Professional & Specialty)
INSERT INTO courses (title, description, topic, level)
VALUES
  ('AWS Certified Solutions Architect - Professional', 'Advanced AWS architecture design. Design complex, multi-account, global-scale applications.', 'Architecture', 'advanced'),
  ('AWS Certified DevOps Engineer - Professional', 'Master DevOps on AWS. CI/CD, infrastructure as code, monitoring, and automation at scale.', 'DevOps', 'advanced'),
  ('AWS Certified Generative AI Developer - Professional', 'Build generative AI applications on AWS. Learn LLMs, RAG, and foundation models.', 'Artificial Intelligence', 'advanced'),
  ('AWS Certified Security - Specialty', 'Master AWS security. IAM, encryption, compliance, incident response, and security best practices.', 'Security', 'advanced'),
  ('AWS Certified Advanced Networking - Specialty', 'Expert-level networking on AWS. VPC, routing, hybrid connectivity, and network optimization.', 'Networking', 'advanced'),
  ('AWS Certified Machine Learning - Specialty', 'Advanced ML concepts and implementation. Deep learning, feature engineering, and production ML.', 'Machine Learning', 'advanced');
