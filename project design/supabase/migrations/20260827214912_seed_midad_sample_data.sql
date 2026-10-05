/*
# Seed MIDAD database with sample data

## Overview
Populates all tables with the realistic Arabic sample data currently used in the app's
sampleData.ts file. This includes:
- 12 subjects (Quran through English)
- 8 volunteer teachers with external links
- 16 educational resources across subjects
- 4 teacher announcements
- 6 student contributions in various moderation states
- 4 user suggestions

## Notes
- All data is clearly demo/sample data for the prototype.
- Teachers are assigned fixed UUIDs (t1-t8) so resources and announcements can reference them.
- Resource author names match teacher names for consistency.
*/

-- ============================================================
-- 1. SUBJECTS
-- ============================================================
INSERT INTO subjects (id, name, name_en, description, icon, color, sort_order) VALUES
  ('quran', 'القرآن', 'Quran', 'تلاوات، أحكام التجويد، وتفسير الآيات.', 'BookOpen', 'ink', 1),
  ('islamic', 'التربية الإسلامية', 'Islamic Education', 'العقيدة، الفقه، والسيرة النبوية.', 'Moon', 'ink', 2),
  ('arabic', 'اللغة العربية', 'Arabic Language', 'النحو، البلاغة، الأدب، والإنشاء.', 'PenLine', 'gold', 3),
  ('math', 'الرياضيات', 'Mathematics', 'الجبر، الهندسة، التفاضل، والإحصاء.', 'Sigma', 'ink', 4),
  ('physics', 'الفيزياء', 'Physics', 'الميكانيك، الكهرباء، والموجات.', 'Atom', 'sage', 5),
  ('biology', 'الأحياء', 'Biology', 'الخلية، الوراثة، والأجهزة الحية.', 'Dna', 'sage', 6),
  ('chemistry', 'الكيمياء', 'Chemistry', 'الروابط، التفاعلات، والكيمياء العضوية.', 'FlaskConical', 'gold', 7),
  ('computer', 'الحاسوب', 'Computer Science', 'البرمجة، الخوارزميات، والذكاء الاصطناعي.', 'Cpu', 'ink', 8),
  ('geography', 'الجغرافيا', 'Geography', 'الخرائط، المناخ، والموارد الطبيعية.', 'Globe2', 'sage', 9),
  ('history', 'التاريخ', 'History', 'الحضارات، الأنظمة، والوقائع الكبرى.', 'ScrollText', 'gold', 10),
  ('society', 'المجتمع', 'Social Studies', 'المواطنة، الاقتصاد، والقضايا الاجتماعية.', 'Users', 'sage', 11),
  ('english', 'اللغة الإنجليزية', 'English Language', 'القواعد، المفردات، والقراءة.', 'Languages', 'ink', 12)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order;

-- ============================================================
-- 2. TEACHERS (with fixed UUIDs for referential integrity)
-- ============================================================
INSERT INTO teachers (id, name, subject_id, bio, avatar_initials, questions_open, followers_count) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'أ. أحمد محمد', 'math', 'معلم متطوع يساعد الطلاب على فهم الرياضيات بطريقة أبسط وأكثر وضوحاً.', 'أم', true, 342),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'أ. سارة العلي', 'physics', 'شرح فيزياء مبسّط مع تركيز على الفهم لا الحفظ، وأمثلة من الحياة اليومية.', 'سع', true, 287),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'أ. خالد إبراهيم', 'chemistry', 'كيمياء تفاعلية وتطبيقية، مع ملخصات بصرية لكل فصل.', 'خإ', false, 198),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'أ. ليلى حسن', 'biology', 'أحياء بأسلوب قصصي يربط المفاهيم بالجسم الإنساني والطبيعة.', 'لح', true, 231),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'أ. عمر فاروق', 'arabic', 'نحو وبلاغة بطرق مبتكرة، مع تدريب مكثف على الإنشاء.', 'عف', true, 415),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'أ. مريم ناصر', 'english', 'إتقان الإنجليزية خطوة بخطوة: قواعد، مفردات، ومهارات قراءة.', 'من', false, 176),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'أ. يوسف كمال', 'computer', 'مقدمة في البرمجة والذكاء الاصطناعي للطلاب المهتمين بالتقنية.', 'يك', true, 154),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'أ. نور الهدى', 'history', 'التاريخ كقصة متصلة، لا مجرد تواريخ وأسماء.', 'نه', false, 132)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subject_id = EXCLUDED.subject_id,
  bio = EXCLUDED.bio,
  avatar_initials = EXCLUDED.avatar_initials,
  questions_open = EXCLUDED.questions_open,
  followers_count = EXCLUDED.followers_count;

-- ============================================================
-- 3. TEACHER_LINKS
-- ============================================================
INSERT INTO teacher_links (teacher_id, label, link_type, url, sort_order) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Telegram', 'telegram', '#', 1),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'WhatsApp', 'whatsapp', '#', 2),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Telegram', 'telegram', '#', 1),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Telegram', 'telegram', '#', 1),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Telegram', 'telegram', '#', 1),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'WhatsApp', 'whatsapp', '#', 2),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'Telegram', 'telegram', '#', 1),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'Telegram', 'telegram', '#', 1),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'Telegram', 'telegram', '#', 1),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'Telegram', 'telegram', '#', 1)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. RESOURCES
-- ============================================================
INSERT INTO resources (id, subject_id, teacher_id, title, lesson, type, author, description, status, created_at) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'physics', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'قوانين نيوتن للحركة', 'الديناميكا', 'summary', 'أ. سارة العلي', 'ملخص شامل لقوانين نيوتن الثلاثة مع أمثلة محلولة.', 'approved', '2026-08-20T00:00:00Z'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'physics', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'الحركة المستقيمة المنتظمة', 'الكينماتيكا', 'lesson', 'أ. سارة العلي', 'شرح مفصل لمفاهيم الإزاحة والسرعة والتسارع.', 'approved', '2026-08-18T00:00:00Z'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'physics', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'تجربة البندول البسيط', 'الحركة الدورانية', 'video', 'أ. سارة العلي', 'فيديو عملي يوضح حساب فترة تأرجح البندول.', 'approved', '2026-08-15T00:00:00Z'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'math', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'قوانين الاشتقاق', 'التفاضل', 'summary', 'أ. أحمد محمد', 'قواعد الاشتقاق الأساسية مع تمارين متنوعة.', 'approved', '2026-08-22T00:00:00Z'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'math', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'حل المعادلات التربيعية', 'الجبر', 'lesson', 'أ. أحمد محمد', 'طرق حل المعادلات من الدرجة الثانية بالتفصيل.', 'approved', '2026-08-19T00:00:00Z'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'math', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'نظرية فيثاغورس', 'الهندسة', 'presentation', 'أ. أحمد محمد', 'عرض تقديمي تفاعلي يشرح النظرية وتطبيقاتها.', 'approved', '2026-08-14T00:00:00Z'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'biology', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'الانقسام المتساوي', 'الخلية', 'summary', 'أ. ليلى حسن', 'مراحل الانقسام الخلوي مع رسوم توضيحية.', 'approved', '2026-08-21T00:00:00Z'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'biology', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'الحمض النووي DNA', 'الوراثة', 'lesson', 'أ. ليلى حسن', 'بنية الحمض النووي ووظائفه في نقل الصفات الوراثية.', 'approved', '2026-08-17T00:00:00Z'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'chemistry', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'الروابط الأيونية', 'الروابط الكيميائية', 'summary', 'أ. خالد إبراهيم', 'كيف تتكون الروابط الأيونية وأمثلة من الحياة.', 'approved', '2026-08-16T00:00:00Z'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'arabic', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'أنواع الخبر في الجملة الاسمية', 'النحو', 'summary', 'أ. عمر فاروق', 'تصنيفات الخبر وأحكامه النحوية مع أمثلة.', 'approved', '2026-08-23T00:00:00Z'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'arabic', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'البلاغة في الشعر الجاهلي', 'الأدب', 'presentation', 'أ. عمر فاروق', 'عرض تقديمي يستعرض أبرز الصور البلاغية.', 'approved', '2026-08-12T00:00:00Z'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'english', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'Present Perfect Tense', 'Tenses', 'lesson', 'أ. مريم ناصر', 'شرح زمن المضارع التام مع أمثلة عملية.', 'approved', '2026-08-20T00:00:00Z'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'computer', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'مقدمة في الخوارزميات', 'أساسيات البرمجة', 'lesson', 'أ. يوسف كمال', 'مفهوم الخوارزمية وخصائصها مع أمثلة بسيطة.', 'approved', '2026-08-21T00:00:00Z'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'computer', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'أساسيات الذكاء الاصطناعي', 'الذكاء الاصطناعي', 'presentation', 'أ. يوسف كمال', 'مدخل إلى مفهوم الذكاء الاصطناعي وتطبيقاته.', 'approved', '2026-08-18T00:00:00Z'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'history', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'الحضارة المصرية القديمة', 'الحضارات', 'summary', 'أ. نور الهدى', 'ملخص عن أبرز معالم الحضارة المصرية القديمة.', 'approved', '2026-08-13T00:00:00Z'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'quran', NULL, 'أحكام النون الساكنة والتنوين', 'التجويد', 'summary', 'فريق مِداد', 'الإظهار، الإدغام، الإقلاب، والإخفاء مع أمثلة.', 'approved', '2026-08-10T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  lesson = EXCLUDED.lesson,
  type = EXCLUDED.type,
  author = EXCLUDED.author,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- ============================================================
-- 5. ANNOUNCEMENTS
-- ============================================================
INSERT INTO announcements (teacher_id, title, body, scheduled_date, scheduled_time, link_label, link_url) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'شرح درس قوانين الاشتقاق اليوم', 'سيتم شرح الدرس عبر Telegram. سنبدأ من القواعد الأساسية ثم ننتقل إلى تمارين تطبيقية.', '2026-08-27', '7:00 مساءً', 'الانضمام للدرس', '#'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'مراجعة شاملة قبل الاختبار', 'جلسة مراجعة لكل ما درسناه في الديناميكا، مع حل أسئلة نموذجية.', '2026-08-28', '6:30 مساءً', 'الانضمام للجلسة', '#'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'ورشة كتابة إنشاء', 'ورشة تفاعلية لتحسين مهارات الكتابة الإبداعية لدى الطلاب.', '2026-08-29', '5:00 مساءً', 'التسجيل في الورشة', '#'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'أسئلة وأجوبة مفتوحة', 'الأسئلة مفتوحة الآن — اطرح أي سؤال حول درس الانقسام المتساوي وسأجيب عليه.', '2026-08-26', '8:00 مساءً', NULL, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. CONTRIBUTIONS
-- ============================================================
INSERT INTO contributions (student_name, email, subject_id, lesson, content_type, description, file_name, status, review_note, created_at) VALUES
  ('محمد العبدالله', 'm***@example.com', 'physics', 'قوانين نيوتن', 'summary', 'ملخص مرتب بجداول يسهل المراجعة قبل الاختبار.', 'newton-laws-summary.pdf', 'pending', NULL, '2026-08-25T00:00:00Z'),
  ('فاطمة الزهراء', 'f***@example.com', 'math', 'التفاضل', 'presentation', 'عرض تقديمي يشرح قواعد الاشتقاق بالصور.', 'derivatives-slides.pptx', 'pending', NULL, '2026-08-24T00:00:00Z'),
  ('عبدالرحمن سالم', 'a***@example.com', 'biology', 'الوراثة', 'file', 'ملف مرجعي يحتوي على رسم تخطيطي للحمض النووي.', 'dna-diagram.png', 'pending', NULL, '2026-08-23T00:00:00Z'),
  ('نورة أحمد', 'n***@example.com', 'arabic', 'البلاغة', 'video', 'فيديو قصير يشرح الاستعارة المكنية.', 'metaphor-explainer.mp4', 'approved', NULL, '2026-08-22T00:00:00Z'),
  ('خالد يوسف', 'k***@example.com', 'chemistry', 'الروابط', 'summary', 'ملخص يركز على الفرق بين الروابط الأيونية والتساهمية.', 'bonds-summary.pdf', 'rejected', 'المحتوى لا يتوافق مع الموضوع المحدد.', '2026-08-20T00:00:00Z'),
  ('سارة محمد', 's***@example.com', 'english', 'Tenses', 'summary', 'جدول مرئي لكل الأزمنة مع أمثلة.', 'tenses-chart.pdf', 'changes_requested', 'يرجى إضافة أمثلة بالعربية لتوضيح الفروق.', '2026-08-19T00:00:00Z')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. SUGGESTIONS
-- ============================================================
INSERT INTO suggestions (name, email, type, message, status, created_at) VALUES
  ('طالب مجهول', NULL, 'اقتراح ميزة', 'أتمنى إضافة قسم للتمارين المحلولة لكل مادة.', 'new', '2026-08-25T00:00:00Z'),
  ('أ. أحمد', 'a***@example.com', 'اقتراح متعلق بالمعلمين', 'إمكانية جدولة الدروس مسبقاً وعرضها في تقويم.', 'new', '2026-08-24T00:00:00Z'),
  (NULL, NULL, 'مشكلة', 'البحث لا يجد بعض الدروس عند كتابة الكلمات بالتشكيل.', 'read', '2026-08-23T00:00:00Z'),
  ('ليلى', 'l***@example.com', 'اقتراح محتوى', 'إضافة دروس في الرياضيات للصف الثاني الثانوي.', 'resolved', '2026-08-22T00:00:00Z')
ON CONFLICT DO NOTHING;
