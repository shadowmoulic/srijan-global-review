-- ==============================================================================
-- SRIJAN: Global Review of Arts, Science & Humanities
-- Supabase PostgreSQL Schema & Security Script (Idempotent / Clean Re-Creation)
-- Target Project Ref: qbgubcicjqkgowxgrmmp
-- ==============================================================================

-- DROP EXISTING TABLES & POLICIES IF THEY EXIST TO PREVENT COLUMN OR POLICY MISMATCHES
DROP TABLE IF EXISTS public.srijan_submissions CASCADE;
DROP TABLE IF EXISTS public.srijan_reviewers CASCADE;
DROP TABLE IF EXISTS public.srijan_contacts CASCADE;

-- 1. MANUSCRIPT SUBMISSIONS TABLE
CREATE TABLE public.srijan_submissions (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    email TEXT NOT NULL,
    institution TEXT,
    title TEXT NOT NULL,
    domain TEXT,
    type TEXT,
    abstract TEXT,
    file TEXT,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Screening',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. REVIEWER APPLICATIONS TABLE
CREATE TABLE public.srijan_reviewers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    institution TEXT,
    country TEXT,
    expertise TEXT,
    link TEXT,
    cv TEXT,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Pending Review',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EDITORIAL CONTACTS TABLE
CREATE TABLE public.srijan_contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Unread',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR CORE WEB VITALS & FAST QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_submissions_created ON public.srijan_submissions(created_at DESC);
CREATE INDEX idx_submissions_status ON public.srijan_submissions(status);
CREATE INDEX idx_submissions_email ON public.srijan_submissions(email);

CREATE INDEX idx_reviewers_created ON public.srijan_reviewers(created_at DESC);
CREATE INDEX idx_reviewers_status ON public.srijan_reviewers(status);

CREATE INDEX idx_contacts_created ON public.srijan_contacts(created_at DESC);
CREATE INDEX idx_contacts_status ON public.srijan_contacts(status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enables anonymous site visitors to submit & admin board to review/update
-- ==============================================================================

-- Submissions RLS
ALTER TABLE public.srijan_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to srijan_submissions"
    ON public.srijan_submissions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public select from srijan_submissions"
    ON public.srijan_submissions FOR SELECT
    USING (true);

CREATE POLICY "Allow public update to srijan_submissions"
    ON public.srijan_submissions FOR UPDATE
    USING (true);

-- Reviewers RLS
ALTER TABLE public.srijan_reviewers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to srijan_reviewers"
    ON public.srijan_reviewers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public select from srijan_reviewers"
    ON public.srijan_reviewers FOR SELECT
    USING (true);

CREATE POLICY "Allow public update to srijan_reviewers"
    ON public.srijan_reviewers FOR UPDATE
    USING (true);

-- Contacts RLS
ALTER TABLE public.srijan_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to srijan_contacts"
    ON public.srijan_contacts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public select from srijan_contacts"
    ON public.srijan_contacts FOR SELECT
    USING (true);

CREATE POLICY "Allow public update to srijan_contacts"
    ON public.srijan_contacts FOR UPDATE
    USING (true);

-- ==============================================================================
-- SEED INITIAL MOCK DATA (matching demo frontend state)
-- ==============================================================================
INSERT INTO public.srijan_submissions (id, title, author, email, institution, domain, type, abstract, date, status, file)
VALUES 
    ('SRJ-2026-8491', 'Cognitive Poetics and Spatial Metaphors in Arundhati Roy’s Fiction', 'Dr. Devika Sen', 'dsen@jnu.ac.in', 'Jawaharlal Nehru University', 'Literature', 'Research Article', 'This paper analyzes the spatial architectures in modern post-colonial Indian fiction, demonstrating how linguistic metaphors construct cognitive boundaries.', '2026-05-14', 'Under Review', 'Sen_Cognitive_Poetics.docx'),
    ('SRJ-2026-2310', 'Ethical Paradigms in Autonomous AI Agents: A Bioethical Assessment', 'Prof. Rajesh K. Varma', 'rvarma@iisc.ac.in', 'Indian Institute of Science', 'Interdisciplinary', 'Theoretical Review', 'An inquiry into the moral agency of autonomous algorithms operating in medical diagnostics, proposing a novel ethical governance framework.', '2026-05-16', 'Screening', 'Varma_AI_Bioethics.pdf')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.srijan_reviewers (id, name, email, institution, country, expertise, link, date, status, cv)
VALUES 
    ('REV-9012', 'Dr. Elena Rostova', 'e.rostova@sorbonne.fr', 'Sorbonne University', 'France', 'Comparative literature, Continental philosophy', 'https://orcid.org/0000-0002-1192-3341', '2026-05-15', 'Approved', 'Rostova_CV_2026.pdf')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.srijan_contacts (id, name, email, subject, message, date, status)
VALUES 
    ('MSG-4412', 'Dr. Vikramaditya Bose', 'vbose@caluniv.ac.in', 'Special Issue Proposal', 'Respected Editors, I am interested in guest editing a special issue on Digital Humanities in South Asia for Volume 2. Please advise on the formal proposal protocol.', '2026-05-17', 'Unread')
ON CONFLICT (id) DO NOTHING;
