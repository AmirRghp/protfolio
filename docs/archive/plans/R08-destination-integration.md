# R08 — یکپارچه‌سازی مقصدها و مسیر دسترس‌پذیر

**وضعیت:** تکمیل‌شده در ۲۰۲۶-۱۰-۲۱؛ یافتهٔ P2 بازبینی دربارهٔ abort شدن iframe آرکید اصلاح و دوباره بررسی شد. **وابستگی:** R02، R06 و R07. **Skill:** `browser-testing-with-devtools`؛ پشتیبان: `code-review-and-quality`. **خروجی:** جریان کامل Hero تا مانیتور/برد/آرکید و برگشت.

## فایل‌های مورد بررسی و تغییر

- `src/RoomPreview.tsx` — مالکیت state پنجره، تمرکز بازگشتی، fallback آرکید و گزارش شکست صحنه
- `src/MonitorDesktop.tsx` — پنجرهٔ کنترل‌شده و ترتیب `Escape`
- `src/RoomScene.tsx` — گزارش از‌دست‌رفتن graphics context به والد
- `src/MonitorDesktop.test.tsx`, `tests/destinations.spec.ts`, `tests/monitor.spec.ts`, `tests/room-navigation.spec.ts`
- `tests/project-apps.spec.ts` — پایدارسازی مختصات دو تست canceled-pointer
- `README.md`, `docs/PRD.md`, `docs/plans.md`

## مراحل

- [x] همان نمونهٔ `MonitorDesktop` متصل به صفحهٔ فیزیکی را در overview و focus مانیتور حفظ کن؛ رفت‌وبرگشت صرف بین این دو نباید دسکتاپ/پس‌زمینه را تعویض یا state پنجره را بی‌دلیل reset کند.
- [x] state مقصد اتاق را با about-me، اپ پروژه، برد و آرکید هماهنگ کن؛ با انتخاب برد/آرکید یا مقصد تازه، پنجره و انتخاب stale باقی نماند و focus به کنترل مقصد/برگشت درست منتقل شود.
- [x] کنترل برگشت همیشه قابل‌مشاهده و HTML باشد؛ خروج از بازی و پنجرهٔ اپ، بستن هر UI، و برگشت سلسله‌مراتبی قابل‌پیش‌بینی باشند.
- [x] رفتار برد و کارت‌های پروژهٔ فعلی را در قاب تازه حفظ کن؛ دسترسی کامل به همهٔ پروژه‌ها به لیست HTML وابسته بماند.
- [x] تعامل آرکید موجود و شروع بازی فقط پس از انتخاب Play را حفظ کن؛ لینک مستقیم سرویس و دکمهٔ Exit بیرون از iframe بمانند.
- [x] شرایط فعلی embed و استفادهٔ سرویس بازی را دوباره بررسی کن؛ پاسخ 200 یا تست mock اثبات اجازه/پایداری سرویس نیست. اگر embed مناسب نیست، آرکید لینک مستقیم روشن داشته باشد.
- [x] خطای WebGL، شکست مدل و iframe ناموجود را با fallback قابل‌استفاده پوشش بده؛ متن/لینک‌ها در HTML مستقل باقی بمانند.
- [x] تمرکز صفحه، عنوان معنایی، focus-visible، keyboard، tab order و reduced motion را در مسیرهای مقصد بررسی کن.

## پذیرش و بررسی

- [x] از overview هر مقصد باز می‌شود و به مسیر موردانتظار برمی‌گردد؛ انتخاب سریع، بستن و برگشت وسط حرکت state ناسازگار نمی‌سازند.
- [x] دسکتاپ و همان wallpaper متحرک در گذار overview↔monitor یک نمونهٔ پیوسته می‌مانند؛ لایهٔ دسکتاپ بیرون از focus مانیتور `inert` است و مقصدهای دیگر را نمی‌پوشاند.
- [x] اطلاعات و لینک‌های پورتفولیو بدون WebGL و بدون پیدا کردن hotspot قابل‌دسترسی‌اند.
- [x] مانیتور، برد و آرکید کنترل بازگشت قابل‌مشاهده دارند؛ iframe بازی keyboard focus را از کنترل Exit قطع نمی‌کند.
- [x] تست‌های reducer و Playwright مسیر کامل، keyboard، error/fallback، focus restoration و reduced motion را پاس می‌کنند.

## گزارش اجرا

### تصمیم‌های پیاده‌شده

- پنجرهٔ about-me/اپ پروژه بین overview و مانیتور باز می‌ماند و همان DOM/state را حفظ می‌کند. `openAppId` در `RoomPreview` کنترل می‌شود؛ انتخاب برد یا آرکید، و همچنین شکست صحنه، آن را پاک می‌کند.
- لایهٔ دسکتاپ فقط در focus مانیتور `inert={false}` است. با شکست WebGL/مدل یا context loss، پنجره بسته و focus به دکمهٔ Monitor برمی‌گردد.
- `Escape` در مانیتور ابتدا پنجره را می‌بندد (حتی وقتی focus روی خود desktop است) و بعد از آن به overview برمی‌گردد. بستن پنجره focus را به آیکون آغازگر برمی‌گرداند.
- بازگشت از مانیتور/برد/آرکید یک ref مقصد دارد و پس از رسیدن به overview دکمهٔ همان مقصد را focus می‌کند.
- آرکید بعد از Play یک iframe می‌سازد. تا زمانی که قاب نمایش داده می‌شود، راهنمای خنثی، لینک مستقیم PS1FUN و Exit بیرون iframe می‌مانند. `load` فقط تایمر ۸ ثانیه‌ای را متوقف می‌کند و برای محتوای cross-origin موفقیت بازی محسوب نمی‌شود؛ فقط نبود load در این مهلت پیام `role="status"` را نشان می‌دهد. focus بعد از Play روی Exit و بعد از Exit روی Play می‌نشیند.
- `referrerPolicy="no-referrer"` به iframe بازی اضافه شد؛ sandbox و مجوزهای سرویس تغییر نکردند.
- هیچ dependency، backend، API، router یا reducer جدیدی اضافه نشد.

### اصلاح بازبینی ۲۰۲۶-۱۰-۲۱

- یافتهٔ P2: وقتی درخواست iframe بلافاصله abort می‌شد، مرورگر برای صفحهٔ خطای خودش رویداد `load` می‌فرستاد؛ handler قبلی تایمر را پاک می‌کرد و fallback هرگز نمایش داده نمی‌شد.
- اصلاح: تا زمانی که iframe نمایش داده می‌شود، راهنمای خنثی، لینک مستقیم PS1FUN و Exit بیرون قاب همیشه حاضرند. `load` فقط تایمر را متوقف می‌کند و نشانهٔ موفقیت بازی نیست؛ فقط نبود `load` در ۸ ثانیه پیام `role="status"` را نشان می‌دهد. متن پیام از ادعای قطعی «could not be loaded» به گزارش نبود بازی در مهلت تغییر کرد.
- تست regression: `an aborted game request still leaves usable guidance and the direct link` در `tests/room-navigation.spec.ts` با abort فوری، وجود راهنمای بیرون قاب، لینک مستقیم و Exit را بررسی می‌کند. تست timeout در `tests/destinations.spec.ts` نیز متن و نبود راهنمای اضافی در حالت جایگزین‌شده را می‌سنجد.
- مستندات README، PRD و این کارت با محدودیت واقعی cross-origin یکسان شدند: نه موفقیت بارگیری بازی و نه شکست شبکه/`X-Frame-Options` از والد قابل‌تشخیص نیست.

### فرمان‌ها و نتیجه‌ها

| فرمان | نتیجه |
| --- | --- |
| `npm run typecheck` | پاس |
| `npm run lint` | پاس |
| `npm test` | ۱۱ فایل، ۴۳ تست پاس |
| `npm run build` | پاس؛ `index` ۲۶۱.۰۱ kB (gzip ۸۲.۷۹)، `RoomScene` ۹۷۱.۶۸ kB (gzip ۲۶۰.۰۰)، CSS ۱۳.۱۷ kB (gzip ۳.۷۳)؛ هشدار Vite برای chunk بزرگ‌تر از ۵۰۰ kB باقی است |
| `npm run test:e2e -- --workers=2` | ۶۱ تست Chromium پاس در ۴.۹ دقیقه |
| `npm run test:e2e -- --workers=1 --grep "an aborted game request\|a game frame that never loads\|arcade loads only on request"` | ۳ تست هدفمند پاس در ۱۸.۷ ثانیه |
| `npm audit --audit-level=high` | ۰ آسیب‌پذیری |
| `git diff --check` | بدون خطای whitespace |

### شواهد مرورگر

- Chromium با SwiftShader در عرض‌های ۳۲۰، ۳۷۵، ۷۶۸، ۱۰۲۴ و ۱۴۴۰ بررسی شد؛ overflow افقی در مرزهای تست‌شده دیده نشد. در حالت abort، راهنمای خنثی، لینک مستقیم و Exit در viewport هر پنج عرض باقی ماندند.
- مسیرهای keyboard، `Escape`، focus بازگشتی، `inert`، reduced motion، شکست GLB/chunk، WebGL unavailable و graphics context loss تست شدند.
- screenshotهای پنجرهٔ حفظ‌شده در overview و مانیتور، fallback timeout آرکید و راهنمای abort در خروجی Playwright ذخیره شدند.
- بررسی ۲۱ اکتبر ۲۰۲۶ از PS1FUN: پاسخ HTTP 200؛ `X-Frame-Options` و CSP `frame-ancestors` مشاهده نشد؛ HTML ۳۶٬۶۴۶ بایت و شامل لینک Privacy Policy بود، اما terms/embed license پیدا نشد.

### محدودیت‌ها و کار باقی‌مانده

- بارگیری زنده و مجوز/شرایط embed سرویس PS1FUN همچنان تأییدنشده است. fallback فقط نبود رویداد load در ۸ ثانیه را تشخیص می‌دهد. `load` می‌تواند مربوط به صفحهٔ خطای مرورگر باشد؛ بنابراین موفقیت بازی یا شکست شبکه/`X-Frame-Options` از والد قابل‌تشخیص نیست. راهنمای خنثی، لینک مستقیم و Exit بیرون iframe همیشه در دسترس می‌مانند.
- اگر پنجرهٔ اپ پروژه در overview باز بماند، iframe بارگذاری‌شدهٔ آن زنده می‌ماند. این نتیجهٔ تصمیم حفظ state است و هزینهٔ آن باید در R09 بررسی شود.
- تست‌های این مرحله Chromium/SwiftShader هستند؛ Firefox، Safari و دستگاه واقعی پوشش داده نشدند.
- محدودیت keyboard برای drag آیکون‌ها از R07 باقی است و در R08 تغییری نکرد.
- R09 بعدی است: عملکرد، مرورگر و تحویل بصری.
