"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTransition } from "react"

import { BuyerFormSchema } from "@/lib/validations/buyerSchema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

type BuyerFormInput = z.input<typeof BuyerFormSchema>

type Props = {
  lead: any
  onSubmitAction: (id: string, formData: FormData) => Promise<any>
}

export default function BuyerEditForm({ lead, onSubmitAction }: Props) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<BuyerFormInput>({
    resolver: zodResolver(BuyerFormSchema),
    defaultValues: {
      fullName: lead.fullName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      city: lead.city || undefined,
      propertyType: lead.propertyType || undefined,
      bhk: lead.bhk || undefined,
      purpose: lead.purpose || undefined,
      budgetMin: lead.budgetMin ?? undefined,
      budgetMax: lead.budgetMax ?? undefined,
      timeline: lead.timeline || undefined,
      source: lead.source || undefined,
      status: lead.status || undefined,
      tags: Array.isArray(lead.tags) ? lead.tags.join(", ") : (lead.tags || ""),
      notes: lead.notes || "",
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = form;

  const propertyType = watch("propertyType");
  const notesValue = watch("notes") || "";
  const tagsValue = watch("tags") || "";
  const tagList = tagsValue.split(",").map(t => t.trim()).filter(Boolean);

  const onSubmit = (data: BuyerFormInput) => {
    const fd = new FormData();
    for (const key in data) {
      const value = data[key as keyof BuyerFormInput];
      if (value !== null && value !== undefined) {
        fd.append(key, String(value));
      }
    }
    fd.append("updatedAt", new Date(lead.updatedAt).toISOString());
    startTransition(async () => {
      await onSubmitAction(lead.id, fd);
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <input type="hidden" name="updatedAt" value={new Date(lead.updatedAt).toISOString()} />

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Contact Information</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name *</Label>
              <Input id="fullName" type="text" {...register("fullName")} className={`mt-1 ${errors.fullName ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`} />
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input id="email" type="email" {...register("email")} className={`mt-1 ${errors.email ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`} />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone *</Label>
              <Input id="phone" type="tel" {...register("phone")} className={`mt-1 ${errors.phone ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`} />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Property Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Budget Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetMin" className="text-sm text-gray-600">Minimum Budget</Label>
                  <Input id="budgetMin" type="number" placeholder="0" {...register("budgetMin")} className={`mt-1 ${errors.budgetMin ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`} />
                </div>
                <div>
                  <Label htmlFor="budgetMax" className="text-sm text-gray-600">Maximum Budget</Label>
                  <Input id="budgetMax" type="number" placeholder="1000000" {...register("budgetMax")} className={`mt-1 ${errors.budgetMax ? "border-red-500" : "border-gray-300"} focus:border-blue-600 focus:ring-blue-600`} />
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

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Additional Details</h2>
          <div className="space-y-6">
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
              <Input id="tags" type="text" placeholder="Enter tags separated by commas" {...register("tags")} className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600" />
              {tagList.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tagList.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
              <Textarea id="notes" placeholder="Additional notes about the lead..." {...register("notes")} maxLength={1000} className="mt-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600" rows={4} />
              <p className="mt-1 text-sm text-gray-500">{notesValue.length}/1000 characters</p>
              {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300">
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}


