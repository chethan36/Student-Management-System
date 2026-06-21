-- Canonical schema is versioned by Flyway.
-- Run the files in backend/src/main/resources/db/migration in version order,
-- or start the backend and Flyway will apply them automatically.
SOURCE ../backend/src/main/resources/db/migration/V1__schema.sql;
SOURCE ../backend/src/main/resources/db/migration/V2__sample_data.sql;
