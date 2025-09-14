// /actions/buyers.ts

'use server';

import { BuyerFormSchema } from '@/lib/validations/buyerSchema';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import type { Prisma } from '@prisma/client';


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
//   const tagsArray = validatedData.tags ? validatedData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newBuyer = await tx.buyer.create({
//         data: {
//           // Explicitly map fields from validatedData
//           fullName: validatedData.fullName,
//           email: validatedData.email,
//           phone: validatedData.phone,
//           city: validatedData.city,
//           propertyType: validatedData.propertyType,
//           purpose: validatedData.purpose,
//           timeline: validatedData.timeline,
//           source: validatedData.source,
//           budgetMin: validatedData.budgetMin,
//           budgetMax: validatedData.budgetMax,
//           notes: validatedData.notes,

//           // Handle special cases
//           bhk: validatedData.bhk || null, // Handle optional enum
//           tags: tagsArray,                 // Use the correctly typed array
//           ownerId: user.id,                // Add the ownerId
//         },
        data: {
          ...validatedData,
          bhk: validatedData.bhk || null,
          ownerId: user.id,
        },
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