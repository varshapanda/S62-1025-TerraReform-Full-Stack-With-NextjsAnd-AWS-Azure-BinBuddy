# **BinBuddy** - Smart Waste Segregation & Management Platform

BinBuddy is a smart, AI-driven waste management web application that encourages community-led waste segregation.  
It provides real-time reporting, AI-based waste verification, and gamified incentives to promote sustainable waste practices.

---

### Problem Statement
Municipal waste management systems fail to track segregation at the source.  
BinBuddy bridges this gap by providing an easy-to-use digital interface for users to report, verify, and earn rewards for proper waste segregation.

### Solution
A gamified web platform that:
- Allows users to upload images of waste for AI verification (Gemini API)
- Awards points for verified waste reports.
- Displays community leaderboards and badges
- Enables authorities to track reports and manage collection

---

## Tech Stack

| Category | Technology |
|-----------|-------------|
| Framework | **Next.js (TypeScript)** |
| Styling | Tailwind CSS  |
| ORM | Prisma ORM  |
| Database | PostgreSQL |
| Authentication | Google Oauth |

---

## Folder Structure

```bash
src/
├── app/              # Routes & pages (Next.js App Router)
│   ├── layout.tsx    # Root layout component
│   └── page.tsx      # Home page
│
├── components/       # Reusable UI components
│   └── Navbar.tsx
│
├── lib/              # Utilities, configs, and helper functions
│   └── utils.ts
│
├── public/           # Static assets (images, icons)
│
└── types/            # TypeScript types and interfaces
```

---

## Folder Purpose

| Folder | Description |
|---------|-------------|
| **app/** | Manages all routes and layout components using the App Router. |
| **components/** | Contains modular and reusable UI components for consistency. |
| **lib/** | Holds configuration files, API helpers, and utility functions. |
| **public/** | Contains images and other static assets. |
| **types/** | Centralized location for shared TypeScript types and interfaces. |

---

## Setup Instructions

### 1️ Clone the Repository
```bash
git clone https://github.com/kalviumcommunity/S62-1025-TerraReform-Full-Stack-With-NextjsAnd-AWS-Azure-BinBuddy

cd binbuddy
```

### 2️ Install Dependencies
```bash
npm install
```

### 3️ Run the Development Server
```bash
npm run dev
```

Visit **http://localhost:3000** to see your app running.

---

## Reflection

This structure was chosen to ensure:
- **Modularity:** Each feature is isolated, easier to manage.
- **Scalability:** New components and pages can be added without breaking existing ones.
- **Collaboration:** Multiple developers can work in parallel safely.
- **Clarity:** Maintains consistency and simplicity in navigation and code readability.

This foundation sets the tone for all upcoming sprints — including API integration, database connection, and deployment.

---

##  Screenshot - App Running Locally

![BinBuddy App Running](./public/app_running.png)

---

### Code Quality Configuration

### 🔹 Why Strict TypeScript Mode Reduces Runtime Bugs
Enabling strict mode in TypeScript enforces strong type checking, catches potential errors during development, and prevents undefined or invalid type issues at runtime.

---

### 🔹 What ESLint + Prettier Rules Enforce
- **ESLint:** Detects syntax errors, unused variables, and enforces clean coding practices.  
- **Prettier:** Formats code consistently (semicolons, quotes, spacing).  
Together, they maintain a uniform and readable code style.

---

### 🔹 How Pre-Commit Hooks Improve Team Consistency
Pre-commit hooks (via Husky + lint-staged) automatically lint and format staged files before commits, ensuring every commit follows project standards and preventing unformatted or buggy code from being pushed.

---

### 🔹 Screenshots / Logs

![ESLint and Prettier in Action](./public/lint_testing.png)

##  Environment Variables

### Purpose
Environment variables are used to securely manage API keys, database URLs, and other sensitive configurations.

### Files
**.env.local** – stores actual credentials, never committed.
**.env.example** – template with placeholder values for team members.

### Variable Types
| Variable | Scope | Description |
|-----------|--------|-------------|
| DATABASE_URL | Server | PostgreSQL connection string |
| NEXT_PUBLIC_API_BASE_URL | Client | Public API endpoint |

### Setup Steps
1. Duplicate .env.example → .env.local
2. Fill in actual credentials.
3. Run npm run dev to start the app.

### Project Workflow Setup

This repository demonstrates a standardized Git workflow with defined branch naming conventions, a PR template, a review checklist, and branch protection rules to ensure consistency, collaboration, and high code quality across the team.

### PostgreSQL Schema Design 
---

### Objective
Design a normalized relational database schema using **PostgreSQL + Prisma ORM** to ensure scalability, data consistency, and efficient querying.

---

### Core Entities and Relationships

| Entity | Description |
|--------|--------------|
| **User** | Represents a registered user or waste collector. |
| **Report** | Represents a waste report submitted by a user. |
| **Task** | Represents a collection task generated from a report. |
| **Reward** | Tracks points earned by users for actions. |
| **Notification** | Manages user notifications for updates and rewards. |

---

### Prisma Schema Overview

```prisma
model User {
  id            Int      @id @default(autoincrement())
  name          String
  email         String   @unique
  password      String?
  googleId      String?  @unique
  points        Int      @default(0)
  role          String   @default("user")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  reports       Report[]
  claimedTasks  Task[]
  notifications Notification[]
  rewards       Reward[]
}

model Report {
  id            Int      @id @default(autoincrement())
  imageUrl      String
  location      String
  latitude      Float?
  longitude     Float?
  wasteType     String?
  wasteCategory String?
  verified      Boolean  @default(false)
  status        String   @default("pending")
  userId        Int
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  task          Task?
}
```

---

### Keys, Constraints, and Indexes

| Feature | Example | Purpose |
|----------|----------|----------|
| **Primary Keys (PK)** | `id` | Uniquely identifies each record |
| **Foreign Keys (FK)** | `userId`, `reportId` | Establishes relationships between tables |
| **Unique Constraints** | `email`, `googleId` | Ensures uniqueness in user identities |
| **Default Values** | `@default(now())`, `@default("pending")` | Auto-assigns timestamps and statuses |
| **Indexes** | `@@index([status])`, `@@index([email])` | Optimizes query performance |

---

### Normalization

| Level | Description | Applied In |
|--------|--------------|------------|
| **1NF** | Each column stores atomic values (no repeating groups) | All tables |
| **2NF** | Non-key attributes fully depend on the primary key | Each entity has a single PK |
| **3NF** | No transitive dependency between non-key attributes | Separated User, Report, Reward, etc. |

Redundancy is avoided by using **foreign key relationships** instead of duplicating data across tables.

---

### Migration & Seeding

### Apply Migrations
```bash
npx prisma migrate dev --name init_schema
```

### Open Prisma Studio
```bash
npx prisma studio
```

### Seed Database
```bash
npx prisma db seed
```

The seed file inserts:
- Sample users  
- Example waste reports  
- Collection tasks  
- Reward transactions  
- Notifications  

**All relationships are verified successfully** after seeding.

---

### Reflection on Schema Design

- **Scalability:** Modular tables make it easy to extend features (e.g., badges, leaderboards).  
- **Data Consistency:** Use of foreign keys and cascading deletes ensures referential integrity.  
- **Query Efficiency:** Indexed columns (`status`, `email`, `userId`) improve performance for common queries.  
- **Maintainability:** Prisma’s clear schema syntax simplifies migrations and updates.

---

### Verification Logs / Screenshots
- Screenshot of successful migration using Prisma CLI  
![Prisma Migration Success](./public/prisma_migration.png)

- Screenshot of seeded data logs in terminal
![Prisma Studio Seeded Data Logs](./public/seed_data.png)

- Screenshot of seeded data shown in **Prisma Studio**  
![Prisma Studio Seeded Data](./public/prisma_studio.png)

##  Dockerfile Explanation

The `Dockerfile` builds and runs the app inside a lightweight Node.js container.

- **Stage 1 (Builder):**
  - Uses `node:20-alpine` for a clean build.
  - Installs dependencies with `npm ci`.
  - Builds the optimized Next.js app.
- **Stage 2 (Runner):**
  - Copies the build output.
  - Removes Husky’s prepare script to avoid production errors.
  - Installs only production dependencies.
  - Exposes port `3000` and starts the app with `npm run start`.

###  Networks
- The project uses a single **bridge network** named `appnet`.
- This network isolates the container from other local apps and allows internal communication if additional services (like APIs or workers) are added later.
- It ensures consistent networking between containers when scaling.

###  Environment Variables
Environment variables are defined in a `.env` file (loaded via `env_file` in `docker-compose.yml`) and passed to the app container.
DATABASE_URL — connects the app to the Neon-hosted PostgreSQL database.

REDIS_URL — connects securely to the Upstash Redis instance (TLS).

NODE_ENV — ensures the app runs in optimized production mode.

###  Reflection on Issues Faced and Fixes

| Issue | Description | Solution |
|--------|--------------|-----------|
| **Husky Build Error** | Husky’s `prepare` script caused `husky: not found` errors during the Docker build. | Removed the script using `npm pkg delete scripts.prepare` before installing production dependencies. |
| **Missing Environment Variables** | Docker Compose didn’t detect `.env` values initially. | Added `env_file: - .env` under the `app` service in `docker-compose.yml`. |
| **TypeScript Redis Error** | TypeScript threw `string \| undefined` errors for `process.env.REDIS_URL`. | Added a runtime check and non-null assertion in `src/lib/redis.ts` to ensure the variable exists. |
| **Version Warning** | `version: '3.9'` in `docker-compose.yml` triggered a deprecation warning. | Removed the `version` key as it’s obsolete in Docker Compose v2+. |


## Screenshots showing successful builds and running containers

![Docker Running](./public/docker-running.png)
---
![Docker Logs](./public/docker_containers.png)


# Prisma ORM Setup & Client Initialization

## Prisma Setup Commands & Configuration

Before initializing the Prisma client and database connection, Prisma ORM was installed and configured in the project using the following steps:

1. **Install Prisma Packages**  
   Installed Prisma and its client library:  
   ```
   npm install prisma --save-dev
   npm install @prisma/client
   ```

2. **Initialize Prisma**  
   Initialized Prisma in the project root, creating a `prisma/` directory with a default schema and environment file:  
   ```
   npx prisma init
   ```

3. **Configure the Database Connection**  
   Updated the `.env.local` file with the PostgreSQL connection string:  
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/binbuddy_db"
   ```  
   This configuration allows Prisma to connect directly to the local PostgreSQL instance.

4. **Generate the Prisma Client**  
   After defining the models in `prisma/schema.prisma`, generated the Prisma client to enable type-safe queries:  
   ```
   npx prisma generate
   ```

5. **Push Schema and Apply Migrations**  
   Applied the schema to the database and created migration history for tracking structural changes:  
   ```
   npx prisma migrate dev --name init_schema
   ```

6. **Seed the Database (Optional)**  
   Inserted sample users, reports, tasks, rewards, and notifications:  
   ```
   npx prisma db seed
   ```

After these setup steps, Prisma was fully configured and ready to be integrated into the application.

---

## Purpose of Prisma ORM in the Project

Prisma ORM bridges the backend and database layers of the project. It provides type-safe, auto-generated queries that help developers interact with PostgreSQL efficiently while ensuring schema consistency. This integration enhances reliability, improves developer productivity, and minimizes runtime database errors.

---

## Setup Steps Followed

1. **Initialized Prisma Client** — A development-safe Prisma client instance was added in `src/lib/prisma.ts` using the singleton pattern. This ensures a single database connection is maintained across hot reloads during development.  
2. **Added a Test API Route** — Implemented an API endpoint in `src/app/api/test-db/route.ts` to verify database connectivity. This route successfully fetched entity counts and sample user data from the PostgreSQL database.  
3. **Verified Connection** — After running the development server, Prisma established a PostgreSQL connection, executed multiple queries, and returned a successful JSON response.  

---

## Prisma Schema Overview

The schema includes five main entities — **User**, **Report**, **Task**, **Reward**, and **Notification** — each with clearly defined relationships and indexing for optimized querying.  
The models are normalized and follow 3NF design principles to ensure scalability and data consistency.  
Key relationships include:
- One user can create many reports, rewards, and notifications.
- Each report is linked to one user and optionally one task.
- Tasks can be claimed by users, with one-to-one linkage to reports.
- Rewards and notifications are tied to user actions and events.

---

## Evidence and Screenshots

- Successful API response from `/api/test-db`  
  ![API Response](./public/api-test.png)

- Terminal logs showing Prisma queries and DB connection  
  ![Terminal Output](./public/terminal-output.png)

- Seeded data viewed in Prisma Studio  
  ![Prisma Studio](./public/seed_data.png)

---

## Reflection

Integrating Prisma ORM into the project provided several key benefits:

- **Type Safety:** Prevents invalid queries by enforcing schema-level typing.  
- **Query Reliability:** Automatically generates schema-consistent database queries.  
- **Developer Productivity:** Provides autocomplete, query validation, and fast iteration cycles.  
- **Maintainability:** Centralized schema ensures clear version control and easy migrations.  
- **Scalability:** Supports complex relationships while maintaining efficient performance.

---

**Outcome:**  
The Prisma ORM setup and client initialization were successfully completed. The database connection has been verified with live queries, and the setup is now stable for use across the project’s backend modules.