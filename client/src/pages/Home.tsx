import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Video, Zap } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-accent p-2">
              <Video className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">منصة الفيديو</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/dashboard")}
            >
              سجلي
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-foreground">
              تقنية الذكاء الاصطناعي الأحدث
            </span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            أنشئ فيديوهات مذهلة باستخدام الذكاء الاصطناعي
          </h1>

          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            حول أفكارك إلى فيديوهات احترافية من خلال النصوص والصور باستخدام تقنية Grok
            Imagine Video المتقدمة - بدون الحاجة لتسجيل دخول
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={() => setLocation("/generate-text")}
              className="gap-2"
            >
              <Video className="h-5 w-5" />
              ابدأ من النص
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/generate-image")}
              className="gap-2"
            >
              <Video className="h-5 w-5" />
              ابدأ من صورة
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card/50 py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            المميزات
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-background p-6">
              <div className="mb-4 inline-flex rounded-lg bg-accent/10 p-3">
                <Video className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                توليد من النص
              </h3>
              <p className="text-muted-foreground">
                اكتب وصفاً وحول أفكارك إلى فيديوهات احترافية بسهولة
              </p>
            </div>

            <div className="rounded-lg border border-border bg-background p-6">
              <div className="mb-4 inline-flex rounded-lg bg-accent/10 p-3">
                <Video className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                توليد من الصورة
              </h3>
              <p className="text-muted-foreground">
                أحي صورك الثابتة بإضافة حركة واقعية وسلسة
              </p>
            </div>

            <div className="rounded-lg border border-border bg-background p-6">
              <div className="mb-4 inline-flex rounded-lg bg-accent/10 p-3">
                <Video className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                معاينة فورية
              </h3>
              <p className="text-muted-foreground">
                شاهد الفيديو مباشرة وحمّله بسهولة عند اكتماله
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="rounded-lg border border-border bg-gradient-to-r from-accent/10 to-accent/5 p-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            جاهز لإنشاء فيديوهات مذهلة؟
          </h2>
          <p className="mb-6 text-muted-foreground">
            ابدأ الآن مباشرة بدون الحاجة لتسجيل دخول أو إنشاء حساب
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={() => setLocation("/generate-text")}>
              ابدأ من النص
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/generate-image")}>
              ابدأ من الصورة
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 منصة الفيديو بالذكاء الاصطناعي. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
