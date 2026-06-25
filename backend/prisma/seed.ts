import { PrismaClient, Role, TripStatus, BookingStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  // Delete all data to start fresh. Order matters due to foreign keys.
  await prisma.booking.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding mock users...');

  // 1. Create Users
  const fernando = await prisma.user.create({
    data: {
      email: 'fernando.driver@example.com',
      full_name: 'Fernando',
      phone: '+56 9 1234 5678',
      role: Role.DRIVER,
      university_verified: true,
      wallet: {
        create: {
          available_balance: 0,
          escrow_balance: 0,
        }
      }
    }
  });

  const german = await prisma.user.create({
    data: {
      email: 'german.passenger@example.com',
      full_name: 'Germán',
      phone: '+56 9 8765 4321',
      role: Role.PASSENGER,
      university_verified: true,
      wallet: {
        create: {
          available_balance: 5000,
          escrow_balance: 0, // This will be updated when the booking is created
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      email: 'benjamin.passenger@example.com',
      full_name: 'Benjamín',
      phone: '+56 9 1122 3344',
      role: Role.PASSENGER,
      university_verified: true,
      wallet: {
        create: {
          available_balance: 2000,
          escrow_balance: 0,
        }
      }
    }
  });

  // 2. Create Vehicle for Fernando
  console.log('Creating vehicle for driver Fernando...');
  await prisma.vehicle.create({
    data: {
      driver_id: fernando.id,
      make_model: 'Toyota Yaris 2021',
      license_plate: 'ABCD-12',
      verification_status: 'VERIFIED',
    }
  });

  // 3. Create a Trip from San Antonio to Valparaíso (Eje Brasil)
  console.log('Creating a scheduled trip...');
  const tripPrice = 2500;
  const departureDate = new Date();
  departureDate.setHours(departureDate.getHours() + 2); // Trip in 2 hours

  const trip = await prisma.trip.create({
    data: {
      driver_id: fernando.id,
      origin_name: 'San Antonio',
      origin_lat: -33.5939, // Coordinates approx for San Antonio
      origin_lng: -71.6074,
      destination_name: 'Valparaíso (Eje Brasil)',
      destination_lat: -33.0441, // Coordinates approx for Eje Brasil PUCV
      destination_lng: -71.6148,
      departure_datetime: departureDate,
      available_seats: 3, // Out of 4
      suggested_price_clp: tripPrice,
      status: TripStatus.SCHEDULED,
    }
  });

  // 4. Create an active Booking for Germán in ESCROW status
  console.log('Creating an active booking in ESCROW status...');
  const booking = await prisma.booking.create({
    data: {
      trip_id: trip.id,
      passenger_id: german.id,
      status: BookingStatus.CONFIRMED,
      payment_status: PaymentStatus.ESCROW,
      boarding_pin: '741', // 3 digit pin to test validation
    }
  });

  // 5. Update Germán's wallet to move funds to Escrow
  await prisma.wallet.update({
    where: { user_id: german.id },
    data: {
      available_balance: { decrement: tripPrice },
      escrow_balance: { increment: tripPrice },
    }
  });

  console.log('--- SEEDING COMPLETE ---');
  console.log('Test the validation endpoint with the following data:');
  console.log(`Booking ID: ${booking.id}`);
  console.log(`Driver ID: ${fernando.id}`);
  console.log(`Boarding PIN: 741`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
