import Link from "next/link"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getBuyerById, deleteLead } from "../actions/buyers"
import { LeadDetailsClient } from "./lead-details-client"

export default async function ViewLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getBuyerById(id);

  return <LeadDetailsClient lead={lead} />
}
