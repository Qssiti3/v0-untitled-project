"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, UserCheck, UserX, Filter, Edit, Ban, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<any[]>([])
  const [filteredBarbers, setFilteredBarbers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBarber, setSelectedBarber] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false)
  const [editedBarber, setEditedBarber] = useState<any>(null)
  const [suspensionDuration, setSuspensionDuration] = useState("7")
  const [suspensionReason, setSuspensionReason] = useState("")

  useEffect(() => {
    // جلب الحلاقين من localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const barbersList = users.filter((user: any) => user.type === "barber")
    setBarbers(barbersList)
    setFilteredBarbers(barbersList)
  }, [])

  useEffect(() => {
    // تطبيق الفلترة على الحلاقين
    let result = barbers

    // فلترة حسب الحالة
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        result = result.filter((barber) => !barber.isBlocked && !barber.isSuspended)
      } else if (statusFilter === "blocked") {
        result = result.filter((barber) => barber.isBlocked)
      } else if (statusFilter === "suspended") {
        result = result.filter((barber) => barber.isSuspended && !barber.isBlocked)
      }
    }

    // فلترة حسب البحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (barber) =>
          barber.name.toLowerCase().includes(query) ||
          barber.email.toLowerCase().includes(query) ||
          barber.phone.includes(query),
      )
    }

    setFilteredBarbers(result)
  }, [barbers, searchQuery, statusFilter])

  const formatDate = (dateString: string) => {
    if (!dateString) return "غير متوفر"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const handleViewBarber = (barber: any) => {
    setSelectedBarber(barber)
    setIsViewDialogOpen(true)
  }

  const handleEditBarber = (barber: any) => {
    setEditedBarber({ ...barber })
    setIsEditDialogOpen(true)
  }

  const handleSaveBarber = () => {
    // حفظ التغييرات على الحلاق
    const updatedBarbers = barbers.map((barber) => (barber.id === editedBarber.id ? editedBarber : barber))

    // تحديث localStorage
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const updatedAllUsers = allUsers.map((user: any) => (user.id === editedBarber.id ? editedBarber : user))
    localStorage.setItem("users", JSON.stringify(updatedAllUsers))

    // تحديث حالة الحلاقين
    setBarbers(updatedBarbers)
    setIsEditDialogOpen(false)

    toast({
      title: "تم تحديث الحلاق",
      description: `تم تحديث بيانات الحلاق ${editedBarber.name} بنجاح`,
    })
  }

  const handleDeleteBarber = (barberId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الحلاق؟")) {
      // حذف الحلاق من localStorage
      const updatedBarbers = barbers.filter((barber) => barber.id !== barberId)

      // تحديث localStorage
      const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
      const updatedAllUsers = allUsers.filter((user: any) => user.id !== barberId)
      localStorage.setItem("users", JSON.stringify(updatedAllUsers))

      setBarbers(updatedBarbers)

      toast({
        title: "تم حذف الحلاق",
        description: "تم حذف الحلاق بنجاح",
        variant: "destructive",
      })
    }
  }

  const handleToggleBarberStatus = (barberId: string, currentStatus: boolean) => {
    // تغيير حالة الحلاق (محظور/غير محظور)
    const updatedBarbers = barbers.map((barber) => {
      if (barber.id === barberId) {
        return {
          ...barber,
          isBlocked: !currentStatus,
          // إذا تم إلغاء الحظر، نتأكد من إلغاء الإيقاف المؤقت أيضًا
          isSuspended: currentStatus ? false : barber.isSuspended,
          suspendedUntil: currentStatus ? null : barber.suspendedUntil,
          suspensionReason: currentStatus ? null : barber.suspensionReason,
        }
      }
      return barber
    })

    // تحديث localStorage
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const updatedAllUsers = allUsers.map((user: any) => {
      if (user.id === barberId) {
        return {
          ...user,
          isBlocked: !currentStatus,
          isSuspended: currentStatus ? false : user.isSuspended,
          suspendedUntil: currentStatus ? null : user.suspendedUntil,
          suspensionReason: currentStatus ? null : user.suspensionReason,
        }
      }
      return user
    })
    localStorage.setItem("users", JSON.stringify(updatedAllUsers))

    // تحديث حالة الحلاقين
    setBarbers(updatedBarbers)

    toast({
      title: currentStatus ? "تم إلغاء حظر الحلاق" : "تم حظر الحلاق",
      description: currentStatus
        ? "تم إلغاء حظر الحلاق بنجاح ويمكنه الآن تسجيل الدخول"
        : "تم حظر الحلاق بنجاح ولن يتمكن من تسجيل الدخول",
    })
  }

  const handleSuspendBarber = (barber: any) => {
    setSelectedBarber(barber)
    setSuspensionDuration("7")
    setSuspensionReason("")
    setIsSuspendDialogOpen(true)
  }

  const handleConfirmSuspension = () => {
    if (!selectedBarber) return

    // حساب تاريخ انتهاء الإيقاف
    const days = Number.parseInt(suspensionDuration)
    const suspendedUntil = new Date()
    suspendedUntil.setDate(suspendedUntil.getDate() + days)

    // تحديث حالة الحلاق
    const updatedBarbers = barbers.map((barber) => {
      if (barber.id === selectedBarber.id) {
        return {
          ...barber,
          isSuspended: true,
          suspendedUntil: suspendedUntil.toISOString(),
          suspensionReason: suspensionReason,
        }
      }
      return barber
    })

    // تحديث localStorage
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const updatedAllUsers = allUsers.map((user: any) => {
      if (user.id === selectedBarber.id) {
        return {
          ...user,
          isSuspended: true,
          suspendedUntil: suspendedUntil.toISOString(),
          suspensionReason: suspensionReason,
        }
      }
      return user
    })
    localStorage.setItem("users", JSON.stringify(updatedAllUsers))

    // تحديث حالة الحلاقين
    setBarbers(updatedBarbers)
    setIsSuspendDialogOpen(false)

    toast({
      title: "تم إيقاف الحلاق مؤقتًا",
      description: `تم إيقاف الحلاق ${selectedBarber.name} لمدة ${days} أيام`,
    })
  }

  const handleRemoveSuspension = (barberId: string) => {
    // إلغاء الإيقاف المؤقت للحلاق
    const updatedBarbers = barbers.map((barber) => {
      if (barber.id === barberId) {
        return {
          ...barber,
          isSuspended: false,
          suspendedUntil: null,
          suspensionReason: null,
        }
      }
      return barber
    })

    // تحديث localStorage
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const updatedAllUsers = allUsers.map((user: any) => {
      if (user.id === barberId) {
        return {
          ...user,
          isSuspended: false,
          suspendedUntil: null,
          suspensionReason: null,
        }
      }
      return user
    })
    localStorage.setItem("users", JSON.stringify(updatedAllUsers))

    // تحديث حالة الحلاقين
    setBarbers(updatedBarbers)

    toast({
      title: "تم إلغاء الإيقاف المؤقت",
      description: "تم إلغاء الإيقاف المؤقت للحلاق بنجاح",
    })
  }

  const getBarberStatus = (barber: any) => {
    if (barber.isBlocked) {
      return { status: "محظور", variant: "destructive" as const }
    } else if (barber.isSuspended) {
      return { status: "موقوف مؤقتًا", variant: "warning" as const }
    } else {
      return { status: "نشط", variant: "outline" as const }
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">إدارة الحلاقين</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الحلاقين</CardTitle>
          <CardDescription>إدارة جميع الحلاقين في النظام.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="البحث عن حلاق..."
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
                    <SelectValue placeholder="حالة الحلاق" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحلاقين</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="suspended">موقوف مؤقتًا</SelectItem>
                  <SelectItem value="blocked">محظور</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الحلاق</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>التقييم</TableHead>
                  <TableHead>المواعيد المكتملة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBarbers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      لا يوجد حلاقين مطابقين للبحث
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBarbers.map((barber) => {
                    const statusInfo = getBarberStatus(barber)
                    return (
                      <TableRow
                        key={barber.id}
                        className={barber.isBlocked ? "bg-red-50" : barber.isSuspended ? "bg-amber-50" : ""}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              {barber.name.charAt(0)}
                            </div>
                            <div>
                              <div>{barber.name}</div>
                              <div className="text-xs text-muted-foreground">{barber.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell dir="ltr" className="text-right">
                          {barber.phone}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="font-medium">{barber.rating?.toFixed(1) || "0.0"}</span>
                            <span className="text-muted-foreground text-xs mr-1">({barber.reviews || 0} تقييم)</span>
                          </div>
                        </TableCell>
                        <TableCell>{barber.completedBookings || 0}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>{statusInfo.status}</Badge>
                          {barber.isSuspended && barber.suspendedUntil && (
                            <div className="text-xs text-muted-foreground mt-1">
                              حتى {formatDate(barber.suspendedUntil)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewBarber(barber)}>
                                <UserCheck className="ml-2 h-4 w-4" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditBarber(barber)}>
                                <Edit className="ml-2 h-4 w-4" />
                                تعديل البيانات
                              </DropdownMenuItem>
                              {!barber.isBlocked && !barber.isSuspended && (
                                <DropdownMenuItem onClick={() => handleSuspendBarber(barber)}>
                                  <Clock className="ml-2 h-4 w-4" />
                                  إيقاف مؤقت
                                </DropdownMenuItem>
                              )}
                              {barber.isSuspended && (
                                <DropdownMenuItem onClick={() => handleRemoveSuspension(barber.id)}>
                                  <Clock className="ml-2 h-4 w-4" />
                                  إلغاء الإيقاف المؤقت
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleToggleBarberStatus(barber.id, barber.isBlocked || false)}
                              >
                                <Ban className="ml-2 h-4 w-4" />
                                {barber.isBlocked ? "إلغاء الحظر" : "حظر الحلاق"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteBarber(barber.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <UserX className="ml-2 h-4 w-4" />
                                حذف الحلاق
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* نافذة عرض تفاصيل الحلاق */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل الحلاق</DialogTitle>
            <DialogDescription>عرض معلومات الحلاق بالتفصيل</DialogDescription>
          </DialogHeader>

          {selectedBarber && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl">
                  {selectedBarber.name.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold">{selectedBarber.name}</h3>
                <div className="flex gap-2">
                  <Badge variant="default">حلاق</Badge>
                  {selectedBarber.isBlocked && <Badge variant="destructive">محظور</Badge>}
                  {selectedBarber.isSuspended && <Badge variant="warning">موقوف مؤقتًا</Badge>}
                </div>
              </div>

              <Tabs defaultValue="info">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">معلومات عامة</TabsTrigger>
                  <TabsTrigger value="services">الخدمات</TabsTrigger>
                  <TabsTrigger value="status">الحالة</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="space-y-4">
                  <div className="grid gap-2">
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">البريد الإلكتروني:</span>
                      <span>{selectedBarber.email}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">رقم الهاتف:</span>
                      <span dir="ltr">{selectedBarber.phone}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">تاريخ التسجيل:</span>
                      <span>{formatDate(selectedBarber.joinDate || selectedBarber.createdAt)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">سنوات الخبرة:</span>
                      <span>{selectedBarber.experience || 0} سنوات</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">التقييم:</span>
                      <span>
                        {selectedBarber.rating?.toFixed(1) || "0.0"} من 5 ({selectedBarber.reviews || 0} تقييم)
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">عدد المواعيد المكتملة:</span>
                      <span>{selectedBarber.completedBookings || 0}</span>
                    </div>
                    {selectedBarber.shopAddress && (
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">عنوان المحل:</span>
                        <span>{selectedBarber.shopAddress}</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="services">
                  <div className="py-1">
                    <div className="font-medium mb-2">الخدمات المقدمة:</div>
                    {selectedBarber.services && selectedBarber.services.length > 0 ? (
                      <div className="space-y-2">
                        {selectedBarber.services.map((service: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 border rounded-md">
                            <span>{service.name}</span>
                            <Badge variant="outline">{service.price} ريال</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-center py-4">لا توجد خدمات مسجلة</div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="status">
                  <div className="space-y-4">
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">الحالة الحالية:</span>
                      <Badge
                        variant={
                          selectedBarber.isBlocked ? "destructive" : selectedBarber.isSuspended ? "warning" : "outline"
                        }
                      >
                        {selectedBarber.isBlocked ? "محظور" : selectedBarber.isSuspended ? "موقوف مؤقتًا" : "نشط"}
                      </Badge>
                    </div>

                    {selectedBarber.isSuspended && (
                      <>
                        <div className="flex justify-between py-1 border-b">
                          <span className="font-medium">تاريخ انتهاء الإيقاف:</span>
                          <span>{formatDate(selectedBarber.suspendedUntil)}</span>
                        </div>
                        <div className="py-1 border-b">
                          <span className="font-medium">سبب الإيقاف:</span>
                          <p className="mt-1 text-sm">{selectedBarber.suspensionReason || "لم يتم تحديد سبب"}</p>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 justify-end">
                      {selectedBarber.isBlocked ? (
                        <Button onClick={() => handleToggleBarberStatus(selectedBarber.id, true)}>إلغاء الحظر</Button>
                      ) : selectedBarber.isSuspended ? (
                        <Button onClick={() => handleRemoveSuspension(selectedBarber.id)}>إلغاء الإيقاف المؤقت</Button>
                      ) : (
                        <>
                          <Button variant="outline" onClick={() => handleSuspendBarber(selectedBarber)}>
                            إيقاف مؤقت
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleToggleBarberStatus(selectedBarber.id, false)}
                          >
                            حظر الحلاق
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  إغلاق
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleEditBarber(selectedBarber)
                  }}
                >
                  تعديل
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة تعديل الحلاق */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الحلاق</DialogTitle>
            <DialogDescription>تعديل معلومات الحلاق</DialogDescription>
          </DialogHeader>

          {editedBarber && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">الاسم</Label>
                  <Input
                    id="name"
                    value={editedBarber.name}
                    onChange={(e) => setEditedBarber({ ...editedBarber, name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedBarber.email}
                    onChange={(e) => setEditedBarber({ ...editedBarber, email: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={editedBarber.phone}
                    onChange={(e) => setEditedBarber({ ...editedBarber, phone: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="experience">سنوات الخبرة</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={editedBarber.experience || 0}
                    onChange={(e) => setEditedBarber({ ...editedBarber, experience: Number.parseInt(e.target.value) })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="shopAddress">عنوان المحل</Label>
                  <Input
                    id="shopAddress"
                    value={editedBarber.shopAddress || ""}
                    onChange={(e) => setEditedBarber({ ...editedBarber, shopAddress: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleSaveBarber}>حفظ التغييرات</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة إيقاف الحلاق مؤقتًا */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إيقاف الحلاق مؤقتًا</DialogTitle>
            <DialogDescription>تحديد مدة وسبب الإيقاف المؤقت</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="suspensionDuration">مدة الإيقاف</Label>
                <RadioGroup
                  id="suspensionDuration"
                  value={suspensionDuration}
                  onValueChange={setSuspensionDuration}
                  className="grid grid-cols-3 gap-2"
                >
                  <div>
                    <RadioGroupItem value="1" id="duration-1" className="peer sr-only" />
                    <Label
                      htmlFor="duration-1"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span>يوم واحد</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="3" id="duration-3" className="peer sr-only" />
                    <Label
                      htmlFor="duration-3"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span>3 أيام</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="7" id="duration-7" className="peer sr-only" />
                    <Label
                      htmlFor="duration-7"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span>أسبوع</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="14" id="duration-14" className="peer sr-only" />
                    <Label
                      htmlFor="duration-14"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span>أسبوعين</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="30" id="duration-30" className="peer sr-only" />
                    <Label
                      htmlFor="duration-30"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span>شهر</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="90" id="duration-90" className="peer sr-only" />
                    <Label
                      htmlFor="duration-90"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span>3 أشهر</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="suspensionReason">سبب الإيقاف</Label>
                <textarea
                  id="suspensionReason"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="اكتب سبب إيقاف الحلاق هنا..."
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSuspendDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleConfirmSuspension}>تأكيد الإيقاف</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
