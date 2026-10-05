-- Remove all demo/sample seed data from the database.
-- This deletes the fake teachers, resources, announcements, contributions, and suggestions
-- that were inserted by the seed migration. Subjects are kept since they define the
-- academic structure and are managed by the Admin.

-- Delete in dependency order to respect FK constraints

-- Subscriptions referencing demo teachers
DELETE FROM subscriptions
WHERE teacher_id IN (
  SELECT id FROM teachers
  WHERE id IN (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08'
  )
);

-- Questions referencing demo teachers
DELETE FROM questions
WHERE teacher_id IN (
  SELECT id FROM teachers
  WHERE id IN (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08'
  )
);

-- Announcements from demo teachers
DELETE FROM announcements
WHERE teacher_id IN (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05'
);

-- Teacher links for demo teachers
DELETE FROM teacher_links
WHERE teacher_id IN (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08'
);

-- Demo resources (topics)
DELETE FROM resources
WHERE id IN (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16'
);

-- Demo contributions
DELETE FROM contributions
WHERE student_name IN (
  'محمد العبدالله', 'فاطمة الزهراء', 'عبدالرحمن سالم',
  'نورة أحمد', 'خالد يوسف', 'سارة محمد'
);

-- Demo suggestions
DELETE FROM suggestions
WHERE message IN (
  'أتمنى إضافة قسم للتمارين المحلولة لكل مادة.',
  'إمكانية جدولة الدروس مسبقاً وعرضها في تقويم.',
  'البحث لا يجد بعض الدروس عند كتابة الكلمات بالتشكيل.',
  'إضافة دروس في الرياضيات للصف الثاني الثانوي.'
);

-- Demo teachers
DELETE FROM teachers
WHERE id IN (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08'
);

-- Reset followers_count on any remaining teachers to reflect actual subscriptions
UPDATE teachers SET followers_count = 0 WHERE followers_count > 0;
