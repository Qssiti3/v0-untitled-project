"use client"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Star, Scissors, Phone, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

// Dynamically import the entire react-leaflet and leaflet packages
const MapWithNoSSR = dynamic(() => import("../components/simple-map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-muted/20">
      <div className="text-primary">Loading map...</div>
    </div>
  ),
})

// مكون بطاقة معلومات الحلاق المحسنة
function BarberInfoCard({ barber, userType, onBookClick }) {
  const router = useRouter()

  // تحديد ما إذا كان الحلاق قريباً (أقل من 5 كم)
  const isNearby = barber.distance <= 5

  return (
    <Card className="w-[280px] p-0 overflow-hidden">
      <CardContent className="p-3">
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-lg">{barber.name || "حلاق"}</h3>
            <Badge className={barber.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {barber.isAvailable ? "متاح الآن" : "غير متاح"}
            </Badge>
          </div>

          <div className="flex items-center text-yellow-500 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.floor(barber.rating || 0) ? "fill-current" : ""}`} />
            ))}
            <span className="text-sm text-muted-foreground mr-1">({barber.reviews || 0})</span>
          </div>

          <div className="text-sm text-muted-foreground mb-1">
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className={isNearby ? "text-green-600" : "text-orange-600"}>
                {isNearby ? "قريب منك" : "بعيد عنك"} ({barber.distance} كم)
              </span>
            </div>

            <div className="flex items-center gap-1 mb-1">
              <Clock className="h-3.5 w-3.5" />
              <span>متاح خلال {barber.availability?.length > 0 ? barber.availability[0] : "غير محدد"}</span>
            </div>

            <div className="flex items-center gap-1 mb-1">
              <Scissors className="h-3.5 w-3.5" />
              <span>خبرة {barber.experience || 0} سنوات</span>
            </div>

            {/* عرض معلومات الاتصال فقط للزبائن */}
            {userType === "customer" && (
              <div className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                <span>{barber.phone || "غير متوفر"}</span>
              </div>
            )}
          </div>

          <div className="mt-2 text-sm">
            <p className="line-clamp-2">{barber.description || "لا يوجد وصف متاح"}</p>
          </div>

          {barber.services && barber.services.length > 0 ? (
            <div className="mt-2 pt-2 border-t">
              <h4 className="font-medium text-sm mb-1">الخدمات:</h4>
              <ul className="text-xs space-y-0.5">
                {barber.services.slice(0, 3).map((service) => (
                  <li key={service.id} className="flex justify-between">
                    <span>{service.name}</span>
                    <span>{service.price} ريال</span>
                  </li>
                ))}
                {barber.services.length > 3 && (
                  <li className="text-muted-foreground">+{barber.services.length - 3} خدمات أخرى</li>
                )}
              </ul>
            </div>
          ) : (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">لم يتم إضافة خدمات بعد</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20 p-3 pt-2 flex gap-2">
        {userType === "customer" && (
          <Button className="w-full text-sm" onClick={() => onBookClick(barber)}>
            احجز موعد
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full text-sm"
          onClick={() => router.push(`/barber-profile/${barber.id}`)}
        >
          عرض الملف الكامل
        </Button>
      </CardFooter>
    </Card>
  )
}

// تعديل مكون الخريطة لإضافة التحقق من الصلاحيات
interface MapComponentProps {
  userLocation: { lat: number; lng: number }
  barbers: any[]
  onClick?: (location: { lat: number; lng: number }) => void
  onShopLocationClick?: (location: { lat: number; lng: number }) => void
  isSelectable?: boolean
  selectingShopLocation?: boolean
  selectedLocation?: { lat: number; lng: number } | null
  shopLocation?: { lat: number; lng: number } | null
  showServiceZone?: boolean
  serviceZoneRadius?: number
  currentUserId?: string
  barberOwnerId?: string
  userType?: string
  customerLocation?: { lat: number; lng: number } | null
  showDirections?: boolean
}

// تعديل المكون الرئيسي لتمرير معرفات المستخدمين
export default function MapComponent(props: MapComponentProps) {
  const {
    userLocation,
    barbers,
    onClick,
    onShopLocationClick,
    isSelectable = false,
    selectingShopLocation = false,
    selectedLocation = null,
    shopLocation = null,
    showServiceZone = false,
    serviceZoneRadius = 5,
    currentUserId,
    barberOwnerId,
    userType,
    customerLocation = null,
    showDirections = false,
  } = props

  const router = useRouter()

  // معالجة النقر على زر الحجز
  const handleBookClick = (barber) => {
    router.push(`/dashboard/customer/booking/${barber.id}`)
  }

  // تعديل التحقق من صلاحية تعديل الموقع
  const canModifyLocation = isSelectable && currentUserId && barberOwnerId && currentUserId === barberOwnerId

  // Pass all props to the dynamically loaded map component
  return <MapWithNoSSR {...props} onBookClick={handleBookClick} />
}
