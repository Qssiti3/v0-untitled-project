"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save, Trash2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"
import { updateBarberLocation, deleteBarberLocation } from "@/lib/api"
import dynamic from "next/dynamic"
import BarberNavbar from "@/components/barber-navbar"

// Dynamically import the MapComponent with SSR disabled
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-[400px] bg-muted/20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="mr-2">جاري تحميل الخريطة...</span>
    </div>
  ),
})

export default function BarberLocationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [userLocation, setUserLocation] = useState({ lat: 24.7136, lng: 46.6753 }) // الرياض كموقع افتراضي
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [shopLocation, setShopLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [serviceZone, setServiceZone] = useState(5) // نطاق الخدمة بالكيلومتر
  const [shopAddress, setShopAddress] = useState("")
  const [selectingShopLocation, setSelectingShopLocation] = useState(false)

  // التحقق من وجود مستخدم مسجل الدخول ونوعه
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.type !== "barber") {
        router.push("/dashboard/customer")
      } else {
        // تعيين الموقع المحدد إذا كان المستخدم لديه موقع محفوظ
        if (user.location) {
          setSelectedLocation(user.location)
        }
        if (user.shopLocation) {
          setShopLocation(user.shopLocation)
        }
        if (user.shopAddress) {
          setShopAddress(user.shopAddress)
        }
        if (user.serviceZone) {
          setServiceZone(user.serviceZone)
        }
      }
    }
  }, [user, authLoading, router])

  // الحصول على موقع المستخدم الحالي
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          },
          (error) => {
            console.error("Error getting user location:", error)
          },
        )
      }
    }
  }, [])

  // حفظ موقع الحلاق
  const handleSaveLocation = async () => {
    if (!selectedLocation) {
      setError("يرجى تحديد موقع المحل أولاً")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      // تحديث موقع الحلاق
      await updateBarberLocation(
        user.id,
        selectedLocation,
        serviceZone,
        "shop_only", // تعيين نوع الخدمة إلى shop_only فقط
        shopAddress,
        null, // لا نستخدم موقع شخصي منفصل
        user.id, // تمرير معرف المستخدم الحالي للتحقق
      )

      toast({
        title: "تم حفظ الموقع بنجاح",
        description: "تم تحديث موقع المحل الخاص بك",
      })

      // تحديث بيانات المستخدم المحلية
      if (user) {
        user.location = selectedLocation
        user.serviceZone = serviceZone
        user.shopAddress = shopAddress
      }
    } catch (err) {
      console.error("Error saving location:", err)
      setError("حدث خطأ أثناء حفظ الموقع. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
    }
  }

  // حذف موقع الحلاق
  const handleDeleteLocation = async () => {
    try {
      setIsLoading(true)
      setError("")

      // حذف موقع الحلاق
      await deleteBarberLocation(user.id, user.id)

      toast({
        title: "تم حذف الموقع بنجاح",
        description: "تم حذف موقع المحل الخاص بك",
      })

      // إعادة تعيين الحالة
      setSelectedLocation(null)
      setShopLocation(null)
      setShopAddress("")

      // تحديث بيانات المستخدم المحلية
      if (user) {
        user.location = null
        user.shopLocation = null
        user.shopAddress = ""
      }
    } catch (err) {
      console.error("Error deleting location:", err)
      setError("حدث خطأ أثناء حذف الموقع. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
    }
  }

  // تحديد موقع المحل
  const handleMapClick = (location) => {
    setSelectedLocation(location)
    setShopLocation(location)
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
      <BarberNavbar user={user} logout={logout} />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold mb-6">إدارة موقع المحل</h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Map Card */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>تحديد موقع المحل</CardTitle>
                  <CardDescription>
                    انقر على الخريطة لتحديد موقع المحل الخاص بك. سيتمكن العملاء من رؤية هذا الموقع والحجز بناءً عليه.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[400px] w-full">
                    <MapComponent
                      userLocation={userLocation}
                      barbers={[]}
                      onClick={handleMapClick}
                      isSelectable={true}
                      selectedLocation={selectedLocation}
                      shopLocation={shopLocation}
                      showServiceZone={true}
                      serviceZoneRadius={serviceZone}
                      currentUserId={user?.id}
                      barberOwnerId={user?.id}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Settings Card */}
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>إعدادات الموقع</CardTitle>
                  <CardDescription>قم بتعديل إعدادات موقع المحل ونطاق الخدمة الخاص بك.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shopAddress">عنوان المحل</Label>
                    <Input
                      id="shopAddress"
                      placeholder="أدخل عنوان المحل بالتفصيل"
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>نطاق الخدمة ({serviceZone} كم)</Label>
                    <Slider
                      value={[serviceZone]}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={(value) => setServiceZone(value[0])}
                    />
                    <p className="text-sm text-muted-foreground">
                      سيتمكن العملاء ضمن هذا النطاق من رؤية ملفك الشخصي والحجز معك.
                    </p>
                  </div>

                  {selectedLocation && (
                    <Alert className="mt-4">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        تم تحديد موقع المحل بنجاح. اضغط على "حفظ الموقع" لتأكيد التغييرات.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Button className="w-full" onClick={handleSaveLocation} disabled={isLoading || !selectedLocation}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
                    حفظ الموقع
                  </Button>
                  {selectedLocation && (
                    <Button variant="outline" className="w-full" onClick={handleDeleteLocation} disabled={isLoading}>
                      <Trash2 className="h-4 w-4 ml-2" />
                      حذف الموقع
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* معلومات إضافية */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>معلومات هامة</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                <li>سيتمكن العملاء من رؤية موقع المحل الخاص بك على الخريطة.</li>
                <li>سيتم عرض ملفك الشخصي للعملاء الموجودين ضمن نطاق الخدمة الذي حددته.</li>
                <li>تأكد من تحديث موقعك في حال انتقلت إلى مكان آخر.</li>
                <li>يمكنك تعديل نطاق الخدمة في أي وقت حسب قدرتك على تقديم الخدمة.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
