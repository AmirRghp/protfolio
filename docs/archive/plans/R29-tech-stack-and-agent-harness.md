# R29 — سکشن تعاملی تِک‌استک با تب‌های Arc UI و ردهٔ Agent Harness

**وضعیت:** در ۲۰۲۶-۱۱-۰۸ پیاده‌سازی و آزمایش شد. **وابستگی:** R28. **خروجی:** بخش Tech Stack میان سوابق کاری و تماس با تب‌های متحرک فنری Arc UI، آیکون‌های وکتور اختصاصی، و ردهٔ Agent Harness.

## هدف و نیازمندی‌ها

- معرفی سکشن اختصاصی Tech Stack با جای‌گیری میان سکشن‌های سوابق کاری (Work Experience) و ارتباط با من (Contact Me) با شناسه `#ld-techstack`.
- یکپارچه‌سازی کامپوننت تب‌های فنری برگرفته از Arc UI (`@uiarc/tabs`) با انیمیشن تغییر موقعیت لغزنده زیر لیبل‌ها بدون ایجاد آرتیفکت یا خطوط فوکوس ناخواسته.
- تعریف رده‌های جامع دسته‌بندی استک:
  - All، Languages، Frontend، Backend، Databases، DevOps & Cloud، Data & AI و تب جدید **Agent Harness**.
- پالایش فناوری‌های استک متناسب با هویت مهندسی هوش مصنوعی:
  - حذف فناوری‌های غیرضروری و قدیمی: `C++`، `Framer Motion`، `Node.js`، `Express.js`، `Socket.IO`، `Passport`، `Google OAuth`، `MongoDB`، `Mongoose`، `AWS`، `Vercel`، و `Mistral AI`.
  - اضافه شدن ابزارهای نوین بازیابی، تست و هوش مصنوعی: `Playwright`، `ChromaDB`، `FAISS`، `Claude API`، `OpenRouter API`، `Streamlit`، `Gradio`، و `Three.js`.
  - اضافه شدن ابزارها و پلتفرم‌های ایجنت‌کدینگ در تب Agent Harness: شامل `CODEX`، `Claude Code`، `Antigravity`، `zCode`، `Cursor`، و `Open Code`.
- طراحی و پیاده‌سازی آیکون‌های SVG اختصاصی در کامپوننت `TechIcon` برای تمامی ابزارهای جدید با رنگ‌بندی اصیل برندها.
- پیاده‌سازی چیپ‌های تعاملی فناوری با افکت اینورت کنتراست هنگام هاور (پس‌زمینه سفید با نوشته تیره).

## بررسی و پذیرش

- [x] تست‌های جامع `src/components/landing/TechStackSection.test.tsx` با بررسی حضور تب‌ها و آیتم‌های جدید و حذف موارد مدنظر با موفقیت پاس شدند.
- [x] تست‌های لندینگ `src/components/landing/FlatLanding.test.tsx` پاس شدند.
- [x] بیلد و تایپ‌چک کامل پروژه بدون خطا اجرا شد (۲۱۶ تست پاس در کل پروژه).
