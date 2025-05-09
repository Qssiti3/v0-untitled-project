"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import CustomerNavbar from "@/components/customer-navbar"
import SupportChat from "@/components/support-chat"

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "customer")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!user || user.type !== "customer") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <CustomerNavbar />
      <main className="container mx-auto p-4 pt-20">{children}</main>
      <SupportChat />
    </div>
  )
}
