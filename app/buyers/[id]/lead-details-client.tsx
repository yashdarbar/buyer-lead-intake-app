"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { deleteLead } from "../actions/buyers"
import { DeleteLeadModal } from "@/components/delete-lead-modal"
import toast from "react-hot-toast"
import type { User } from "@supabase/supabase-js"

interface LeadDetailsClientProps {
  currentUser: User;
  lead: {
    ownerId: string
    id: string
    fullName: string
    email: string | null
    phone: string
    city: string | null
    propertyType: string | null
    bhk: string | null
    purpose: string | null
    budgetMin: number | null
    budgetMax: number | null
    timeline: string | null
    source: string | null
    status: string
    notes: string | null
    tags: string[]
    createdAt: Date
    history: Array<{
      id: string
      changedBy: string
      changedAt: Date
      diff: any
    }>
  }
}

export function LeadDetailsClient({ lead, currentUser }: LeadDetailsClientProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const isOwner = lead.ownerId === currentUser.id;

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "—"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteLead(lead.id)
      if (result.success) {
        toast.success("Lead deleted successfully")
        router.push("/buyers")
      } else {
        toast.error(result.message || "Failed to delete lead")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the lead")
      console.error("Delete error:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Link href="/buyers" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Leads
          </Link>

          {/* Page Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Lead Details: {lead.fullName}</h1>
            {isOwner && (
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
                <Link href={`/buyers/${lead.id}/edit`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Lead Information Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Lead Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-600">Full Name</dt>
                  <dd className="text-sm text-gray-900 mt-1">{lead.fullName}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600">Email</dt>
                  <dd className="text-sm text-gray-900 mt-1">{lead.email || "Not provided"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600">Phone</dt>
                  <dd className="text-sm text-gray-900 mt-1">{lead.phone}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600">City</dt>
                  <dd className="text-sm text-gray-900 mt-1">{lead.city || '—'}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600">Property Type</dt>
                  <dd className="text-sm text-gray-900 mt-1">{lead.propertyType || '—'}</dd>
                </div>

                {lead.bhk && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600">BHK</dt>
                    <dd className="text-sm text-gray-900 mt-1">{lead.bhk}</dd>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-600">Purpose</dt>
                  <dd className="text-sm text-gray-900 mt-1 capitalize">{lead.purpose || '—'}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600">Budget Range</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {formatCurrency(lead.budgetMin)} - {formatCurrency(lead.budgetMax)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600">Timeline</dt>
                  <dd className="text-sm text-gray-900 mt-1">{lead.timeline || '—'}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600">Lead Source</dt>
                  <dd className="text-sm text-gray-900 mt-1 capitalize">{lead.source || '—'}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600">Status</dt>
                  <dd className="mt-1">
                    <Badge className="bg-green-100 text-green-800 capitalize">{lead.status}</Badge>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600">Created</dt>
                  <dd className="text-sm text-gray-900 mt-1">{new Date(lead.createdAt).toLocaleDateString()}</dd>
                </div>
              </div>
            </div>

            {lead.tags && lead.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <dt className="text-sm font-medium text-gray-600 mb-2">Tags</dt>
                <div className="flex flex-wrap gap-2">
                  {lead.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {lead.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <dt className="text-sm font-medium text-gray-600 mb-2">Notes</dt>
                <dd className="text-sm text-gray-900">{lead.notes}</dd>
              </div>
            )}
          </div>

          {/* Change History Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Changes</h2>
            {lead.history.length > 0 ? (
              <div className="space-y-4">
                {lead.history.map((change) => (
                  <div key={change.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">Changes</span>
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(change.diff, null, 2)}</pre>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Changed by {change.changedBy} on {formatDate(change.changedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No changes have been recorded for this lead yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteLeadModal
          leadId={lead.id}
          leadName={lead.fullName}
          onDelete={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}
