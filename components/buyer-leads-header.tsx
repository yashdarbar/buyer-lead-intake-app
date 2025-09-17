"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Upload, Download } from "lucide-react"
import { exportBuyersCSV } from "@/app/buyers/actions/buyers"
import toast from "react-hot-toast"

function useDebouncedCallback<T extends (...args: any[]) => void>(callback: T, delayMs: number) {
  return useMemo(() => {
    let timer: any;
    return (...args: Parameters<T>) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => callback(...args), delayMs);
    };
  }, [callback, delayMs]);
}

export function BuyerLeadsHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);

  const q = searchParams.get("q") || "";
  const statusValue = searchParams.get("status") || "all";
  const cityValue = searchParams.get("city") || "all";
  const propertyTypeValue = searchParams.get("propertyType") || "all";
  const timelineValue = searchParams.get("timeline") || "all";
  const budgetValue = searchParams.get("budget") || "all";

  const updateParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (value && value !== "all") params.set(name, value); else params.delete(name);
    // Reset pagination on any filter/search change
    params.set("page", "1");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const onSearchChange = useDebouncedCallback((value: string) => {
    updateParam("q", value.trim());
  }, 300);

  const handleExportCSV = async () => {
    setIsExporting(true);
    toast.loading("Preparing your export...", { id: "export" });

    try {
      const queryString = searchParams.toString();
      const result = await exportBuyersCSV(queryString);

      if (result.success && result.csvData) {
        // Create and download the CSV file
        const blob = new Blob([result.csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `buyer-leads-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Export started! Your CSV file is downloading.', { id: "export" });
      } else {
        toast.error(result.message || 'Failed to export CSV', { id: "export" });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('An error occurred while exporting CSV', { id: "export" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Buyer Leads</h1>
        <div className="flex items-center gap-3">
          <Link href="/buyers/import">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Leads
            </Button>
          </Link>
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={handleExportCSV}
            disabled={isExporting}
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
          <Link href="/buyers/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Lead
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            key={q}
            type="text"
            placeholder="Search by name, email, or phone..."
            defaultValue={q}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700 mb-1 block">Status</Label>
          <Select value={statusValue} onValueChange={(v) => updateParam("status", v)}>
            <SelectTrigger className="border-gray-300 focus:border-blue-600 focus:ring-blue-600">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Visited">Visited</SelectItem>
              <SelectItem value="Negotiation">Negotiation</SelectItem>
              <SelectItem value="Converted">Converted</SelectItem>
              <SelectItem value="Dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="city-filter" className="text-sm font-medium text-gray-700 mb-1 block">City</Label>
          <Select value={cityValue} onValueChange={(v) => updateParam("city", v)}>
            <SelectTrigger className="border-gray-300 focus:border-blue-600 focus:ring-blue-600">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              <SelectItem value="Chandigarh">Chandigarh</SelectItem>
              <SelectItem value="Mohali">Mohali</SelectItem>
              <SelectItem value="Zirakpur">Zirakpur</SelectItem>
              <SelectItem value="Panchkula">Panchkula</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="propertyType-filter" className="text-sm font-medium text-gray-700 mb-1 block">Property Type</Label>
          <Select value={propertyTypeValue} onValueChange={(v) => updateParam("propertyType", v)}>
            <SelectTrigger className="border-gray-300 focus:border-blue-600 focus:ring-blue-600">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Apartment">Apartment</SelectItem>
              <SelectItem value="Villa">Villa</SelectItem>
              <SelectItem value="Plot">Plot</SelectItem>
              <SelectItem value="Office">Office</SelectItem>
              <SelectItem value="Retail">Retail</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="timeline-filter" className="text-sm font-medium text-gray-700 mb-1 block">Timeline</Label>
          <Select value={timelineValue} onValueChange={(v) => updateParam("timeline", v)}>
            <SelectTrigger className="border-gray-300 focus:border-blue-600 focus:ring-blue-600">
              <SelectValue placeholder="All Timelines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Timelines</SelectItem>
              <SelectItem value="IMMEDIATE">0-3 Months</SelectItem>
              <SelectItem value="THREE_TO_SIX_MONTHS">3-6 Months</SelectItem>
              <SelectItem value="MORE_THAN_SIX_MONTHS">6+ Months</SelectItem>
              <SelectItem value="Exploring">Just Exploring</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="budget-filter" className="text-sm font-medium text-gray-700 mb-1 block">Budget (INR)</Label>
          <Select value={budgetValue} onValueChange={(v) => updateParam("budget", v)}>
            <SelectTrigger className="border-gray-300 focus:border-blue-600 focus:ring-blue-600">
              <SelectValue placeholder="All Budgets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Budgets</SelectItem>
              <SelectItem value="0-1000000">Up to ₹10L</SelectItem>
              <SelectItem value="1000000-2500000">₹10L - ₹25L</SelectItem>
              <SelectItem value="2500000-5000000">₹25L - ₹50L</SelectItem>
              <SelectItem value="5000000-10000000">₹50L - ₹1Cr</SelectItem>
              <SelectItem value="10000000-">₹1Cr+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
