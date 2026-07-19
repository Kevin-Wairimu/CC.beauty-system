import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const appointmentSchema = z.object({
  body: z.object({
    service: z.string().min(1, 'Service name is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(10, 'Phone must be at least 10 digits').max(15).optional().or(z.literal('')),
    name: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
    serviceId: z.string().uuid().optional().or(z.literal('')),
    staffId: z.string().uuid().optional().or(z.literal('')),
    sessionId: z.string().optional().or(z.literal('')),
  }),
});

export const enquirySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is too short'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    message: z.string().min(10, 'Message must be at least 10 characters'),
  }),
});

export const profileUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  }),
});
