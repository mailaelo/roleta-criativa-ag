-- Test Queries for Roleta Criativa
-- Note: Before running these queries, you must map the Firestore BigQuery Export table
-- (user_data_raw_latest) to a structured view matching this schema. Run the following command in BigQuery:
--
-- CREATE OR REPLACE VIEW `roda-criativa.analytics.raw_events` AS
-- SELECT
--   timestamp,
--   SAFE_CAST(JSON_VALUE(data, '$.moodCheckIn') AS INT64) AS mood,
--   SAFE_CAST(JSON_VALUE(data, '$.timeSpentMs') AS INT64) AS timeSpentMs,
--   JSON_VALUE(data, '$.goal') AS feeling,
--   SAFE_CAST(JSON_VALUE(data, '$.moodCheckIn') AS INT64) AS artSkill
-- FROM
--   `roda-criativa.analytics.user_data_raw_latest`;

-- 1. Habit Trend Analysis (Weekly Sessions Count)
SELECT
  EXTRACT(YEAR FROM timestamp) AS year,
  EXTRACT(ISOWEEK FROM timestamp) AS week,
  COUNT(*) as total_sessions,
  AVG(mood) as avg_mood,
  AVG(timeSpentMs) / 60000 as avg_time_minutes
FROM
  `roda-criativa.analytics.raw_events`
WHERE
  timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
GROUP BY
  year, week
ORDER BY
  year DESC, week DESC;

-- 2. Mood Distribution (How users feel after sessions)
SELECT
  mood,
  COUNT(*) as session_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM
  `roda-criativa.analytics.raw_events`
GROUP BY
  mood
ORDER BY
  mood DESC;

-- 3. Top Words Used to Describe Sessions
SELECT
  LOWER(TRIM(feeling)) as normalized_feeling,
  COUNT(*) as frequency
FROM
  `roda-criativa.analytics.raw_events`
WHERE
  feeling IS NOT NULL
GROUP BY
  normalized_feeling
ORDER BY
  frequency DESC
LIMIT 10;

-- 4. Session Time vs Art Satisfaction (Skill)
-- To see if longer sessions lead to higher satisfaction
SELECT
  CASE 
    WHEN timeSpentMs < 300000 THEN 'Under 5 Mins'
    WHEN timeSpentMs < 900000 THEN '5-15 Mins'
    WHEN timeSpentMs < 1800000 THEN '15-30 Mins'
    ELSE 'Over 30 Mins'
  END AS duration_category,
  COUNT(*) as sessions,
  AVG(artSkill) as avg_art_skill
FROM
  `roda-criativa.analytics.raw_events`
GROUP BY
  duration_category
ORDER BY
  avg_art_skill DESC;
