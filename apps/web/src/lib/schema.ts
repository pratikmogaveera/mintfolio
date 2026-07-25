import { z } from 'zod';

export const loginUserSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Identifier must be at least 3 characters long.')
    .max(254, 'Identifier can be at most 254 characters long.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(40, 'Password must be at most 40 characters long.'),
});

export const signUpUserSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email.')
    .min(3, 'Email must be at least 3 characters long.')
    .max(254, 'Email can be at most 254 characters long.'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long.')
    .max(40, 'Username can be at most 40 characters long.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(40, 'Password must be at most 40 characters long.'),
});

export const createHoldingSchema = z.object({
  scheme_code: z.string().min(1, 'Please select a scheme.'),
  scheme_name: z.string().min(1, 'Please select a scheme.'),
  units: z.coerce.number().min(0.01, 'Units must be at least 0.01.'),
  amount_invested: z.coerce.number().min(10, 'Amount invested must be at least ₹10.'),
});

export const updateHoldingSchema = z
  .object({
    units: z.coerce.number().min(0.01, 'Units must be at least 0.01.').optional(),
    amount_invested: z.coerce.number().min(10, 'Amount invested must be at least ₹10.').optional(),
  })
  .refine((data) => data.units !== undefined || data.amount_invested !== undefined, {
    message: 'At least one field must be provided.',
  });

export type LoginUserPayload = z.infer<typeof loginUserSchema>;

export type SignUpUserPayload = z.infer<typeof signUpUserSchema>;

export type CreateHoldingPayload = z.infer<typeof createHoldingSchema>;

export type UpdateHoldingPayload = z.infer<typeof updateHoldingSchema>;
