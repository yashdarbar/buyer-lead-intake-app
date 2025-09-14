"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export default function Dashboard() {
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
        <div>
            <h1>User</h1>
            {/* <p>{user}</p> */}
        </div>
    )
}