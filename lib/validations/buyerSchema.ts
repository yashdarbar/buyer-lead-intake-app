// /lib/validations/buyerSchema.ts
import { z } from 'zod';

export const BuyerFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(80),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),

  // --- THESE ENUMS ARE NOW OPTIONAL ---
  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']).optional(),
  propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']).optional(),
  purpose: z.enum(['Buy', 'Rent']).optional(),
  timeline: z.enum(['IMMEDIATE', 'THREE_TO_SIX_MONTHS', 'MORE_THAN_SIX_MONTHS', 'Exploring']).optional(),
  source: z.enum(['Website', 'Referral', 'Walk_in', 'Call', 'Other']).optional(),
  // --- END OPTIONAL ENUMS ---

  bhk: z.enum(['ONE', 'TWO', 'THREE', 'FOUR', 'Studio']).optional(),
  budgetMin: z.coerce.number().optional(),
  budgetMax: z.coerce.number().optional(),
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
  tags: z.string().optional(),
}).refine(data => {
  if ((data.propertyType === 'Apartment' || data.propertyType === 'Villa') && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for this property type',
  path: ['bhk'],
}).refine(data => {
  if (data.budgetMin && data.budgetMax) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: 'Max budget must be greater than or equal to min budget',
  path: ['budgetMax'],
});

// // FILE: lib/validations/buyerSchema.ts

// import { z } from 'zod';

// export const BuyerFormSchema = z.object({
//   fullName: z.string().min(2, 'Full name must be at least 2 characters').max(80),
//   email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
//   phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
//   city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),
//   propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),
//   bhk: z.enum(['ONE', 'TWO', 'THREE', 'FOUR', 'Studio']).optional(),
//   purpose: z.enum(['Buy', 'Rent']),
//   budgetMin: z.coerce.number().optional(),
//   budgetMax: z.coerce.number().optional(),
//   timeline: z.enum(['IMMEDIATE', 'THREE_TO_SIX_MONTHS', 'MORE_THAN_SIX_MONTHS', 'Exploring']),
//   source: z.enum(['Website', 'Referral', 'Walk_in', 'Call', 'Other']),
//   notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
//   tags: z.string().optional(),
// })
// .superRefine((data, ctx) => {
//   // Validation 1: Check for BHK if property type requires it
//   if (
//     (data.propertyType === 'Apartment' || data.propertyType === 'Villa') &&
//     !data.bhk
//   ) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: 'BHK is required for this property type',
//       path: ['bhk'],
//     });
//   }

//   // Validation 2: Check if budgetMax is greater than or equal to budgetMin
//   if (
//     data.budgetMin !== undefined &&
//     data.budgetMax !== undefined &&
//     data.budgetMax < data.budgetMin
//   ) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: 'Max budget must be greater than or equal to min budget',
//       path: ['budgetMax'],
//     });
//   }
// });