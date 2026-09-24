# KrishiSetu (SIH26132) — Farmer Market Linkage Platform

Full-Stack Agricultural Market Intelligence and Direct Farmer-Buyer Linkage Platform.

---

## Architecture Overview

```
SIH2026/
├── backend/       # Java 17 + Spring Boot 3.3 REST API (Security, JPA, PostgreSQL, Flyway, Swagger)
├── ai-service/    # Python FastAPI + Scikit-Learn/XGBoost Price Prediction Microservice
└── frontend/      # React + Vite + Tailwind CSS + Recharts + Lucide UI Dashboard
```

---

## 1. Running the Spring Boot Backend

### Requirements
- Java 17+
- Maven 3.8+
- PostgreSQL (or in-memory H2)

### Starting the Server
```bash
cd backend
mvn clean spring-boot:run
```

- **API Base URL**: `http://localhost:8080/api`
- **Interactive Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI v3 Docs**: `http://localhost:8080/v3/api-docs`

---

## 2. Running the Python AI Price Prediction Microservice

### Requirements
- Python 3.9+
- pip

### Starting the FastAPI Service
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **AI API URL**: `http://localhost:8000`
- **FastAPI Interactive Docs**: `http://localhost:8000/docs`

---

## 3. Running the React Frontend

### Requirements
- Node.js 18+
- npm

### Starting the Frontend
```bash
cd frontend
npm install
npm run dev
```

- **Frontend URL**: `http://localhost:5173` (or `http://localhost:5174`)

---

## Demo Credentials (Seed Data)

| Role | Email / Username | Password |
|---|---|---|
| **Farmer** | `ramesh.patil@example.com` | `password123` |
| **Buyer** | `procurement@abcfoods.com` | `password123` |
| **Admin** | `admin@krishisetu.gov.in` | `admin123` |
