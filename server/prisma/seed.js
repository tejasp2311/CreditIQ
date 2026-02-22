import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data (in development only)
  if (process.env.NODE_ENV === 'development') {
    await prisma.auditLog.deleteMany();
    await prisma.loanDecision.deleteMany();
    await prisma.loanApplication.deleteMany();
    await prisma.modelVersion.deleteMany();
    await prisma.user.deleteMany();
    console.log('✓ Cleaned existing data');
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@creditiq.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });
  console.log('✓ Created admin user:', admin.email);

  // Create test users
  const testPassword = await bcrypt.hash('Test@123', 12);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        password: testPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        password: testPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'robert.johnson@example.com',
        password: testPassword,
        firstName: 'Robert',
        lastName: 'Johnson',
        role: 'USER',
      },
    }),
  ]);
  console.log(`✓ Created ${users.length} test users`);

  // Create model version
  const modelVersion = await prisma.modelVersion.create({
    data: {
      version: 'v1.0',
      description: 'Initial Random Forest model for credit risk assessment',
      isActive: true,
    },
  });
  console.log('✓ Created model version:', modelVersion.version);

  // Create sample loan applications
  const loanApplications = await Promise.all([
    // Approved loan - high income, good credit
    prisma.loanApplication.create({
      data: {
        userId: users[0].id,
        status: 'APPROVED',
        income: 800000,
        loanAmount: 2000000,
        tenure: 60,
        employmentType: 'SALARIED',
        existingEmis: 10000,
        creditScore: 780,
        age: 35,
        dependents: 2,
        submittedAt: new Date(),
      },
    }),
    // Rejected loan - low credit score
    prisma.loanApplication.create({
      data: {
        userId: users[0].id,
        status: 'REJECTED',
        income: 300000,
        loanAmount: 1000000,
        tenure: 48,
        employmentType: 'SELF_EMPLOYED',
        existingEmis: 8000,
        creditScore: 520,
        age: 28,
        dependents: 1,
        submittedAt: new Date(),
      },
    }),
    // Submitted loan - pending evaluation
    prisma.loanApplication.create({
      data: {
        userId: users[1].id,
        status: 'SUBMITTED',
        income: 600000,
        loanAmount: 1500000,
        tenure: 72,
        employmentType: 'SALARIED',
        existingEmis: 12000,
        creditScore: 720,
        age: 32,
        dependents: 1,
        submittedAt: new Date(),
      },
    }),
    // Draft loan
    prisma.loanApplication.create({
      data: {
        userId: users[1].id,
        status: 'DRAFT',
        income: 450000,
        loanAmount: 1200000,
        tenure: 60,
        employmentType: 'SALARIED',
        existingEmis: 5000,
        creditScore: 690,
        age: 29,
        dependents: 0,
      },
    }),
    // Approved loan - low amount, excellent credit
    prisma.loanApplication.create({
      data: {
        userId: users[2].id,
        status: 'APPROVED',
        income: 1200000,
        loanAmount: 1000000,
        tenure: 36,
        employmentType: 'SALARIED',
        existingEmis: 0,
        creditScore: 820,
        age: 40,
        dependents: 3,
        submittedAt: new Date(),
      },
    }),
  ]);
  console.log(`✓ Created ${loanApplications.length} loan applications`);

  // Create loan decisions for submitted/approved/rejected loans
  const decisions = await Promise.all([
    prisma.loanDecision.create({
      data: {
        applicationId: loanApplications[0].id,
        decision: 'APPROVED',
        probability: 0.15,
        riskBand: 'LOW',
        policyPassed: true,
        modelVersion: 'v1.0',
        explanations: [
          { feature: 'Credit Score', impact: 'positive', value: 780, contribution: 0.35 },
          { feature: 'Income', impact: 'positive', value: 800000, contribution: 0.25 },
          { feature: 'Debt-to-Income Ratio', impact: 'positive', value: 15.0, contribution: 0.20 },
        ],
      },
    }),
    prisma.loanDecision.create({
      data: {
        applicationId: loanApplications[1].id,
        decision: 'REJECTED',
        probability: null,
        riskBand: null,
        policyPassed: false,
        policyReason: 'Credit score 520 is below minimum requirement of 550',
        modelVersion: null,
      },
    }),
    prisma.loanDecision.create({
      data: {
        applicationId: loanApplications[4].id,
        decision: 'APPROVED',
        probability: 0.08,
        riskBand: 'LOW',
        policyPassed: true,
        modelVersion: 'v1.0',
        explanations: [
          { feature: 'Credit Score', impact: 'positive', value: 820, contribution: 0.40 },
          { feature: 'Income', impact: 'positive', value: 1200000, contribution: 0.30 },
          { feature: 'No Existing EMIs', impact: 'positive', value: 0, contribution: 0.15 },
        ],
      },
    }),
  ]);
  console.log(`✓ Created ${decisions.length} loan decisions`);

  // Create audit logs
  const auditLogs = await Promise.all([
    prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: 'USER_REGISTERED',
        entityType: 'User',
        metadata: { email: admin.email, role: admin.role },
      },
    }),
    ...users.map((user) =>
      prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'USER_REGISTERED',
          entityType: 'User',
          metadata: { email: user.email, role: user.role },
        },
      })
    ),
    ...loanApplications.map((app) =>
      prisma.auditLog.create({
        data: {
          actorId: app.userId,
          action: 'LOAN_CREATED',
          entityType: 'LoanApplication',
          entityId: app.id,
          metadata: { status: app.status, loanAmount: app.loanAmount },
        },
      })
    ),
  ]);
  console.log(`✓ Created ${auditLogs.length} audit log entries`);

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('   Admin: admin@creditiq.com / Admin@123');
  console.log('   User 1: john.doe@example.com / Test@123');
  console.log('   User 2: jane.smith@example.com / Test@123');
  console.log('   User 3: robert.johnson@example.com / Test@123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
