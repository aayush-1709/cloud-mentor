-- Add IAM module as a lesson to AWS Certified Cloud Practitioner course
-- First, get the AWS Cloud Practitioner course ID and add IAM lesson

INSERT INTO lessons (course_id, title, content, estimated_duration, order_index, objectives)
SELECT 
  id,
  'Identity and Access Management (IAM)',
  'Master AWS IAM: Users, Groups, Policies, Roles, and best practices for secure cloud access control. Learn to implement least privilege principle and prevent common security misconfiguration.',
  600,
  3,
  ARRAY[
    'Understand IAM fundamentals',
    'Manage users, groups, and roles',
    'Create and manage policies',
    'Implement least privilege principle',
    'Apply IAM security best practices',
    'Identify and prevent IAM security risks'
  ]
FROM courses 
WHERE title = 'AWS Certified Cloud Practitioner'
RETURNING id;

-- Now add sub-lessons for IAM module
-- We''ll add these as separate lessons that belong to the IAM lesson (parent)
-- Since lessons table may not have parent_lesson_id, we''ll add them sequentially

INSERT INTO lessons (course_id, title, content, estimated_duration, order_index, objectives)
SELECT 
  id,
  'Introduction to IAM',
  'Learn what IAM is, why it''s critical, and how it enables secure access management in AWS. Understand the IAM architecture, authentication vs authorization, and basic concepts.',
  60,
  3.1,
  ARRAY['Understand IAM basics', 'Learn IAM architecture', 'Understand authentication vs authorization']
FROM courses 
WHERE title = 'AWS Certified Cloud Practitioner';

INSERT INTO lessons (course_id, title, content, estimated_duration, order_index, objectives)
SELECT 
  id,
  'IAM Users',
  'Create and manage IAM users, understand access keys, console password, and multi-factor authentication. Learn user lifecycle management and best practices for user creation.',
  75,
  3.2,
  ARRAY['Create IAM users', 'Manage access keys', 'Set up MFA', 'Understand user lifecycle']
FROM courses 
WHERE title = 'AWS Certified Cloud Practitioner';

INSERT INTO lessons (course_id, title, content, estimated_duration, order_index, objectives)
SELECT 
  id,
  'IAM Groups',
  'Organize users into groups, attach policies to groups, and manage group membership. Learn to efficiently manage permissions for multiple users through group-based access control.',
  60,
  3.3,
  ARRAY['Create and manage groups', 'Attach policies to groups', 'Manage group membership', 'Apply group-based access control']
FROM courses 
WHERE title = 'AWS Certified Cloud Practitioner';

INSERT INTO lessons (course_id, title, content, estimated_duration, order_index, objectives)
SELECT 
  id,
  'IAM Policies: Managed vs Custom',
  'Understand AWS Managed Policies, Customer Managed Policies, and Inline Policies. Learn policy structure, JSON syntax, and when to use each type. Deep dive into policy examples.',
  90,
  3.4,
  ARRAY['Understand policy types', 'Read policy JSON', 'Create custom policies', 'Apply managed policies', 'Use inline policies appropriately']
FROM courses 
WHERE title = 'AWS Certified Cloud Practitioner';

INSERT INTO lessons (course_id, title, content, estimated_duration, order_index, objectives)
SELECT 
  id,
  'IAM Roles',
  'Understand IAM roles and when to use them instead of users. Learn role creation, service principals, trust policies, and cross-account access. Understand federation and temporary credentials.',
  90,
  3.5,
  ARRAY['Create IAM roles', 'Understand service principals', 'Configure cross-account access', 'Use temporary credentials', 'Implement federation']
FROM courses 
WHERE title = 'AWS Certified Cloud Practitioner';

INSERT INTO lessons (course_id, title, content, estimated_duration, order_index, objectives)
SELECT 
  id,
  'Trust Relationships',
  'Master trust relationships and trust policies in IAM roles. Learn how to grant permissions to other AWS accounts, external identities, and services. Understand assume role operations.',
  75,
  3.6,
  ARRAY['Understand trust relationships', 'Create trust policies', 'Configure assume role permissions', 'Implement cross-account trusts']
FROM courses 
WHERE title = 'AWS Certified Cloud Practitioner';

INSERT INTO lessons (course_id, title, content, estimated_duration, order_index, objectives)
SELECT 
  id,
  'Least Privilege Principle',
  'Learn the principle of least privilege and its implementation in AWS. Understand how to design permissions that give minimum necessary access, audit policies, and detect over-privileged accounts.',
  80,
  3.7,
  ARRAY['Understand least privilege', 'Design minimal permissions', 'Audit IAM policies', 'Use access analyzer', 'Implement permission boundaries']
FROM courses 
WHERE title = 'AWS Certified Cloud Practitioner';

INSERT INTO lessons (course_id, title, content, estimated_duration, order_index, objectives)
SELECT 
  id,
  'IAM Best Practices',
  'Implement AWS-recommended IAM best practices including: using root account only for billing, enabling MFA, rotating access keys, using roles instead of users, auditing with CloudTrail, and tagging strategies.',
  85,
  3.8,
  ARRAY['Apply security best practices', 'Use CloudTrail for auditing', 'Implement MFA everywhere', 'Rotate credentials', 'Use tags for organization']
FROM courses 
WHERE title = 'AWS Certified Cloud Practitioner';

INSERT INTO lessons (course_id, title, content, estimated_duration, order_index, objectives)
SELECT 
  id,
  'IAM Security Risks & Misconfiguration',
  'Identify common IAM security risks and misconfigurations: overly permissive policies, exposed access keys, unused credentials, weak passwords. Learn detection methods and remediation strategies.',
  75,
  3.9,
  ARRAY['Identify security risks', 'Detect misconfigurations', 'Audit permissions', 'Remediate security issues', 'Prevent credential exposure']
FROM courses 
WHERE title = 'AWS Certified Cloud Practitioner';
