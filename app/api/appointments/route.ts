import { NextResponse } from "next/server"

// بيانات تجريبية للمواعيد
const MOCK_APPOINTMENTS = [
  {
    id: "appt1",
    customerId: "user1",
    barberId: "barber1",
    barberName: "محمد أحمد",
    date: "2025-05-15",
    time: "16:30",
    services: [
      { id: "s1", name: "قص شعر", price: 50 },
      { id: "s2", name: "حلاقة لحية", price: 30 },
    ],
    totalPrice: 80,
    status: "pending", // pending, confirmed, completed, cancelled
    location: "customer_address", // customer_address or barber_location
    customerAddress: "الرياض، حي النزهة، شارع الأمير سلطان",
    createdAt: "2025-05-10T10:30:00Z",
  },
]

// الحصول على جميع المواعيد للمستخدم الحالي
export async function GET(request: Request) {
  try {
    // استخراج معلمات البحث من الطلب
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const userType = searchParams.get("userType") // customer or barber

    if (!userId || !userType) {
      return NextResponse.json({ error: "معلمات البحث غير كاملة" }, { status: 400 })
    }

    // في تطبيق حقيقي، ستقوم بالبحث عن المواعيد بناءً على نوع المستخدم ومعرفه
    let userAppointments = []

    if (userType === "customer") {
      userAppointments = MOCK_APPOINTMENTS.filter((appointment) => appointment.customerId === userId)
    } else if (userType === "barber") {
      userAppointments = MOCK_APPOINTMENTS.filter((appointment) => appointment.barberId === userId)
    }

    return NextResponse.json({
      appointments: userAppointments,
    })
  } catch (error) {
    console.error("خطأ في جلب بيانات المواعيد:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء جلب بيانات المواعيد" }, { status: 500 })
  }
}

// إنشاء موعد جديد
export async function POST(request: Request) {
  try {
    const appointmentData = await request.json()
    const { customerId, barberId, date, time, services, location, customerAddress } = appointmentData

    // التحقق من صحة المدخلات
    if (!customerId || !barberId || !date || !time || !services || !location) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
    }

    // حساب السعر الإجمالي
    const totalPrice = services.reduce((total: number, service: any) => total + service.price, 0)

    // إنشاء موعد جديد
    const newAppointment = {
      id: `appt_${Date.now()}`,
      customerId,
      barberId,
      barberName: "محمد أحمد", // في تطبيق حقيقي، ستحصل على اسم الحلاق من قاعدة البيانات
      date,
      time,
      services,
      totalPrice,
      status: "pending",
      location,
      customerAddress: location === "customer_address" ? customerAddress : null,
      createdAt: new Date().toISOString(),
    }

    // في تطبيق حقيقي، ستقوم بتخزين الموعد في قاعدة البيانات هنا

    return NextResponse.json({
      message: "تم إنشاء الموعد بنجاح",
      appointment: newAppointment,
    })
  } catch (error) {
    console.error("خطأ في إنشاء الموعد:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء إنشاء الموعد" }, { status: 500 })
  }
}
