import { NextResponse } from "next/server"

// في تطبيق حقيقي، ستحتاج إلى استخدام قاعدة بيانات وتشفير كلمات المرور
// هذه بيانات تجريبية فقط للتوضيح
const MOCK_USERS = [
  {
    id: "user1",
    name: "أحمد محمد",
    email: "ahmed@example.com",
    password: "password123",
    type: "customer",
    phone: "0512345678",
    address: "الرياض، حي النزهة",
  },
  {
    id: "user2",
    name: "محمد علي",
    email: "barber@example.com",
    password: "password123",
    type: "barber",
    phone: "0598765432",
    experience: 5,
    rating: 4.8,
    location: { lat: 24.7136, lng: 46.6753 }, // إحداثيات الرياض
    services: ["قص شعر", "حلاقة لحية", "تصفيف شعر"],
    availability: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  },
]

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // التحقق من صحة المدخلات
    if (!email || !password) {
      return NextResponse.json({ error: "يرجى إدخال البريد الإلكتروني وكلمة المرور" }, { status: 400 })
    }

    // البحث عن المستخدم
    const user = MOCK_USERS.find((user) => user.email === email)

    // التحقق من وجود المستخدم وصحة كلمة المرور
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 })
    }

    // إنشاء كائن المستخدم بدون كلمة المرور للإرجاع
    const { password: _, ...userWithoutPassword } = user

    // في تطبيق حقيقي، ستقوم بإنشاء رمز JWT هنا
    return NextResponse.json({
      user: userWithoutPassword,
      token: "mock_jwt_token_" + user.id,
    })
  } catch (error) {
    console.error("خطأ في تسجيل الدخول:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء تسجيل الدخول" }, { status: 500 })
  }
}
