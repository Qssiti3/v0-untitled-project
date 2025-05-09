"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserAppointments } from "@/lib/api"
import { Calendar, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BarberStatusAlert } from "@/components/barber-status-alert"

export default function BarberDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      if (user) {
        try {
          const response = await getUserAppointments(user.id, "barber")
          setAppointments(response.appointments)
        } catch (error) {
          console.error("Error fetching appointments:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchAppointments()
  }, [user])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">قيد الانتظار</Badge>
      case "confirmed":
        return <Badge variant="default">مؤكد</Badge>
      case "completed":
        return <Badge variant="success">مكتمل</Badge>
      case "cancelled":
        return <Badge variant="destructive">ملغي</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!user) {
    return <div>جاري التحميل...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <BarberStatusAlert />

      <h1 className="text-2xl font-bold mb-6">مرحباً {user.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المواعيد</CardTitle>
            <CardDescription>عدد المواعيد الكلي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">المواعيد المكتملة</CardTitle>
            <CardDescription>عدد المواعيد التي تم إكمالها</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter((appointment) => appointment.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">المواعيد القادمة</CardTitle>
            <CardDescription>عدد المواعيد المؤكدة القادمة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter((appointment) => appointment.status === "confirmed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>المواعيد القادمة</CardTitle>
            <CardDescription>آخر المواعيد المؤكدة</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">جاري التحميل...</div>
            ) : appointments.filter((appointment) => appointment.status === "confirmed").length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">لا توجد مواعيد قادمة</div>
            ) : (
              <div className="space-y-4">
                {appointments
                  .filter((appointment) => appointment.status === "confirmed")
                  .slice(0, 3)
                  .map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex flex-col">
                        <div className="font-medium">{appointment.customerName || "عميل"}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {appointment.date} - {appointment.time}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {appointment.location === "customer_address" ? "منزل العميل" : "في المحل"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(appointment.status)}
                        <Link href={`/dashboard/barber/tracking/${appointment.id}`}>
                          <Button variant="outline" size="sm">
                            تتبع الموعد
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                <div className="text-center pt-2">
                  <Link href="/dashboard/barber/requests">
                    <Button variant="link">عرض جميع المواعيد</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
