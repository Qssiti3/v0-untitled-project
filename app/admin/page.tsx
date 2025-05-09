"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, MessageSquare, TrendingUp, UserCheck } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line, LineChart } from "recharts"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBarbers: 0,
    totalCustomers: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    averageRating: 0,
  })

  const [chartData, setChartData] = useState([])
  const [revenueData, setRevenueData] = useState([])

  useEffect(() => {
    // جلب البيانات الإحصائية
    fetchStats()
    fetchChartData()
    fetchRevenueData()
  }, [])

  const fetchStats = () => {
    // جلب المستخدمين
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const barbers = users.filter((user: any) => user.type === "barber")
    const customers = users.filter((user: any) => user.type === "customer")

    // جلب المواعيد
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")
    const completed = appointments.filter((app: any) => app.status === "completed").length
    const pending = appointments.filter((app: any) => app.status === "pending").length
    const cancelled = appointments.filter((app: any) => app.status === "cancelled").length

    // حساب الإيرادات
    const revenue = appointments
      .filter((app: any) => app.status === "completed")
      .reduce((sum: number, app: any) => sum + (app.totalPrice || 0), 0)

    // حساب متوسط التقييم
    const ratings = appointments.filter((app: any) => app.rating).map((app: any) => app.rating)
    const avgRating =
      ratings.length > 0 ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length : 0

    setStats({
      totalUsers: users.length - 1, // استبعاد الأدمين
      totalBarbers: barbers.length,
      totalCustomers: customers.length,
      totalAppointments: appointments.length,
      completedAppointments: completed,
      pendingAppointments: pending,
      cancelledAppointments: cancelled,
      totalRevenue: revenue,
      averageRating: Number.parseFloat(avgRating.toFixed(1)),
    })
  }

  const fetchChartData = () => {
    // بيانات تجريبية لعدد المستخدمين الجدد حسب الشهر
    const data = [
      { name: "يناير", barbers: 4, customers: 12 },
      { name: "فبراير", barbers: 6, customers: 18 },
      { name: "مارس", barbers: 8, customers: 24 },
      { name: "أبريل", barbers: 10, customers: 32 },
      { name: "مايو", barbers: 12, customers: 40 },
      { name: "يونيو", barbers: 16, customers: 48 },
    ]
    setChartData(data)
  }

  const fetchRevenueData = () => {
    // بيانات تجريبية للإيرادات حسب الشهر
    const data = [
      { name: "يناير", revenue: 5000 },
      { name: "فبراير", revenue: 7500 },
      { name: "مارس", revenue: 10000 },
      { name: "أبريل", revenue: 12500 },
      { name: "مايو", revenue: 15000 },
      { name: "يونيو", revenue: 20000 },
    ]
    setRevenueData(data)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">لوحة التحكم</h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <CardTitle className="text-sm font-medium">إجمالي المواعيد</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completedAppointments} مكتمل, {stats.pendingAppointments} قيد الانتظار
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRevenue} ريال</div>
                <p className="text-xs text-muted-foreground">
                  متوسط {Math.round(stats.totalRevenue / (stats.completedAppointments || 1))} ريال لكل موعد
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط التقييم</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating}/5</div>
                <p className="text-xs text-muted-foreground">بناءً على {stats.completedAppointments} موعد مكتمل</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>المستخدمين الجدد</CardTitle>
                <CardDescription>عدد المستخدمين الجدد حسب الشهر</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="barbers" name="الحلاقين" fill="#3b82f6" />
                    <Bar dataKey="customers" name="الزبائن" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>الإيرادات</CardTitle>
                <CardDescription>إجمالي الإيرادات حسب الشهر</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={revenueData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="الإيرادات" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>تحليل المواعيد</CardTitle>
                <CardDescription>توزيع المواعيد حسب الحالة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-4 w-full">
                    <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                      <div className="text-green-600 text-lg font-bold">{stats.completedAppointments}</div>
                      <div className="text-green-800">مكتمل</div>
                      <div className="text-green-600 text-xs mt-2">
                        {stats.totalAppointments > 0
                          ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
                          : 0}
                        %
                      </div>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-blue-600 text-lg font-bold">{stats.pendingAppointments}</div>
                      <div className="text-blue-800">قيد الانتظار</div>
                      <div className="text-blue-600 text-xs mt-2">
                        {stats.totalAppointments > 0
                          ? Math.round((stats.pendingAppointments / stats.totalAppointments) * 100)
                          : 0}
                        %
                      </div>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg">
                      <div className="text-red-600 text-lg font-bold">{stats.cancelledAppointments}</div>
                      <div className="text-red-800">ملغي</div>
                      <div className="text-red-600 text-xs mt-2">
                        {stats.totalAppointments > 0
                          ? Math.round((stats.cancelledAppointments / stats.totalAppointments) * 100)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أحدث الرسائل</CardTitle>
                <CardDescription>آخر رسائل الدعم الفني</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">أحمد محمد</p>
                      <p className="text-xs text-muted-foreground">كيف يمكنني تغيير موعد الحجز الخاص بي؟</p>
                      <p className="text-xs text-muted-foreground">منذ 10 دقائق</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">محمد أحمد</p>
                      <p className="text-xs text-muted-foreground">أواجه مشكلة في تحديث قائمة الخدمات الخاصة بي</p>
                      <p className="text-xs text-muted-foreground">منذ 30 دقيقة</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
