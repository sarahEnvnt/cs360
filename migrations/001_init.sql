-- ============================================
-- CS360 - Customer Success Platform
-- Consolidated Database Migration
-- ============================================
-- Combines:
--   1. cs360_schema.sql        (base tables, views, triggers, sample data)
--   2. cs360_schema_auth.sql   (add password_hash to users)
--   3. cs360_schema_permissions.sql (add permissions JSONB to users)
--   4. cs360_schema_assignee.sql   (add assignee_id to accounts, recreate views)
--   5. cs360_rename_pipeline_leads.sql (rename pipeline→leads, recreate views)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ACCOUNTS
-- ============================================
CREATE TABLE accounts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    name_ar         VARCHAR(255),
    sector          VARCHAR(100),
    ministry        VARCHAR(255),
    summary         TEXT,
    challenges      TEXT,
    alliances       TEXT,
    notes           TEXT,
    status          VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'churned')),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_accounts_sector ON accounts(sector);

-- ============================================
-- 2. STAKEHOLDERS
-- ============================================
CREATE TABLE stakeholders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    title           VARCHAR(255),
    role            VARCHAR(10) CHECK (role IN ('DM', 'REC', 'INF', 'CHM')),
    influence       INTEGER CHECK (influence BETWEEN 0 AND 10),
    sentiment       VARCHAR(20) CHECK (sentiment IN ('champion', 'positive', 'neutral', 'unknown', 'negative')),
    friend_foe      VARCHAR(20) CHECK (friend_foe IN ('Friend', 'Neutral', 'Foe', 'Unknown')),
    contacts        TEXT,
    last_meeting    DATE,
    notes           TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stakeholders_account ON stakeholders(account_id);
CREATE INDEX idx_stakeholders_role ON stakeholders(role);

-- ============================================
-- 3. PROJECTS
-- ============================================
CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(50) CHECK (type IN ('FM', 'CR', 'License', 'Extension', 'New', 'Strategy', 'Other')),
    status          VARCHAR(50) DEFAULT 'leads' CHECK (status IN ('active', 'leads', 'exploration', 'completed')),
    budget          DECIMAL(15, 2) DEFAULT 0,
    currency        VARCHAR(10) DEFAULT 'SAR',
    timeframe       VARCHAR(100),
    progress        INTEGER CHECK (progress BETWEEN 0 AND 100),
    probability     INTEGER CHECK (probability BETWEEN 0 AND 100),
    stakeholder     VARCHAR(255),
    vendor          VARCHAR(255),
    competitors     TEXT,
    notes           TEXT,
    start_date      DATE,
    end_date        DATE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_account ON projects(account_id);
CREATE INDEX idx_projects_status ON projects(status);

-- ============================================
-- 4. ACTIVITIES
-- ============================================
CREATE TABLE activities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(50) CHECK (type IN ('Meeting', 'Call', 'Workshop', 'Presentation', 'Email', 'Follow-up', 'Review', 'Other')),
    date            DATE,
    priority        VARCHAR(20) CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    status          VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'upcoming', 'in_progress', 'done', 'overdue')),
    representative  VARCHAR(255),
    role            VARCHAR(255),
    notes           TEXT,
    outcome         TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_account ON activities(account_id);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_date ON activities(date);
CREATE INDEX idx_activities_priority ON activities(priority);

-- ============================================
-- 5. SURVEYS
-- ============================================
CREATE TABLE surveys (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. SURVEY QUESTIONS
-- ============================================
CREATE TABLE survey_questions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id       UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    question_text   TEXT NOT NULL,
    question_type   VARCHAR(50) CHECK (question_type IN ('rating', 'nps', 'csat', 'text', 'single_choice', 'multi_choice')),
    options         JSONB,
    sort_order      INTEGER DEFAULT 0,
    is_required     BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_survey_questions_survey ON survey_questions(survey_id);

-- ============================================
-- 7. SURVEY RESPONSES
-- ============================================
CREATE TABLE survey_responses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    survey_id       UUID REFERENCES surveys(id) ON DELETE SET NULL,
    survey_name     VARCHAR(255),
    respondent      VARCHAR(255),
    date            DATE,
    csat            INTEGER CHECK (csat BETWEEN 0 AND 100),
    nps             INTEGER CHECK (nps BETWEEN 0 AND 10),
    satisfaction    VARCHAR(50) CHECK (satisfaction IN ('Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied')),
    service_quality VARCHAR(50) CHECK (service_quality IN ('Excellent', 'Good', 'Average', 'Poor')),
    recommend       VARCHAR(50) CHECK (recommend IN ('Definitely', 'Probably', 'Not Sure', 'Probably Not', 'Definitely Not')),
    feedback        TEXT,
    answers         JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_responses_account ON survey_responses(account_id);
CREATE INDEX idx_responses_date ON survey_responses(date);
CREATE INDEX idx_responses_survey ON survey_responses(survey_id);

-- ============================================
-- 8. HEALTH SCORES
-- ============================================
CREATE TABLE health_scores (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id              UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    product_adoption        INTEGER DEFAULT 0 CHECK (product_adoption BETWEEN 0 AND 100),
    stakeholder_engagement  INTEGER DEFAULT 0 CHECK (stakeholder_engagement BETWEEN 0 AND 100),
    support_satisfaction    INTEGER DEFAULT 0 CHECK (support_satisfaction BETWEEN 0 AND 100),
    renewal_likelihood      INTEGER DEFAULT 0 CHECK (renewal_likelihood BETWEEN 0 AND 100),
    expansion_potential     INTEGER DEFAULT 0 CHECK (expansion_potential BETWEEN 0 AND 100),
    strategic_alignment     INTEGER DEFAULT 0 CHECK (strategic_alignment BETWEEN 0 AND 100),
    overall_score           INTEGER GENERATED ALWAYS AS (
        (product_adoption + stakeholder_engagement + support_satisfaction +
         renewal_likelihood + expansion_potential + strategic_alignment) / 6
    ) STORED,
    assessed_by             VARCHAR(255),
    notes                   TEXT,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_health_account ON health_scores(account_id);
CREATE INDEX idx_health_created ON health_scores(created_at DESC);

-- ============================================
-- 9. USERS (with auth and permissions columns)
-- ============================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    role            VARCHAR(50) DEFAULT 'csm' CHECK (role IN ('admin', 'manager', 'csm', 'viewer')),
    is_active       BOOLEAN DEFAULT TRUE,
    password_hash   VARCHAR(255),
    permissions     JSONB DEFAULT '["dashboard","accounts","surveys","reports"]',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. ACTIVITY LOG
-- ============================================
CREATE TABLE activity_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id),
    account_id      UUID REFERENCES accounts(id) ON DELETE CASCADE,
    action          VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID,
    details         JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_log_account ON activity_log(account_id);
CREATE INDEX idx_log_created ON activity_log(created_at DESC);

-- ============================================
-- Add assignee_id to accounts (from assignee migration)
-- ============================================
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_accounts_assignee ON accounts(assignee_id);

-- ============================================
-- VIEWS
-- ============================================

-- Latest health score per account
CREATE VIEW v_latest_health AS
SELECT DISTINCT ON (account_id) *
FROM health_scores
ORDER BY account_id, created_at DESC;

-- Account summary view (final version with assignee + leads rename)
CREATE VIEW v_account_summary AS
SELECT
    a.id, a.name, a.name_ar, a.sector, a.ministry, a.summary, a.created_at,
    a.assignee_id,
    u.name AS assignee_name,
    COALESCE(lh.overall_score, 0) AS health_score,
    (SELECT COUNT(*) FROM stakeholders s WHERE s.account_id = a.id) AS stakeholders_count,
    (SELECT COUNT(*) FROM projects p WHERE p.account_id = a.id AND p.status = 'active') AS active_projects,
    (SELECT COUNT(*) FROM projects p WHERE p.account_id = a.id AND p.status IN ('leads', 'exploration')) AS pipeline_projects,
    (SELECT COUNT(*) FROM survey_responses sr WHERE sr.account_id = a.id) AS survey_responses_count,
    (SELECT COALESCE(SUM(budget), 0) FROM projects p WHERE p.account_id = a.id AND p.status = 'active') AS active_revenue,
    (SELECT COALESCE(SUM(budget), 0) FROM projects p WHERE p.account_id = a.id AND p.status IN ('leads', 'exploration')) AS pipeline_value,
    (SELECT ROUND(
        (COUNT(*) FILTER (WHERE sr.nps >= 9) - COUNT(*) FILTER (WHERE sr.nps <= 6))::numeric
        / NULLIF(COUNT(*) FILTER (WHERE sr.nps IS NOT NULL), 0) * 100
    ) FROM survey_responses sr WHERE sr.account_id = a.id) AS nps_score
FROM accounts a
LEFT JOIN v_latest_health lh ON lh.account_id = a.id
LEFT JOIN users u ON u.id = a.assignee_id
ORDER BY a.name;

-- Executive dashboard KPIs (final version with leads rename)
CREATE VIEW v_executive_kpis AS
SELECT
    (SELECT COUNT(*) FROM accounts) AS total_accounts,
    (SELECT COUNT(*) FROM accounts a JOIN v_latest_health lh ON lh.account_id = a.id WHERE lh.overall_score >= 80) AS healthy_accounts,
    (SELECT COUNT(*) FROM accounts a JOIN v_latest_health lh ON lh.account_id = a.id WHERE lh.overall_score >= 60 AND lh.overall_score < 80) AS attention_accounts,
    (SELECT COUNT(*) FROM accounts a JOIN v_latest_health lh ON lh.account_id = a.id WHERE lh.overall_score < 60) AS risk_accounts,
    (SELECT COUNT(*) FROM projects WHERE status = 'active') AS active_projects_count,
    (SELECT COALESCE(SUM(budget), 0) FROM projects WHERE status = 'active') AS total_active_revenue,
    (SELECT COALESCE(SUM(budget), 0) FROM projects WHERE status IN ('leads', 'exploration')) AS total_pipeline;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_accounts_updated BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_stakeholders_updated BEFORE UPDATE ON stakeholders FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_activities_updated BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Sample account (SAIS)
INSERT INTO accounts (id, name, name_ar, sector, ministry, summary, challenges, alliances)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Supreme Authority for Industrial Security (SAIS)',
    'الهيئة العليا للأمن الصناعي',
    'Government',
    'Ministry of Interior',
    'جهة أمنية تابعة لوزارة الداخلية السعودية، مسؤولة عن تنظيم وحماية المنشآت الصناعية الحيوية في المملكة',
    'Development process takes a lot of time, Late responses from stakeholders',
    'Presidency of State Security (PSS), Civil Defense, National Cybersecurity Authority (NCA), Ministry of Energy'
);

-- Stakeholders
INSERT INTO stakeholders (account_id, name, title, role, influence, sentiment, friend_foe) VALUES
('a0000000-0000-0000-0000-000000000001', 'Aali AlZahrani', 'Governor', 'DM', 10, 'neutral', 'Neutral'),
('a0000000-0000-0000-0000-000000000001', 'Ibrahim Al Abu Essa', 'Director General', 'DM', 9, 'positive', 'Friend'),
('a0000000-0000-0000-0000-000000000001', 'Ammar', 'Assistant Governor', 'INF', 8, 'champion', 'Friend'),
('a0000000-0000-0000-0000-000000000001', 'Dr. Mohammed AlSaeed', 'Tech Consultant', 'INF', 5, 'unknown', 'Unknown'),
('a0000000-0000-0000-0000-000000000001', 'Ahmed Ghalib', 'Project Manager', 'REC', 3, 'champion', 'Friend');

-- Projects (using 'leads' instead of 'pipeline')
INSERT INTO projects (account_id, name, type, status, budget, timeframe, progress, stakeholder) VALUES
('a0000000-0000-0000-0000-000000000001', 'OS FWA', 'FM', 'active', 15353650.00, '12 months', 65, 'Ibrahim Al Abu Essa'),
('a0000000-0000-0000-0000-000000000001', 'Change Requests', 'CR', 'active', 1630125.00, '750 days', 40, 'Ahmed Ghalib'),
('a0000000-0000-0000-0000-000000000001', 'HCIS License Renewal', 'License', 'active', 2658484.01, '12 months', 80, 'Ibrahim Al Abu Essa'),
('a0000000-0000-0000-0000-000000000001', 'HCIS Additional 209 Days', 'Extension', 'active', 586454.00, '209 days', 55, 'Ahmed Ghalib'),
('a0000000-0000-0000-0000-000000000001', 'OS Renewal FWA', 'FM', 'leads', 24000000.00, NULL, NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'HCIS Enhancement', 'New', 'leads', 8000000.00, NULL, NULL, NULL),
('a0000000-0000-0000-0000-000000000001', 'Full Strategy (Data, AI)', 'Strategy', 'exploration', NULL, NULL, NULL, NULL);

-- Health score
INSERT INTO health_scores (account_id, product_adoption, stakeholder_engagement, support_satisfaction, renewal_likelihood, expansion_potential, strategic_alignment)
VALUES ('a0000000-0000-0000-0000-000000000001', 68, 72, 85, 70, 60, 78);

-- Activities
INSERT INTO activities (account_id, name, type, date, priority, status, representative, role) VALUES
('a0000000-0000-0000-0000-000000000001', 'AI Opportunities Discussion', 'Meeting', '2025-03-01', 'high', 'planned', 'CS Team', 'Lead'),
('a0000000-0000-0000-0000-000000000001', 'Develop Roadmap with Strategy Team', 'Workshop', '2025-03-10', 'high', 'planned', 'CS Team', 'Facilitator'),
('a0000000-0000-0000-0000-000000000001', 'Steering Committee', 'Presentation', '2025-03-20', 'critical', 'planned', 'CS Team', 'Presenter');

-- Survey response
INSERT INTO survey_responses (account_id, survey_name, respondent, date, csat, nps, satisfaction, feedback)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Q1 2025 Satisfaction Survey', 'Ahmed Ghalib', '2025-02-15', 80, 8, 'Satisfied', 'Good overall service, need faster response times');

-- Admin user (password: admin123)
INSERT INTO users (email, name, role, password_hash, permissions)
VALUES ('admin@cs360.local', 'Admin', 'admin', '$2a$12$JAA2M4FTPQRwIWMWytHTFOVWiqMZKmWog7kZMdmYT9OPlVq7OhMG.', '["dashboard","accounts","surveys","reports","users"]')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, permissions = EXCLUDED.permissions;
