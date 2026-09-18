import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// DEVELOPMENT ONLY credentials — never use in production.
const DEV_PASSWORD = 'DevPass123!';

async function main() {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  // ----- Users -----
  const admin = await prisma.user.upsert({
    where: { email: 'admin@soulnestt.dev' },
    update: {},
    create: {
      name: 'Dev Admin',
      email: 'admin@soulnestt.dev',
      phone: '+919000000001',
      passwordHash,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const tenant1 = await prisma.user.upsert({
    where: { email: 'tenant1@soulnestt.dev' },
    update: {},
    create: {
      name: 'Aarav Sharma',
      email: 'tenant1@soulnestt.dev',
      phone: '+919000000002',
      passwordHash,
      role: 'TENANT',
      isVerified: true,
    },
  });

  const tenant2 = await prisma.user.upsert({
    where: { email: 'tenant2@soulnestt.dev' },
    update: {},
    create: {
      name: 'Priya Verma',
      email: 'tenant2@soulnestt.dev',
      phone: '+919000000003',
      passwordHash,
      role: 'TENANT',
    },
  });

  const owner1 = await prisma.user.upsert({
    where: { email: 'owner1@soulnestt.dev' },
    update: {},
    create: {
      name: 'Rajesh Gupta',
      email: 'owner1@soulnestt.dev',
      phone: '+919000000004',
      passwordHash,
      role: 'OWNER',
      isVerified: true,
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: 'owner2@soulnestt.dev' },
    update: {},
    create: {
      name: 'UrbanStay Homes',
      email: 'owner2@soulnestt.dev',
      phone: '+919000000005',
      passwordHash,
      role: 'OWNER',
    },
  });

  // ----- Profiles -----
  await prisma.tenantProfile.upsert({
    where: { userId: tenant1.id },
    update: {},
    create: {
      userId: tenant1.id,
      gender: 'MALE',
      age: 24,
      occupation: 'SOFTWARE_ENGINEER',
      collegeOrCompany: 'Infosys',
      budgetMin: 8000,
      budgetMax: 15000,
      preferredLocations: ['Koramangala', 'HSR Layout'],
      roomType: 'SINGLE',
      moveInDate: new Date('2026-10-01'),
      foodPreference: 'VEG',
      smokingPreference: 'NO',
      sleepSchedule: 'EARLY',
      cleanlinessPreference: 'HIGH',
      bio: 'Quiet working professional looking for a peaceful place.',
    },
  });

  await prisma.tenantProfile.upsert({
    where: { userId: tenant2.id },
    update: {},
    create: {
      userId: tenant2.id,
      gender: 'FEMALE',
      age: 21,
      occupation: 'STUDENT',
      collegeOrCompany: 'Christ University',
      budgetMin: 6000,
      budgetMax: 12000,
      preferredLocations: ['Koramangala', 'BTM Layout'],
      roomType: 'SHARED',
      foodPreference: 'VEG',
      sleepSchedule: 'EARLY',
      cleanlinessPreference: 'HIGH',
    },
  });

  await prisma.ownerProfile.upsert({
    where: { userId: owner1.id },
    update: {},
    create: {
      userId: owner1.id,
      ownerType: 'INDIVIDUAL',
      phone: '+919000000004',
      verificationStatus: 'APPROVED',
    },
  });

  await prisma.ownerProfile.upsert({
    where: { userId: owner2.id },
    update: {},
    create: {
      userId: owner2.id,
      ownerType: 'ORGANIZATION',
      organizationName: 'UrbanStay Homes Pvt Ltd',
      phone: '+919000000005',
      verificationStatus: 'PENDING',
    },
  });

  // ----- Amenities -----
  const amenityNames = ['WiFi', 'Power Backup', 'Housekeeping', 'Laundry', 'Parking', 'AC'];
  const amenities = [];
  for (const name of amenityNames) {
    amenities.push(
      await prisma.amenity.upsert({ where: { name }, update: {}, create: { name } })
    );
  }

  // ----- Properties -----
  const existing = await prisma.property.findFirst({ where: { title: 'Sunny Single Room in Koramangala' } });
  let properties;
  if (existing) {
    properties = await prisma.property.findMany({ orderBy: { createdAt: 'asc' }, take: 4 });
  } else {
    properties = await prisma.$transaction([
      prisma.property.create({
        data: {
          ownerId: owner1.id,
          title: 'Sunny Single Room in Koramangala',
          description: 'Well-lit single room in a shared flat, close to metro.',
          propertyType: 'ROOM',
          roomType: 'SINGLE',
          address: '12, 5th Block, Koramangala',
          area: 'Koramangala',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560095',
          latitude: 12.9352,
          longitude: 77.6245,
          rent: 12000,
          deposit: 36000,
          availableFrom: new Date('2026-10-01'),
          genderPreference: 'ANY',
          status: 'PUBLISHED',
        },
      }),
      prisma.property.create({
        data: {
          ownerId: owner1.id,
          title: 'Cozy 1BHK Flat in HSR Layout',
          description: 'Independent 1BHK with balcony and covered parking.',
          propertyType: 'FLAT',
          roomType: 'ENTIRE',
          address: '27, Sector 2, HSR Layout',
          area: 'HSR Layout',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560102',
          latitude: 12.9081,
          longitude: 77.6476,
          rent: 22000,
          deposit: 100000,
          availableFrom: new Date('2026-09-15'),
          status: 'PUBLISHED',
        },
      }),
      prisma.property.create({
        data: {
          ownerId: owner2.id,
          title: 'UrbanStay PG for Women - BTM',
          description: 'Managed PG with meals, housekeeping and 24x7 security.',
          propertyType: 'PG',
          roomType: 'SHARED',
          address: '44, 2nd Stage, BTM Layout',
          area: 'BTM Layout',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560076',
          latitude: 12.9166,
          longitude: 77.6101,
          rent: 9500,
          deposit: 19000,
          availableFrom: new Date('2026-09-20'),
          genderPreference: 'FEMALE',
          status: 'PUBLISHED',
        },
      }),
      prisma.property.create({
        data: {
          ownerId: owner2.id,
          title: 'Shared Workspace Corner - Indiranagar',
          description: 'Shared space suitable for students and remote workers.',
          propertyType: 'SHARED_SPACE',
          address: '100 Feet Road, Indiranagar',
          area: 'Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          rent: 7000,
          status: 'DRAFT',
        },
      }),
    ]);

    // Images (URLs only for MVP)
    await prisma.propertyImage.createMany({
      data: [
        { propertyId: properties[0].id, url: 'https://picsum.photos/seed/room1/800/600', sortOrder: 0 },
        { propertyId: properties[0].id, url: 'https://picsum.photos/seed/room2/800/600', sortOrder: 1 },
        { propertyId: properties[1].id, url: 'https://picsum.photos/seed/flat1/800/600', sortOrder: 0 },
        { propertyId: properties[2].id, url: 'https://picsum.photos/seed/pg1/800/600', sortOrder: 0 },
      ],
    });

    // Property <-> Amenity links
    await prisma.propertyAmenity.createMany({
      data: [
        { propertyId: properties[0].id, amenityId: amenities[0].id }, // WiFi
        { propertyId: properties[0].id, amenityId: amenities[1].id }, // Power Backup
        { propertyId: properties[1].id, amenityId: amenities[0].id },
        { propertyId: properties[1].id, amenityId: amenities[4].id }, // Parking
        { propertyId: properties[1].id, amenityId: amenities[5].id }, // AC
        { propertyId: properties[2].id, amenityId: amenities[2].id }, // Housekeeping
        { propertyId: properties[2].id, amenityId: amenities[3].id }, // Laundry
      ],
    });

    // Saved properties
    await prisma.savedProperty.createMany({
      data: [
        { tenantId: tenant1.id, propertyId: properties[0].id },
        { tenantId: tenant1.id, propertyId: properties[2].id },
        { tenantId: tenant2.id, propertyId: properties[2].id },
      ],
    });

    // Enquiries
    await prisma.enquiry.createMany({
      data: [
        {
          tenantId: tenant1.id,
          ownerId: owner1.id,
          propertyId: properties[0].id,
          message: 'Is the room available from October 1st? Can I visit this weekend?',
          status: 'PENDING',
        },
        {
          tenantId: tenant2.id,
          ownerId: owner2.id,
          propertyId: properties[2].id,
          message: 'Are meals included in the rent?',
          status: 'ACCEPTED',
        },
      ],
    });
  }

  // ----- Verification: duplicate saves are rejected -----
  const dupTenantId = tenant1.id;
  const dupPropertyId = properties[0].id;
  const alreadySaved = await prisma.savedProperty.findUnique({
    where: { tenantId_propertyId: { tenantId: dupTenantId, propertyId: dupPropertyId } },
  });
  if (alreadySaved) {
    try {
      await prisma.savedProperty.create({
        data: { tenantId: dupTenantId, propertyId: dupPropertyId },
      });
      console.error('FAIL: duplicate SavedProperty was allowed!');
      process.exitCode = 1;
    } catch (e) {
      if (e.code === 'P2002') {
        console.log('OK: duplicate SavedProperty correctly rejected (P2002).');
      } else {
        throw e;
      }
    }
  }

  const userCount = await prisma.user.count();
  const propertyCount = await prisma.property.count();
  console.log(`Seed complete: ${userCount} users, ${propertyCount} properties.`);
  console.log(`DEVELOPMENT login for all seeded users: ${DEV_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
