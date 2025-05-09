"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Upload, User, Save, Loader2, MapPin, Phone, Mail, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"
import { updateCustomerProfile, uploadProfileImage } from "@/lib/api"
import CustomerNavbar from "@/components/customer-navbar"

export default function CustomerProfilePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // التحقق من وجود مستخدم مسجل الدخول ونوعه
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.type !== "customer") {
        router.push("/dashboard/barber")
      } else {
        // تعبئة بيانات النموذج من بيانات المستخدم
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
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
      await updateCustomerProfile({
        ...formData,
        profileImage: profileImage,
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
      <CustomerNavbar user={user} activeTab="" setActiveTab={() => {}} logout={() => {}} />

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" className="mb-2" onClick={() => router.push("/dashboard/customer")}>
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى لوحة التحكم
            </Button>
            <h1 className="text-2xl font-bold">الملف الشخصي</h1>
            <p className="text-muted-foreground">تعديل معلوماتك الشخصية وصورتك</p>
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
                <CardDescription>صورة ملفك الشخصي التي سيراها الحلاقون</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={profileImage || ""} alt="صورة الملف الشخصي" />
                  <AvatarFallback className="text-2xl">{user?.name?.substring(0, 2) || "MS"}</AvatarFallback>
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
                <CardDescription>تعديل بياناتك الشخصية وعنوانك</CardDescription>
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
                    <Label htmlFor="address">العنوان</Label>
                    <div className="relative">
                      <Home className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="address"
                        name="address"
                        className="pr-10 min-h-[80px]"
                        placeholder="أدخل عنوانك التفصيلي..."
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" type="button" onClick={() => router.push("/dashboard/customer/location")}>
                      <MapPin className="ml-2 h-4 w-4" />
                      تحديد موقعي على الخريطة
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
          </div>
        </div>
      </main>
    </div>
  )
}
