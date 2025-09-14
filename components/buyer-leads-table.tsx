"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DeleteLeadModal } from "./delete-lead-modal"

// Mock data for demonstration
const mockLeads = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    status: "qualified",
    source: "website",
    budget: "$250k - $500k",
    location: "Downtown",
    lastContact: "2024-01-15",
    notes: "Interested in 2-bedroom condo",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "(555) 987-6543",
    status: "new",
    source: "referral",
    budget: "$500k - $1M",
    location: "Waterfront",
    lastContact: "2024-01-14",
    notes: "Looking for luxury apartment",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@email.com",
    phone: "(555) 456-7890",
    status: "contacted",
    source: "social",
    budget: "$100k - $250k",
    location: "Suburbs",
    lastContact: "2024-01-13",
    notes: "First-time buyer",
  },
  {
    id: 4,
    name: "David Thompson",
    email: "david.thompson@email.com",
    phone: "(555) 321-0987",
    status: "converted",
    source: "advertising",
    budget: "$1M+",
    location: "Uptown",
    lastContact: "2024-01-12",
    notes: "Purchased penthouse",
  },
  {
    id: 5,
    name: "Lisa Wang",
    email: "lisa.wang@email.com",
    phone: "(555) 654-3210",
    status: "lost",
    source: "cold-call",
    budget: "$0 - $100k",
    location: "Downtown",
    lastContact: "2024-01-11",
    notes: "Budget constraints",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800"
    case "contacted":
      return "bg-yellow-100 text-yellow-800"
    case "qualified":
      return "bg-green-100 text-green-800"
    case "converted":
      return "bg-purple-100 text-purple-800"
    case "lost":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function BuyerLeadsTable() {
  const [leads, setLeads] = useState(mockLeads)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; leadId: number | null; leadName: string }>({
    isOpen: false,
    leadId: null,
    leadName: "",
  })

  const handleDeleteClick = (leadId: number, leadName: string) => {
    setDeleteModal({ isOpen: true, leadId, leadName })
  }

  const handleDeleteConfirm = () => {
    if (deleteModal.leadId) {
      setLeads(leads.filter((lead) => lead.id !== deleteModal.leadId))
      setDeleteModal({ isOpen: false, leadId: null, leadName: "" })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, leadId: null, leadName: "" })
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-2">Name</div>
            <div className="col-span-2">Contact</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Source</div>
            <div className="col-span-2">Budget</div>
            <div className="col-span-1">Location</div>
            <div className="col-span-2">Last Contact</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {leads.map((lead) => (
            <div key={lead.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Name */}
                <div className="col-span-2">
                  <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                  <div className="text-sm text-gray-500 truncate">{lead.notes}</div>
                </div>

                {/* Contact */}
                <div className="col-span-2">
                  <div className="text-sm text-gray-900">{lead.email}</div>
                  <div className="text-sm text-gray-500">{lead.phone}</div>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <Badge className={`${getStatusColor(lead.status)} capitalize`}>{lead.status}</Badge>
                </div>

                {/* Source */}
                <div className="col-span-1">
                  <span className="text-sm text-gray-900 capitalize">{lead.source}</span>
                </div>

                {/* Budget */}
                <div className="col-span-2">
                  <span className="text-sm text-gray-900">{lead.budget}</span>
                </div>

                {/* Location */}
                <div className="col-span-1">
                  <span className="text-sm text-gray-900">{lead.location}</span>
                </div>

                {/* Last Contact */}
                <div className="col-span-2">
                  <span className="text-sm text-gray-900">{lead.lastContact}</span>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/buyers/${lead.id}`} className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/buyers/${lead.id}/edit`} className="flex items-center">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Lead
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(lead.id, lead.name)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{" "}
              <span className="font-medium">5</span> results
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteLeadModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        leadName={deleteModal.leadName}
      />
    </>
  )
}
