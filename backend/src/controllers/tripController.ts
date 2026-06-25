import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const validateTrip = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const { pin, driverId } = req.body;

  try {
    // 1. Find the booking with its related trip and wallet
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        trip: true,
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // 2. Validate Driver Authorization
    if (booking.trip.driver_id !== driverId) {
      return res.status(403).json({ error: 'Unauthorized: Only the driver of this trip can validate the PIN' });
    }

    // 3. Validate PIN
    if (booking.boarding_pin !== pin) {
      return res.status(400).json({ error: 'Invalid boarding PIN' });
    }

    // 4. Validate current status to prevent double-processing
    if (booking.payment_status === 'RELEASED') {
      return res.status(400).json({ error: 'Funds have already been released for this booking' });
    }
    
    if (booking.payment_status !== 'ESCROW') {
      return res.status(400).json({ error: 'Payment is not in ESCROW state' });
    }

    // 5. Execute Transaction: Release Escrow & Update Status
    const tripCost = booking.trip.suggested_price_clp;

    await prisma.$transaction(async (tx) => {
      // Update Booking Status
      await tx.booking.update({
        where: { id: bookingId },
        data: { payment_status: 'RELEASED' }
      });

      // Increase Driver's available balance
      await tx.wallet.update({
        where: { user_id: driverId },
        data: {
          available_balance: {
            increment: tripCost
          }
        }
      });
      
      // Decrease Passenger's Escrow Balance
      await tx.wallet.update({
        where: { user_id: booking.passenger_id },
        data: {
          escrow_balance: {
            decrement: tripCost
          }
        }
      });
    });

    return res.status(200).json({ success: true, message: 'Trip validated and funds released successfully' });

  } catch (error) {
    console.error('Error validating trip:', error);
    return res.status(500).json({ error: 'Internal server error during validation' });
  }
};
