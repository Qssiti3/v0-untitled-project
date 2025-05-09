// مكتبة للتعامل مع طلبات API باستخدام localStorage

// بيانات تجريبية للحلاقين
const MOCK_BARBERS = [
  {
    id: "barber_1001",
    uid: "B1001", // معرف مختصر للحلاق
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
      { id: "s4", name: "صبغة شعر", price: 120 },
      { id: "s5", name: "علاج الشعر", price: 150 },
    ],
    description: "حلاق محترف متخصص في قصات الشعر العصرية واللحى، خبرة أكثر من 5 سنوات في مجال الحلاقة الرجالية",
    isAvailable: true,
    profileImage: "/placeholder.svg?height=200&width=200&text=م",
    serviceZone: 5, // منطقة الخدمة بالكيلومترات
    serviceMode: "both", // نوع الخدمة: both, home_visits, shop_only
    shopAddress: "الرياض، حي النزهة، شارع الأمير سلطان",
    joinDate: "2023-01-15", // تاريخ الانضمام
    completedBookings: 128, // عدد الحجوزات المكتملة
  },
  {
    id: "barber_1002",
    uid: "B1002", // معرف مختصر للحلاق
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
      { id: "s4", name: "قص شعر أطفال", price: 40 },
    ],
    description: "حلاق ذو خبرة في قصات الشعر الكلاسيكية والحديثة، متخصص في العناية باللحية وتصفيف الشعر",
    isAvailable: true,
    profileImage: "/placeholder.svg?height=200&width=200&text=خ",
    serviceZone: 4, // منطقة الخدمة بالكيلومترات
    serviceMode: "home_visits", // نوع الخدمة: both, home_visits, shop_only
    shopAddress: "",
    joinDate: "2022-08-10", // تاريخ الانضمام
    completedBookings: 215, // عدد الحجوزات المكتملة
  },
  {
    id: "barber_1003",
    uid: "B1003", // معرف مختصر للحلاق
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
    description: "حلاق شاب متخصص في أحدث صيحات الموضة وقصات الشعر العصرية، أقدم خدمات متميزة بأسعار مناسبة",
    isAvailable: true,
    profileImage: "/placeholder.svg?height=200&width=200&text=ع",
    serviceZone: 6, // منطقة الخدمة بالكيلومترات
    serviceMode: "shop_only", // نوع الخدمة: both, home_visits, shop_only
    shopAddress: "الرياض، حي العليا، شارع التحلية",
    joinDate: "2024-02-20", // تاريخ الانضمام
    completedBookings: 42, // عدد الحجوزات المكتملة
  },
]

// بيانات تجريبية للعملاء
const MOCK_CUSTOMERS = [
  {
    id: "customer_2001",
    uid: "C2001", // معرف مختصر للعميل
    name: "أحمد محمد",
    email: "ahmed@example.com",
    phone: "0501234567",
    type: "customer",
    address: "الرياض، حي الملز، شارع الستين",
    location: { lat: 24.6917, lng: 46.7169 },
    profileImage: "/placeholder.svg?height=200&width=200&text=أ",
    joinDate: "2023-05-10", // تاريخ الانضمام
    completedBookings: 8, // عدد الحجوزات المكتملة
  },
  {
    id: "customer_2002",
    uid: "C2002", // معرف مختصر للعميل
    name: "سعود عبدالعزيز",
    email: "saud@example.com",
    phone: "0555555555",
    type: "customer",
    address: "الرياض، حي النزهة، شارع التخصصي",
    location: { lat: 24.7545, lng: 46.6823 },
    profileImage: "/placeholder.svg?height=200&width=200&text=س",
    joinDate: "2023-11-15", // تاريخ الانضمام
    completedBookings: 3, // عدد الحجوزات المكتملة
  },
]

// بيانات تجريبية للمواعيد
const MOCK_APPOINTMENTS = [
  {
    id: "appt_3001",
    customerId: "customer_2001",
    customerUid: "C2001", // معرف مختصر للعميل
    barberId: "barber_1001",
    barberUid: "B1001", // معرف مختصر للحلاق
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
    bookingCode: "BK3001", // رمز الحجز
  },
]

// تهيئة البيانات في localStorage إذا لم تكن موجودة
const initializeLocalStorage = () => {
  if (!localStorage.getItem("barbers")) {
    localStorage.setItem("barbers", JSON.stringify(MOCK_BARBERS))
  }
  if (!localStorage.getItem("customers")) {
    localStorage.setItem("customers", JSON.stringify(MOCK_CUSTOMERS))
  }
  if (!localStorage.getItem("appointments")) {
    localStorage.setItem("appointments", JSON.stringify(MOCK_APPOINTMENTS))
  }
}

// استدعاء دالة التهيئة
if (typeof window !== "undefined") {
  initializeLocalStorage()
}

// إنشاء معرف فريد للمستخدم
export function generateUniqueId(type: string) {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)

  if (type === "barber") {
    return `barber_${timestamp}${randomStr}`
  } else if (type === "customer") {
    return `customer_${timestamp}${randomStr}`
  } else if (type === "appointment") {
    return `appt_${timestamp}${randomStr}`
  }

  return `user_${timestamp}${randomStr}`
}

// إنشاء معرف مختصر للمستخدم
export function generateShortId(type: string) {
  // الحصول على آخر معرف مختصر من localStorage
  let lastId = 0

  if (type === "barber") {
    const barbers = JSON.parse(localStorage.getItem("barbers") || "[]")
    if (barbers.length > 0) {
      const lastBarber = barbers[barbers.length - 1]
      if (lastBarber.uid && lastBarber.uid.startsWith("B")) {
        lastId = Number.parseInt(lastBarber.uid.substring(1)) || 0
      }
    }
    return `B${(lastId + 1).toString().padStart(4, "0")}`
  } else if (type === "customer") {
    const customers = JSON.parse(localStorage.getItem("customers") || "[]")
    if (customers.length > 0) {
      const lastCustomer = customers[customers.length - 1]
      if (lastCustomer.uid && lastCustomer.uid.startsWith("C")) {
        lastId = Number.parseInt(lastCustomer.uid.substring(1)) || 0
      }
    }
    return `C${(lastId + 1).toString().padStart(4, "0")}`
  } else if (type === "booking") {
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")
    if (appointments.length > 0) {
      const lastAppointment = appointments[appointments.length - 1]
      if (lastAppointment.bookingCode && lastAppointment.bookingCode.startsWith("BK")) {
        lastId = Number.parseInt(lastAppointment.bookingCode.substring(2)) || 0
      }
    }
    return `BK${(lastId + 1).toString().padStart(4, "0")}`
  }

  return `U${(lastId + 1).toString().padStart(4, "0")}`
}

// الحصول على الحلاقين القريبين
export async function getNearbyBarbers(lat: number, lng: number, maxDistance = 10) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على الحلاقين من localStorage
    const barbers = JSON.parse(localStorage.getItem("barbers") || "[]")

    console.log("عدد الحلاقين المتاحين:", barbers.length)

    // تصفية الحلاقين الذين لديهم موقع محدد
    const barbersWithLocation = barbers.filter(
      (barber: any) =>
        barber.location && typeof barber.location.lat === "number" && typeof barber.location.lng === "number",
    )

    console.log("عدد الحلاقين بموقع محدد:", barbersWithLocation.length)

    // حساب المسافة لكل حلاق
    const barbersWithDistance = barbersWithLocation.map((barber: any) => {
      const distance = calculateDistance(lat, lng, barber.location.lat, barber.location.lng)
      return {
        ...barber,
        distance: Number.parseFloat(distance.toFixed(1)),
      }
    })

    // تصفية الحلاقين حسب المسافة القصوى
    const nearbyBarbers = barbersWithDistance.filter((barber: any) => {
      // تحقق مما إذا كان العميل ضمن منطقة خدمة الحلاق
      const withinDistance = barber.distance <= maxDistance
      const withinServiceZone = barber.serviceZone ? barber.distance <= barber.serviceZone : true

      return withinDistance && withinServiceZone
    })

    console.log("عدد الحلاقين القريبين:", nearbyBarbers.length)
    console.log("الحلاقين القريبين:", nearbyBarbers)

    return { barbers: nearbyBarbers }
  } catch (error) {
    console.error("خطأ في جلب بيانات الحلاقين:", error)
    throw error
  }
}

// الحصول على تفاصيل حلاق معين
export const getBarberDetails = async (barberId: string) => {
  try {
    console.log(`جلب تفاصيل الحلاق: ${barberId}`)

    // في تطبيق حقيقي، ستقوم بجلب البيانات من قاعدة البيانات
    // هنا نستخدم بيانات تجريبية من localStorage

    const barbers = JSON.parse(localStorage.getItem("barbers") || "[]")
    const barber = barbers.find((b: any) => b.id === barberId)

    if (!barber) {
      console.error(`لم يتم العثور على الحلاق: ${barberId}`)
      throw new Error("لم يتم العثور على الحلاق")
    }

    // التأكد من وجود أوقات متاحة
    if (!barber.availability || barber.availability.length === 0) {
      console.log("لا توجد أوقات متاحة للحلاق، إضافة أوقات افتراضية")
      barber.availability = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]
    }

    // التأكد من وجود خدمات
    if (!barber.services || barber.services.length === 0) {
      console.log("لا توجد خدمات للحلاق، إضافة خدمات افتراضية")
      barber.services = [
        { id: "s1", name: "قص شعر", price: 50 },
        { id: "s2", name: "حلاقة لحية", price: 30 },
      ]
    }

    console.log("تفاصيل الحلاق:", barber)

    return barber
  } catch (error) {
    console.error("خطأ في جلب تفاصيل الحلاق:", error)
    throw error
  }
}

// الحصول على تفاصيل عميل معين
export async function getCustomerDetails(customerId: string, userType?: string) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على العملاء من localStorage
    const customers = JSON.parse(localStorage.getItem("customers") || "[]")

    // البحث عن العميل المطلوب
    const customer = customers.find((c: any) => c.id === customerId)

    if (!customer) {
      throw new Error("لم يتم العثور على العميل")
    }

    // إذا كان المستخدم ليس حلاقاً، قم بإخفاء بعض المعلومات الحساسة
    if (userType && userType !== "barber") {
      // إنشاء نسخة من العميل مع إخفاء بعض المعلومات
      const filteredCustomer = { ...customer }
      // يمكن إضافة المزيد من الحقول التي يجب إخفاؤها هنا
      return filteredCustomer
    }

    return customer
  } catch (error) {
    console.error("خطأ في جلب بيانات العميل:", error)
    throw error
  }
}

// الحصول على مواعيد المستخدم
export async function getUserAppointments(userId: string, userType: string) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على المواعيد من localStorage
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")

    // تصفية المواعيد حسب نوع المستخدم ومعرفه
    let userAppointments = []

    if (userType === "customer") {
      userAppointments = appointments.filter((appointment: any) => appointment.customerId === userId)
    } else if (userType === "barber") {
      userAppointments = appointments.filter((appointment: any) => appointment.barberId === userId)
    }

    return { appointments: userAppointments }
  } catch (error) {
    console.error("خطأ في جلب بيانات المواعيد:", error)
    throw error
  }
}

// الحصول على طلبات الحجز للحلاق
export async function getBarberRequests(barberId: string) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على المواعيد من localStorage
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")

    // تصفية المواعيد حسب معرف الحلاق وحالة الطلب
    const requests = appointments.filter(
      (appointment: any) => appointment.barberId === barberId && appointment.status === "pending",
    )

    return { appointments: requests }
  } catch (error) {
    console.error("خطأ في جلب بيانات الطلبات:", error)
    throw error
  }
}

// الحصول على تفاصيل موعد معين
export async function getAppointmentDetails(appointmentId: string) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على المواعيد من localStorage
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")

    // البحث عن الموعد المطلوب
    const appointment = appointments.find((appt: any) => appt.id === appointmentId)

    if (!appointment) {
      console.error(`لم يتم العثور على الموعد: ${appointmentId}`)
      throw new Error("لم يتم العثور على الموعد")
    }

    console.log("تفاصيل الموعد:", appointment)
    return appointment
  } catch (error) {
    console.error("خطأ في جلب تفاصيل الموعد:", error)
    throw error
  }
}

// إنشاء موعد جديد
export async function createAppointment(appointmentData: any) {
  try {
    console.log("بيانات الموعد المستلمة:", appointmentData)

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على المواعيد الحالية من localStorage
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")

    // إنشاء معرف فريد للموعد الجديد
    const newAppointmentId = generateUniqueId("appointment")
    const bookingCode = generateShortId("booking")

    // التأكد من وجود جميع البيانات المطلوبة
    if (!appointmentData.barberId || !appointmentData.customerId || !appointmentData.date || !appointmentData.time) {
      throw new Error("بيانات الموعد غير مكتملة")
    }

    // إنشاء الموعد الجديد
    const newAppointment = {
      id: newAppointmentId,
      bookingCode,
      ...appointmentData,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    console.log("الموعد الجديد:", newAppointment)

    // إضافة الموعد الجديد إلى المصفوفة
    appointments.push(newAppointment)

    // حفظ المواعيد المحدثة في localStorage
    localStorage.setItem("appointments", JSON.stringify(appointments))

    return { message: "تم إنشاء الموعد بنجاح", appointment: newAppointment }
  } catch (error) {
    console.error("خطأ في إنشاء الموعد:", error)
    throw error
  }
}

// Add the updateAppointment function to the lib/api.ts file

// Add this function after the createAppointment function
export async function updateAppointment(appointmentId: string, appointmentData: any) {
  try {
    console.log("بيانات الموعد المحدثة:", appointmentData)

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على المواعيد الحالية من localStorage
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")

    // البحث عن الموعد المطلوب
    const appointmentIndex = appointments.findIndex((appointment: any) => appointment.id === appointmentId)

    if (appointmentIndex === -1) {
      throw new Error("لم يتم العثور على الموعد")
    }

    // التحقق من حالة الموعد - لا يمكن تعديل الموعد إلا إذا كان في حالة الانتظار
    if (appointments[appointmentIndex].status !== "pending") {
      throw new Error("لا يمكن تعديل هذا الموعد لأنه تم تأكيده أو إلغاؤه بالفعل")
    }

    // تحديث بيانات الموعد
    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      ...appointmentData,
      updatedAt: new Date().toISOString(),
    }

    // حفظ المواعيد المحدثة في localStorage
    localStorage.setItem("appointments", JSON.stringify(appointments))

    return { message: "تم تحديث الموعد بنجاح", appointment: appointments[appointmentIndex] }
  } catch (error) {
    console.error("خطأ في تحديث الموعد:", error)
    throw error
  }
}

// تحديث حالة الموعد
export async function updateAppointmentStatus(appointmentId: string, status: string) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على المواعيد الحالية من localStorage
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")

    // البحث عن الموعد المطلوب
    const appointmentIndex = appointments.findIndex((appointment: any) => appointment.id === appointmentId)

    if (appointmentIndex === -1) {
      throw new Error("لم يتم العثور على الموعد")
    }

    // تحديث حالة الموعد
    appointments[appointmentIndex].status = status

    // حفظ المواعيد المحدثة في localStorage
    localStorage.setItem("appointments", JSON.stringify(appointments))

    return { message: "تم تحديث حالة الموعد بنجاح", appointment: appointments[appointmentIndex] }
  } catch (error) {
    console.error("خطأ في تحديث حالة الموعد:", error)
    throw error
  }
}

// إلغاء موعد
export async function cancelAppointment(appointmentId: string) {
  return updateAppointmentStatus(appointmentId, "cancelled")
}

// تحديث الملف الشخصي للحلاق
export async function updateBarberProfile(profileData: any) {
  try {
    console.log("بيانات الملف الشخصي المستلمة:", profileData)

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على الحلاقين الحاليين من localStorage
    const barbers = JSON.parse(localStorage.getItem("barbers") || "[]")

    // البحث عن الحلاق المطلوب
    const barberIndex = barbers.findIndex((barber: any) => barber.id === profileData.id)

    if (barberIndex === -1) {
      // إذا لم يتم العثور على الحلاق، أضف حلاق جديد
      const newBarber = {
        id: profileData.id || generateUniqueId("barber"),
        uid: generateShortId("barber"),
        ...profileData,
        joinDate: new Date().toISOString().split("T")[0],
        completedBookings: 0,
        isAvailable: true,
      }
      barbers.push(newBarber)
      console.log("تم إضافة حلاق جديد:", newBarber)
    } else {
      // تحديث بيانات الحلاق الموجود
      barbers[barberIndex] = {
        ...barbers[barberIndex],
        ...profileData,
        isAvailable: true,
      }
      console.log("تم تحديث بيانات الحلاق:", barbers[barberIndex])
    }

    // حفظ الحلاقين المحدثين في localStorage
    localStorage.setItem("barbers", JSON.stringify(barbers))

    // تحديث المستخدم الحالي في localStorage إذا كان هو نفس الحلاق
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
    if (currentUser && currentUser.id === profileData.id) {
      const updatedUser = { ...currentUser, ...profileData }
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }

    return { message: "تم تحديث الملف الشخصي بنجاح" }
  } catch (error) {
    console.error("خطأ في تحديث الملف الشخصي:", error)
    throw error
  }
}

// تحديث الملف الشخصي للعميل
export async function updateCustomerProfile(profileData: any) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على العملاء الحاليين من localStorage
    const customers = JSON.parse(localStorage.getItem("customers") || "[]")

    // البحث عن العميل المطلوب
    const customerIndex = customers.findIndex((customer: any) => customer.id === profileData.id)

    if (customerIndex === -1) {
      // إذا لم يتم العثور على العميل، أضف عميل جديد
      const newCustomer = {
        id: generateUniqueId("customer"),
        uid: generateShortId("customer"),
        type: "customer",
        ...profileData,
        joinDate: new Date().toISOString().split("T")[0],
        completedBookings: 0,
      }
      customers.push(newCustomer)
    } else {
      // تحديث بيانات العميل الموجود
      customers[customerIndex] = {
        ...customers[customerIndex],
        ...profileData,
      }
    }

    // حفظ العملاء المحدثين في localStorage
    localStorage.setItem("customers", JSON.stringify(customers))

    return { message: "تم تحديث الملف الشخصي بنجاح" }
  } catch (error) {
    console.error("خطأ في تحديث الملف الشخصي:", error)
    throw error
  }
}

// تحديث موقع الحلاق
export async function updateBarberLocation(
  barberId: string,
  location: { lat: number; lng: number },
  serviceZone = 5,
  serviceMode = "shop_only",
  shopAddress = "",
  shopLocation: { lat: number; lng: number } | null = null,
  currentUserId?: string,
) {
  try {
    console.log("تحديث موقع الحلاق:", barberId, location, serviceZone, serviceMode, shopAddress, shopLocation)

    // تعزيز التحقق من أن المستخدم يقوم بتعديل موقعه الخاص فقط
    if (!currentUserId || currentUserId !== barberId) {
      throw new Error("غير مسموح لك بتعديل موقع حلاق آخر")
    }

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على الحلاقين الحاليين من localStorage
    const barbers = JSON.parse(localStorage.getItem("barbers") || "[]")

    // البحث عن الحلاق المطلوب
    let barberIndex = barbers.findIndex((barber: any) => barber.id === barberId)

    // الحصول على بيانات المستخدم الحالي من localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

    // إذا لم يتم العثور على الحلاق، أضف حلاق جديد
    if (barberIndex === -1) {
      console.log("إنشاء حلاق جديد بمعرف:", barberId)

      // استخدام بيانات المستخدم الحالي إذا كانت متوفرة
      const newBarber = {
        id: barberId,
        uid: generateShortId("barber"),
        name: currentUser.name || "حلاق جديد",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        experience: currentUser.experience || 0,
        rating: 0,
        reviews: 0,
        availability: [],
        services: [],
        description: currentUser.description || "",
        isAvailable: true,
        profileImage: currentUser.profileImage || "/placeholder.svg?height=200&width=200&text=ح",
        joinDate: new Date().toISOString().split("T")[0],
        completedBookings: 0,
        serviceZone: 5,
        serviceMode: "shop_only",
      }
      barbers.push(newBarber)
      barberIndex = barbers.length - 1
    }

    // تحديث موقع الحلاق ومنطقة الخدمة
    barbers[barberIndex].location = location
    barbers[barberIndex].serviceZone = serviceZone
    barbers[barberIndex].serviceMode = serviceMode
    barbers[barberIndex].shopAddress = shopAddress
    barbers[barberIndex].isAvailable = true // تأكد من أن الحلاق متاح

    // تحديث موقع المحل إذا كان موجوداً
    if (shopLocation) {
      barbers[barberIndex].shopLocation = shopLocation
    } else {
      // إذا لم يتم تحديد موقع المحل، استخدم موقع الحلاق
      barbers[barberIndex].shopLocation = location
    }

    console.log("تم تحديث بيانات الحلاق:", barbers[barberIndex])

    // حفظ الحلاقين المحدثين في localStorage
    localStorage.setItem("barbers", JSON.stringify(barbers))

    // تحديث المستخدم الحالي في localStorage إذا كان هو نفس الحلاق
    if (currentUser && currentUser.id === barberId) {
      currentUser.location = location
      currentUser.serviceZone = serviceZone
      currentUser.serviceMode = serviceMode
      currentUser.shopAddress = shopAddress
      currentUser.isAvailable = true
      if (shopLocation) {
        currentUser.shopLocation = shopLocation
      } else {
        currentUser.shopLocation = location
      }
      localStorage.setItem("currentUser", JSON.stringify(currentUser))
    }

    return { message: "تم تحديث الموقع بنجاح" }
  } catch (error) {
    console.error("خطأ في تحديث الموقع:", error)
    throw error
  }
}

// إضافة دالة جديدة لحذف موقع الحلاق
export async function deleteBarberLocation(barberId: string, currentUserId?: string) {
  try {
    // تعزيز التحقق من أن المستخدم يقوم بحذف موقعه الخاص فقط
    if (!currentUserId || currentUserId !== barberId) {
      throw new Error("غير مسموح لك بحذف موقع حلاق آخر")
    }

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على الحلاقين الحاليين من localStorage
    const barbers = JSON.parse(localStorage.getItem("barbers") || "[]")

    // البحث عن الحلاق المطلوب
    const barberIndex = barbers.findIndex((barber: any) => barber.id === barberId)

    if (barberIndex === -1) {
      throw new Error("لم يتم العثور على الحلاق")
    }

    // حذف معلومات الموقع
    barbers[barberIndex].location = null
    barbers[barberIndex].shopLocation = null
    barbers[barberIndex].serviceZone = 0
    barbers[barberIndex].isAvailable = false

    // حفظ الحلاقين المحدثين في localStorage
    localStorage.setItem("barbers", JSON.stringify(barbers))

    // تحديث المستخدم الحالي في localStorage إذا كان هو نفس الحلاق
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
    if (currentUser && currentUser.id === barberId) {
      currentUser.location = null
      currentUser.shopLocation = null
      currentUser.serviceZone = 0
      currentUser.isAvailable = false
      localStorage.setItem("currentUser", JSON.stringify(currentUser))
    }

    return { message: "تم حذف الموقع بنجاح" }
  } catch (error) {
    console.error("خطأ في حذف الموقع:", error)
    throw error
  }
}

// رفع صورة الملف الشخصي
export async function uploadProfileImage(file: File) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // إنشاء عنوان URL وهمي للصورة
    const imageUrl = `/placeholder.svg?height=200&width=200&text=${file.name.substring(0, 1)}`

    return imageUrl
  } catch (error) {
    console.error("خطأ في رفع الصورة:", error)
    throw error
  }
}

// تتبع موقع الحلاق أثناء التوجه للعميل
export async function trackBarberLocation(appointmentId: string, location: { lat: number; lng: number }) {
  try {
    console.log("تحديث موقع الحلاق:", appointmentId, location)

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 300))

    // الحصول على بيانات التتبع الحالية من localStorage
    const trackingData = JSON.parse(localStorage.getItem("tracking") || "{}")

    // تحديث موقع الحلاق للموعد المحدد
    trackingData[appointmentId] = {
      location,
      timestamp: new Date().toISOString(),
    }

    // حفظ بيانات التتبع المحدثة في localStorage
    localStorage.setItem("tracking", JSON.stringify(trackingData))

    console.log("تم تحديث موقع الحلاق بنجاح")
    return { message: "تم تحديث موقع الحلاق بنجاح" }
  } catch (error) {
    console.error("خطأ في تحديث موقع الحلاق:", error)
    throw error
  }
}

// الحصول على موقع الحلاق أثناء التوجه للعميل
export async function getBarberTrackingLocation(appointmentId: string) {
  try {
    console.log("جلب موقع الحلاق للموعد:", appointmentId)

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 300))

    // الحصول على بيانات التتبع من localStorage
    const trackingData = JSON.parse(localStorage.getItem("tracking") || "{}")

    // التحقق من وجود بيانات تتبع للموعد المحدد
    if (!trackingData[appointmentId]) {
      console.log("لا توجد بيانات تتبع للموعد:", appointmentId)
      return { tracking: null }
    }

    console.log("تم جلب بيانات التتبع:", trackingData[appointmentId])
    return { tracking: trackingData[appointmentId] }
  } catch (error) {
    console.error("خطأ في جلب موقع الحلاق:", error)
    throw error
  }
}

// دالة مساعدة لحساب المسافة بين نقطتين (صيغة هافرساين)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // نصف قطر الأرض بالكيلومتر
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // المسافة بالكيلومتر
  return distance
}

// إضافة هذه الدالة إلى ملف lib/api.ts

// تقييم الحلاق بعد إكمال الموعد
export async function rateBarber(appointmentId: string, rating: number, feedback = "") {
  try {
    console.log(`تقييم الموعد: ${appointmentId} بتقييم: ${rating}`)

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على المواعيد من localStorage
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")

    // البحث عن الموعد المطلوب
    const appointmentIndex = appointments.findIndex((app: any) => app.id === appointmentId)

    if (appointmentIndex === -1) {
      throw new Error("لم يتم العثور على الموعد")
    }

    // التحقق من أن الموعد مكتمل
    if (appointments[appointmentIndex].status !== "completed") {
      throw new Error("لا يمكن تقييم موعد غير مكتمل")
    }

    // تحديث التقييم للموعد
    appointments[appointmentIndex].rating = rating
    appointments[appointmentIndex].feedback = feedback
    appointments[appointmentIndex].ratedAt = new Date().toISOString()

    // حفظ المواعيد المحدثة في localStorage
    localStorage.setItem("appointments", JSON.stringify(appointments))

    // تحديث متوسط تقييم الحلاق
    const barberId = appointments[appointmentIndex].barberId
    updateBarberRating(barberId)

    return { message: "تم تقييم الموعد بنجاح" }
  } catch (error) {
    console.error("خطأ في تقييم الموعد:", error)
    throw error
  }
}

// تحديث متوسط تقييم الحلاق
function updateBarberRating(barberId: string) {
  try {
    // الحصول على المواعيد من localStorage
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")

    // الحصول على جميع المواعيد المكتملة للحلاق التي تم تقييمها
    const barberRatedAppointments = appointments.filter(
      (app: any) => app.barberId === barberId && app.status === "completed" && app.rating,
    )

    // حساب متوسط التقييم
    let totalRating = 0
    barberRatedAppointments.forEach((app: any) => {
      totalRating += app.rating
    })

    const averageRating = barberRatedAppointments.length > 0 ? totalRating / barberRatedAppointments.length : 0

    // تحديث تقييم الحلاق في localStorage
    const barbers = JSON.parse(localStorage.getItem("barbers") || "[]")
    const barberIndex = barbers.findIndex((barber: any) => barber.id === barberId)

    if (barberIndex !== -1) {
      barbers[barberIndex].rating = averageRating
      barbers[barberIndex].reviews = barberRatedAppointments.length
      localStorage.setItem("barbers", JSON.stringify(barbers))
    }

    // تحديث تقييم الحلاق في قائمة المستخدمين
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const userIndex = users.findIndex((user: any) => user.id === barberId)

    if (userIndex !== -1) {
      users[userIndex].rating = averageRating
      users[userIndex].reviews = barberRatedAppointments.length
      localStorage.setItem("users", JSON.stringify(users))
    }

    console.log(`تم تحديث تقييم الحلاق ${barberId} إلى ${averageRating}`)
  } catch (error) {
    console.error("خطأ في تحديث تقييم الحلاق:", error)
  }
}
