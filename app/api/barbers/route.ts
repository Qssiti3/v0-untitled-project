import { NextResponse } from "next/server"

// بيانات تجريبية للحلاقين
const MOCK_BARBERS = [
  {
    id: "barber1",
    name: "محمد أحمد",
    email: "mohamed@example.com",
    phone: "0512345678",
    experience: 5,
    rating: 4.8,
    reviews: 32,
    location: { lat: 24.7136, lng: 46.6753 }, // الرياض
    distance: 2.5, // كم
    availability: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
    services: [
      { id: "s1", name: "قص شعر", price: 50 },
      { id: "s2", name: "حلاقة لحية", price: 30 },
      { id: "s3", name: "تصفيف شعر", price: 40 },
    ],
    description: "حلاق محترف متخصص في قصات الشعر العصرية واللحى",
    isAvailable: true,
  },
  {
    id: "barber2",
    name: "خالد عبدالله",
    email: "khaled@example.com",
    phone: "0598765432",
    experience: 7,
    rating: 4.5,
    reviews: 45,
    location: { lat: 24.7236, lng: 46.6853 }, // الرياض
    distance: 3.2, // كم
    availability: ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"],
    services: [
      { id: "s1", name: "قص شعر", price: 60 },
      { id: "s2", name: "حلاقة لحية", price: 35 },
      { id: "s3", name: "تصفيف شعر", price: 45 },
    ],
    description: "حلاق ذو خبرة في قصات الشعر الكلاسيكية والحديثة",
    isAvailable: true,
  },
  {
    id: "barber3",
    name: "عبدالرحمن محمد",
    email: "abdulrahman@example.com",
    phone: "0567891234",
    experience: 3,
    rating: 4.2,
    reviews: 18,
    location: { lat: 24.7036, lng: 46.6653 }, // الرياض
    distance: 4.1, // كم
    availability: ["9:00", "10:00", "13:00", "14:00", "17:00", "18:00"],
    services: [
      { id: "s1", name: "قص شعر", price: 45 },
      { id: "s2", name: "حلاقة لحية", price: 25 },
      { id: "s3", name: "تصفيف شعر", price: 35 },
    ],
    description: "حلاق شاب متخصص في أحدث صيحات الموضة وقصات الشعر العصرية",
    isAvailable: true,
  },
]

export async function GET(request: Request) {
  try {
    // استخراج معلمات البحث من الطلب
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const maxDistance = searchParams.get("maxDistance") || "10" // الافتراضي 10 كم

    // في تطبيق حقيقي، ستقوم بالبحث عن الحلاقين بناءً على الموقع والمسافة
    // هنا نقوم بإرجاع جميع الحلاقين المتاحين

    return NextResponse.json({
      barbers: MOCK_BARBERS,
    })
  } catch (error) {
    console.error("خطأ في جلب بيانات الحلاقين:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء جلب بيانات الحلاقين" }, { status: 500 })
  }
}
