-- Migration: Add assignee_id to accounts table
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_accounts_assignee ON accounts(assignee_id);

-- Recreate v_account_summary to include assignee
DROP VIEW IF EXISTS v_account_summary CASCADE;
CREATE VIEW v_account_summary AS
SELECT
    a.id,
    a.name,
    a.name_ar,
    a.sector,
    a.status,
    COALESCE(h.overall_score, 0) AS health_score,
    a.assignee_id,
    u.name AS assignee_name,
    (SELECT COUNT(*) FROM stakeholders s WHERE s.account_id = a.id) AS stakeholder_count,
    (SELECT COUNT(*) FROM projects p WHERE p.account_id = a.id AND p.status = 'active') AS active_projects,
    (SELECT COUNT(*) FROM projects p WHERE p.account_id = a.id AND p.status IN ('pipeline', 'exploration')) AS pipeline_projects,
    (SELECT COALESCE(SUM(budget), 0) FROM projects p WHERE p.account_id = a.id AND p.status = 'active') AS active_revenue,
    (SELECT COALESCE(SUM(budget), 0) FROM projects p WHERE p.account_id = a.id AND p.status IN ('pipeline', 'exploration')) AS pipeline_value,
    (SELECT ROUND(AVG(csat)) FROM survey_responses sr WHERE sr.account_id = a.id AND sr.csat IS NOT NULL) AS avg_csat,
    (SELECT
        ROUND(
            ((COUNT(*) FILTER (WHERE nps >= 9))::NUMERIC -
             (COUNT(*) FILTER (WHERE nps <= 6))::NUMERIC) /
            NULLIF(COUNT(*), 0) * 100
        )
     FROM survey_responses sr WHERE sr.account_id = a.id AND sr.nps IS NOT NULL
    ) AS nps_score,
    (SELECT COUNT(*) FROM survey_responses sr WHERE sr.account_id = a.id) AS survey_responses_count,
    (SELECT COUNT(*) FROM activities act WHERE act.account_id = a.id AND act.status NOT IN ('done')) AS pending_activities
FROM accounts a
LEFT JOIN v_latest_health h ON h.account_id = a.id
LEFT JOIN users u ON u.id = a.assignee_id;
