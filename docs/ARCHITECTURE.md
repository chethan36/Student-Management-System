# System architecture

The system is a three-tier application. A React single-page application calls versioned REST resources on a stateless Spring Boot API. Spring Security validates a signed JWT on each protected request and method/route authorization separates Admin, Faculty, and Student capabilities. The service layer owns transactions and authorization invariants; JPA repositories persist to MySQL. Flyway owns schema evolution.

```text
Browser -> React + Tailwind -> /api REST + JWT -> Controllers -> Services -> JPA -> MySQL
                                      |              |
                                  RBAC filter    PDFBox reports
```

## Key decisions

- JWTs are short-lived and stored in session storage by the client; production deployments should use an HttpOnly refresh-token cookie when persistent sessions are required.
- Passwords are BCrypt hashes and are never serialized.
- Faculty write operations verify course ownership in the service, beyond URL-level role checks.
- Student resources resolve the student from the authenticated email, so IDs cannot be swapped to view another record.
- Pagination, filtering, and sorting use Spring Data query parameters (`page`, `size`, and `sort`).
- Flyway migrations, database constraints, and service validation protect data integrity.

## API surface

| Role | Endpoints |
|---|---|
| Public | `POST /api/auth/login`, `POST /api/auth/logout` |
| Admin | `/api/admin/dashboard`, CRUD `/students`, `/faculty`, `/departments`, `/courses`, `POST /enrollments` |
| Faculty | `GET /api/faculty/courses`, course roster and attendance, `POST /marks`, student search |
| Student | `GET /api/student/profile`, `/courses`, `/attendance`, `/marks`, `/report-card` |
