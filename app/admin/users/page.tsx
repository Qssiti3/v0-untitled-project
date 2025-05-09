"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, UserCheck, UserX, Filter, Edit, Ban } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [userTypeFilter, setUserTypeFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedUser, setEditedUser] = useState<any>(null)

  useEffect(() => {
    // جلب المستخدمين من localStorage
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
    // استبعاد المستخدم الأدمين
    const filteredUsers = storedUsers.filter((user: any) => user.type !== "admin")
    setUsers(filteredUsers)
    setFilteredUsers(filteredUsers)
  }, [])

  useEffect(() => {
    // تطبيق الفلترة على المستخدمين
    let result = users

    // فلترة حسب نوع المستخدم
    if (userTypeFilter !== "all") {
      result = result.filter((user) => user.type === userTypeFilter)
    }

    // فلترة حسب البحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone.includes(query),
      )
    }

    setFilteredUsers(result)
  }, [users, searchQuery, userTypeFilter])

  const formatDate = (dateString: string) => {
    if (!dateString) return "غير متوفر"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleEditUser = (user: any) => {
    setEditedUser({ ...user })
    setIsEditDialogOpen(true)
  }

  const handleSaveUser = () => {
    // حفظ التغييرات على المستخدم
    const updatedUsers = users.map((user) => (user.id === editedUser.id ? editedUser : user))

    // تحديث localStorage
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const updatedAllUsers = allUsers.map((user: any) => (user.id === editedUser.id ? editedUser : user))
    localStorage.setItem("users", JSON.stringify(updatedAllUsers))

    // تحديث حالة المستخدمين
    setUsers(updatedUsers)
    setIsEditDialogOpen(false)

    toast({
      title: "تم تحديث المستخدم",
      description: `تم تحديث بيانات المستخدم ${editedUser.name} بنجاح`,
    })
  }

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      // حذف المستخدم من localStorage
      const updatedUsers = users.filter((user) => user.id !== userId)

      // تحديث localStorage
      const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
      const updatedAllUsers = allUsers.filter((user: any) => user.id !== userId)
      localStorage.setItem("users", JSON.stringify(updatedAllUsers))

      setUsers(updatedUsers)

      toast({
        title: "تم حذف المستخدم",
        description: "تم حذف المستخدم بنجاح",
        variant: "destructive",
      })
    }
  }

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    // تغيير حالة المستخدم (محظور/غير محظور)
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return { ...user, isBlocked: !currentStatus }
      }
      return user
    })

    // تحديث localStorage
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const updatedAllUsers = allUsers.map((user: any) => {
      if (user.id === userId) {
        return { ...user, isBlocked: !currentStatus }
      }
      return user
    })
    localStorage.setItem("users", JSON.stringify(updatedAllUsers))

    // تحديث حالة المستخدمين
    setUsers(updatedUsers)

    toast({
      title: currentStatus ? "تم إلغاء حظر المستخدم" : "تم حظر المستخدم",
      description: currentStatus
        ? "تم إلغاء حظر المستخدم بنجاح ويمكنه الآن تسجيل الدخول"
        : "تم حظر المستخدم بنجاح ولن يتمكن من تسجيل الدخول",
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">إدارة المستخدمين</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>المستخدمين</CardTitle>
          <CardDescription>إدارة جميع المستخدمين في النظام من زبائن وحلاقين.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="البحث عن مستخدم..."
                  className="w-full pr-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="نوع المستخدم" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستخدمين</SelectItem>
                  <SelectItem value="customer">الزبائن</SelectItem>
                  <SelectItem value="barber">الحلاقين</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      لا يوجد مستخدمين مطابقين للبحث
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className={user.isBlocked ? "bg-red-50" : ""}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {user.name.charAt(0)}
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.type === "barber" ? "default" : "secondary"}>
                          {user.type === "barber" ? "حلاق" : "زبون"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell dir="ltr" className="text-right">
                        {user.phone}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isBlocked ? "destructive" : "outline"}>
                          {user.isBlocked ? "محظور" : "نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewUser(user)}>
                              <UserCheck className="ml-2 h-4 w-4" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="ml-2 h-4 w-4" />
                              تعديل البيانات
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id, user.isBlocked || false)}>
                              <Ban className="ml-2 h-4 w-4" />
                              {user.isBlocked ? "إلغاء الحظر" : "حظر المستخدم"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <UserX className="ml-2 h-4 w-4" />
                              حذف المستخدم
                            </DropdownMenuItem>
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

      {/* نافذة تفاصيل المستخدم */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل المستخدم</DialogTitle>
            <DialogDescription>عرض معلومات المستخدم بالتفصيل</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl">
                  {selectedUser.name.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                <div className="flex gap-2">
                  <Badge variant={selectedUser.type === "barber" ? "default" : "secondary"}>
                    {selectedUser.type === "barber" ? "حلاق" : "زبون"}
                  </Badge>
                  {selectedUser.isBlocked && <Badge variant="destructive">محظور</Badge>}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between py-1 border-b">
                  <span className="font-medium">البريد الإلكتروني:</span>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-medium">رقم الهاتف:</span>
                  <span dir="ltr">{selectedUser.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="font-medium">تاريخ التسجيل:</span>
                  <span>{formatDate(selectedUser.createdAt)}</span>
                </div>

                {selectedUser.type === "barber" && (
                  <>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">سنوات الخبرة:</span>
                      <span>{selectedUser.experience || 0} سنوات</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">التقييم:</span>
                      <span>{selectedUser.rating || 0} من 5</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">عدد المواعيد المكتملة:</span>
                      <span>{selectedUser.completedBookings || 0}</span>
                    </div>
                    <div className="py-1 border-b">
                      <div className="font-medium mb-1">الخدمات:</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.services?.map((service: any, index: number) => (
                          <Badge key={index} variant="outline">
                            {service.name} - {service.price} ريال
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {selectedUser.type === "customer" && selectedUser.address && (
                  <div className="flex justify-between py-1 border-b">
                    <span className="font-medium">العنوان:</span>
                    <span>{selectedUser.address}</span>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إغلاق
                </Button>
                <Button
                  onClick={() => {
                    setIsDialogOpen(false)
                    handleEditUser(selectedUser)
                  }}
                >
                  تعديل
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة تعديل المستخدم */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
            <DialogDescription>تعديل معلومات المستخدم</DialogDescription>
          </DialogHeader>

          {editedUser && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">الاسم</Label>
                  <Input
                    id="name"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={editedUser.phone}
                    onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                  />
                </div>

                {editedUser.type === "barber" && (
                  <div className="grid gap-2">
                    <Label htmlFor="experience">سنوات الخبرة</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={editedUser.experience || 0}
                      onChange={(e) => setEditedUser({ ...editedUser, experience: Number.parseInt(e.target.value) })}
                    />
                  </div>
                )}

                {editedUser.type === "customer" && (
                  <div className="grid gap-2">
                    <Label htmlFor="address">العنوان</Label>
                    <Input
                      id="address"
                      value={editedUser.address || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="blocked"
                    checked={editedUser.isBlocked || false}
                    onCheckedChange={(checked) => setEditedUser({ ...editedUser, isBlocked: checked })}
                  />
                  <Label htmlFor="blocked" className="mr-2">
                    حظر المستخدم
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleSaveUser}>حفظ التغييرات</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
