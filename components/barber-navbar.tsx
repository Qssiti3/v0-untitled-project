"use client"

import Link from "next/link"
import { Scissors } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import NavbarMenu from "./navbar-menu"
import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"

interface BarberNavbarProps {
  user: any
  activeTab: string
  setActiveTab: (tab: string) => void
  logout: () => void
  pendingRequests?: number
}

export default function BarberNavbar({
  user,
  activeTab,
  setActiveTab,
  logout,
  pendingRequests = 0,
}: BarberNavbarProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/barber" className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            <span className="font-bold">BarberGo</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications Icon with Badge */}
          <div className="relative">
            <Link
              href="/dashboard/barber/requests"
              className="p-2 rounded-full hover:bg-muted transition-colors relative"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {pendingRequests > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingRequests}
                </span>
              )}
            </Link>
          </div>

          <Link href="/dashboard/barber/messages">
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
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                2
              </span>
              <span className="sr-only">الرسائل</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" alt={user?.name || "الحلاق"} />
              <AvatarFallback>{user?.name?.substring(0, 2) || "حل"}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{user?.name || "الحلاق"}</p>
              <p className="text-xs text-muted-foreground">حلاق</p>
            </div>
          </div>

          <NavbarMenu user={user} userType="barber" activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />
        </div>
      </div>
    </header>
  )
}
