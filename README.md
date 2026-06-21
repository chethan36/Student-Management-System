# Campus Core Student Management System

A production-oriented full-stack student management system with role-based Admin, Faculty, and Student workspaces. The API uses Spring Boot, Spring Security JWT, JPA/Hibernate, Flyway, MySQL, BCrypt, bean validation, centralized exception handling, pagination, and PDFBox. The responsive client uses React, Tailwind CSS, Chart.js, Axios, and React Router.

## Project structure

```text
.
├── backend/                 Spring Boot API and Flyway migrations
│   └── src/main/java/com/sms
│       ├── config/          Security, CORS, and JPA auditing
│       ├── controller/      Role-oriented REST controllers
│       ├── dto/             Validated request/response contracts
│       ├── entity/          JPA domain model
│       ├── exception/       Consistent API error handling
│       ├── repository/      Spring Data persistence
│       ├── security/        JWT parsing and authentication filter
│       └── service/         Transactions and authorization rules
├── frontend/                React/Vite/Tailwind SPA
├── database/                SQL entry point
├── docs/ARCHITECTURE.md     Architecture and endpoint map
└── docker-compose.yml       MySQL, API, and web deployment
```

## Quick start with Docker

Requirements: Docker Engine with Compose v2.

```bash
cp .env.example .env
# Set secure values in .env before any non-local deployment.
docker compose up --build
```

Open `http://localhost:3000`. The API is also exposed at `http://localhost:8080`.

Sample accounts (development seed only):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@sms.local` | `password` |
| Faculty | `faculty@sms.local` | `password` |
| Student | `student@sms.local` | `password` |

Remove or replace `V2__sample_data.sql` before a production launch. Existing databases retain applied migrations, so reset the development volume with `docker compose down -v` when intentionally rebuilding sample data.

## Local development

Use Java 21+, Maven 3.9+, Node 22+, and MySQL 8.4+.

```bash
# Database (or use only the mysql service from Compose)
docker compose up -d mysql

# API
cd backend
DB_URL='jdbc:mysql://localhost:3306/student_management?useSSL=false&allowPublicKeyRetrieval=true' \
DB_USERNAME=sms_user DB_PASSWORD=sms_password mvn spring-boot:run

# Client, in another terminal
cd frontend
npm install
npm run dev
```

Flyway automatically creates and seeds the database. For a manual MySQL session, run the two scripts under `backend/src/main/resources/db/migration` in version order.

## Verification

```bash
cd backend && mvn test
cd frontend && npm run build
docker compose config
```

Useful pagination example:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  'http://localhost:8080/api/admin/students?search=CSE&page=0&size=10&sort=name,asc'
```

## Production checklist

- Replace all secrets and sample accounts; manage secrets outside source control.
- Terminate TLS at a reverse proxy or load balancer and restrict CORS to the deployed origin.
- Use managed MySQL backups, migration review, monitoring, and centralized logs.
- For long-lived sessions, add rotating refresh tokens in Secure, HttpOnly, SameSite cookies. The current access token intentionally lives only for the browser session.
- Run `mvn test`, `npm run build`, container scanning, and API integration tests in CI.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for design details and the REST endpoint inventory.
