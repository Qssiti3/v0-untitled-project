"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, Menu, MessageSquare, Scissors, Settings, User, BarChart, MapPin, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavbarMenuProps {
  user: any
  userType: "customer" | "barber"
  activeTab: string
  setActiveTab: (tab: string) => void
  logout: () => void
}

export default function NavbarMenu({ user, userType, activeTab, setActiveTab, logout }: NavbarMenuProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
    setIsOpen(false)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setIsOpen(false)
  }

  // Cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <Button variant="ghost" size="icon" onClick={toggleMenu} aria-expanded={isOpen}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">فتح القائمة</span>
      </Button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
          style={{ right: "auto", left: 0 }} // Forzar posición a la izquierda para RTL
        >
          <div className="py-1 rounded-md bg-white dark:bg-gray-800 shadow-xs">
            {userType === "customer" ? (
              <>
                <Link
                  href="/dashboard/customer"
                  className="flex items-center justify-end gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleTabChange("map")}
                >
                  <span>الخريطة</span>
                  <MapPin className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/customer?tab=barbers"
                  className="flex items-center justify-end gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleTabChange("barbers")}
                >
                  <span>الحلاقون</span>
                  <Scissors className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/customer?tab=appointments"
                  className="flex items-center justify-end gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleTabChange("appointments")}
                >
                  <span>المواعيد</span>
                  <Calendar className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/customer/messages"
                  className="flex items-center justify-end gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  <span>الرسائل</span>
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard/barber"
                  className="flex items-center justify-end gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleTabChange("dashboard")}
                >
                  <span>لوحة التحكم</span>
                  <BarChart className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/barber?tab=appointments"
                  className="flex items-center justify-end gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleTabChange("appointments")}
                >
                  <span>المواعيد</span>
                  <Calendar className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/barber?tab=services"
                  className="flex items-center justify-end gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleTabChange("services")}
                >
                  <span>خدماتي</span>
                  <Scissors className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/barber/messages"
                  className="flex items-center justify-end gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  <span>الرسائل</span>
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            <Link
              href={`/dashboard/${userType}/profile`}
              className="flex items-center justify-end gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <span>الملف الشخصي</span>
              <User className="h-4 w-4" />
            </Link>
            <Link
              href={`/dashboard/${userType}/settings`}
              className="flex items-center justify-end gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <span>الإعدادات</span>
              <Settings className="h-4 w-4" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-end gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
            >
              <span>تسجيل الخروج</span>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
