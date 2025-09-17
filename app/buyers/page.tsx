// FILE: /app/buyers/page.tsx
// FILE: /app/buyers/page.tsx

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getBuyers } from "./actions/buyers";
import { BuyerLeadsTable } from "@/components/buyer-leads-table";
import { BuyerLeadsHeader } from "@/components/buyer-leads-header";
import { Pagination } from "@/components/pagination";

// ADD THIS LINE: This forces the page to be dynamically rendered on every request.
export const dynamic = 'force-dynamic';

// interface BuyersPageProps {
//   searchParams: {
//     page?: string;
//     query?: string;
//   };
// }
interface BuyersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BuyersPage({ searchParams }: { searchParams: BuyersPageProps["searchParams"] }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const sp = await searchParams;
  const { buyers, totalPages } = await getBuyers(sp);

  // Get current page for pagination component
  const currentPage = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BuyerLeadsHeader />

        <main className="mt-8">
          {buyers && buyers.length > 0 ? (
            <>
              <BuyerLeadsTable initialLeads={buyers} />
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </>
          ) : (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800">No Leads Found</h3>
              <p className="text-gray-500 mt-2">Create a new lead to get started!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}