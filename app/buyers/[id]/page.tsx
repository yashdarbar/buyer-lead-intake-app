import { getBuyerById, deleteLead } from "../actions/buyers"
import { LeadDetailsClient } from "./lead-details-client"
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ViewLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { id } = await params;
  if (!user) {
    redirect('/login');
  }
  const lead = await getBuyerById(id);

  return <LeadDetailsClient lead={lead} currentUser={user} />
}
