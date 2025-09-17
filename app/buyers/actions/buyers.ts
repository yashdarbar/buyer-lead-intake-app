// /actions/buyers.ts

'use server';

import { BuyerFormSchema } from '@/lib/validations/buyerSchema';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// import { Prisma } from '@prisma/client';
import { City, Status, PropertyType, Timeline } from '@prisma/client';
import { notFound } from 'next/navigation';
// Lazy import to avoid type resolution at build if deps not installed yet
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Papa from 'papaparse';

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

    revalidatePath('/buyers');
    return { success: true, message: 'Lead created successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to create lead.' };
  }
}

export async function getBuyers(
    searchParams: { [key: string]: string | string[] | undefined }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { buyers: [], totalPages: 0 };
    }

    const page = Number(Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page) || 1;
    const query = (Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q) || "";

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const andConditions: Prisma.BuyerWhereInput[] = [];

    // Add owner filter to only show user's own leads
    // andConditions.push({ ownerId: user.id });

    // --- SEARCH LOGIC ---
    if (query) {
        andConditions.push({
            OR: [
                { fullName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query } },
            ],
        });
    }

    // --- FILTER LOGIC (with corrected type casting) ---
    const statusStr = (Array.isArray(searchParams.status) ? searchParams.status[0] : searchParams.status);
    if (statusStr && Object.values(Status).includes(statusStr as Status)) {
        andConditions.push({ status: statusStr as Status });
    }

    const cityStr = (Array.isArray(searchParams.city) ? searchParams.city[0] : searchParams.city);
    if (cityStr && Object.values(City).includes(cityStr as City)) {
        andConditions.push({ city: cityStr as City });
    }

    const propertyTypeStr = (Array.isArray(searchParams.propertyType) ? searchParams.propertyType[0] : searchParams.propertyType);
    if (propertyTypeStr && Object.values(PropertyType).includes(propertyTypeStr as PropertyType)) {
        andConditions.push({ propertyType: propertyTypeStr as PropertyType });
    }

    const timelineStr = (Array.isArray(searchParams.timeline) ? searchParams.timeline[0] : searchParams.timeline);
    if (timelineStr && Object.values(Timeline).includes(timelineStr as Timeline)) {
        andConditions.push({ timeline: timelineStr as Timeline });
    }

    // Budget filter logic
    const budgetStr = (Array.isArray(searchParams.budget) ? searchParams.budget[0] : searchParams.budget);
    if (budgetStr && budgetStr !== "all") {
        const [minStr, maxStr] = budgetStr.split("-");
        const min = minStr ? parseInt(minStr) : null;
        const max = maxStr ? parseInt(maxStr) : null;

        if (min !== null && !isNaN(min)) {
            andConditions.push({ budgetMax: { gte: min } });
        }
        if (max !== null && !isNaN(max)) {
            andConditions.push({ budgetMin: { lte: max } });
        }
    }

    const where: Prisma.BuyerWhereInput = { AND: andConditions };

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
        take: 5
      },
    },
  });

  if (!buyer) {
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

    revalidatePath('/buyers');
    revalidatePath(`/buyers/${id}`);
    return { success: true, message: 'Lead updated successfully.' } as const;
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to update lead.' } as const;
  }
}

// Import buyers from CSV with per-row validation
export async function importBuyersCSV(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Authentication required.' } as const;
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return { success: false, message: 'No file uploaded.' } as const;
  }

  const filename = (file as File).name?.toLowerCase() || '';
  if (!filename.endsWith('.csv')) {
    return { success: false, message: 'Please upload a .csv file.' } as const;
  }

  const text = await (file as File).text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (parsed.errors && parsed.errors.length > 0) {
    return { success: false, message: 'CSV parsing failed.', errors: parsed.errors.map((e: any) => `Row ${e.row ?? '?'}: ${e.message}`) } as const;
  }

  const rows = (parsed.data as any[]).filter(Boolean);
  if (rows.length > 200) {
    return { success: false, message: 'Row limit exceeded. Max 200 rows allowed.' } as const;
  }

  const requiredHeaders = ['fullName','email','phone','city','propertyType','bhk','purpose','budgetMin','budgetMax','timeline','source','notes','tags','status'];
  const headersInFile = parsed.meta?.fields || [];
  const missing = requiredHeaders.filter(h => !headersInFile.includes(h));
  if (missing.length > 0) {
    return { success: false, message: `Missing required headers: ${missing.join(', ')}` } as const;
  }

  const validRows: any[] = [];
  const importErrors: string[] = [];

  rows.forEach((row, idx) => {
    // Ensure all keys are strings; Papa already provides strings
    const result = BuyerFormSchema.safeParse(row);
    const displayRow = idx + 2; // account for header row being line 1
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      const messages = Object.entries(flat).flatMap(([field, msgs]) => (msgs || []).map(m => `${field}: ${m}`));
      if (messages.length === 0) messages.push('Invalid row');
      importErrors.push(`Row ${displayRow}: ${messages.join('; ')}`);
      return;
    }

    const data = result.data as any;
    // Transformations: tags already transformed to array by schema; ensure optional enums nulls handled
    const toInsert: any = {
      ...data,
      bhk: data.bhk ?? null,
      email: data.email || null,
      notes: data.notes || null,
      budgetMin: data.budgetMin ?? null,
      budgetMax: data.budgetMax ?? null,
      ownerId: user.id,
    };
    validRows.push(toInsert);
  });

  if (importErrors.length > 0) {
    return { success: false, message: 'Validation failed.', errors: importErrors } as const;
  }

  if (validRows.length === 0) {
    return { success: false, message: 'No valid rows found.' } as const;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.buyer.createMany({ data: validRows, skipDuplicates: true });
    });
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to import leads.' } as const;
  }

  revalidatePath('/buyers');
  return { success: true } as const;
}

// Export buyers to CSV with filtering logic
export async function exportBuyersCSV(searchParamsString: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Authentication required.' } as const;
  }

  try {
    // Parse search params to get filters
    const searchParams = new URLSearchParams(searchParamsString);
    const query = searchParams.get("q") || "";

    const andConditions: Prisma.BuyerWhereInput[] = [];

    // Add owner filter to only export user's own leads
    andConditions.push({ ownerId: user.id });

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

    const statusStr = searchParams.get("status");
    if (statusStr && STATUS_VALUES.includes(statusStr)) {
      andConditions.push({ status: statusStr as any });
    }

    const cityStr = searchParams.get("city");
    if (cityStr && CITY_VALUES.includes(cityStr)) {
      andConditions.push({ city: cityStr as any });
    }

    const propertyTypeStr = searchParams.get("propertyType");
    if (propertyTypeStr && PROPERTY_TYPE_VALUES.includes(propertyTypeStr)) {
      andConditions.push({ propertyType: propertyTypeStr as any });
    }

    const timelineStr = searchParams.get("timeline");
    if (timelineStr && TIMELINE_VALUES.includes(timelineStr)) {
      andConditions.push({ timeline: timelineStr as any });
    }

    // Budget filter logic
    const budgetStr = searchParams.get("budget");
    if (budgetStr && budgetStr !== "all") {
      const [minStr, maxStr] = budgetStr.split("-");
      const min = minStr ? parseInt(minStr) : null;
      const max = maxStr ? parseInt(maxStr) : null;

      if (min !== null) {
        andConditions.push({ budgetMax: { gte: min } });
      }
      if (max !== null) {
        andConditions.push({ budgetMin: { lte: max } });
      }
    }

    const where: Prisma.BuyerWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    // Fetch all matching buyers (no pagination)
    const buyers = await prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    // Transform data for CSV export
    const csvData = buyers.map(buyer => ({
      fullName: buyer.fullName,
      email: buyer.email || '',
      phone: buyer.phone,
      city: buyer.city || '',
      propertyType: buyer.propertyType || '',
      bhk: buyer.bhk || '',
      purpose: buyer.purpose || '',
      budgetMin: buyer.budgetMin || '',
      budgetMax: buyer.budgetMax || '',
      timeline: buyer.timeline || '',
      source: buyer.source || '',
      status: buyer.status,
      notes: buyer.notes || '',
      tags: Array.isArray(buyer.tags) ? buyer.tags.join(',') : '',
      createdAt: buyer.createdAt.toISOString(),
      updatedAt: buyer.updatedAt.toISOString(),
    }));

    // Convert to CSV using Papa.unparse
    const csvString = Papa.unparse(csvData);

    return { success: true, csvData: csvString } as const;
  } catch (error) {
    console.error('Export Error:', error);
    return { success: false, message: 'Failed to export leads.' } as const;
  }
}