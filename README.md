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

