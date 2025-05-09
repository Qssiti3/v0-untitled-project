"use client"

import Link from "next/link"
import { Scissors, Bell } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import NavbarMenu from "./navbar-menu"
import { useEffect, useState } from "react"
import { getUserAppointments } from "@/lib/api"
import { useRouter } from "next/navigation"

interface CustomerNavbarProps {
  user: any
  activeTab: string
  setActiveTab: (tab: string) => void
  logout: () => void
}

export default function CustomerNavbar({ user, activeTab, setActiveTab, logout }: CustomerNavbarProps) {
  const router = useRouter()
  const [pendingAppointmentsCount, setPendingAppointmentsCount] = useState(0)

  useEffect(() => {
    const fetchPendingAppointments = async () => {
      if (!user) return

      try {
        const { appointments } = await getUserAppointments(user.id, "customer")
        const pendingCount = appointments.filter(
          (appointment) => appointment.status === "pending" || appointment.status === "confirmed",
        ).length
        setPendingAppointmentsCount(pendingCount)
      } catch (error) {
        console.error("Error fetching pending appointments:", error)
      }
    }

    fetchPendingAppointments()

    // Refresh every 30 seconds
    const intervalId = setInterval(fetchPendingAppointments, 30000)
    return () => clearInterval(intervalId)
  }, [user])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/customer" className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            <span className="font-bold">BarberGo</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Appointments Notification Icon */}
          <Link href="/dashboard/customer" onClick={() => setActiveTab("appointments")}>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {pendingAppointmentsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {pendingAppointmentsCount}
                </span>
              )}
              <span className="sr-only">المواعيد</span>
            </Button>
          </Link>

          {/* Messages Icon */}
          <Link href="/dashboard/customer/messages">
            <Button variant="outline" size="icon" className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="sr-only">الرسائل</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" alt={user?.name || "المستخدم"} />
              <AvatarFallback>{user?.name?.substring(0, 2) || "مس"}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{user?.name || "المستخدم"}</p>
              <p className="text-xs text-muted-foreground">عميل</p>
            </div>
          </div>

          <NavbarMenu
            user={user}
            userType="customer"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            logout={logout}
          />
        </div>
      </div>
    </header>
  )
}
