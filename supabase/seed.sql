-- ====================================================================
-- AI CAMPUS EVENT ASSISTANT — SEED DEMONSTRATION DATA
-- Vision Builders | HACKSPACE Hackathon
-- ====================================================================

-- 1. SEED PROFILES (Demarcated as demonstration records)
INSERT INTO public.profiles (id, email, display_name, role, department, academic_year, student_id, interests)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'alex.student@campus.edu', 'Alex Rivera (Demo Student)', 'student', 'Computer Science & Engineering', '3rd Year', 'CS-2023-4091', ARRAY['AI/ML', 'Hackathons', 'Web Development']),
  ('00000000-0000-0000-0000-000000000002', 'sarah.admin@campus.edu', 'Dr. Sarah Jenkins (Demo Admin)', 'admin', 'Student Affairs & Innovation', 'Faculty Lead', 'FAC-2018-012', ARRAY['Event Operations', 'Innovation']),
  ('00000000-0000-0000-0000-000000000003', 'liam.chen@campus.edu', 'Liam Chen (Demo Student)', 'student', 'Electrical Engineering', '4th Year', 'EE-2022-1088', ARRAY['Robotics', 'Hardware', 'Sports']),
  ('00000000-0000-0000-0000-000000000004', 'priya.sharma@campus.edu', 'Priya Sharma (Demo Student)', 'student', 'Information Technology', '2nd Year', 'IT-2024-5521', ARRAY['UI/UX Design', 'Coding Competitions'])
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

-- 2. SEED EVENTS
INSERT INTO public.events (
  id, title, slug, description, category, poster_url, organizer_name, venue, 
  event_format, start_at, end_at, registration_deadline, capacity, registered_count,
  minimum_team_size, maximum_team_size, eligibility_rules, event_rules, status, created_by
) VALUES
(
  'e1000000-0000-0000-0000-000000000001',
  'HACKSPACE 2026: Campus AI & Systems Hackathon',
  'hackspace-2026-hackathon',
  'The flagship 36-hour inter-collegiate hackathon challenging student engineers to build high-impact autonomous systems, decentralized networks, and smart campus solutions.',
  'Hackathon',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  'Vision Builders Council',
  'Main Auditorium & Tech Complex Hall B',
  'in-person',
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '3 days',
  150, 42, 2, 4,
  'Enrolled undergraduate or postgraduate students with valid college ID.',
  'Teams must consist of 2 to 4 members. Pre-built code is strictly disallowed. Hardware tracks provided on-site.',
  'published',
  '00000000-0000-0000-0000-000000000002'
),
(
  'e1000000-0000-0000-0000-000000000002',
  'Advanced Cloud Architecture & Kubernetes Masterclass',
  'advanced-cloud-kubernetes-masterclass',
  'An intensive hands-on technical workshop covering modern microservices orchestration, service meshes, zero-trust container security, and GitOps pipelines.',
  'Technical Workshop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  'Campus Cloud Computing Club',
  'Computer Lab 402, Turing Science Block',
  'hybrid',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days' + INTERVAL '4 hours',
  NOW() + INTERVAL '1 day',
  60, 48, 1, 1,
  'Students with basic familiarity with Linux command line and Docker.',
  'Bring your own laptop with 8GB+ RAM. Cloud sandbox credits will be provisioned on entry.',
  'published',
  '00000000-0000-0000-0000-000000000002'
),
(
  'e1000000-0000-0000-0000-000000000003',
  'CodeCraft 2026: Speed Algorithm Championship',
  'codecraft-2026-speed-algo',
  'A high-octane 3-hour competitive programming sprint testing data structures, graph theory, dynamic programming, and numerical algorithms under strict execution constraints.',
  'Coding Competition',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  'ACM Student Chapter',
  'Virtual Online Judge Portal',
  'virtual',
  NOW() + INTERVAL '8 days',
  NOW() + INTERVAL '8 days' + INTERVAL '3 hours',
  NOW() + INTERVAL '6 days',
  200, 115, 1, 1,
  'All engineering and computing majors.',
  'Individual participation only. Webcams required for virtual proctoring. Plagiarism checks enforced via MOSS.',
  'published',
  '00000000-0000-0000-0000-000000000002'
),
(
  'e1000000-0000-0000-0000-000000000004',
  'NextGen AI & Ethics: Dean''s Leadership Seminar',
  'nextgen-ai-ethics-deans-seminar',
  'Keynote addresses and panel debates featuring industry research scientists discussing ethical boundaries, agentic safety, bias mitigation, and regulatory frontiers in computing.',
  'Seminar',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
  'Dean of Academic Affairs',
  'Saraswati Convention Center',
  'in-person',
  NOW() + INTERVAL '12 days',
  NOW() + INTERVAL '12 days' + INTERVAL '5 hours',
  NOW() + INTERVAL '10 days',
  300, 180, 1, 1,
  'Open to all campus departments and faculty members.',
  'Formal or smart-casual attire. Q&A session will follow keynote presentations.',
  'published',
  '00000000-0000-0000-0000-000000000002'
),
(
  'e1000000-0000-0000-0000-000000000005',
  'Vibrance 2026: Annual Inter-College Cultural Gala',
  'vibrance-2026-cultural-gala',
  'A magnificent 2-day festival celebrating music, theatrical arts, contemporary dance, acoustic performances, and university cultural diversity.',
  'Cultural Event',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  'Student Cultural Federation',
  'Open Air Amphitheatre',
  'in-person',
  NOW() + INTERVAL '20 days',
  NOW() + INTERVAL '22 days',
  NOW() + INTERVAL '15 days',
  800, 520, 1, 10,
  'All college students across accredited institutions.',
  'Valid physical college badge required at gates. Security guidelines apply.',
  'published',
  '00000000-0000-0000-0000-000000000002'
),
(
  'e1000000-0000-0000-0000-000000000006',
  'Titan Cup: Inter-Departmental 5v5 Futsal Tournament',
  'titan-cup-futsal-tournament',
  'Fast-paced indoor soccer tournament spanning 3 rounds of knockouts. Compete for the rolling trophy and department bragging rights.',
  'Sports Event',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  'Department of Physical Education',
  'Indoor Sports Arena Court 1 & 2',
  'in-person',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '16 days',
  NOW() + INTERVAL '10 days',
  32, 28, 5, 7,
  'Current students with sports clearance waiver on file.',
  'Standard FIFA futsal rules. Shin guards compulsory.',
  'published',
  '00000000-0000-0000-0000-000000000002'
),
(
  'e1000000-0000-0000-0000-000000000007',
  'Campus CleanTech & Sustainability Innovation Challenge',
  'cleantech-sustainability-challenge-2026',
  'Pitch prototype hardware and software solutions to reduce campus energy waste, optimize water recycling, and cut carbon footprints with $5,000 seed funding.',
  'Innovation Challenge',
  'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80',
  'Sustainability & Green Campus Initiative',
  'Innovation Hub Pitch Stage',
  'hybrid',
  NOW() + INTERVAL '25 days',
  NOW() + INTERVAL '26 days',
  NOW() + INTERVAL '18 days',
  50, 18, 2, 5,
  'Multidisciplinary student teams.',
  'Executive summary and prototype demonstration required at semifinal pitch.',
  'published',
  '00000000-0000-0000-0000-000000000002'
)
ON CONFLICT (slug) DO NOTHING;

-- 3. SEED SAMPLE REGISTRATIONS
INSERT INTO public.registrations (
  id, public_registration_id, event_id, user_id, registration_type, status, qr_payload, registered_at
) VALUES
(
  'r1000000-0000-0000-0000-000000000001',
  'ACE-2026-X89K2L',
  'e1000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'individual',
  'confirmed',
  'ACE-VERIFY:ACE-2026-X89K2L:e1000000-0000-0000-0000-000000000001:00000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '1 day'
),
(
  'r1000000-0000-0000-0000-000000000002',
  'ACE-2026-C44T9Q',
  'e1000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'individual',
  'confirmed',
  'ACE-VERIFY:ACE-2026-C44T9Q:e1000000-0000-0000-0000-000000000002:00000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '2 days'
),
(
  'r1000000-0000-0000-0000-000000000003',
  'ACE-2026-M71P3Z',
  'e1000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  'individual',
  'confirmed',
  'ACE-VERIFY:ACE-2026-M71P3Z:e1000000-0000-0000-0000-000000000003:00000000-0000-0000-0000-000000000003',
  NOW() - INTERVAL '3 days'
)
ON CONFLICT (public_registration_id) DO NOTHING;

-- 4. SEED SAMPLE NOTIFICATIONS
INSERT INTO public.notifications (user_id, title, message, notification_type, related_event_id, is_read)
VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Registration Confirmed!',
  'You have successfully registered for HACKSPACE 2026. Your digital participant pass is now ready.',
  'registration',
  'e1000000-0000-0000-0000-000000000001',
  false
),
(
  '00000000-0000-0000-0000-000000000001',
  'Workshop Sandbox Access Provisioned',
  'Your cloud sandbox credentials for the Kubernetes Masterclass are now assigned.',
  'general',
  'e1000000-0000-0000-0000-000000000002',
  true
);