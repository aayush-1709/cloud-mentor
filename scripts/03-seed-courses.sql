-- Seed demo AWS certification courses (only 3 for hackathon demo)
INSERT INTO courses (title, description, category, level)
VALUES
  ('AWS Certified Solutions Architect - Associate', 'Design secure, scalable, and cost-effective applications on AWS. Essential for solution architects.', 'Architecture', 'associate'),
  ('AWS Certified Cloud Practitioner', 'Foundational AWS certification covering core cloud concepts, services, and best practices. Perfect for beginners.', 'AWS Fundamentals', 'practitioner'),
  ('AWS Certified Solutions Architect - Professional', 'Advanced AWS architecture design. Design complex, multi-account, global-scale applications.', 'Architecture', 'advanced');
