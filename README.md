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


##  Prisma Database Migration & Seeding Documentation

This section outlines the complete workflow for handling **database schema changes**, **rollback procedures**, and **seeding** in the BinBuddy project.  
All commands are run from the project root unless otherwise specified.

---

###  Migration Workflow

We use **Prisma Migrate** to manage schema changes in PostgreSQL via Prisma ORM.

####  Create a new migration
When schema changes are made in `prisma/schema.prisma`, generate a new migration:
```bash
npx prisma migrate dev --name add_new_feature
```

This will:
- Save migration files in the `/prisma/migrations` directory  
- Apply them automatically to the development database  
- Update the Prisma Client to match the latest schema changes

To reset and reapply all migrations (for local dev only):
```bash
npx prisma migrate reset
```
### Rollback (Safe Method)
Never delete migration folders manually.
If a migration causes an issue, create a new corrective migration:
1. Revert the schema changes in `prisma/schema.prisma`.
2. Generate a new migration:
```bash
npx prisma migrate dev --name revert_faulty_change
``` 
For local testing only:
```bash
npx prisma migrate reset
```
Warning: This deletes all local data.

### Seeding the Database
To insert initial data into your database:
  ```bash 
  npx prisma db seed
```
### Screenshots showing succesful migration and seed scripts 
 ![Migration successful](./public/successful-migration.png)


 ![Seeding successful](./public/seed-script.png)


## Authentication APIs (Signup / Login) Documentation

### Overview
This explains the Signup and Login authentication flow built using **Next.js**, **Prisma**, **bcrypt**, and **JWT**. It covers secure password hashing, token generation, and route protection using token validation.

---

### Authentication Flow

#### **1. Signup Flow**
1. User sends `name`, `email`, and `password` to `/api/auth/signup`.
2. Backend checks if the user already exists.
3. Password is securely hashed using `bcrypt` before saving.
4. A new user record is created in the database.
5. A JWT token is generated and stored as an **HTTP-only cookie**.
6. Response is returned with success message and user details (excluding password).

#### **2. Login Flow**
1. User sends `email` and `password` to `/api/auth/login`.
2. Backend verifies user existence.
3. Password is validated using `bcrypt.compare()`.
4. A new JWT token is generated and sent as an **HTTP-only cookie**.
5. Response confirms successful login.

#### **3. Protected Route Access**
1. Frontend requests `/api/users` with JWT (either in cookie or Authorization header).
2. Server verifies token using a helper function.
3. If valid, protected data is returned; otherwise, a 401/403 error is sent.

---

## Sample API Requests & Responses

### **Signup API** (`POST /api/auth/signup`)
#### Request Body:
```json
{
  "name": "Alice Johnson",
  "email": "alice@binbuddy.com",
  "password": "SecurePass123!"
}
```

#### Successful Response:
```json
{
    "success": true,
    "message": "Signup successful. You are now logged in.",
    "user": {
        "id": 5,
        "name": "Alice Johnson",
        "email": "alice@binbuddy.com",
        "googleId": null,
        "points": 0,
        "role": "user",
        "createdAt": "2025-11-06T08:16:29.051Z",
        "updatedAt": "2025-11-06T08:16:29.051Z"
    }
}
```

#### Failed Response (Existing User):
```json
{
  "success": false,
  "message": "User already exists"
}
```

---

### **Login API** (`POST /api/auth/login`)
#### Request Body:
```json
{
  "email": "alice@binbuddy.com",
  "password": "SecurePass123!"
}
```

#### Successful Response:
```json
{
    "success": true,
    "message": "Login successful",
    "user": {
        "id": 5,
        "name": "Alice Johnson",
        "email": "alice@binbuddy.com",
        "role": "user",
        "points": 0
    }
}
```

#### Failed Response (Invalid Credentials):
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### **Protected Route** (`GET /api/users`)
#### Request Header:
```
Authorization: Bearer <JWT_TOKEN>
```

#### Successful Response:
```json
{
    "success": true,
    "message": "Protected data accessed successfully",
    "user": {
        "id": 5,
        "email": "alice@binbuddy.com",
        "role": "user"
    }
}
```

#### Failed Response (Token Missing or Expired):
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

### Security Mechanisms

#### **Password Hashing (bcrypt)**
- User passwords are hashed before storage using `bcrypt.hash(password, 10)`.
- This ensures that even if the database is compromised, passwords remain unreadable.

#### **JWT Token Generation**
- Tokens are generated using `jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '24h' })`.
- JWT contains essential user data and is signed with a secret key to prevent tampering.

---

### Token Expiry & Storage

| Concept | Description |
|----------|--------------|
| **Expiry** | Tokens expire after **24 hours** to limit session duration. |
| **Storage** | Tokens are stored as **HTTP-only cookies** for security against XSS attacks. |
| **CSRF Protection** | Cookies use `SameSite=strict` and `secure=true` in production. |
| **Refresh Strategy** | When tokens expire, users are re-authenticated. Future improvement: add refresh tokens for longer sessions. |

---

### Postman Testing Screenshots

### Successful Requests
- **Signup Success Screenshot**  
![Signup Success](./public/signup_success.png)

- **Login Success Screenshot**  
![Login Success](./public/login_success.png)

- **Protected Route Access Screenshot**  
![Protected Route Success](./public/protected_route_access.png)

### Failed Requests
- **Signup Error (User Exists)**  
![Signup Error](./public/signup_error.png)

- **Login Error (Invalid Credentials)**  
![Login Error](./public/login_error.png)

- **Token Missing or Expired Error**  
![Token Error](./public/token_missing.png)

---

### Reflection
Building secure authentication APIs involves:
- Hashing passwords before storage.
- Using JWTs for stateless session management.
- Protecting endpoints with middleware-based token verification.
- Storing tokens safely using HTTP-only cookies.

> "A good authentication system is invisible when it works — but disastrous when it fails. Secure it early, test it often, and document it clearly."


##  Middleware Authentication & Role Access

###  Overview
This middleware checks if users are logged in and have the correct role before accessing API routes.

---

###  How It Works
- `/api/auth/login` and `/api/auth/signup` are open to everyone.  
- All other `/api/*` routes need a valid JWT token.  
- If the token is missing or invalid → returns **401 Unauthorized**.  
- Only **admins** can access `/api/admin/*` routes.  
- If a normal user tries → returns **403 Access Denied**.

---

###  Reflection
Follows least privilege — users only access what they need.  
New roles like `moderator` can be added easily later.

