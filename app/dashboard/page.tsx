"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth"

export default function DashboardRedirect() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.type === "customer") {
        router.push("/dashboard/customer")
      } else if (user.type === "barber") {
        router.push("/dashboard/barber")
      } else if (user.type === "admin") {
        router.push("/admin")
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="mr-2">جاري التوجيه...</span>
    </div>
  )
}
