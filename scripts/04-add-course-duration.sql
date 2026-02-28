-- Add sample lessons/modules for each course (estimated_duration is in minutes)
INSERT INTO lessons (course_id, title, content, estimated_duration, order_index, objectives)
SELECT id, 'Getting Started with AWS', 'Introduction to AWS cloud platform, account setup, and core concepts.', 120, 1, ARRAY['Understand AWS basics', 'Set up AWS account']
FROM courses WHERE title = 'AWS Certified Cloud Practitioner'
UNION ALL
SELECT id, 'AWS Core Services', 'Deep dive into EC2, S3, RDS, and Lambda.', 180, 2, ARRAY['Learn EC2 instances', 'Master S3 buckets', 'Understand RDS']
FROM courses WHERE title = 'AWS Certified Cloud Practitioner'
UNION ALL
SELECT id, 'Introduction to AI/ML on AWS', 'Overview of SageMaker and AWS AI services.', 150, 1, ARRAY['Understand AI concepts', 'Learn SageMaker basics']
FROM courses WHERE title = 'AWS Certified AI Practitioner'
UNION ALL
SELECT id, 'Architecture Fundamentals', 'Design principles and architectural patterns for AWS.', 200, 1, ARRAY['Learn design patterns', 'Understand scalability']
FROM courses WHERE title = 'AWS Certified Solutions Architect - Associate'
UNION ALL
SELECT id, 'Advanced Architecture', 'Complex multi-region and multi-account designs.', 300, 1, ARRAY['Master complex designs', 'Learn high availability']
FROM courses WHERE title = 'AWS Certified Solutions Architect - Professional';

-- Seed one starter assessment for demo flow
WITH selected_course AS (
  SELECT id AS course_id
  FROM courses
  WHERE title = 'AWS Certified Cloud Practitioner'
  LIMIT 1
),
new_assessment AS (
  INSERT INTO assessments (course_id, title, description, passing_score, time_limit_minutes)
  SELECT
    course_id,
    'Cloud Practitioner Fundamentals Quiz',
    'Quick check on core AWS foundation concepts.',
    70,
    20
  FROM selected_course
  RETURNING id
),
q1 AS (
  INSERT INTO quiz_questions (assessment_id, question_text, question_type, order_index)
  SELECT id, 'Which AWS service is object storage?', 'multiple_choice', 1
  FROM new_assessment
  RETURNING id
),
q2 AS (
  INSERT INTO quiz_questions (assessment_id, question_text, question_type, order_index)
  SELECT id, 'What is IAM primarily used for?', 'multiple_choice', 2
  FROM new_assessment
  RETURNING id
)
INSERT INTO quiz_options (question_id, option_text, is_correct, order_index)
SELECT id, 'Amazon S3', true, 1 FROM q1
UNION ALL
SELECT id, 'Amazon EC2', false, 2 FROM q1
UNION ALL
SELECT id, 'Amazon RDS', false, 3 FROM q1
UNION ALL
SELECT id, 'Managing AWS access permissions', true, 1 FROM q2
UNION ALL
SELECT id, 'Deploying containers', false, 2 FROM q2
UNION ALL
SELECT id, 'Streaming logs', false, 3 FROM q2;
