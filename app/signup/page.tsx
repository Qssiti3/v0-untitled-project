"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Scissors, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, register, isLoading } = useAuth()

  const [activeTab, setActiveTab] = useState("customer")
  const [error, setError] = useState("")

  // بيانات الزبون
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerPassword, setCustomerPassword] = useState("")
  const [customerConfirmPassword, setCustomerConfirmPassword] = useState("")

  // بيانات الحلاق
  const [barberName, setBarberName] = useState("")
  const [barberEmail, setBarberEmail] = useState("")
  const [barberPhone, setBarberPhone] = useState("")
  const [barberExperience, setBarberExperience] = useState("")
  const [barberPassword, setBarberPassword] = useState("")
  const [barberConfirmPassword, setBarberConfirmPassword] = useState("")

  useEffect(() => {
    const type = searchParams.get("type")
    if (type === "barber" || type === "customer") {
      setActiveTab(type)
    }

    // إذا كان المستخدم مسجل الدخول بالفعل، توجيهه إلى لوحة التحكم المناسبة
    if (user) {
      if (user.type === "customer") {
        router.push("/dashboard/customer")
      } else if (user.type === "barber") {
        router.push("/dashboard/barber")
      }
    }
  }, [user, router, searchParams])

  const validateCustomerForm = () => {
    if (!customerName || !customerEmail || !customerPhone || !customerPassword || !customerConfirmPassword) {
      setError("يرجى ملء جميع الحقول المطلوبة")
      return false
    }

    if (!customerEmail.includes("@")) {
      setError("يرجى إدخال بريد إلكتروني صحيح")
      return false
    }

    if (customerPassword.length < 6) {
      setError("يجب أن تتكون كلمة المرور من 6 أحرف على الأقل")
      return false
    }

    if (customerPassword !== customerConfirmPassword) {
      setError("كلمات المرور غير متطابقة")
      return false
    }

    return true
  }

  const validateBarberForm = () => {
    if (!barberName || !barberEmail || !barberPhone || !barberExperience || !barberPassword || !barberConfirmPassword) {
      setError("يرجى ملء جميع الحقول المطلوبة")
      return false
    }

    if (!barberEmail.includes("@")) {
      setError("يرجى إدخال بريد إلكتروني صحيح")
      return false
    }

    if (barberPassword.length < 6) {
      setError("يجب أن تتكون كلمة المرور من 6 أحرف على الأقل")
      return false
    }

    if (barberPassword !== barberConfirmPassword) {
      setError("كلمات المرور غير متطابقة")
      return false
    }

    return true
  }

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateCustomerForm()) return

    try {
      // تسجيل المستخدم الجديد
      await register({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        password: customerPassword,
        type: "customer",
      })

      // سيتم التوجيه تلقائيًا في useEffect عندما يتم تعيين المستخدم
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إنشاء الحساب")
    }
  }

  const handleBarberSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateBarberForm()) return

    try {
      // تسجيل الحلاق الجديد
      await register({
        name: barberName,
        email: barberEmail,
        phone: barberPhone,
        experience: barberExperience,
        password: barberPassword,
        type: "barber",
        services: [
          { id: "s1", name: "قص شعر", price: 50 },
          { id: "s2", name: "حلاقة لحية", price: 30 },
        ],
      })

      // سيتم التوجيه تلقائيًا في useEffect عندما يتم تعيين المستخدم
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إنشاء الحساب")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2">
        <Scissors className="h-6 w-6" />
        <span className="text-xl font-bold">BarberGo</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">إنشاء حساب جديد</CardTitle>
          <CardDescription>اختر نوع الحساب وأدخل بياناتك للتسجيل</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="customer">زبون</TabsTrigger>
              <TabsTrigger value="barber">حلاق</TabsTrigger>
            </TabsList>
            <TabsContent value="customer">
              <form className="space-y-4" onSubmit={handleCustomerSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="customer-name">الاسم الكامل</Label>
                  <Input
                    id="customer-name"
                    placeholder="أدخل اسمك الكامل"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-email">البريد الإلكتروني</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    placeholder="example@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-phone">رقم الهاتف</Label>
                  <Input
                    id="customer-phone"
                    placeholder="05xxxxxxxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-password">كلمة المرور</Label>
                  <Input
                    id="customer-password"
                    type="password"
                    placeholder="********"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-confirm-password">تأكيد كلمة المرور</Label>
                  <Input
                    id="customer-confirm-password"
                    type="password"
                    placeholder="********"
                    value={customerConfirmPassword}
                    onChange={(e) => setCustomerConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    "إنشاء حساب زبون"
                  )}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="barber">
              <form className="space-y-4" onSubmit={handleBarberSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="barber-name">الاسم الكامل</Label>
                  <Input
                    id="barber-name"
                    placeholder="أدخل اسمك الكامل"
                    value={barberName}
                    onChange={(e) => setBarberName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barber-email">البريد الإلكتروني</Label>
                  <Input
                    id="barber-email"
                    type="email"
                    placeholder="example@example.com"
                    value={barberEmail}
                    onChange={(e) => setBarberEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barber-phone">رقم الهاتف</Label>
                  <Input
                    id="barber-phone"
                    placeholder="05xxxxxxxx"
                    value={barberPhone}
                    onChange={(e) => setBarberPhone(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barber-experience">سنوات الخبرة</Label>
                  <Input
                    id="barber-experience"
                    type="number"
                    placeholder="5"
                    value={barberExperience}
                    onChange={(e) => setBarberExperience(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barber-password">كلمة المرور</Label>
                  <Input
                    id="barber-password"
                    type="password"
                    placeholder="********"
                    value={barberPassword}
                    onChange={(e) => setBarberPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barber-confirm-password">تأكيد كلمة المرور</Label>
                  <Input
                    id="barber-confirm-password"
                    type="password"
                    placeholder="********"
                    value={barberConfirmPassword}
                    onChange={(e) => setBarberConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    "إنشاء حساب حلاق"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            بالتسجيل، أنت توافق على{" "}
            <Link href="#" className="underline">
              الشروط والأحكام
            </Link>{" "}
            و{" "}
            <Link href="#" className="underline">
              سياسة الخصوصية
            </Link>
          </div>
          <div className="text-center text-sm">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="underline">
              تسجيل الدخول
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
