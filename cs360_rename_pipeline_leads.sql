-- Migration: Rename project status "pipeline" to "leads"
-- Run this against the cs360 database

-- 1. Drop the old CHECK constraint first
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- 2. Update existing projects with status 'pipeline' to 'leads'
UPDATE projects SET status = 'leads' WHERE status = 'pipeline';

-- 3. Add new CHECK constraint
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('active', 'leads', 'exploration', 'completed'));

-- 4. Update default value
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'leads';

-- 4. Recreate v_account_summary view (references 'pipeline' in filters)
DROP VIEW IF EXISTS v_account_summary CASCADE;
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

-- 5. Recreate v_executive_kpis view (references 'pipeline' in filters)
DROP VIEW IF EXISTS v_executive_kpis CASCADE;
CREATE VIEW v_executive_kpis AS
SELECT
    (SELECT COUNT(*) FROM accounts) AS total_accounts,
    (SELECT COUNT(*) FROM accounts a JOIN v_latest_health lh ON lh.account_id = a.id WHERE lh.overall_score >= 80) AS healthy_accounts,
    (SELECT COUNT(*) FROM accounts a JOIN v_latest_health lh ON lh.account_id = a.id WHERE lh.overall_score >= 60 AND lh.overall_score < 80) AS attention_accounts,
    (SELECT COUNT(*) FROM accounts a JOIN v_latest_health lh ON lh.account_id = a.id WHERE lh.overall_score < 60) AS risk_accounts,
    (SELECT COUNT(*) FROM projects WHERE status = 'active') AS active_projects_count,
    (SELECT COALESCE(SUM(budget), 0) FROM projects WHERE status = 'active') AS total_active_revenue,
    (SELECT COALESCE(SUM(budget), 0) FROM projects WHERE status IN ('leads', 'exploration')) AS total_pipeline;
