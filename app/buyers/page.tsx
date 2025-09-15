// FILE: /app/buyers/page.tsx
// FILE: /app/buyers/page.tsx

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getBuyers } from "./actions/buyers";
import { BuyerLeadsTable } from "@/components/buyer-leads-table";
import { BuyerLeadsHeader } from "@/components/buyer-leads-header";

// ADD THIS LINE: This forces the page to be dynamically rendered on every request.
export const dynamic = 'force-dynamic';

// interface BuyersPageProps {
//   searchParams: {
//     page?: string;
//     query?: string;
//   };
// }
interface BuyersPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function BuyersPage({ searchParams }: BuyersPageProps) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

//   const currentPage = Number(searchParams.page) || 1;
//   const query = searchParams.query || '';
  const page = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const query = Array.isArray(searchParams.query) ? searchParams.query[0] : searchParams.query;

  const currentPage = Number(page) || 1;
  const searchQuery = query || '';

  const { buyers, totalPages } = await getBuyers(currentPage, query);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BuyerLeadsHeader />

        <main className="mt-8">
          {buyers && buyers.length > 0 ? (
            <BuyerLeadsTable initialLeads={buyers} />
          ) : (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800">No Leads Found</h3>
              <p className="text-gray-500 mt-2">Create a new lead to get started!</p>
            </div>
          )}

          {/* <Pagination currentPage={currentPage} totalPages={totalPages} /> */}
        </main>
      </div>
    </div>
  );
}