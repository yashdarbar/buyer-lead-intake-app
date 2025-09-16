import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getBuyerById, updateBuyerLead } from "../../actions/buyers"
import BuyerEditForm from "./buyer-edit-form"

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getBuyerById(id);
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/buyers" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Leads
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Edit Lead: {lead.fullName}</h1>
          </div>
        </div>
        <BuyerEditForm lead={lead} onSubmitAction={updateBuyerLead} />
      </div>
    </div>
  )
}
