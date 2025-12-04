import { PrismaClient, TaskStatus, ReportStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const prisma = new PrismaClient();
const REFRESH_TOKEN_SECRET =
  (process.env.JWT_SECRET || "your-jwt-secret") + "_refresh";

async function main() {
  console.log("Starting seed...");

  // Create User 1
  const password1 = await bcrypt.hash("password123", 10);
  const user1 = await prisma.user.create({
    data: {
      name: "Varsha Panda",
      email: "varsha@binbuddy.com",
      password: password1,
      points: 50,
      role: "user",
      state: "Delhi",
      city: "New Delhi",
    },
  });
  console.log("Created user:", user1.email);

  // Create User 2
  const password2 = await bcrypt.hash("password123", 10);
  const user2 = await prisma.user.create({
    data: {
      name: "Kiesha Gibin",
      email: "kiesha@binbuddy.com",
      password: password2,
      points: 100,
      role: "user",
      state: "Delhi",
      city: "New Delhi",
    },
  });
  console.log("Created user:", user2.email);

  // Create User 3
  const password3 = await bcrypt.hash("password123", 10);
  const user3 = await prisma.user.create({
    data: {
      name: "Paul Koshy",
      email: "paul@binbuddy.com",
      password: password3,
      points: 75,
      role: "user",
      state: "Delhi",
      city: "New Delhi",
    },
  });
  console.log("Created user:", user3.email);

  // Create Refresh Tokens for users
  const refreshToken1 = jwt.sign(
    { id: user1.id, type: "refresh" },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  const hashedRefreshToken1 = crypto
    .createHash("sha256")
    .update(refreshToken1)
    .digest("hex");

  await prisma.refreshToken.create({
    data: {
      userId: user1.id,
      token: hashedRefreshToken1,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("Created refresh token for user1");

  const refreshToken2 = jwt.sign(
    { id: user2.id, type: "refresh" },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  const hashedRefreshToken2 = crypto
    .createHash("sha256")
    .update(refreshToken2)
    .digest("hex");

  await prisma.refreshToken.create({
    data: {
      userId: user2.id,
      token: hashedRefreshToken2,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("Created refresh token for user2");

  // Create a revoked refresh token for user3
  const refreshToken3 = jwt.sign(
    { id: user3.id, type: "refresh" },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  const hashedRefreshToken3 = crypto
    .createHash("sha256")
    .update(refreshToken3)
    .digest("hex");

  await prisma.refreshToken.create({
    data: {
      userId: user3.id,
      token: hashedRefreshToken3,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revokedAt: new Date(),
    },
  });
  console.log("Created revoked refresh token for user3");

  // Create Report 1
  const report1 = await prisma.report.create({
    data: {
      imageUrl: "https://example.com/waste-plastic.jpg",
      imageHash: `hash-${Date.now()}-1`,
      category: "DRY",
      lat: 28.6315,
      lng: 77.2167,
      note: "Plastic bottles and packaging near food court",
      address: "Connaught Place, New Delhi",
      status: ReportStatus.VERIFIED,
      reporterId: user1.id,
    },
  });
  console.log("Created report:", report1.id);

  // Create Report 2
  const report2 = await prisma.report.create({
    data: {
      imageUrl: "https://example.com/waste-organic.jpg",
      imageHash: `hash-${Date.now()}-2`,
      category: "WET",
      lat: 28.6519,
      lng: 77.19,
      note: "Food waste and organic material near market area",
      address: "Karol Bagh, New Delhi",
      status: ReportStatus.VERIFIED,
      reporterId: user2.id,
    },
  });
  console.log("Created report:", report2.id);

  // Create Report 3
  const report3 = await prisma.report.create({
    data: {
      imageUrl: "https://example.com/waste-metal.jpg",
      imageHash: `hash-${Date.now()}-3`,
      category: "DRY",
      lat: 28.6129,
      lng: 77.2295,
      note: "Metal cans and containers near monument",
      address: "India Gate, New Delhi",
      status: ReportStatus.PENDING,
      reporterId: user3.id,
    },
  });
  console.log("Created report:", report3.id);

  // Create Task 1 (PENDING)
  const task1 = await prisma.task.create({
    data: {
      reportId: report1.id,
      status: TaskStatus.PENDING,
    },
  });
  console.log("Created task:", task1.id);

  // Create Task 2 (ASSIGNED)
  const task2 = await prisma.task.create({
    data: {
      reportId: report2.id,
      status: TaskStatus.ASSIGNED,
      assignedToId: user3.id,
      startedAt: new Date(),
    },
  });
  console.log("Created task:", task2.id);

  // Create Reward entries
  await prisma.reward.create({
    data: {
      userId: user1.id,
      points: 10,
      action: "report_waste",
      description: "Reported plastic waste at Connaught Place",
    },
  });
  console.log("Created reward for user1");

  await prisma.reward.create({
    data: {
      userId: user2.id,
      points: 10,
      action: "report_waste",
      description: "Reported organic waste at Karol Bagh",
    },
  });
  console.log("Created reward for user2");

  await prisma.reward.create({
    data: {
      userId: user3.id,
      points: 15,
      action: "claim_task",
      description: "Claimed collection task",
    },
  });
  console.log("Created reward for user3");

  // Create Notifications
  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: "points_earned",
      title: "Points Earned!",
      message: "You earned 10 points for reporting waste",
      read: false,
    },
  });
  await prisma.notification.create({
    data: {
      userId: user2.id,
      type: "points_earned",
      title: "Points Earned!",
      message: "You earned 10 points for reporting waste",
      read: false,
    },
  });
  await prisma.notification.create({
    data: {
      userId: user3.id,
      type: "task_claimed",
      title: "Task Claimed!",
      message: "You claimed a collection task. Complete it to earn 15 points!",
      read: true,
    },
  });
  console.log("Created notifications");

  // Create Images for reports
  const images = await prisma.image.createMany({
    data: [
      {
        url: "https://example.com/images/plastic-bottles.jpg",
        reportId: report1.id,
        uploadedBy: user1.id,
      },
      {
        url: "https://example.com/images/organic-waste.jpg",
        reportId: report2.id,
        uploadedBy: user2.id,
      },
      {
        url: "https://example.com/images/metal-cans.jpg",
        reportId: report3.id,
        uploadedBy: user3.id,
      },
      {
        url: "https://example.com/images/recycling-center.jpg",
        uploadedBy: user1.id,
      },
      {
        url: "https://example.com/images/community-cleanup.jpg",
        uploadedBy: user2.id,
      },
    ],
  });
  console.log(`Created ${images.count} image records`);

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
