"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Save, Lock, Bell, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [profileData, setProfileData] = useState({
    name: user?.name || "مدير النظام",
    email: user?.email || "Qssiti",
    phone: user?.phone || "0500000000",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    newUsers: true,
    newAppointments: true,
    cancelledAppointments: true,
    systemAlerts: true,
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: "30",
  })

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // في تطبيق حقيقي، سنرسل البيانات إلى الخادم
    toast({
      title: "تم تحديث الملف الشخصي",
      description: "تم تحديث بيانات الملف الشخصي بنجاح",
    })
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: "كلمة المرور الجديدة وتأكيدها غير متطابقين",
        variant: "destructive",
      })
      return
    }

    // في تطبيق حقيقي، سنتحقق من كلمة المرور الحالية ونحدث كلمة المرور الجديدة
    toast({
      title: "تم تغيير كلمة المرور",
      description: "تم تغيير كلمة المرور بنجاح",
    })

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // في تطبيق حقيقي، سنرسل البيانات إلى الخادم
    toast({
      title: "تم تحديث إعدادات الإشعارات",
      description: "تم تحديث إعدادات الإشعارات بنجاح",
    })
  }

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // في تطبيق حقيقي، سنرسل البيانات إلى الخادم
    toast({
      title: "تم تحديث إعدادات الأمان",
      description: "تم تحديث إعدادات الأمان بنجاح",
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">الإعدادات</h2>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="password">كلمة المرور</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>الملف الشخصي</CardTitle>
              <CardDescription>قم بتعديل معلومات الملف الشخصي الخاص بك</CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">اسم المستخدم</Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  حفظ التغييرات
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>تغيير كلمة المرور</CardTitle>
              <CardDescription>قم بتغيير كلمة المرور الخاصة بك</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
                {passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>كلمة المرور الجديدة وتأكيدها غير متطابقين</span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="gap-2">
                  <Lock className="h-4 w-4" />
                  تغيير كلمة المرور
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
              <CardDescription>تخصيص إعدادات الإشعارات</CardDescription>
            </CardHeader>
            <form onSubmit={handleNotificationSubmit}>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="new-users">مستخدمين جدد</Label>
                    <p className="text-sm text-muted-foreground">تلقي إشعارات عند تسجيل مستخدمين جدد</p>
                  </div>
                  <Switch
                    id="new-users"
                    checked={notificationSettings.newUsers}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, newUsers: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="new-appointments">مواعيد جديدة</Label>
                    <p className="text-sm text-muted-foreground">تلقي إشعارات عند إنشاء مواعيد جديدة</p>
                  </div>
                  <Switch
                    id="new-appointments"
                    checked={notificationSettings.newAppointments}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, newAppointments: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cancelled-appointments">مواعيد ملغاة</Label>
                    <p className="text-sm text-muted-foreground">تلقي إشعارات عند إلغاء المواعيد</p>
                  </div>
                  <Switch
                    id="cancelled-appointments"
                    checked={notificationSettings.cancelledAppointments}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, cancelledAppointments: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="system-alerts">تنبيهات النظام</Label>
                    <p className="text-sm text-muted-foreground">تلقي إشعارات حول تحديثات وتنبيهات النظام</p>
                  </div>
                  <Switch
                    id="system-alerts"
                    checked={notificationSettings.systemAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, systemAlerts: checked })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="gap-2">
                  <Bell className="h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الأمان</CardTitle>
              <CardDescription>إدارة إعدادات الأمان لحسابك</CardDescription>
            </CardHeader>
            <form onSubmit={handleSecuritySubmit}>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">المصادقة الثنائية</Label>
                    <p className="text-sm text-muted-foreground">تفعيل المصادقة الثنائية لزيادة أمان حسابك</p>
                  </div>
                  <Switch
                    id="two-factor"
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="login-notifications">إشعارات تسجيل الدخول</Label>
                    <p className="text-sm text-muted-foreground">تلقي إشعارات عند تسجيل الدخول إلى حسابك</p>
                  </div>
                  <Switch
                    id="login-notifications"
                    checked={securitySettings.loginNotifications}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, loginNotifications: checked })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">مدة انتهاء الجلسة (بالدقائق)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    min="5"
                    max="120"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">مدة الخمول قبل تسجيل الخروج تلقائياً</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="gap-2">
                  <Shield className="h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
