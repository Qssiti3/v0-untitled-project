"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Calendar,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Scissors,
  Users,
  LayoutDashboard,
  HelpCircle,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export default function AdminNavbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      href: "/admin",
      label: "لوحة التحكم",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      href: "/admin/users",
      label: "إدارة الزبائن",
      icon: <Users className="h-5 w-5" />,
    },
    {
      href: "/admin/barbers",
      label: "إدارة الحلاقين",
      icon: <Scissors className="h-5 w-5" />,
    },
    {
      href: "/admin/appointments",
      label: "إدارة المواعيد",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      href: "/admin/statistics",
      label: "الإحصائيات",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      href: "/admin/support",
      label: "الدعم الفني",
      icon: <HelpCircle className="h-5 w-5" />,
    },
    {
      href: "/admin/messages",
      label: "الرسائل",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      href: "/admin/settings",
      label: "الإعدادات",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <div className="fixed top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-0 pt-10">
            <div className="flex flex-col items-center justify-center p-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profileImage || "/placeholder.svg"} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="mt-2 text-center">
                <div className="font-medium">{user?.name}</div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
              </div>
            </div>
            <Separator />
            <nav className="flex flex-col gap-1 p-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    pathname === route.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  {route.icon}
                  {route.label}
                </Link>
              ))}
              <Button
                variant="ghost"
                className="mt-2 flex w-full items-center justify-start gap-2 px-3"
                onClick={() => logout()}
              >
                <LogOut className="h-5 w-5" />
                تسجيل الخروج
              </Button>
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <Link href="/admin" className="flex items-center gap-2">
            <Scissors className="h-6 w-6" />
            <span className="text-xl font-bold">BarberGo</span>
          </Link>
          <span className="text-sm text-muted-foreground">لوحة الإدارة</span>
        </div>

        <nav className="mx-6 hidden items-center space-x-4 md:flex">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                pathname === route.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="mr-auto flex items-center gap-4">
          <div className="hidden items-center gap-2 md:flex">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImage || "/placeholder.svg"} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-muted-foreground">مدير النظام</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => logout()}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
