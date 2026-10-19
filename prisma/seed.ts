import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting rich HMS database seeding...");

  // 1. Clean existing records in reverse dependency order
  await prisma.damageReport.deleteMany();
  await prisma.gatePass.deleteMany();
  await prisma.maintenanceTicket.deleteMany();
  await prisma.messAttendance.deleteMany();
  await prisma.messMenu.deleteMany();
  await prisma.utilityMeterReading.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.room.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.building.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.residentProfile.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Previous data cleared.");

  // 2. Hash standard passwords
  const defaultPassword = await bcrypt.hash("password123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);
  const wardenPassword = await bcrypt.hash("warden123", 10);
  const accountantPassword = await bcrypt.hash("account123", 10);
  const maintPassword = await bcrypt.hash("maint123", 10);
  const residentPassword = await bcrypt.hash("resident123", 10);

  // 3. Seed Users across all 5 roles
  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@hms.com",
      passwordHash: adminPassword,
      fullName: "David Sterling (Super Admin)",
      phoneNumber: "+1 (555) 019-2831",
      role: "SUPER_ADMIN",
    },
  });

  const wardenUser = await prisma.user.create({
    data: {
      email: "warden@hms.com",
      passwordHash: wardenPassword,
      fullName: "Robert Vance (Chief Warden)",
      phoneNumber: "+1 (555) 014-9921",
      role: "WARDEN",
      staffProfile: {
        create: {
          department: "MANAGEMENT",
        },
      },
    },
    include: { staffProfile: true },
  });

  const accountantUser = await prisma.user.create({
    data: {
      email: "accountant@hms.com",
      passwordHash: accountantPassword,
      fullName: "Alice Chen (Lead Accountant)",
      phoneNumber: "+1 (555) 018-7734",
      role: "ACCOUNTANT",
      staffProfile: {
        create: {
          department: "ACCOUNTS",
        },
      },
    },
    include: { staffProfile: true },
  });

  const maintenanceUser = await prisma.user.create({
    data: {
      email: "maintenance@hms.com",
      passwordHash: maintPassword,
      fullName: "Mike Kowalski (Senior Technician)",
      phoneNumber: "+1 (555) 012-3498",
      role: "MAINTENANCE_STAFF",
      staffProfile: {
        create: {
          department: "PLUMBING",
        },
      },
    },
    include: { staffProfile: true },
  });

  const resident1User = await prisma.user.create({
    data: {
      email: "resident@hms.com",
      passwordHash: residentPassword,
      fullName: "Alex Rivera (Student)",
      phoneNumber: "+1 (555) 017-8822",
      role: "RESIDENT",
      residentProfile: {
        create: {
          gender: "MALE",
          dob: new Date("2004-05-14"),
          idProofType: "STUDENT_ID",
          idProofNumber: "STU-2026-0891",
          emergencyName: "Elena Rivera (Mother)",
          emergencyPhone: "+1 (555) 019-9900",
          emergencyRelation: "Mother",
        },
      },
    },
    include: { residentProfile: true },
  });

  const resident2User = await prisma.user.create({
    data: {
      email: "sarah@hms.com",
      passwordHash: residentPassword,
      fullName: "Sarah Connor (Graduate Scholar)",
      phoneNumber: "+1 (555) 016-4433",
      role: "RESIDENT",
      residentProfile: {
        create: {
          gender: "FEMALE",
          dob: new Date("2002-11-20"),
          idProofType: "NATIONAL_ID",
          idProofNumber: "NAT-ID-99281A",
          emergencyName: "John Connor",
          emergencyPhone: "+1 (555) 013-1122",
          emergencyRelation: "Father",
        },
      },
    },
    include: { residentProfile: true },
  });

  console.log("👤 5 Role accounts created.");

  // 4. Seed Property Hierarchy (Branch -> Building -> Floor -> RoomType -> Room -> Bed)
  const branch = await prisma.branch.create({
    data: {
      name: "Grand Greenwood Central Campus",
      address: "450 University Boulevard, Tech District",
      city: "Metropolis",
    },
  });

  const northBuilding = await prisma.building.create({
    data: {
      branchId: branch.id,
      name: "North Tower (Boys)",
      gender: "MALE",
    },
  });

  const southBuilding = await prisma.building.create({
    data: {
      branchId: branch.id,
      name: "South Tower (Girls)",
      gender: "FEMALE",
    },
  });

  // Room Types
  const singleAC = await prisma.roomType.create({
    data: {
      name: "Single Deluxe AC",
      capacity: 1,
      hasAC: true,
      hasAttachedBath: true,
      baseRent: 650.0,
      depositAmount: 1300.0,
    },
  });

  const doubleAC = await prisma.roomType.create({
    data: {
      name: "Double Sharing AC",
      capacity: 2,
      hasAC: true,
      hasAttachedBath: true,
      baseRent: 450.0,
      depositAmount: 900.0,
    },
  });

  const tripleNonAC = await prisma.roomType.create({
    data: {
      name: "Triple Sharing Economy",
      capacity: 3,
      hasAC: false,
      hasAttachedBath: false,
      baseRent: 280.0,
      depositAmount: 560.0,
    },
  });

  // Floors
  const northFloor1 = await prisma.floor.create({
    data: {
      buildingId: northBuilding.id,
      floorNumber: 1,
    },
  });

  const northFloor2 = await prisma.floor.create({
    data: {
      buildingId: northBuilding.id,
      floorNumber: 2,
    },
  });

  const southFloor1 = await prisma.floor.create({
    data: {
      buildingId: southBuilding.id,
      floorNumber: 1,
    },
  });

  // Rooms & Beds
  // Room 101 (North Floor 1, Double Sharing AC)
  const room101 = await prisma.room.create({
    data: {
      floorId: northFloor1.id,
      roomTypeId: doubleAC.id,
      roomNumber: "101",
    },
  });

  const bed101A = await prisma.bed.create({
    data: {
      roomId: room101.id,
      bedNumber: "Bed 101-A",
      status: "OCCUPIED",
    },
  });

  const bed101B = await prisma.bed.create({
    data: {
      roomId: room101.id,
      bedNumber: "Bed 101-B",
      status: "VACANT",
    },
  });

  // Room 102 (North Floor 1, Single Deluxe AC)
  const room102 = await prisma.room.create({
    data: {
      floorId: northFloor1.id,
      roomTypeId: singleAC.id,
      roomNumber: "102",
    },
  });

  const bed102A = await prisma.bed.create({
    data: {
      roomId: room102.id,
      bedNumber: "Bed 102-A",
      status: "RESERVED",
    },
  });

  // Room 201 (North Floor 2, Triple Non AC)
  const room201 = await prisma.room.create({
    data: {
      floorId: northFloor2.id,
      roomTypeId: tripleNonAC.id,
      roomNumber: "201",
    },
  });

  await prisma.bed.create({
    data: {
      roomId: room201.id,
      bedNumber: "Bed 201-A",
      status: "VACANT",
    },
  });

  await prisma.bed.create({
    data: {
      roomId: room201.id,
      bedNumber: "Bed 201-B",
      status: "MAINTENANCE",
    },
  });

  await prisma.bed.create({
    data: {
      roomId: room201.id,
      bedNumber: "Bed 201-C",
      status: "VACANT",
    },
  });

  // Room G01 (South Floor 1, Double Sharing AC)
  const roomG01 = await prisma.room.create({
    data: {
      floorId: southFloor1.id,
      roomTypeId: doubleAC.id,
      roomNumber: "G-01",
    },
  });

  const bedG01A = await prisma.bed.create({
    data: {
      roomId: roomG01.id,
      bedNumber: "Bed G01-A",
      status: "OCCUPIED",
    },
  });

  await prisma.bed.create({
    data: {
      roomId: roomG01.id,
      bedNumber: "Bed G01-B",
      status: "VACANT",
    },
  });

  console.log("🏢 Property hierarchy & beds generated.");

  // 5. Seed Allocations
  const now = new Date();
  const semesterStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const semesterEnd = new Date(now.getFullYear(), now.getMonth() + 5, 30);

  const allocationAlex = await prisma.allocation.create({
    data: {
      bedId: bed101A.id,
      residentId: resident1User.residentProfile!.id,
      startDate: semesterStart,
      endDate: semesterEnd,
      monthlyRent: 450.0,
      securityDeposit: 900.0,
      status: "ACTIVE",
      checkedInAt: semesterStart,
    },
  });

  const allocationSarah = await prisma.allocation.create({
    data: {
      bedId: bedG01A.id,
      residentId: resident2User.residentProfile!.id,
      startDate: semesterStart,
      endDate: semesterEnd,
      monthlyRent: 450.0,
      securityDeposit: 900.0,
      status: "ACTIVE",
      checkedInAt: semesterStart,
    },
  });

  // 6. Seed Submeter Reading & Invoices
  await prisma.utilityMeterReading.create({
    data: {
      roomId: room101.id,
      utilityType: "ELECTRICITY",
      billingPeriod: semesterStart,
      previousUnits: 1420.0,
      currentUnits: 1710.0,
      unitsConsumed: 290.0,
      ratePerUnit: 0.15,
      totalCost: 43.5,
      splitCount: 1, // Only Alex occupied this month
    },
  });

  const invoice1 = await prisma.invoice.create({
    data: {
      allocationId: allocationAlex.id,
      invoiceNumber: "INV-2026-00101",
      billingMonth: semesterStart,
      dueDate: new Date(semesterStart.getFullYear(), semesterStart.getMonth(), 10),
      subtotal: 493.5,
      taxOrDiscount: -20.0, // Early bird voucher
      totalAmount: 473.5,
      paidAmount: 473.5,
      status: "PAID",
      items: {
        create: [
          {
            type: "RENT",
            description: "Room 101 Base Monthly Rent (Sep 2026)",
            amount: 450.0,
          },
          {
            type: "ELECTRICITY_SUBMETER",
            description: "Room 101 Sub-Meter Electricity (290 units @ $0.15)",
            amount: 43.5,
          },
          {
            type: "MESS_REBATE",
            description: "Approved Meal Opt-out Credits (2 Lunches)",
            amount: -20.0,
          },
        ],
      },
      payments: {
        create: {
          amount: 473.5,
          paymentMethod: "CREDIT_CARD",
          status: "CONFIRMED",
          referenceCode: "TXN_STRIPE_99812A",
          notes: "Online card payment processed successfully.",
        },
      },
    },
  });

  await prisma.invoice.create({
    data: {
      allocationId: allocationSarah.id,
      invoiceNumber: "INV-2026-00102",
      billingMonth: new Date(now.getFullYear(), now.getMonth(), 1),
      dueDate: new Date(now.getFullYear(), now.getMonth(), 10),
      subtotal: 480.0,
      totalAmount: 480.0,
      paidAmount: 0.0,
      status: "ISSUED",
      items: {
        create: [
          {
            type: "RENT",
            description: "Room G-01 Base Monthly Rent (Current Month)",
            amount: 450.0,
          },
          {
            type: "MESS_FEE",
            description: "Standard Mess Catering Subscription",
            amount: 30.0,
          },
        ],
      },
    },
  });

  console.log("💰 Invoices & ledger items seeded.");

  // 7. Seed Weekly Mess Menu (Realistic & Diverse Pakistani & Continental Hostel Meals)
  const weeklyMenuData = [
    // 0: Sunday
    { dayOfWeek: 0, mealType: "BREAKFAST", itemsList: "Halwa Puri, Chana Masala, Achar, Fresh Lassi & Karak Chai" },
    { dayOfWeek: 0, mealType: "LUNCH", itemsList: "Chicken Biryani with Mint Raita, Fresh Kachumber Salad & Shami Kababs" },
    { dayOfWeek: 0, mealType: "DINNER", itemsList: "Beef Nihari with Ginger & Green Chilies, Warm Tandoori Naan & Kheer" },

    // 1: Monday
    { dayOfWeek: 1, mealType: "BREAKFAST", itemsList: "Anda Ghotala (Spiced Scrambled Eggs), Crispy Parathas & Doodh Patti Chai" },
    { dayOfWeek: 1, mealType: "LUNCH", itemsList: "Daal Chawal (Tarka Daal with Basmati Rice), Aloo Zeera & Mixed Pickle" },
    { dayOfWeek: 1, mealType: "DINNER", itemsList: "Chicken Karahi, Fluffy Roti, Fresh Cucumber Tomato Salad & Gulab Jamun" },

    // 2: Tuesday
    { dayOfWeek: 2, mealType: "BREAKFAST", itemsList: "French Toast, Soft Boiled Eggs, Hash Browns, Butter, Jam & Coffee" },
    { dayOfWeek: 2, mealType: "LUNCH", itemsList: "White Chana Pulao, Podina Raita, Fried Aloo Tikki & Onion Salad" },
    { dayOfWeek: 2, mealType: "DINNER", itemsList: "Aloo Gosht (Mutton Gravy with Potatoes), Khamiri Roti & Fruit Trifle" },

    // 3: Wednesday
    { dayOfWeek: 3, mealType: "BREAKFAST", itemsList: "Aloo Paratha with Fresh Homemade Yogurt, Green Chutney & Cardamom Tea" },
    { dayOfWeek: 3, mealType: "LUNCH", itemsList: "Kadhi Pakora with Boiled Cumin Rice & Roasted Papad" },
    { dayOfWeek: 3, mealType: "DINNER", itemsList: "Chicken Haleem with Fried Onions, Lemons & Chaat Masala, Warm Naan & Zarda" },

    // 4: Thursday
    { dayOfWeek: 4, mealType: "BREAKFAST", itemsList: "Desi Style Bread Omelette (Onions & Chillies), Toasted Bread & Milk Tea" },
    { dayOfWeek: 4, mealType: "LUNCH", itemsList: "Mixed Vegetable Sabzi (Gobi Aloo Matar), Warm Phulkas & Boondi Raita" },
    { dayOfWeek: 4, mealType: "DINNER", itemsList: "Chicken Shinwari Karahi, Charcoal Seekh Kabab, Roghani Naan & Shahi Tukray" },

    // 5: Friday
    { dayOfWeek: 5, mealType: "BREAKFAST", itemsList: "Chana Chaat, Boiled Eggs, Butter Toast & Masala Chai" },
    { dayOfWeek: 5, mealType: "LUNCH", itemsList: "Special Mutton Yakhni Pulao, Zeera Raita, Chapli Kabab & Green Salad" },
    { dayOfWeek: 5, mealType: "DINNER", itemsList: "Daal Makhani, Butter Naan, Chicken Malai Boti Skewers & Sooji Halwa" },

    // 6: Saturday
    { dayOfWeek: 6, mealType: "BREAKFAST", itemsList: "Cheese Omelette, Chicken Sausages, Butter Croissant, Juice & Coffee" },
    { dayOfWeek: 6, mealType: "LUNCH", itemsList: "Black Chana Curry with Steamed Rice, Spicy Sirka Onions & Mint Chutney" },
    { dayOfWeek: 6, mealType: "DINNER", itemsList: "Chicken Korma with Saffron Basmati Rice, Sheermal & Gajar ka Halwa" },
  ];

  await prisma.messMenu.createMany({
    data: weeklyMenuData,
  });

  // 8. Seed Maintenance Ticket
  await prisma.maintenanceTicket.create({
    data: {
      residentId: resident1User.residentProfile!.id,
      staffId: maintenanceUser.staffProfile!.id,
      category: "PLUMBING",
      priority: "URGENT",
      status: "IN_PROGRESS",
      title: "Bathroom sink faucet slow drain & leak",
      description: "Water is accumulating under the sink cabinet in Room 101. Please inspect the pipe coupling.",
    },
  });

  // 9. Seed Gate Passes
  await prisma.gatePass.create({
    data: {
      residentId: resident1User.residentProfile!.id,
      approvedById: wardenUser.staffProfile!.id,
      reason: "[DAY_OUTING] Visiting University Central Library for thesis group study | Destination: Campus North Library",
      expectedOutTime: new Date(Date.now() - 3600 * 1000 * 2),
      expectedInTime: new Date(Date.now() + 3600 * 1000 * 6),
      actualOutTime: new Date(Date.now() - 3600 * 1000 * 1.5),
      status: "CHECKED_OUT",
    },
  });

  await prisma.gatePass.create({
    data: {
      residentId: resident2User.residentProfile!.id,
      reason: "[NIGHT_OUT] Attending Regional Robotics Hackathon with university team | Destination: Tech Innovation Hub, 500 Silicon Blvd",
      expectedOutTime: new Date(Date.now() + 3600 * 1000 * 2),
      expectedInTime: new Date(Date.now() + 3600 * 1000 * 36),
      status: "PENDING",
    },
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

