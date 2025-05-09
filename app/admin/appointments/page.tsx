"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Eye, XCircle, Filter, Calendar, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    // جلب المواعيد من localStorage
    const storedAppointments = JSON.parse(localStorage.getItem("appointments") || "[]")
    setAppointments(storedAppointments)
    setFilteredAppointments(storedAppointments)
  }, [])

  useEffect(() => {
    // تطبيق الفلترة على المواعيد
    let result = appointments

    // فلترة حسب الحالة
    if (statusFilter !== "all") {
      result = result.filter((appointment) => appointment.status === statusFilter)
    }

    // فلترة حسب البحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (appointment) =>
          appointment.customerName.toLowerCase().includes(query) ||
          appointment.barberName.toLowerCase().includes(query) ||
          appointment.location.toLowerCase().includes(query),
      )
    }

    setFilteredAppointments(result)
  }, [appointments, searchQuery, statusFilter])

  const formatDate = (dateString: string) => {
    if (!dateString) return "غير متوفر"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">مكتمل</Badge>
      case "scheduled":
        return <Badge className="bg-blue-500">قادم</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">ملغي</Badge>
      default:
        return <Badge variant="outline">غير معروف</Badge>
    }
  }

  const handleViewAppointment = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsDialogOpen(true)
  }

  const handleCancelAppointment = (appointmentId: string) => {
    if (window.confirm("هل أنت متأكد من إلغاء هذا الموعد؟")) {
      // تحديث حالة الموعد في localStorage
      const updatedAppointments = appointments.map((appointment) => {
        if (appointment.id === appointmentId) {
          return { ...appointment, status: "cancelled" }
        }
        return appointment
      })

      localStorage.setItem("appointments", JSON.stringify(updatedAppointments))
      setAppointments(updatedAppointments)

      alert("تم إلغاء الموعد بنجاح")
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">إدارة المواعيد</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>المواعيد</CardTitle>
          <CardDescription>إدارة جميع مواعيد الحلاقة في النظام.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="البحث عن موعد..."
                  className="w-full pr-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="حالة الموعد" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المواعيد</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="scheduled">قادمة</SelectItem>
                  <SelectItem value="cancelled">ملغاة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الموعد</TableHead>
                  <TableHead>الزبون</TableHead>
                  <TableHead>الحلاق</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الوقت</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      لا يوجد مواعيد مطابقة للبحث
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.id.substring(0, 8)}</TableCell>
                      <TableCell>{appointment.customerName}</TableCell>
                      <TableCell>{appointment.barberName}</TableCell>
                      <TableCell>{appointment.date}</TableCell>
                      <TableCell>{appointment.time}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewAppointment(appointment)}>
                              <Eye className="ml-2 h-4 w-4" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            {appointment.status === "scheduled" && (
                              <DropdownMenuItem
                                onClick={() => handleCancelAppointment(appointment.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <XCircle className="ml-2 h-4 w-4" />
                                إلغاء الموعد
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* نافذة تفاصيل الموعد */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل الموعد</DialogTitle>
            <DialogDescription>عرض معلومات الموعد بالتفصيل</DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 py-2">
                <Calendar className="h-8 w-8 text-primary" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold">موعد حلاقة</h3>
                  <div>{getStatusBadge(selectedAppointment.status)}</div>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between py-1 border-b">
                  <span className="font-medium">رقم الموعد:</span>
                  <span>{selectedAppointment.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-medium">الزبون:</span>
                  <span>{selectedAppointment.customerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-medium">الحلاق:</span>
                  <span>{selectedAppointment.barberName}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-medium">التاريخ:</span>
                  <span>{selectedAppointment.date}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-medium">الوقت:</span>
                  <span>{selectedAppointment.time}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-medium">الموقع:</span>
                  <span>{selectedAppointment.location}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-medium">السعر الإجمالي:</span>
                  <span>{selectedAppointment.totalPrice} ريال</span>
                </div>

                <div className="py-1 border-b">
                  <div className="font-medium mb-1">الخدمات:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedAppointment.services?.map((service: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedAppointment.status === "completed" && selectedAppointment.rating && (
                  <div className="flex justify-between py-1 border-b">
                    <span className="font-medium">التقييم:</span>
                    <span className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 ml-1" />
                      {selectedAppointment.rating}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-1 border-b">
                  <span className="font-medium">تاريخ الإنشاء:</span>
                  <span>{formatDate(selectedAppointment.createdAt)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
