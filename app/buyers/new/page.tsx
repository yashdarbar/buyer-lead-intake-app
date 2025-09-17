"use client"

import type React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { BuyerFormSchema } from "@/lib/validations/buyerSchema"
import { createBuyerLead } from "../actions/buyers"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

// Infer the form data type from your Zod schema
type BuyerFormData = z.infer<typeof BuyerFormSchema>

type BuyerFormInput = z.input<typeof BuyerFormSchema>

type BuyerFormOutput = z.output<typeof BuyerFormSchema>

export default function NewBuyerLeadPage() {
  const router = useRouter()
  const form = useForm<BuyerFormInput>({
    resolver: zodResolver(BuyerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      tags: "",
      notes: "",
      budgetMax: undefined,
      budgetMin: undefined,
      // You can set default values for enums if needed
      // city: "Mohali",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  // Watch for changes to conditionally render fields
  const propertyType = watch("propertyType");
  const notesValue = watch("notes") || "";
  const tagsValue = watch("tags") || "";
  const tagList = tagsValue.split(",").map(tag => tag.trim()).filter(Boolean);

  const onSubmit = async (data: BuyerFormInput) => {
    try {
      const formData = new FormData();
      // Convert the structured data into FormData for the server action
      for (const key in data) {
        const value = data[key as keyof BuyerFormInput];
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      }

      const result = await createBuyerLead(formData);

      if (result?.success === false) {
        toast.error(result.message || "Failed to create lead");
        return;
      }

      toast.success("Lead created successfully!");
      // Redirect to buyers page after successful creation
      router.push('/buyers');
    } catch (error) {
      console.error("Error creating lead:", error);
      toast.error("An error occurred while creating the lead");
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <Link href="/buyers" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Leads
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Lead</h1>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            {/* Contact Information Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    {...register("fullName")}
                    className={`mt-1 ${errors.fullName ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`}
                  />
                  {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={`mt-1 ${errors.email ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    className={`mt-1 ${errors.phone ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                </div>

                {/* <div>
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
                {/* Replace your existing status div with this one */}
            <Controller
                name="status"
                control={control}
                render={({ field }) => (
            <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status
                </Label>
        <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            >
                <SelectTrigger className={`mt-1 ${errors.status ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`}>
                <SelectValue placeholder="Select status (defaults to New)" />
                </SelectTrigger>
                <SelectContent>
                {/* Note: Values are capitalized to match the Prisma Schema enum */}
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Visited">Visited</SelectItem>
                <SelectItem value="Negotiation">Negotiation</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
                <SelectItem value="Dropped">Dropped</SelectItem>
                </SelectContent>
            </Select>
                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
                </div>
            )}
            />
              </div>
            </div>

            {/* Property Requirements Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Property Requirements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={`mt-1 ${errors.city ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`}>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mohali">Mohali</SelectItem>
                          <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                          <SelectItem value="Panchkula">Panchkula</SelectItem>
                          <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                    </div>
                  )}
                />

                <Controller
                  name="propertyType"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label htmlFor="propertyType" className="text-sm font-medium text-gray-700">Property Type</Label>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={`mt-1 ${errors.propertyType ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`}>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Apartment">Apartment</SelectItem>
                          <SelectItem value="Villa">Villa</SelectItem>
                          <SelectItem value="Plot">Plot</SelectItem>
                          <SelectItem value="Office">Office</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.propertyType && <p className="mt-1 text-sm text-red-600">{errors.propertyType.message}</p>}
                    </div>
                  )}
                />

                {(propertyType === "Apartment" || propertyType === "Villa") && (
                  <Controller
                    name="bhk"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <Label htmlFor="bhk" className="text-sm font-medium text-gray-700">BHK *</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={`mt-1 ${errors.bhk ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`}>
                            <SelectValue placeholder="Select BHK" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ONE">1 BHK</SelectItem>
                            <SelectItem value="TWO">2 BHK</SelectItem>
                            <SelectItem value="THREE">3 BHK</SelectItem>
                            <SelectItem value="FOUR">4 BHK</SelectItem>
                            <SelectItem value="Studio">Studio</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.bhk && <p className="mt-1 text-sm text-red-600">{errors.bhk.message}</p>}
                      </div>
                    )}
                  />
                )}

                <Controller
                  name="purpose"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label htmlFor="purpose" className="text-sm font-medium text-gray-700">Purpose</Label>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={`mt-1 ${errors.purpose ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`}>
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Buy">Buy</SelectItem>
                          <SelectItem value="Rent">Rent</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.purpose && <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>}
                    </div>
                  )}
                />

                <div className="col-span-1 md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Budget Range (INR)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budgetMin" className="text-sm text-gray-600">Minimum Budget</Label>
                      <Input
                        id="budgetMin"
                        type="number"
                        placeholder="e.g., 5000000"
                        {...register("budgetMin")}
                        className={`mt-1 ${errors.budgetMin ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`}
                      />
                       {errors.budgetMin && <p className="mt-1 text-sm text-red-600">{errors.budgetMin.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="budgetMax" className="text-sm text-gray-600">Maximum Budget</Label>
                      <Input
                        id="budgetMax"
                        type="number"
                        placeholder="e.g., 7500000"
                        {...register("budgetMax")}
                        className={`mt-1 ${errors.budgetMax ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`}
                      />
                       {errors.budgetMax && <p className="mt-1 text-sm text-red-600">{errors.budgetMax.message}</p>}
                    </div>
                  </div>
                </div>

                <Controller
                  name="timeline"
                  control={control}
                  render={({ field }) => (
                    <div>
                       <Label htmlFor="timeline" className="text-sm font-medium text-gray-700">Timeline</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={`mt-1 ${errors.timeline ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`}>
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IMMEDIATE">0-3 Months</SelectItem>
                            <SelectItem value="THREE_TO_SIX_MONTHS">3-6 Months</SelectItem>
                            <SelectItem value="MORE_THAN_SIX_MONTHS">6+ Months</SelectItem>
                            <SelectItem value="Exploring">Just Exploring</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.timeline && <p className="mt-1 text-sm text-red-600">{errors.timeline.message}</p>}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Additional Details Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Additional Details
              </h2>
              <div className="space-y-4 sm:space-y-6">
                 <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label htmlFor="leadSource" className="text-sm font-medium text-gray-700">Lead Source</Label>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={`mt-1 ${errors.source ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`}>
                          <SelectValue placeholder="Select lead source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Website">Website</SelectItem>
                          <SelectItem value="Referral">Referral</SelectItem>
                          <SelectItem value="Walk_in">Walk-in</SelectItem>
                          <SelectItem value="Call">Call</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                       {errors.source && <p className="mt-1 text-sm text-red-600">{errors.source.message}</p>}
                    </div>
                  )}
                />

                <div>
                  <Label htmlFor="tags" className="text-sm font-medium text-gray-700">Tags</Label>
                  <Input
                    id="tags"
                    type="text"
                    placeholder="Enter tags separated by commas"
                    {...register("tags")}
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
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about the lead..."
                    {...register("notes")}
                    maxLength={1000}
                    className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                    rows={4}
                  />
                  <p className="mt-1 text-sm text-gray-500">{notesValue.length}/1000 characters</p>
                  {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/buyers')}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Lead'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

