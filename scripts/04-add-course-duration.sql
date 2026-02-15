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
