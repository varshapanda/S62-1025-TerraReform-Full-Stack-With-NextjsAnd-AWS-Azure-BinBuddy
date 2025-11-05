import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

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
    },
  });
  console.log("Created user:", user3.email);

  // Create Report 1
  const report1 = await prisma.report.create({
    data: {
      imageUrl: "https://example.com/waste-plastic.jpg",
      location: "Connaught Place, New Delhi",
      latitude: 28.6315,
      longitude: 77.2167,
      wasteType: "plastic",
      wasteCategory: "recyclable",
      verified: true,
      status: "verified",
      userId: user1.id,
    },
  });
  console.log("Created report:", report1.id);

  // Create Report 2
  const report2 = await prisma.report.create({
    data: {
      imageUrl: "https://example.com/waste-organic.jpg",
      location: "Karol Bagh, New Delhi",
      latitude: 28.6519,
      longitude: 77.19,
      wasteType: "organic",
      wasteCategory: "non-recyclable",
      verified: true,
      status: "verified",
      userId: user2.id,
    },
  });
  console.log("Created report:", report2.id);

  // Create Report 3
  const report3 = await prisma.report.create({
    data: {
      imageUrl: "https://example.com/waste-metal.jpg",
      location: "India Gate, New Delhi",
      latitude: 28.6129,
      longitude: 77.2295,
      wasteType: "metal",
      wasteCategory: "recyclable",
      verified: false,
      status: "pending",
      userId: user3.id,
    },
  });
  console.log("Created report:", report3.id);

  // Create Task 1 (available)
  const task1 = await prisma.task.create({
    data: {
      reportId: report1.id,
      status: "available",
    },
  });
  console.log("Created task:", task1.id);

  // Create Task 2 (claimed)
  const task2 = await prisma.task.create({
    data: {
      reportId: report2.id,
      status: "claimed",
      claimedBy: user3.id,
      claimedAt: new Date(),
    },
  });
  console.log("Created task:", task2.id);

  // Create Reward 1
  await prisma.reward.create({
    data: {
      userId: user1.id,
      points: 10,
      action: "report_waste",
      description: "Reported plastic waste at Connaught Place",
    },
  });
  console.log("Created reward for user1");

  // Create Reward 2
  await prisma.reward.create({
    data: {
      userId: user2.id,
      points: 10,
      action: "report_waste",
      description: "Reported organic waste at Karol Bagh",
    },
  });
  console.log("Created reward for user2");

  // Create Reward 3
  await prisma.reward.create({
    data: {
      userId: user3.id,
      points: 15,
      action: "claim_task",
      description: "Claimed collection task at Karol Bagh",
    },
  });
  console.log("Created reward for user3");

  // Create Notification 1
  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: "points_earned",
      title: "Points Earned!",
      message: "You earned 10 points for reporting waste",
      read: false,
    },
  });
  console.log("Created notification for user1");

  // Create Notification 2
  await prisma.notification.create({
    data: {
      userId: user2.id,
      type: "points_earned",
      title: "Points Earned!",
      message: "You earned 10 points for reporting waste",
      read: false,
    },
  });
  console.log("Created notification for user2");

  // Create Notification 3
  await prisma.notification.create({
    data: {
      userId: user3.id,
      type: "task_claimed",
      title: "Task Claimed!",
      message: "You claimed a collection task. Complete it to earn 15 points!",
      read: true,
    },
  });
  console.log("Created notification for user3");
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
        uploadedBy: user1.id, // extra user upload not tied to a report
      },
      {
        url: "https://example.com/images/community-cleanup.jpg",
        uploadedBy: user2.id, // extra user upload not tied to a report
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
