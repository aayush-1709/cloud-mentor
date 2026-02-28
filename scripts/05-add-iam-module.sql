-- Add IAM module and submodules for AWS Certified Cloud Practitioner

WITH course_ref AS (
  SELECT id AS course_id
  FROM courses
  WHERE title = 'AWS Certified Cloud Practitioner'
  LIMIT 1
),
main_module AS (
  INSERT INTO lessons (course_id, title, content, estimated_duration, order_index, objectives)
  SELECT
    course_id,
    'Identity and Access Management (IAM)',
    'Master AWS IAM: users, groups, policies, roles, and best practices for secure cloud access control.',
    600,
    3,
    ARRAY[
      'Understand IAM fundamentals',
      'Manage users, groups, and roles',
      'Create and manage policies',
      'Implement least privilege'
    ]
  FROM course_ref
  RETURNING id, course_id
)
INSERT INTO lessons (course_id, parent_lesson_id, title, content, estimated_duration, order_index, objectives)
SELECT
  m.course_id,
  m.id,
  sub.title,
  sub.content,
  sub.estimated_duration,
  sub.order_index,
  sub.objectives
FROM main_module m
CROSS JOIN (
  VALUES
    ('Introduction to IAM', 'IAM fundamentals and architecture overview.', 60, 31, ARRAY['Understand IAM basics', 'Learn IAM architecture']::text[]),
    ('IAM Users', 'Create and manage IAM users, credentials, and MFA.', 75, 32, ARRAY['Create IAM users', 'Set up MFA']::text[]),
    ('IAM Groups', 'Use groups for scalable permission management.', 60, 33, ARRAY['Create groups', 'Attach policies to groups']::text[]),
    ('IAM Policies: Managed vs Custom', 'Understand policy types and JSON policy structure.', 90, 34, ARRAY['Understand policy types', 'Create custom policies']::text[]),
    ('IAM Roles', 'Use IAM roles, trust policies, and temporary credentials.', 90, 35, ARRAY['Create IAM roles', 'Understand trust policies']::text[]),
    ('Least Privilege Principle', 'Apply least privilege and reduce over-permissioning.', 80, 36, ARRAY['Design minimal permissions', 'Audit IAM access']::text[]),
    ('IAM Best Practices', 'Apply AWS IAM security and governance best practices.', 85, 37, ARRAY['Apply security best practices', 'Strengthen account security']::text[])
) AS sub(title, content, estimated_duration, order_index, objectives);
