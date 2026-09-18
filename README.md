# SafeSphere — Emergency Awareness & Disaster Preparedness Platform

SafeSphere is a crisis resilience, household safety assessment, and community emergency mutual-aid platform designed with a clean, calm, and trustworthy healthcare/safety visual identity.

---

## 📁 Project Architecture

```
SafeSphere/
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   │   └── assets/
│   │
│   └── src/
│       ├── main.js
│       ├── app.js
│       ├── api.js
│       ├── data.js
│       ├── style.css
│       │
│       ├── components/
│       ├── pages/
│       └── utils/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── requirements.txt
│   └── .env.example
│
├── database/
│   └── supabase_schema.sql
│
├── README.md
└── .gitignore
```

---

## 🛡️ Core Capabilities

1. **Disaster Preparedness Guides (Public)**:
   - Actionable before/during/after protocols for Earthquakes, Floods, Wildfires, Power Grid Failures, and Extreme Weather.
2. **72-Hour Emergency Kit Planner (Public)**:
   - Dynamic item checklists tailored to household size and special medical/pet requirements.
3. **Safety Assessment & Surveys (Public)**:
   - Score household readiness and identify safety gaps with instant recommendations.
4. **Emergency Contacts Directory (Public)**:
   - National dispatch hotlines (112, 911, 999, etc.) and specialized crisis support.
5. **Private User Profile & Personal Contacts (Authenticated)**:
   - Private personal contacts (Add, Edit, Delete, One-click Call) with Supabase Row Level Security (RLS).
6. **Community Crisis Assistance (Authenticated)**:
   - Explicit approximate location sharing (~1km blurred privacy) to request or offer urgent neighborhood mutual aid.

---

## ⚙️ Backend API Endpoints (FastAPI)

- `GET /api/health` — System status & Supabase DB connectivity
- `GET /api/guides` — Disaster preparedness educational guides
- `GET /api/contacts` — Official crisis hotlines directory
- `GET /api/analytics` — Community preparedness metrics
- `POST /api/assessment` — Submit household readiness score
- `POST /api/survey` — Submit community feedback
- `GET /api/profile` — Fetch private user profile
- `PUT /api/profile` — Update private profile and preferences
- `GET /api/personal-contacts` — List user's private emergency contacts
- `POST /api/personal-contacts` — Add a new personal emergency contact
- `PUT /api/personal-contacts/{id}` — Update an existing personal emergency contact
- `DELETE /api/personal-contacts/{id}` — Remove a personal emergency contact
- `GET /api/emergency-requests` — List active community mutual-aid requests
- `POST /api/emergency-requests` — Broadcast emergency assistance request
- `POST /api/emergency-requests/{id}/offer` — Volunteer neighbor offers help
- `PUT /api/emergency-requests/{id}/status` — Update request status (active, help_offered, resolved, cancelled)

---

## 🗄️ Supabase PostgreSQL Setup

1. In your Supabase project dashboard, open the **SQL Editor**.
2. Run the script found in `database/supabase_schema.sql`.
3. Set your environment variables in `.env` or the platform environment settings:
   - Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
