🚀 Job Portal with AI Features

A simple full-stack Job Portal web application built using React (Frontend) and Spring Boot (Backend) with basic AI features like skill extraction and job matching.

📌 Features
👨‍💼 Job Seeker
Register and Login
View available jobs
Apply to jobs
View applied jobs
Upload resume text
🧑‍💻 Recruiter
Register and Login
Post new jobs
View applicants
Manage job postings
🤖 AI Features (Simple)
Extract skills from resume text using AI
Match jobs based on skills
Show simple match percentage
🛠️ Tech Stack
Frontend
React.js (Vite)
Tailwind CSS
Axios
Backend
Java 21
Spring Boot 3
Spring Security (JWT)
Spring Data JPA
Maven
Database
PostgreSQL
AI Integration
OpenAI API (for skill extraction)
📁 Project Structure
frontend/
  ├── src/
  │   ├── pages/
  │   ├── components/
  │   ├── services/
  │   └── App.tsx

backend/
  ├── src/main/java/
  │   ├── controller/
  │   ├── service/
  │   ├── repository/
  │   ├── model/
  │   └── config/
🗄️ Database Schema
Users
id
name
email
password
role
Jobs
id
title
description
skills
Applications
id
userId
jobId
status
Resumes
id
userId
text
extractedSkills
🔐 Authentication
JWT-based authentication
Role-based access control (JOB_SEEKER, RECRUITER)
Secure password hashing using BCrypt
⚙️ API Endpoints (Sample)
Auth
POST /api/auth/register
POST /api/auth/login
Jobs
GET /api/jobs
POST /api/jobs
DELETE /api/jobs/{id}
Applications
POST /api/apply
GET /api/applications/user/{id}
🤖 AI Flow
User uploads resume text
Backend sends text to OpenAI API
Extracted skills are stored in database
Jobs are matched based on skill similarity
Match percentage is shown to user
🚀 How to Run
Backend
cd backend
mvn spring-boot:run
Frontend
cd frontend
npm install
npm run dev
🌐 Deployment
Frontend: Netlify
Backend: Render
Database: PostgreSQL (Neon / Supabase)
📸 Screenshots

(Add screenshots here after development)

🎯 Goal

This project is designed to demonstrate:

Full-stack development skills
REST API design
Authentication & security
Basic AI integration
Real-world job portal logic
📌 Future Improvements
Advanced AI recommendations
Email notifications
Resume file upload (PDF parsing)
Admin dashboard
Real-time chat between recruiter and candidate
