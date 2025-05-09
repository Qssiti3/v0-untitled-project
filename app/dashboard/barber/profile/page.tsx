"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Upload,
  User,
  Save,
  Loader2,
  MapPin,
  Scissors,
  Phone,
  Mail,
  X,
  Plus,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"
import { updateBarberProfile, uploadProfileImage } from "@/lib/api"
import BarberNavbar from "@/components/barber-navbar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function BarberProfilePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    description: "",
  })

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // إضافة حالة لإدارة الأوقات المتاحة
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [newTime, setNewTime] = useState("")

  // إضافة حالة لإدارة الخدمات
  const [services, setServices] = useState<any[]>([])
  const [newService, setNewService] = useState({ name: "", price: "" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // استرجاع الأوقات المتاحة والخدمات عند تحميل الصفحة
  useEffect(() => {
    if (user) {
      const barbers = JSON.parse(localStorage.getItem("barbers") || "[]")
      const barber = barbers.find((b: any) => b.id === user.id)

      if (barber) {
        // استرجاع الأوقات المتاحة
        if (barber.availability) {
          setAvailableTimes(barber.availability)
        } else {
          // أوقات افتراضية
          const defaultTimes = [
            "09:00",
            "10:00",
            "11:00",
            "12:00",
            "13:00",
            "14:00",
            "15:00",
            "16:00",
            "17:00",
            "18:00",
          ]
          setAvailableTimes(defaultTimes)
          saveAvailableTimes(defaultTimes)
        }

        // استرجاع الخدمات
        if (barber.services && barber.services.length > 0) {
          setServices(barber.services)
        } else {
          // خدمات افتراضية
          const defaultServices = [
            { id: "s1", name: "قص شعر", price: 50 },
            { id: "s2", name: "حلاقة لحية", price: 30 },
          ]
          setServices(defaultServices)
          saveServices(defaultServices)
        }
      } else {
        // إذا لم يكن الحلاق موجوداً، استخدم القيم الافتراضية
        const defaultTimes = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]
        setAvailableTimes(defaultTimes)
        saveAvailableTimes(defaultTimes)

        const defaultServices = [
          { id: "s1", name: "قص شعر", price: 50 },
          { id: "s2", name: "حلاقة لحية", price: 30 },
        ]
        setServices(defaultServices)
        saveServices(defaultServices)
      }
    }
  }, [user])

  // حفظ الأوقات المتاحة
  const saveAvailableTimes = (times: string[]) => {
    if (!user) return

    try {
      const barbers = JSON.parse(localStorage.getItem("barbers") || "[]")
      const barberIndex = barbers.findIndex((b: any) => b.id === user.id)

      if (barberIndex !== -1) {
        barbers[barberIndex].availability = times
      } else {
        // إنشاء حلاق جديد إذا لم يكن موجوداً
        barbers.push({
          id: user.id,
          name: user.name || "حلاق جديد",
          email: user.email,
          phone: user.phone || "",
          availability: times,
          services: [],
          isAvailable: true,
        })
      }

      localStorage.setItem("barbers", JSON.stringify(barbers))
      console.log("تم حفظ الأوقات المتاحة بنجاح")
    } catch (error) {
      console.error("خطأ في حفظ الأوقات المتاحة:", error)
    }
  }

  // حفظ الخدمات
  const saveServices = (servicesList: any[]) => {
    if (!user) return

    try {
      const barbers = JSON.parse(localStorage.getItem("barbers") || "[]")
      const barberIndex = barbers.findIndex((b: any) => b.id === user.id)

      if (barberIndex !== -1) {
        barbers[barberIndex].services = servicesList
      } else {
        // إنشاء حلاق جديد إذا لم يكن موجوداً
        barbers.push({
          id: user.id,
          name: user.name || "حلاق جديد",
          email: user.email,
          phone: user.phone || "",
          availability: [],
          services: servicesList,
          isAvailable: true,
        })
      }

      localStorage.setItem("barbers", JSON.stringify(barbers))
      console.log("تم حفظ الخدمات بنجاح")
    } catch (error) {
      console.error("خطأ في حفظ الخدمات:", error)
    }
  }

  // إضافة وقت جديد
  const addTime = () => {
    if (!newTime) return

    const updatedTimes = [...availableTimes, newTime].sort()
    setAvailableTimes(updatedTimes)
    saveAvailableTimes(updatedTimes)
    setNewTime("")
  }

  // حذف وقت
  const removeTime = (time: string) => {
    const updatedTimes = availableTimes.filter((t) => t !== time)
    setAvailableTimes(updatedTimes)
    saveAvailableTimes(updatedTimes)
  }

  // إضافة خدمة جديدة
  const addService = () => {
    if (!newService.name || !newService.price) return

    const newServiceObj = {
      id: `s${Date.now()}`,
      name: newService.name,
      price: Number(newService.price),
    }

    const updatedServices = [...services, newServiceObj]
    setServices(updatedServices)
    saveServices(updatedServices)
    setNewService({ name: "", price: "" })
    setIsDialogOpen(false)
  }

  // حذف خدمة
  const removeService = (serviceId: string) => {
    const updatedServices = services.filter((s) => s.id !== serviceId)
    setServices(updatedServices)
    saveServices(updatedServices)
  }

  // التحقق من وجود مستخدم مسجل الدخول ونوعه
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.type !== "barber") {
        router.push("/dashboard/customer")
      } else {
        // تعبئة بيانات النموذج من بيانات المستخدم
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          experience: user.experience?.toString() || "",
          description: user.description || "",
        })

        if (user.profileImage) {
          setProfileImage(user.profileImage)
        }
      }
    }
  }, [user, authLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleServiceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewService((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        setError("حجم الصورة كبير جدًا. يجب أن يكون أقل من 5 ميجابايت")
        return
      }

      setSelectedFile(file)

      // عرض معاينة الصورة
      const reader = new FileReader()
      reader.onload = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleUploadImage = async () => {
    if (!selectedFile) return

    try {
      setIsUploading(true)
      setError("")

      // رفع الصورة
      const imageUrl = await uploadProfileImage(selectedFile)
      setProfileImage(imageUrl)
      setSuccess("تم رفع الصورة بنجاح")
      setSelectedFile(null)
    } catch (err) {
      setError("حدث خطأ أثناء رفع الصورة، يرجى المحاولة مرة أخرى")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // التحقق من صحة البيانات
    if (!formData.name || !formData.email || !formData.phone) {
      setError("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    try {
      setIsUpdating(true)
      setError("")
      setSuccess("")

      // تحديث الملف الشخصي
      await updateBarberProfile({
        id: user?.id,
        ...formData,
        experience: Number.parseInt(formData.experience) || 0,
        profileImage: profileImage,
        services: services,
        availability: availableTimes,
      })

      setSuccess("تم تحديث الملف الشخصي بنجاح")
    } catch (err) {
      setError("حدث خطأ أثناء تحديث الملف الشخصي، يرجى المحاولة مرة أخرى")
    } finally {
      setIsUpdating(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <BarberNavbar user={user} activeTab="" setActiveTab={() => {}} logout={() => {}} />

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" className="mb-2" onClick={() => router.push("/dashboard/barber")}>
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى لوحة التحكم
            </Button>
            <h1 className="text-2xl font-bold">الملف الشخصي</h1>
            <p className="text-muted-foreground">تعديل معلومات ملفك الشخصي وصورتك</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 text-green-600 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* بطاقة الصورة الشخصية */}
            <Card>
              <CardHeader>
                <CardTitle>الصورة الشخصية</CardTitle>
                <CardDescription>صورة ملفك الشخصي التي سيراها العملاء</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={profileImage || ""} alt="صورة الملف الشخصي" />
                  <AvatarFallback className="text-2xl">{user?.name?.substring(0, 2) || "HS"}</AvatarFallback>
                </Avatar>

                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1" onClick={handleUploadClick} disabled={isUploading}>
                    <Upload className="ml-2 h-4 w-4" />
                    اختر صورة
                  </Button>

                  <Button className="flex-1" onClick={handleUploadImage} disabled={isUploading || !selectedFile}>
                    {isUploading ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Save className="ml-2 h-4 w-4" />
                        رفع الصورة
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* بطاقة معلومات الملف الشخصي */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>معلومات الملف الشخصي</CardTitle>
                <CardDescription>تعديل بياناتك الشخصية وتفاصيل خدماتك</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="profile-form" className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        className="pr-10"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        className="pr-10"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        className="pr-10"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">سنوات الخبرة</Label>
                    <div className="relative">
                      <Scissors className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="experience"
                        name="experience"
                        type="number"
                        min="0"
                        className="pr-10"
                        value={formData.experience}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">وصف الخدمات</Label>
                    <Textarea
                      id="description"
                      name="description"
                      rows={4}
                      placeholder="اكتب وصفًا مختصرًا عن خدماتك ومهاراتك..."
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="pt-2 flex items-center">
                    <Button
                      variant="outline"
                      type="button"
                      className="ml-2"
                      onClick={() => router.push("/dashboard/barber/location")}
                    >
                      <MapPin className="ml-2 h-4 w-4" />
                      تعديل الموقع
                    </Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" form="profile-form" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="ml-2 h-4 w-4" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* بطاقة الأوقات المتاحة */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>الأوقات المتاحة</CardTitle>
                <CardDescription>حدد الأوقات التي تكون متاحاً فيها للحجز</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {availableTimes.map((time) => (
                      <Badge key={time} variant="secondary" className="flex items-center gap-1">
                        {time}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeTime(time)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="أضف وقتاً جديداً"
                      className="w-32"
                    />
                    <Button onClick={addTime} size="sm">
                      إضافة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* بطاقة الخدمات */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>الخدمات المقدمة</CardTitle>
                  <CardDescription>أضف الخدمات التي تقدمها وأسعارها</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة خدمة
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة خدمة جديدة</DialogTitle>
                      <DialogDescription>أدخل اسم الخدمة وسعرها</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="service-name">اسم الخدمة</Label>
                        <Input
                          id="service-name"
                          name="name"
                          placeholder="مثال: قص شعر"
                          value={newService.name}
                          onChange={handleServiceInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service-price">السعر (ريال)</Label>
                        <Input
                          id="service-price"
                          name="price"
                          type="number"
                          min="0"
                          placeholder="مثال: 50"
                          value={newService.price}
                          onChange={handleServiceInputChange}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={addService}>إضافة الخدمة</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {services.length === 0 ? (
                    <div className="text-center p-4 border rounded-md text-muted-foreground">
                      لا توجد خدمات مضافة. أضف خدماتك ليتمكن العملاء من حجزها.
                    </div>
                  ) : (
                    services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="font-medium">{service.name}</div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {service.price} ريال
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => removeService(service.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
