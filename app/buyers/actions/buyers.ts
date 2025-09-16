// /actions/buyers.ts

'use server';

import { BuyerFormSchema } from '@/lib/validations/buyerSchema';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { notFound } from 'next/navigation';

// import type { Prisma } from '@prisma/client';

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

// Overloads to support existing calls and new filters
//



export async function getBuyers(
    searchParams: { [key: string]: string | string[] | undefined }
) {
    const page = Number(Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page) || 1;
    const queryParamQ = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
    const queryParamQuery = Array.isArray(searchParams.query) ? searchParams.query[0] : searchParams.query;
    const query = queryParamQ || queryParamQuery || "";

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const andConditions: Prisma.BuyerWhereInput[] = [];

    // --- SEARCH LOGIC ---
    if (query) {
        andConditions.push({
            OR: [
                { fullName: { contains: query, mode: 'insensitive' } },
            ],
        });
    }

    // --- FILTER LOGIC using string whitelists to avoid enum casting issues ---
    const STATUS_VALUES = ['New','Qualified','Contacted','Visited','Negotiation','Converted','Dropped'];
    const CITY_VALUES = ['Chandigarh','Mohali','Zirakpur','Panchkula','Other'];
    const PROPERTY_TYPE_VALUES = ['Apartment','Villa','Plot','Office','Retail'];
    const TIMELINE_VALUES = ['IMMEDIATE','THREE_TO_SIX_MONTHS','MORE_THAN_SIX_MONTHS','Exploring'];

    const statusStr = (Array.isArray(searchParams.status) ? searchParams.status[0] : searchParams.status) as string | undefined;
    if (statusStr && STATUS_VALUES.includes(statusStr)) {
        andConditions.push({ status: statusStr as any });
    }

    const cityStr = (Array.isArray(searchParams.city) ? searchParams.city[0] : searchParams.city) as string | undefined;
    if (cityStr && CITY_VALUES.includes(cityStr)) {
        andConditions.push({ city: cityStr as any });
    }

    const propertyTypeStr = (Array.isArray(searchParams.propertyType) ? searchParams.propertyType[0] : searchParams.propertyType) as string | undefined;
    if (propertyTypeStr && PROPERTY_TYPE_VALUES.includes(propertyTypeStr)) {
        andConditions.push({ propertyType: propertyTypeStr as any });
    }

    const timelineStr = (Array.isArray(searchParams.timeline) ? searchParams.timeline[0] : searchParams.timeline) as string | undefined;
    if (timelineStr && TIMELINE_VALUES.includes(timelineStr)) {
        andConditions.push({ timeline: timelineStr as any });
    }

    // You can add budget range logic here later if needed

    const where: Prisma.BuyerWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    try {
        const buyers = await prisma.buyer.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            take: pageSize,
            skip: skip,
        });

        const totalBuyers = await prisma.buyer.count({ where });

        return { buyers, totalPages: Math.ceil(totalBuyers / pageSize) };
    } catch (error) {
        console.error('Database Error:', error);
        return { buyers: [], totalPages: 0 };
    }
}
// Fetch a single buyer with ownership check and history
export async function getBuyerById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) notFound();

  const buyer = await prisma.buyer.findUnique({
    where: { id },
    include: {
      history: {
        orderBy: { changedAt: 'desc' },
      },
    },
  });

  if (!buyer || buyer.ownerId !== user.id) {
    notFound();
  }

  return buyer;
}

// Update an existing buyer with validation, ownership and concurrency check
export async function updateBuyerLead(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Authentication required.' } as const;
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = BuyerFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Invalid form data.',
      errors: parsed.error.flatten().fieldErrors,
    } as const;
  }

  const existing = await prisma.buyer.findUnique({ where: { id } });
  if (!existing || existing.ownerId !== user.id) {
    return { success: false, message: 'Unauthorized or lead not found.' } as const;
  }

  // Concurrency check
  const submittedUpdatedAt = String(raw.updatedAt || '');
  const existingStamp = existing.updatedAt.toISOString();
  if (!submittedUpdatedAt || submittedUpdatedAt !== existingStamp) {
    return { success: false, message: 'This lead was modified by someone else. Please refresh and try again.' } as const;
  }

  const validated = parsed.data;

  // Build a simple diff of changed fields
  const changed: Record<string, { from: unknown; to: unknown }> = {};
  const fieldsToCompare: Array<keyof typeof validated> = [
    'fullName','email','phone','city','propertyType','bhk','purpose','budgetMin','budgetMax','timeline','source','status','notes','tags',
  ];
  for (const field of fieldsToCompare) {
    const beforeVal = (existing as any)[field];
    const afterVal = (validated as any)[field];
    const normalizedBefore = Array.isArray(beforeVal) ? JSON.stringify(beforeVal) : beforeVal;
    const normalizedAfter = Array.isArray(afterVal) ? JSON.stringify(afterVal) : afterVal;
    if (normalizedBefore !== normalizedAfter) {
      changed[field as string] = { from: beforeVal, to: afterVal };
    }
  }

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.buyer.update({
        where: { id },
        data: {
          ...validated,
        },
      });

      await tx.buyerHistory.create({
        data: {
          buyerId: id,
          changedBy: user.email || user.id,
          diff: JSON.parse(JSON.stringify({ changed })) as unknown as Prisma.InputJsonValue,
        },
      });
    });
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to update lead.' } as const;
  }

  revalidatePath('/buyers');
  revalidatePath(`/buyers/${id}`);
  redirect(`/buyers/${id}`);
}