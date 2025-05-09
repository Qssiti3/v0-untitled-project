import Link from "next/link"
import { MapPin, Scissors, Star, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="h-6 w-6" />
            <span className="text-xl font-bold">BarberGo</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium">
              المميزات
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium">
              كيف يعمل
            </Link>
            <Link href="#testimonials" className="text-sm font-medium">
              آراء العملاء
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">
                تسجيل الدخول
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">إنشاء حساب</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted/50 to-background">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex flex-col gap-4 md:gap-8 md:w-1/2 text-right">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">احصل على خدمة حلاقة احترافية في منزلك</h1>
            <p className="text-muted-foreground md:text-xl">
              ابحث عن أقرب حلاق متاح في منطقتك واحجز موعدًا للحصول على خدمة حلاقة متميزة في راحة منزلك
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Link href="/signup?type=customer">
                <Button size="lg" className="w-full sm:w-auto">
                  سجل كزبون
                </Button>
              </Link>
              <Link href="/signup?type=barber">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  سجل كحلاق
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative w-full aspect-video overflow-hidden rounded-lg shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 z-10"></div>
              <img
                src="/placeholder.svg?height=600&width=800"
                alt="حلاق يقدم خدمة في المنزل"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">مميزات الخدمة</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              نقدم لك تجربة حلاقة فريدة من نوعها بمميزات متعددة
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">البحث على الخريطة</h3>
              <p className="text-muted-foreground">
                ابحث عن أقرب حلاق متاح في منطقتك باستخدام خريطة تفاعلية سهلة الاستخدام
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Scissors className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">حلاقون محترفون</h3>
              <p className="text-muted-foreground">نضم نخبة من الحلاقين المحترفين ذوي الخبرة والمهارة العالية</p>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">تقييمات ومراجعات</h3>
              <p className="text-muted-foreground">اطلع على تقييمات ومراجعات العملاء السابقين لاختيار الحلاق المناسب</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">كيف يعمل</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">خطوات بسيطة للحصول على خدمة حلاقة في منزلك</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="relative flex flex-col items-center gap-4 text-center">
              <div className="absolute top-0 right-1/2 h-full w-px bg-border hidden md:block"></div>
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-bold">إنشاء حساب</h3>
              <p className="text-muted-foreground">قم بإنشاء حساب جديد كزبون أو كحلاق وأكمل ملفك الشخصي</p>
            </div>
            <div className="relative flex flex-col items-center gap-4 text-center">
              <div className="absolute top-0 right-1/2 h-full w-px bg-border hidden md:block"></div>
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-bold">البحث والحجز</h3>
              <p className="text-muted-foreground">ابحث عن حلاق متاح في منطقتك واختر الخدمة المناسبة وموعد الزيارة</p>
            </div>
            <div className="relative flex flex-col items-center gap-4 text-center">
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-bold">استمتع بالخدمة</h3>
              <p className="text-muted-foreground">
                استمتع بخدمة حلاقة احترافية في منزلك وقم بتقييم الخدمة بعد الانتهاء
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="w-full py-12 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">آراء العملاء</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">ما يقوله عملاؤنا عن تجربتهم مع خدمتنا</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col gap-4 p-6 bg-background rounded-lg shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">أحمد محمد</h4>
                  <div className="flex text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">
                "خدمة ممتازة وسريعة، الحلاق كان محترفًا جدًا وملتزمًا بالموعد. سأستخدم الخدمة مرة أخرى بالتأكيد."
              </p>
            </div>
            <div className="flex flex-col gap-4 p-6 bg-background rounded-lg shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">خالد عبدالله</h4>
                  <div className="flex text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4" />
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">
                "تطبيق رائع وفكرة مميزة، وفر علي الوقت والجهد. الحلاق كان ودودًا ومحترفًا."
              </p>
            </div>
            <div className="flex flex-col gap-4 p-6 bg-background rounded-lg shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">محمد علي</h4>
                  <div className="flex text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">
                "تجربة مميزة جدًا، الحلاق وصل في الموعد المحدد وقدم خدمة احترافية. أنصح الجميع بتجربة هذه الخدمة."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 flex flex-col items-center text-center gap-6">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">ابدأ الآن</h2>
          <p className="max-w-[700px] md:text-xl">
            انضم إلى مجتمعنا المتنامي من العملاء والحلاقين واستمتع بتجربة حلاقة فريدة
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup?type=customer">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                سجل كزبون
              </Button>
            </Link>
            <Link href="/signup?type=barber">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 border-primary-foreground"
              >
                سجل كحلاق
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 md:py-12 border-t">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Scissors className="h-6 w-6" />
            <span className="text-xl font-bold">BarberGo</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-muted-foreground">
            <Link href="#">الشروط والأحكام</Link>
            <Link href="#">سياسة الخصوصية</Link>
            <Link href="#">اتصل بنا</Link>
          </div>
          <div className="text-sm text-muted-foreground">© 2025 BarberGo. جميع الحقوق محفوظة.</div>
        </div>
      </footer>
    </div>
  )
}
