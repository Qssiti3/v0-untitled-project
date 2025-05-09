"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Star, Users, TrendingUp } from "lucide-react"

export default function StatisticsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [barbers, setBarbers] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // جلب البيانات من localStorage
    const storedAppointments = JSON.parse(localStorage.getItem("appointments") || "[]")
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")

    setAppointments(storedAppointments)
    setUsers(storedUsers)
    setBarbers(storedUsers.filter((user: any) => user.type === "barber"))
    setCustomers(storedUsers.filter((user: any) => user.type === "customer"))
  }, [])

  // تصفية البيانات حسب النطاق الزمني
  const getFilteredData = () => {
    const now = new Date()
    let startDate = new Date(0) // تاريخ بداية الزمن

    if (timeRange === "week") {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
    } else if (timeRange === "month") {
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 1)
    } else if (timeRange === "year") {
      startDate = new Date(now)
      startDate.setFullYear(now.getFullYear() - 1)
    }

    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.createdAt)
      return appointmentDate >= startDate
    })
  }

  // الإحصائيات العامة
  const getStats = () => {
    const filteredAppointments = getFilteredData()

    const completed = filteredAppointments.filter((app) => app.status === "completed").length
    const pending = filteredAppointments.filter((app) => app.status === "pending").length
    const cancelled = filteredAppointments.filter((app) => app.status === "cancelled").length
    const confirmed = filteredAppointments.filter((app) => app.status === "confirmed").length

    const totalRevenue = filteredAppointments
      .filter((app) => app.status === "completed")
      .reduce((sum, app) => sum + (app.totalPrice || 0), 0)

    return {
      total: filteredAppointments.length,
      completed,
      pending,
      cancelled,
      confirmed,
      totalRevenue,
      totalUsers: users.length,
      totalBarbers: barbers.length,
      totalCustomers: customers.length,
    }
  }

  // بيانات الرسم البياني للمواعيد حسب الحالة
  const getAppointmentStatusData = () => {
    const stats = getStats()
    return [
      { name: "مكتملة", value: stats.completed, color: "#10b981" },
      { name: "قيد الانتظار", value: stats.pending, color: "#f59e0b" },
      { name: "مؤكدة", value: stats.confirmed, color: "#3b82f6" },
      { name: "ملغاة", value: stats.cancelled, color: "#ef4444" },
    ]
  }

  // بيانات الرسم البياني للمواعيد حسب الشهر
  const getAppointmentsByMonth = () => {
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "إبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ]

    const data = Array(12)
      .fill(0)
      .map((_, i) => ({
        name: months[i],
        completed: 0,
        pending: 0,
        cancelled: 0,
        confirmed: 0,
      }))

    appointments.forEach((app) => {
      const date = new Date(app.createdAt)
      const month = date.getMonth()

      if (app.status === "completed") {
        data[month].completed += 1
      } else if (app.status === "pending") {
        data[month].pending += 1
      } else if (app.status === "cancelled") {
        data[month].cancelled += 1
      } else if (app.status === "confirmed") {
        data[month].confirmed += 1
      }
    })

    return data
  }

  // بيانات الرسم البياني للإيرادات حسب الشهر
  const getRevenueByMonth = () => {
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "إبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ]

    const data = Array(12)
      .fill(0)
      .map((_, i) => ({
        name: months[i],
        revenue: 0,
      }))

    appointments
      .filter((app) => app.status === "completed")
      .forEach((app) => {
        const date = new Date(app.createdAt)
        const month = date.getMonth()
        data[month].revenue += app.totalPrice || 0
      })

    return data
  }

  // بيانات الرسم البياني لأفضل الحلاقين
  const getTopBarbers = () => {
    const barberStats = {}

    appointments
      .filter((app) => app.status === "completed")
      .forEach((app) => {
        if (!barberStats[app.barberId]) {
          barberStats[app.barberId] = {
            id: app.barberId,
            name: app.barberName || "غير معروف",
            appointments: 0,
            revenue: 0,
            ratings: [],
          }
        }

        barberStats[app.barberId].appointments += 1
        barberStats[app.barberId].revenue += app.totalPrice || 0

        if (app.rating) {
          barberStats[app.barberId].ratings.push(app.rating)
        }
      })

    // حساب متوسط التقييم
    Object.values(barberStats).forEach((barber: any) => {
      if (barber.ratings.length > 0) {
        barber.avgRating = barber.ratings.reduce((sum, rating) => sum + rating, 0) / barber.ratings.length
      } else {
        barber.avgRating = 0
      }
    })

    // ترتيب الحلاقين حسب عدد المواعيد
    return Object.values(barberStats)
      .sort((a: any, b: any) => b.appointments - a.appointments)
      .slice(0, 5)
  }

  const stats = getStats()
  const appointmentStatusData = getAppointmentStatusData()
  const appointmentsByMonth = getAppointmentsByMonth()
  const revenueByMonth = getRevenueByMonth()
  const topBarbers = getTopBarbers()

  const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444"]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">الإحصائيات والتقارير</h2>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="النطاق الزمني" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الوقت</SelectItem>
            <SelectItem value="week">آخر أسبوع</SelectItem>
            <SelectItem value="month">آخر شهر</SelectItem>
            <SelectItem value="year">آخر سنة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="appointments">المواعيد</TabsTrigger>
          <TabsTrigger value="barbers">الحلاقين</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المواعيد</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completed} مكتملة, {stats.pending} قيد الانتظار
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRevenue} ريال</div>
                <p className="text-xs text-muted-foreground">من {stats.completed} موعد مكتمل</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalBarbers} حلاق, {stats.totalCustomers} زبون
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معدل إكمال المواعيد</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">{stats.cancelled} موعد ملغي</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>حالة المواعيد</CardTitle>
                <CardDescription>توزيع المواعيد حسب الحالة</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {appointmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الإيرادات الشهرية</CardTitle>
                <CardDescription>إجمالي الإيرادات حسب الشهر</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer
                  config={{
                    revenue: {
                      label: "الإيرادات",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="revenue" fill="var(--color-revenue)" name="الإيرادات" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>المواعيد الشهرية</CardTitle>
              <CardDescription>عدد المواعيد حسب الشهر والحالة</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ChartContainer
                config={{
                  completed: {
                    label: "مكتملة",
                    color: "#10b981",
                  },
                  pending: {
                    label: "قيد الانتظار",
                    color: "#f59e0b",
                  },
                  confirmed: {
                    label: "مؤكدة",
                    color: "#3b82f6",
                  },
                  cancelled: {
                    label: "ملغاة",
                    color: "#ef4444",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="completed" fill="var(--color-completed)" name="مكتملة" />
                    <Bar dataKey="pending" fill="var(--color-pending)" name="قيد الانتظار" />
                    <Bar dataKey="confirmed" fill="var(--color-confirmed)" name="مؤكدة" />
                    <Bar dataKey="cancelled" fill="var(--color-cancelled)" name="ملغاة" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="barbers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أفضل الحلاقين</CardTitle>
              <CardDescription>الحلاقين الأكثر نشاطاً حسب عدد المواعيد</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {topBarbers.map((barber: any) => (
                  <div key={barber.id} className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                      {barber.name.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{barber.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span className="ml-1">{barber.appointments} موعد</span>
                        <span className="mx-2">|</span>
                        <TrendingUp className="mr-1 h-3 w-3" />
                        <span className="ml-1">{barber.revenue} ريال</span>
                        <span className="mx-2">|</span>
                        <Star className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span className="ml-1">{barber.avgRating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(barber.appointments / topBarbers[0].appointments) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
