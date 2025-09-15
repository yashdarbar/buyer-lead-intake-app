// /actions/buyers.ts

'use server';

import { BuyerFormSchema } from '@/lib/validations/buyerSchema';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// import { Prisma } from '@prisma/client';

import type { Prisma } from '@prisma/client';

export async function deleteLead(leadId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Authentication required.' };
  }

  try {
    // Ownership check: Ensure the user owns this lead before deleting
    const lead = await prisma.buyer.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.ownerId !== user.id) {
      return { success: false, message: 'Unauthorized or lead not found.' };
    }

    await prisma.buyer.delete({
      where: {
        id: leadId,
      },
    });

    revalidatePath('/buyers'); // This clears the cache for the buyers page
    return { success: true, message: 'Lead deleted successfully.' };

  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: 'Failed to delete lead.' };
  }
}

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

export async function getBuyers(page = 1, query = "") {
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const where: Prisma.BuyerWhereInput = query ? {
    OR: [
      { fullName: { contains: query, mode: Prisma.QueryMode.insensitive } },
      { email: { contains: query, mode: 'insensitive' } },
      { phone: { contains: query} },
    ],
  } : {};

  try {
    const buyers = await prisma.buyer.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      take: pageSize,
      skip: skip,
    });

    const totalBuyers = await prisma.buyer.count({ where });

    return { buyers, totalPages: Math.ceil(totalBuyers / pageSize) };

  } catch (error) {
    console.error('Database Error:', error);
    // In a real app, you might throw a more specific error
    return { buyers: [], totalPages: 0 };
  }
}