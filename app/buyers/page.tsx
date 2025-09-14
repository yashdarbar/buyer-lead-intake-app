"use client";

import { BuyerLeadsHeader } from "@/components/buyer-leads-header";
import { BuyerLeadsTable } from "@/components/buyer-leads-table";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export default function BuyersPage() {
    const supabase = createClient()
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(()=> {
        const getUser = async () => {
            const { data, error } = await supabase.auth.getUser()
            if (error) {
                console.log("Error fetching user:", error)
                return
            }
            setUser(data.user)
            console.log("user data: ", data.user);
        }
        getUser();
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN") {
                setUser(session?.user)
            } else if (event === "SIGNED_OUT") {
                setUser(null);
                router.push("/login")
            }
        })
        return () => {
      authListener.subscription.unsubscribe()
    }
    }, [supabase, router]);


    return (
        <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BuyerLeadsHeader />
        <BuyerLeadsTable />
      </div>
    </div>
    )
}