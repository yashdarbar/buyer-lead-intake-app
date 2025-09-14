// /actions/buyers.ts

'use server';

import { BuyerFormSchema } from '@/lib/validations/buyerSchema';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// // 1. Zod Schema (can be co-located or moved to a separate /lib/validations.ts file)
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
// }).refine(data => {
//   if ((data.propertyType === 'Apartment' || data.propertyType === 'Villa') && !data.bhk) {
//     return false;
//   }
//   return true;
// }, {
//   message: 'BHK is required for this property type',
//   path: ['bhk'],
// }).refine(data => {
//   if (data.budgetMin && data.budgetMax) {
//     return data.budgetMax >= data.budgetMin;
//   }
//   return true;
// }, {
//   message: 'Max budget must be greater than or equal to min budget',
//   path: ['budgetMax'],
// });

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
//       path: ['bhk'], // Field to attach the error to
//     });
//   }

//   if (
//     data.budgetMin !== undefined &&
//     data.budgetMax !== undefined &&
//     data.budgetMax < data.budgetMin
//   ) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: 'Max budget must be greater than or equal to min budget',
//       path: ['budgetMax'], // Field to attach the error to
//     });
//   }
// });

// 2. "Create" Server Action
export async function createBuyerLead(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Authentication required.' };
  }

  const rawFormData = Object.fromEntries(formData.entries());
  const result = BuyerFormSchema.safeParse(rawFormData);

  if (!result.success) {
    return {
      success: false,
      message: 'Invalid form data.',
      errors: result.error.flatten().fieldErrors,
    };
  }

  const validatedData = result.data;
  const tagsArray = validatedData.tags ? validatedData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

  try {
    await prisma.$transaction(async (tx) => {
      const newBuyer = await tx.buyer.create({
        data: {
          // Explicitly map fields from validatedData
          fullName: validatedData.fullName,
          email: validatedData.email,
          phone: validatedData.phone,
          city: validatedData.city,
          propertyType: validatedData.propertyType,
          purpose: validatedData.purpose,
          timeline: validatedData.timeline,
          source: validatedData.source,
          budgetMin: validatedData.budgetMin,
          budgetMax: validatedData.budgetMax,
          notes: validatedData.notes,

          // Handle special cases
          bhk: validatedData.bhk || null, // Handle optional enum
          tags: tagsArray,                 // Use the correctly typed array
          ownerId: user.id,                // Add the ownerId
        },
        // data: {
        //   ...validatedData,
        //   bhk: validatedData.bhk || null,
        //   tags: tagsArray,
        //   ownerId: user.id,
        // },
      });

      await tx.buyerHistory.create({
        data: {
          buyerId: newBuyer.id,
          changedBy: user.email || user.id,
          diff: { created: newBuyer },
        },
      });
    });
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to create lead.' };
  }

  revalidatePath('/buyers');
  redirect('/buyers');
}

// You will add your other buyer-related actions here later...
// export async function updateBuyer(formData: FormData) { ... }
// export async function deleteBuyer(id: string) { ... }