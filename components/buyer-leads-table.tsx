// FILE: /components/buyer-leads-table.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DeleteLeadModal } from "./delete-lead-modal"
// 1. Import the 'Buyer' type from your generated Prisma client
import type { Buyer } from "@prisma/client"
import { deleteLead } from "@/app/buyers/actions/buyers" // We will create this action next
import { toast } from "react-hot-toast" // Assuming you use a toast library for notifications

// Updated to use capitalized status from your Prisma enum
const getStatusColor = (status: string) => {
  switch (status) {
    case "New": return "bg-blue-100 text-blue-800"
    case "Contacted": return "bg-yellow-100 text-yellow-800"
    case "Qualified": return "bg-green-100 text-green-800"
    case "Visited": return "bg-teal-100 text-teal-800"
    case "Negotiation": return "bg-orange-100 text-orange-800"
    case "Converted": return "bg-purple-100 text-purple-800"
    case "Dropped": return "bg-red-100 text-red-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

// 2. Define props for the component
type BuyerLeadsTableProps = {
  initialLeads: Buyer[];
  currentUserId: string;
}

export function BuyerLeadsTable({ initialLeads, currentUserId }: BuyerLeadsTableProps) {
  // 3. Use the prop as the initial state and REMOVE mockLeads
  const [leads, setLeads] = useState(initialLeads)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; leadId: string | null; leadName: string }>({
    isOpen: false,
    leadId: null,
    leadName: "",
  })
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (leadId: string, leadName: string) => {
    setDeleteModal({ isOpen: true, leadId, leadName })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.leadId) return;

    setIsDeleting(true);
    try {
      const result = await deleteLead(deleteModal.leadId);

      if (result.success) {
        setLeads(leads.filter((lead) => lead.id !== deleteModal.leadId));
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while deleting the lead");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, leadId: null, leadName: "" });
    }
  };

  const handleDeleteCancel = () => {
   setDeleteModal({ isOpen: false, leadId: null, leadName: "" })
  }

return (
 <>
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
       <div className="hidden lg:block">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            {/* 4. Update table headers to match your assignment columns */}
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Property Type</div>
              <div className="col-span-2">Budget</div>
              <div className="col-span-2">Last Updated</div>
              <div className="col-span-1 text-right">Actions</div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
             {leads.map((lead) => (
            <div key={lead.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* 5. Update rows to render real data from your Prisma model */}
                 <div className="col-span-3">
                 <div className="text-sm font-medium text-gray-900">{lead.fullName}</div>
                 <div className="text-sm text-gray-500 truncate">{lead.phone}</div>
                 </div>
                  <div className="col-span-2">
                    <Badge className={`${getStatusColor(lead.status)} capitalize`}>{lead.status}</Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-900">{lead.propertyType}</span>
                  </div>
                    <div className="col-span-2">
                    <span className="text-sm text-gray-900">
                      {lead.budgetMin ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(lead.budgetMin) : 'N/A'}
                      {lead.budgetMin && lead.budgetMax ? ' - ' : ''}
                      {lead.budgetMax && !lead.budgetMin ? 'Up to ' : ''}
                      {lead.budgetMax ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(lead.budgetMax) : ''}
                    </span>
                    </div>
                    <div className="col-span-2">
                    <span className="text-sm text-gray-900">{new Date(lead.updatedAt).toLocaleDateString('en-IN')}</span>
                     </div>
                    <div className="col-span-1 text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/buyers/${lead.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                            </Link>
                            </DropdownMenuItem>

                        {lead.ownerId === currentUserId && (
            <>
              <DropdownMenuItem asChild>
                <Link href={`/buyers/${lead.id}/edit`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" /> Edit Lead
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                onClick={() => handleDeleteClick(lead.id, lead.fullName)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Lead
              </DropdownMenuItem>
            </>
          )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
                </div>
             </div>
            ))}
        </div>
        </div>

        {/* Mobile Card View - Visible on mobile and tablet */}
        <div className="lg:hidden divide-y divide-gray-200">
          {leads.map((lead) => (
            <div key={lead.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{lead.fullName}</h3>
                  <p className="text-sm text-gray-500">{lead.phone}</p>
                  {lead.email && (
                    <p className="text-sm text-gray-500">{lead.email}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(lead.status)} capitalize`}>
                    {lead.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/buyers/${lead.id}`} className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/buyers/${lead.id}/edit`} className="flex items-center">
                          <Edit className="mr-2 h-4 w-4" /> Edit Lead
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                        onClick={() => handleDeleteClick(lead.id, lead.fullName)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Property Type:</span>
                  <p className="font-medium text-gray-900">{lead.propertyType || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Budget:</span>
                  <p className="font-medium text-gray-900">
                    {lead.budgetMin ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(lead.budgetMin) : 'N/A'}
                    {lead.budgetMax && lead.budgetMin && ' - '}
                    {lead.budgetMax ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(lead.budgetMax) : ''}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">City:</span>
                  <p className="font-medium text-gray-900">{lead.city || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(lead.updatedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      {/* ... Table Footer and Delete Modal ... */}
        {deleteModal.isOpen && deleteModal.leadId && (
          <DeleteLeadModal
            leadId={deleteModal.leadId}
            leadName={deleteModal.leadName}
            onDelete={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            isDeleting={isDeleting}
          />
        )}
</>
)
}
