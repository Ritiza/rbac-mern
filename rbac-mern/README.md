# RBAC MERN Starter
Complete starter MERN app with Role-Based Access Control (Admin/Editor/Viewer), JWT auth, ownership checks, seeded users, Docker Compose, and a React frontend with route/component guards.

See `/backend` and `/frontend` for details. After downloading unzip and run instructions below.

## Quick start (local)
- Start MongoDB + API:
  - `cd backend`
  - `npm install`
  - `npm run seed`
  - `npm run dev`
- Start frontend:
  - `cd frontend`
  - `npm install`
  - `npm start`

## Docker
`docker-compose up --build`

## Pushing to GitHub
1. `git init`
2. `git add . && git commit -m "Initial RBAC MERN starter"`
3. `gh repo create <your-repo-name> --public --source=. --remote=origin`
4. `git push -u origin main`

