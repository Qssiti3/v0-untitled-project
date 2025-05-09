// مكتبة للتعامل مع المحادثات والرسائل

// بيانات تجريبية للمحادثات
const MOCK_CONVERSATIONS = [
  {
    id: "conv_1001",
    participants: ["barber_1001", "customer_2001"],
    lastMessage: {
      text: "متى ستصل؟",
      senderId: "customer_2001",
      timestamp: "2025-05-10T14:30:00Z",
    },
    unreadCount: 1,
    createdAt: "2025-05-10T10:30:00Z",
  },
  {
    id: "conv_1002",
    participants: ["barber_1002", "customer_2001"],
    lastMessage: {
      text: "شكراً لك، سأكون في انتظارك",
      senderId: "barber_1002",
      timestamp: "2025-05-09T16:45:00Z",
    },
    unreadCount: 0,
    createdAt: "2025-05-09T15:20:00Z",
  },
]

// بيانات تجريبية للرسائل
const MOCK_MESSAGES = {
  conv_1001: [
    {
      id: "msg_2001",
      conversationId: "conv_1001",
      senderId: "barber_1001",
      text: "مرحباً، تم تأكيد موعدك ليوم الخميس الساعة 4:30 مساءً",
      timestamp: "2025-05-10T10:30:00Z",
      read: true,
    },
    {
      id: "msg_2002",
      conversationId: "conv_1001",
      senderId: "customer_2001",
      text: "شكراً لك، هل ستأتي إلى المنزل أم أحضر إلى المحل؟",
      timestamp: "2025-05-10T10:35:00Z",
      read: true,
    },
    {
      id: "msg_2003",
      conversationId: "conv_1001",
      senderId: "barber_1001",
      text: "سآتي إلى منزلك كما هو متفق عليه في الحجز",
      timestamp: "2025-05-10T10:40:00Z",
      read: true,
    },
    {
      id: "msg_2004",
      conversationId: "conv_1001",
      senderId: "customer_2001",
      text: "متى ستصل؟",
      timestamp: "2025-05-10T14:30:00Z",
      read: false,
    },
  ],
  conv_1002: [
    {
      id: "msg_3001",
      conversationId: "conv_1002",
      senderId: "customer_2001",
      text: "هل يمكنني حجز موعد ليوم السبت؟",
      timestamp: "2025-05-09T15:20:00Z",
      read: true,
    },
    {
      id: "msg_3002",
      conversationId: "conv_1002",
      senderId: "barber_1002",
      text: "نعم، لدي مواعيد متاحة يوم السبت. ما هو الوقت المناسب لك؟",
      timestamp: "2025-05-09T15:25:00Z",
      read: true,
    },
    {
      id: "msg_3003",
      conversationId: "conv_1002",
      senderId: "customer_2001",
      text: "الساعة 11 صباحاً إن أمكن",
      timestamp: "2025-05-09T15:30:00Z",
      read: true,
    },
    {
      id: "msg_3004",
      conversationId: "conv_1002",
      senderId: "barber_1002",
      text: "تم حجز الموعد. سأكون عندك الساعة 11 صباحاً يوم السبت",
      timestamp: "2025-05-09T15:35:00Z",
      read: true,
    },
    {
      id: "msg_3005",
      conversationId: "conv_1002",
      senderId: "customer_2001",
      text: "ممتاز، شكراً لك",
      timestamp: "2025-05-09T15:40:00Z",
      read: true,
    },
    {
      id: "msg_3006",
      conversationId: "conv_1002",
      senderId: "barber_1002",
      text: "شكراً لك، سأكون في انتظارك",
      timestamp: "2025-05-09T16:45:00Z",
      read: true,
    },
  ],
}

// تهيئة البيانات في localStorage إذا لم تكن موجودة
const initializeLocalStorage = () => {
  if (!localStorage.getItem("conversations")) {
    localStorage.setItem("conversations", JSON.stringify(MOCK_CONVERSATIONS))
  }
  if (!localStorage.getItem("messages")) {
    localStorage.setItem("messages", JSON.stringify(MOCK_MESSAGES))
  }
}

// استدعاء دالة التهيئة
if (typeof window !== "undefined") {
  initializeLocalStorage()
}

// إنشاء معرف فريد للمحادثة
function generateConversationId() {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `conv_${timestamp}${randomStr}`
}

// إنشاء معرف فريد للرسالة
function generateMessageId() {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `msg_${timestamp}${randomStr}`
}

// الحصول على محادثات المستخدم
export async function getUserConversations(userId: string) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على المحادثات من localStorage
    const conversations = JSON.parse(localStorage.getItem("conversations") || "[]")

    // تصفية المحادثات التي يشارك فيها المستخدم
    const userConversations = conversations.filter((conversation: any) => conversation.participants.includes(userId))

    // ترتيب المحادثات حسب آخر رسالة
    userConversations.sort((a: any, b: any) => {
      const timestampA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0
      const timestampB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0
      return timestampB - timestampA
    })

    // حساب عدد الرسائل غير المقروءة لكل محادثة
    const messages = JSON.parse(localStorage.getItem("messages") || "{}")
    userConversations.forEach((conversation: any) => {
      const conversationMessages = messages[conversation.id] || []
      conversation.unreadCount = conversationMessages.filter(
        (message: any) => message.senderId !== userId && !message.read,
      ).length
    })

    return { conversations: userConversations }
  } catch (error) {
    console.error("خطأ في جلب محادثات المستخدم:", error)
    throw error
  }
}

// الحصول على رسائل محادثة معينة
export async function getConversationMessages(conversationId: string) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على الرسائل من localStorage
    const messages = JSON.parse(localStorage.getItem("messages") || "{}")

    // الحصول على رسائل المحادثة المطلوبة
    const conversationMessages = messages[conversationId] || []

    // ترتيب الرسائل حسب التاريخ
    conversationMessages.sort((a: any, b: any) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    })

    return { messages: conversationMessages }
  } catch (error) {
    console.error("خطأ في جلب رسائل المحادثة:", error)
    throw error
  }
}

// إرسال رسالة جديدة
export async function sendMessage(conversationId: string, senderId: string, text: string) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على الرسائل والمحادثات من localStorage
    const messages = JSON.parse(localStorage.getItem("messages") || "{}")
    const conversations = JSON.parse(localStorage.getItem("conversations") || "[]")

    // إنشاء رسالة جديدة
    const newMessage = {
      id: generateMessageId(),
      conversationId,
      senderId,
      text,
      timestamp: new Date().toISOString(),
      read: false,
    }

    // إضافة الرسالة الجديدة إلى المحادثة
    if (!messages[conversationId]) {
      messages[conversationId] = []
    }
    messages[conversationId].push(newMessage)

    // تحديث آخر رسالة في المحادثة
    const conversationIndex = conversations.findIndex((conv: any) => conv.id === conversationId)
    if (conversationIndex !== -1) {
      conversations[conversationIndex].lastMessage = {
        text,
        senderId,
        timestamp: newMessage.timestamp,
      }
    }

    // حفظ التغييرات في localStorage
    localStorage.setItem("messages", JSON.stringify(messages))
    localStorage.setItem("conversations", JSON.stringify(conversations))

    return { message: newMessage }
  } catch (error) {
    console.error("خطأ في إرسال الرسالة:", error)
    throw error
  }
}

// تحديث حالة قراءة الرسائل
export async function markMessagesAsRead(conversationId: string, userId: string) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 300))

    // الحصول على الرسائل من localStorage
    const messages = JSON.parse(localStorage.getItem("messages") || "{}")

    // التحقق من وجود رسائل للمحادثة
    if (!messages[conversationId]) {
      return { success: true }
    }

    // تحديث حالة قراءة الرسائل
    messages[conversationId] = messages[conversationId].map((message: any) => {
      if (message.senderId !== userId && !message.read) {
        return { ...message, read: true }
      }
      return message
    })

    // حفظ التغييرات في localStorage
    localStorage.setItem("messages", JSON.stringify(messages))

    return { success: true }
  } catch (error) {
    console.error("خطأ في تحديث حالة قراءة الرسائل:", error)
    throw error
  }
}

// الحصول على معلومات المستخدم
export async function getUserInfo(userId: string) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 300))

    // الحصول على بيانات المستخدمين من localStorage
    const barbers = JSON.parse(localStorage.getItem("barbers") || "[]")
    const customers = JSON.parse(localStorage.getItem("customers") || "[]")

    // البحث عن المستخدم في قائمة الحلاقين
    let user = barbers.find((barber: any) => barber.id === userId)
    if (user) {
      return {
        id: user.id,
        name: user.name,
        type: "barber",
        profileImage: user.profileImage || "/placeholder.svg?height=200&width=200&text=ح",
        phone: user.phone,
      }
    }

    // البحث عن المستخدم في قائمة العملاء
    user = customers.find((customer: any) => customer.id === userId)
    if (user) {
      return {
        id: user.id,
        name: user.name,
        type: "customer",
        profileImage: user.profileImage || "/placeholder.svg?height=200&width=200&text=ع",
        phone: user.phone,
      }
    }

    // إذا لم يتم العثور على المستخدم
    return {
      id: userId,
      name: "مستخدم غير معروف",
      type: "unknown",
      profileImage: "/placeholder.svg?height=200&width=200&text=؟",
      phone: "",
    }
  } catch (error) {
    console.error("خطأ في جلب معلومات المستخدم:", error)
    throw error
  }
}

// إنشاء محادثة جديدة
export async function createConversation(senderId: string, receiverId: string, initialMessage: string) {
  try {
    console.log("إنشاء محادثة جديدة بين:", senderId, receiverId)

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 300))

    // الحصول على المحادثات من localStorage
    const conversations = JSON.parse(localStorage.getItem("conversations") || "[]")

    // التحقق مما إذا كانت هناك محادثة موجودة بالفعل بين المستخدمين
    const existingConversation = conversations.find(
      (conv: any) => conv.participants.includes(senderId) && conv.participants.includes(receiverId),
    )

    if (existingConversation) {
      console.log("تم العثور على محادثة موجودة:", existingConversation.id)

      // إرسال الرسالة الأولية في المحادثة الموجودة
      await sendMessage(existingConversation.id, senderId, initialMessage)

      // تحديث عدد الرسائل غير المقروءة للمستقبل
      existingConversation.unreadCount = (existingConversation.unreadCount || 0) + 1
      localStorage.setItem("conversations", JSON.stringify(conversations))

      return {
        conversationId: existingConversation.id,
        isNew: false,
      }
    }

    // إنشاء محادثة جديدة
    const newConversationId = generateConversationId()
    const timestamp = new Date().toISOString()

    const newConversation = {
      id: newConversationId,
      participants: [senderId, receiverId],
      lastMessage: {
        text: initialMessage,
        senderId,
        timestamp,
      },
      unreadCount: 1,
      createdAt: timestamp,
    }

    // إضافة المحادثة الجديدة
    conversations.push(newConversation)
    localStorage.setItem("conversations", JSON.stringify(conversations))

    // إنشاء الرسالة الأولى في المحادثة
    const messages = JSON.parse(localStorage.getItem("messages") || "{}")
    const newMessage = {
      id: generateMessageId(),
      conversationId: newConversationId,
      senderId,
      text: initialMessage,
      timestamp,
      read: false,
    }

    messages[newConversationId] = [newMessage]
    localStorage.setItem("messages", JSON.stringify(messages))

    console.log("تم إنشاء محادثة جديدة:", newConversationId)

    return {
      conversationId: newConversationId,
      isNew: true,
    }
  } catch (error) {
    console.error("خطأ في إنشاء محادثة جديدة:", error)
    throw error
  }
}
