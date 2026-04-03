# دليل النشر الشامل 🚀

هذا الدليل يشرح كيفية نشر تطبيق AI Video Generator على الإنترنت.

## المتطلبات الأساسية

- حساب GitHub (لديك بالفعل)
- حساب على Vercel أو Netlify
- مفتاح API من Replicate
- بطاقة ائتمان (اختيارية - لبعض الخدمات المدفوعة)

## الخطوة 1: الحصول على مفتاح Replicate API

1. اذهب إلى [Replicate.com](https://replicate.com)
2. قم بإنشاء حساب مجاني
3. انتقل إلى صفحة API tokens
4. انسخ مفتاح API الخاص بك

## الخطوة 2: النشر على Vercel (الخيار الموصى به)

### الطريقة الأولى: عبر واجهة Vercel

1. اذهب إلى [Vercel.com](https://vercel.com)
2. انقر على "Sign Up" وسجل دخول باستخدام GitHub
3. بعد التسجيل، انقر على "Add New Project"
4. اختر "Import Git Repository"
5. ابحث عن `ai-video-generator` واختره
6. في صفحة الإعدادات:
   - **Framework Preset**: اختر "Vite"
   - **Root Directory**: اتركه فارغاً
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

7. أضف متغيرات البيئة:
   - اسم المتغير: `REPLICATE_API_TOKEN`
   - القيمة: مفتاح API الخاص بك من Replicate

8. انقر على "Deploy"

### الطريقة الثانية: عبر Vercel CLI

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
cd /home/ubuntu/ai-video-generator
vercel --prod
```

## الخطوة 3: النشر على Netlify (بديل)

### الطريقة الأولى: عبر واجهة Netlify

1. اذهب إلى [Netlify.com](https://netlify.com)
2. انقر على "Sign up" واختر "GitHub"
3. بعد التسجيل، انقر على "Add new site"
4. اختر "Import an existing project"
5. اختر "GitHub" وسجل دخول
6. اختر المستودع `ai-video-generator`
7. في الإعدادات:
   - **Build command**: `pnpm build`
   - **Publish directory**: `dist`
   - **Functions directory**: `dist`

8. أضف متغيرات البيئة:
   - اسم المتغير: `REPLICATE_API_TOKEN`
   - القيمة: مفتاح API الخاص بك

9. انقر على "Deploy site"

## الخطوة 4: إعدادات إضافية

### تفعيل HTTPS

معظم منصات النشر تفعل HTTPS تلقائياً. تحقق من:
- Vercel: تفعيل تلقائي
- Netlify: تفعيل تلقائي

### إعداد Domain مخصص

#### على Vercel:
1. انتقل إلى إعدادات المشروع
2. اختر "Domains"
3. أضف اسم النطاق الخاص بك
4. اتبع التعليمات لتحديث DNS

#### على Netlify:
1. انتقل إلى "Domain settings"
2. اختر "Add custom domain"
3. أدخل اسم النطاق
4. اتبع التعليمات لتحديث DNS

## الخطوة 5: اختبار الموقع

بعد النشر:

1. افتح رابط الموقع الذي تم إنشاؤه
2. اختبر إنشاء فيديو من النص
3. اختبر إنشاء فيديو من الصورة
4. تحقق من أن الفيديوهات تظهر بشكل صحيح

## استكشاف الأخطاء

### المشكلة: "لا يمكن الاتصال بـ API"

**الحل:**
- تحقق من أن `REPLICATE_API_TOKEN` مضبوط بشكل صحيح
- تحقق من أن المفتاح لم ينتهِ صلاحيته
- تحقق من أن حسابك على Replicate نشط

### المشكلة: "خطأ في البناء"

**الحل:**
- تحقق من أن جميع المكتبات مثبتة: `pnpm install`
- تحقق من أن إصدار Node.js 18+
- اعرض السجلات في لوحة التحكم للمزيد من التفاصيل

### المشكلة: "الموقع بطيء"

**الحل:**
- قد يكون السبب Replicate API
- جرب نموذج مختلف
- تحقق من اتصال الإنترنت

## الخطوات التالية

1. **إضافة قاعدة بيانات** (اختياري):
   - استخدم MySQL أو PostgreSQL
   - حدّث `DATABASE_URL` في متغيرات البيئة

2. **إضافة المصادقة** (اختياري):
   - أضف نظام تسجيل دخول
   - احفظ الفيديوهات لكل مستخدم

3. **تحسين الأداء**:
   - أضف caching
   - استخدم CDN

4. **المراقبة والتحليلات**:
   - أضف Google Analytics
   - راقب الأخطاء مع Sentry

## الدعم والمساعدة

- **توثيق Vercel**: https://vercel.com/docs
- **توثيق Netlify**: https://docs.netlify.com
- **توثيق Replicate**: https://replicate.com/docs

---

**ملاحظة مهمة:** تأكد من أن جميع متغيرات البيئة مضبوطة بشكل صحيح قبل النشر!
