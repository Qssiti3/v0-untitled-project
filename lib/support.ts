// مكتبة للتعامل مع رسائل الدعم الفني

// إرسال رسالة دعم فني جديدة
export async function sendSupportMessage({
  userId,
  userName,
  userType,
  message,
}: {
  userId: string
  userName: string
  userType: string
  message: string
}) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // إنشاء رسالة جديدة
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: userId,
      senderName: userName,
      userType: userType,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
    }

    // الحصول على الرسائل الحالية من localStorage
    const messages = JSON.parse(localStorage.getItem("supportMessages") || "[]")

    // إضافة الرسالة الجديدة
    messages.push(newMessage)

    // حفظ الرسائل المحدثة
    localStorage.setItem("supportMessages", JSON.stringify(messages))

    // إضافة رد تلقائي بعد ثانيتين للمحاكاة
    setTimeout(() => {
      const autoReply = {
        id: `reply_${Date.now()}`,
        senderId: "system",
        senderName: "فريق الدعم",
        message: "شكرًا لتواصلك معنا. سيقوم أحد ممثلي خدمة العملاء بالرد عليك قريبًا.",
        timestamp: new Date().toISOString(),
        isRead: false,
      }

      const updatedMessages = JSON.parse(localStorage.getItem("supportMessages") || "[]")
      updatedMessages.push(autoReply)
      localStorage.setItem("supportMessages", JSON.stringify(updatedMessages))
    }, 2000)

    return newMessage
  } catch (error) {
    console.error("خطأ في إرسال رسالة الدعم:", error)
    throw error
  }
}

// الحصول على رسائل الدعم الفني للمستخدم
export async function getSupportMessages(userId: string) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 300))

    // الحصول على جميع الرسائل من localStorage
    const allMessages = JSON.parse(localStorage.getItem("supportMessages") || "[]")

    // تصفية الرسائل الخاصة بالمستخدم
    const userMessages = allMessages.filter(
      (msg: any) => msg.senderId === userId || (msg.senderId === "system" && msg.recipientId === userId),
    )

    return userMessages
  } catch (error) {
    console.error("خطأ في جلب رسائل الدعم:", error)
    throw error
  }
}

// الحصول على جميع رسائل الدعم الفني (للأدمن)
export async function getAllSupportMessages() {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // الحصول على جميع الرسائل من localStorage
    const allMessages = JSON.parse(localStorage.getItem("supportMessages") || "[]")

    // تجميع الرسائل حسب المستخدم
    const messagesByUser: Record<string, any[]> = {}

    allMessages.forEach((msg: any) => {
      if (msg.senderId !== "system") {
        if (!messagesByUser[msg.senderId]) {
          messagesByUser[msg.senderId] = []
        }
        messagesByUser[msg.senderId].push(msg)
      } else {
        if (msg.recipientId && !messagesByUser[msg.recipientId]) {
          messagesByUser[msg.recipientId] = []
        }
        if (msg.recipientId) {
          messagesByUser[msg.recipientId].push(msg)
        }
      }
    })

    // تحويل البيانات إلى مصفوفة
    const conversations = Object.keys(messagesByUser).map((userId) => {
      const userMessages = messagesByUser[userId]
      const lastMessage = userMessages[userMessages.length - 1]
      const unreadCount = userMessages.filter((msg) => !msg.isRead && msg.senderId !== "system").length

      return {
        userId,
        userName: userMessages[0].senderName,
        userType: userMessages[0].userType,
        lastMessage: lastMessage.message,
        lastMessageTime: lastMessage.timestamp,
        unreadCount,
        messages: userMessages,
      }
    })

    // ترتيب المحادثات حسب آخر رسالة
    conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())

    return conversations
  } catch (error) {
    console.error("خطأ في جلب جميع رسائل الدعم:", error)
    throw error
  }
}

// تحديث حالة قراءة الرسائل
export async function markMessagesAsRead(userId: string) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 300))

    // الحصول على جميع الرسائل من localStorage
    const allMessages = JSON.parse(localStorage.getItem("supportMessages") || "[]")

    // تحديث حالة قراءة الرسائل
    const updatedMessages = allMessages.map((msg: any) => {
      if (msg.senderId === userId) {
        return { ...msg, isRead: true }
      }
      return msg
    })

    // حفظ الرسائل المحدثة
    localStorage.setItem("supportMessages", JSON.stringify(updatedMessages))

    return { success: true }
  } catch (error) {
    console.error("خطأ في تحديث حالة قراءة الرسائل:", error)
    throw error
  }
}

// إرسال رد من الأدمن
export async function sendAdminReply({
  userId,
  message,
}: {
  userId: string
  message: string
}) {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // إنشاء رسالة جديدة
    const newMessage = {
      id: `admin_reply_${Date.now()}`,
      senderId: "system",
      senderName: "فريق الدعم",
      recipientId: userId,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
    }

    // الحصول على الرسائل الحالية من localStorage
    const messages = JSON.parse(localStorage.getItem("supportMessages") || "[]")

    // إضافة الرسالة الجديدة
    messages.push(newMessage)

    // حفظ الرسائل المحدثة
    localStorage.setItem("supportMessages", JSON.stringify(messages))

    return newMessage
  } catch (error) {
    console.error("خطأ في إرسال رد الأدمن:", error)
    throw error
  }
}
