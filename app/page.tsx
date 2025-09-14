import { Button } from "@/components/ui/button";
// import { Link } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome to CRM</h1>
        <Link href="/buyers">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">View Buyer Leads</Button>
        </Link>
      </div>
    </div>
  );
}
