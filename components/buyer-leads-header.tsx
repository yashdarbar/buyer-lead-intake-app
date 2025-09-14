"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus } from "lucide-react"

export function BuyerLeadsHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [budgetFilter, setBudgetFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")

  return (
    <div className="mb-8">
      {/* Page Title and Create Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Buyer Leads</h1>
        <Link href="/buyers/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Lead
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700 mb-1 block">
            Status
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-gray-300 focus:border-blue-600 focus:ring-blue-600">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="source-filter" className="text-sm font-medium text-gray-700 mb-1 block">
            Source
          </Label>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="border-gray-300 focus:border-blue-600 focus:ring-blue-600">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
              <SelectItem value="advertising">Advertising</SelectItem>
              <SelectItem value="cold-call">Cold Call</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="budget-filter" className="text-sm font-medium text-gray-700 mb-1 block">
            Budget Range
          </Label>
          <Select value={budgetFilter} onValueChange={setBudgetFilter}>
            <SelectTrigger className="border-gray-300 focus:border-blue-600 focus:ring-blue-600">
              <SelectValue placeholder="All Budgets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Budgets</SelectItem>
              <SelectItem value="0-100k">$0 - $100k</SelectItem>
              <SelectItem value="100k-250k">$100k - $250k</SelectItem>
              <SelectItem value="250k-500k">$250k - $500k</SelectItem>
              <SelectItem value="500k-1m">$500k - $1M</SelectItem>
              <SelectItem value="1m+">$1M+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location-filter" className="text-sm font-medium text-gray-700 mb-1 block">
            Location
          </Label>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="border-gray-300 focus:border-blue-600 focus:ring-blue-600">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="downtown">Downtown</SelectItem>
              <SelectItem value="suburbs">Suburbs</SelectItem>
              <SelectItem value="waterfront">Waterfront</SelectItem>
              <SelectItem value="uptown">Uptown</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
