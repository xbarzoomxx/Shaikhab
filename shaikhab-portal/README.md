# بوابة أسرة الشيخاب

موقع لتوثيق بيانات أفراد أسرة الشيخاب، مع صفحة بحث عامة ولوحة تحكم للمسؤول، وقاعدة البيانات مخزّنة في **Google Sheets**.

## طريقة العمل

- **Google Sheet** يقوم بدور قاعدة البيانات (كل بيانات الأفراد تُخزَّن هناك، ويمكنك فتح نفس الملف وتعديله يدوياً في أي وقت أيضاً).
- **Vercel** يستضيف الموقع نفسه (الصفحة العامة + لوحة التحكم).
- التواصل بين الموقع وملف Google Sheet يتم عبر حساب خدمة (Service Account) من Google Cloud — لا حاجة لتسجيل دخول جوجل من قبل الزوار.

بما أنني (Claude) لا أملك صلاحية الدخول إلى حساب Google أو Vercel الخاص بك، الأكواد كاملة وجاهزة، والخطوات التالية هي ما تحتاج فعله بنفسك (تستغرق حوالي 15-20 دقيقة أول مرة فقط).

---

## الخطوة 1: إنشاء ملف Google Sheet

1. أنشئ ملف Google Sheet جديد فارغ (يمكن تسميته "بيانات أسرة الشيخاب").
2. انسخ **معرّف الملف** (Sheet ID) من الرابط:
   `https://docs.google.com/spreadsheets/d/`**`هنا_المعرف`**`/edit`
3. لا حاجة لإنشاء أي تبويبات (Tabs) بنفسك — سينشئها الموقع تلقائياً (Members و Subscriptions) عند أول استخدام.

## الخطوة 2: إنشاء حساب خدمة (Service Account) في Google Cloud

1. اذهب إلى [console.cloud.google.com](https://console.cloud.google.com) وأنشئ مشروعاً جديداً (أو استخدم مشروعاً موجوداً).
2. من القائمة الجانبية: **APIs & Services > Library**، ابحث عن **Google Sheets API** واضغط **Enable**.
3. من **APIs & Services > Credentials**، اضغط **Create Credentials > Service Account**، وأعطه أي اسم (مثلاً `shaikhab-portal`).
4. بعد إنشائه، ادخل إلى الحساب واذهب لتبويب **Keys > Add Key > Create new key > JSON**. سيتم تنزيل ملف JSON — احتفظ به، فهو يحتوي على البيانات التالية التي ستحتاجها:
   - `client_email` → هذا هو `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → هذا هو `GOOGLE_PRIVATE_KEY`
5. **مهم جداً:** افتح ملف Google Sheet الذي أنشأته، واضغط **مشاركة (Share)**، وأضف بريد `client_email` كمحرر (Editor). بدون هذه الخطوة لن يستطيع الموقع الكتابة في الملف.

## الخطوة 3: رفع الكود إلى GitHub

1. أنشئ مستودع (repository) جديد فارغ على [github.com](https://github.com).
2. من داخل مجلد المشروع الذي تم تسليمه لك، نفّذ:
   ```bash
   git init
   git add .
   git commit -m "النسخة الأولى من بوابة أسرة الشيخاب"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git push -u origin main
   ```

## الخطوة 4: النشر على Vercel

1. سجّل دخول إلى [vercel.com](https://vercel.com) (يمكن الدخول مباشرة بحساب GitHub).
2. اضغط **Add New > Project**، واختر المستودع الذي رفعته للتو.
3. Vercel سيتعرف تلقائياً أنه مشروع Next.js — لا حاجة لتغيير أي إعداد بناء (Build Settings).
4. قبل الضغط على Deploy، افتح قسم **Environment Variables** وأضف المتغيرات التالية:

   | المتغير | القيمة |
   |---|---|
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | من ملف JSON الذي نزّلته |
   | `GOOGLE_PRIVATE_KEY` | من ملف JSON (انسخه كاملاً بين علامتي تنصيص، مع إبقاء `\n`) |
   | `GOOGLE_SHEET_ID` | معرّف ملف الشيت من الخطوة 1 |
   | `ADMIN_PASSWORD` | كلمة مرور من اختيارك لدخول لوحة التحكم |
   | `SESSION_SECRET` | نص عشوائي طويل (يمكن توليده بأمر `openssl rand -hex 32`) |

5. اضغط **Deploy**. بعد دقيقة تقريباً سيصبح الموقع متاحاً على رابط مثل `shaikhab-portal.vercel.app`.
6. (اختياري) من إعدادات المشروع في Vercel يمكنك ربط دومين خاص بالعائلة (مثل `family.shaikhab.com`) من تبويب **Domains**.

## الاستخدام اليومي

- **الصفحة العامة `/`**: يفتحها أي فرد من العائلة للبحث عن اسمه أو اسم قريب له، مع فرز أبجدي أو حسب الأحدث، وفلترة حسب الفرع العائلي أو عضوية الجمعية.
- **لوحة التحكم `/admin`**: تسجيل الدخول بكلمة المرور (`ADMIN_PASSWORD`)، ومنها يمكن:
  - إضافة/تعديل/حذف أي فرد.
  - استيراد كشف كامل من ملف Excel أو CSV دفعة واحدة (يكفي أن يحتوي على عمود `full_name`).
  - تصدير كل البيانات كملف Excel في أي وقت.
- **التعديل المباشر من جوجل**: يمكن لأي شخص تثقون به فتح ملف Google Sheet مباشرة وتعديل الخلايا يدوياً — التغييرات تظهر في الموقع فوراً (البيانات تُقرأ حيّة من الملف عند كل زيارة).

## هيكلة البيانات في الشيت

عند أول تشغيل، سينشئ الموقع تبويبين تلقائياً:

**Members**: `id, full_name, gender, birth_date, phone, city, country, family_branch, is_society_member, society_role, society_join_date, status, notes, created_at, updated_at`

**Subscriptions**: `id, member_id, year, amount_due, amount_paid, status, payment_date, method` (جدول الصندوق التكافولي، جاهز للاستخدام لاحقاً وقابل للتوسعة من لوحة التحكم).

## استكشاف الأخطاء

- **"تعذّر تحميل البيانات"**: تأكد أن بريد حساب الخدمة تمت إضافته كمحرر (Editor) على ملف الشيت، وأن `GOOGLE_SHEET_ID` صحيح.
- **خطأ متعلق بـ private key**: تأكد أن قيمة `GOOGLE_PRIVATE_KEY` في Vercel محاطة بعلامتي تنصيص وتحتوي على `\n` كما هي في ملف JSON الأصلي، دون تعديل.
- **نسيان كلمة مرور المسؤول**: غيّر قيمة `ADMIN_PASSWORD` من إعدادات Environment Variables في Vercel، ثم أعد النشر (Redeploy).

## التطوير محلياً (اختياري)

```bash
npm install
cp .env.example .env.local   # ثم عدّل القيم داخل .env.local
npm run dev
```
الموقع سيعمل على `http://localhost:3000`.
