"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { importBuyersCSV } from "../actions/buyers"

export default function ImportBuyersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [message, setMessage] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setMessage("")
    if (!file) {
      setMessage("Please select a .csv file to import.")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    setIsSubmitting(true)
    try {
      const result = await importBuyersCSV(formData)
      if (!result?.success) {
        setMessage(result?.message || "Import failed.")
        if (Array.isArray((result as any).errors)) {
          setErrors((result as any).errors as string[])
        }
      } else {
        setMessage("Import successful. Your leads have been added.")
        setFile(null)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Import Buyer Leads</h1>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <div>
            <Label htmlFor="file" className="text-sm font-medium text-gray-700">CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-2"
            />
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>Required headers (first row):</p>
            <p className="font-mono break-all">fullName, email, phone, city, propertyType, bhk, purpose, budgetMin, budgetMax, timeline, source, notes, tags, status</p>
            <p>Maximum 200 data rows. The file must be in CSV format.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300">
              {isSubmitting ? "Importing..." : "Import"}
            </Button>
          </div>

          {message && (
            <div className="text-sm mt-2 {errors.length ? 'text-red-600' : 'text-green-700'}">
              {message}
            </div>
          )}

          {errors.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Validation Errors</h2>
              <ul className="list-disc pl-5 space-y-1 text-sm text-red-700">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}