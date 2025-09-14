"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export default function NewBuyerLeadPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    propertyType: "",
    bhk: "",
    purpose: "",
    budgetMin: "",
    budgetMax: "",
    timeline: "",
    leadSource: "",
    tags: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tagList, setTagList] = useState<string[]>([])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim() || formData.fullName.length < 2) {
      newErrors.fullName = "Full name is required and must be at least 2 characters"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if ((formData.propertyType === "Apartment" || formData.propertyType === "Villa") && !formData.bhk) {
      newErrors.bhk = "BHK is required for apartments and villas"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTagsChange = (value: string) => {
    setFormData({ ...formData, tags: value })
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    setTagList(tags)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      // Here you would typically submit to an API
      console.log("Form submitted:", formData)
      router.push("/buyers")
    }
  }

  const isFormValid = formData.fullName.trim().length >= 2 && formData.phone.trim().length > 0

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/buyers" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Leads
          </Link>

          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Create New Lead</h1>
            <div className="flex items-center gap-3">
              <Link href="/buyers">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
                  Cancel
                </Button>
              </Link>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300"
              >
                Save Lead
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`mt-1 ${errors.fullName ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`}
                  />
                  {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`mt-1 ${errors.email ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`mt-1 ${errors.phone ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Property Requirements Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Property Requirements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    City
                  </Label>
                  <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mohali">Mohali</SelectItem>
                      <SelectItem value="chandigarh">Chandigarh</SelectItem>
                      <SelectItem value="panchkula">Panchkula</SelectItem>
                      <SelectItem value="zirakpur">Zirakpur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="propertyType" className="text-sm font-medium text-gray-700">
                    Property Type
                  </Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
                  >
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Plot">Plot</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.propertyType === "Apartment" || formData.propertyType === "Villa") && (
                  <div>
                    <Label htmlFor="bhk" className="text-sm font-medium text-gray-700">
                      BHK *
                    </Label>
                    <Select value={formData.bhk} onValueChange={(value) => setFormData({ ...formData, bhk: value })}>
                      <SelectTrigger
                        className={`mt-1 ${errors.bhk ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`}
                      >
                        <SelectValue placeholder="Select BHK" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 BHK</SelectItem>
                        <SelectItem value="2">2 BHK</SelectItem>
                        <SelectItem value="3">3 BHK</SelectItem>
                        <SelectItem value="4">4 BHK</SelectItem>
                        <SelectItem value="5+">5+ BHK</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.bhk && <p className="mt-1 text-sm text-red-600">{errors.bhk}</p>}
                  </div>
                )}

                <div>
                  <Label htmlFor="purpose" className="text-sm font-medium text-gray-700">
                    Purpose
                  </Label>
                  <Select
                    value={formData.purpose}
                    onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                  >
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Budget Range</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budgetMin" className="text-sm text-gray-600">
                        Minimum Budget
                      </Label>
                      <Input
                        id="budgetMin"
                        type="number"
                        placeholder="0"
                        value={formData.budgetMin}
                        onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                        className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="budgetMax" className="text-sm text-gray-600">
                        Maximum Budget
                      </Label>
                      <Input
                        id="budgetMax"
                        type="number"
                        placeholder="1000000"
                        value={formData.budgetMax}
                        onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                        className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="timeline" className="text-sm font-medium text-gray-700">
                    Timeline
                  </Label>
                  <Select
                    value={formData.timeline}
                    onValueChange={(value) => setFormData({ ...formData, timeline: value })}
                  >
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate (0-1 month)</SelectItem>
                      <SelectItem value="short">Short term (1-3 months)</SelectItem>
                      <SelectItem value="medium">Medium term (3-6 months)</SelectItem>
                      <SelectItem value="long">Long term (6+ months)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Details Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Additional Details
              </h2>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="leadSource" className="text-sm font-medium text-gray-700">
                    Lead Source
                  </Label>
                  <Select
                    value={formData.leadSource}
                    onValueChange={(value) => setFormData({ ...formData, leadSource: value })}
                  >
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                      <SelectValue placeholder="Select lead source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="advertising">Advertising</SelectItem>
                      <SelectItem value="cold-call">Cold Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    type="text"
                    placeholder="Enter tags separated by commas"
                    value={formData.tags}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                  />
                  {tagList.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tagList.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about the lead..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    maxLength={1000}
                    className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                    rows={4}
                  />
                  <p className="mt-1 text-sm text-gray-500">{formData.notes.length}/1000 characters</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
