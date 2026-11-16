import { z } from 'zod';

export const reservationRequestSchema = z.object({
  guestName: z.string().min(2, 'Guest name is required'),
  email: z.string().email('A valid email is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  notes: z.string().max(1000).optional()
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  price: z.number().positive(),
  category: z.string().min(2)
});
