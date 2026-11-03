# R10 — کنترل‌ها و جابه‌جایی پنجره‌های دسکتاپ

**وضعیت:** تکمیل‌شده در ۲۰۲۶-۱۰-۲۲ با ۵۰ تست واحد، ۷۳ تست Chromium E2E، lint/typecheck/build و مرور بصری ۷۶۸/۱۰۲۴/۱۴۴۰ به‌همراه smoke ۳۲۰/۳۷۵. **وابستگی:** R09. **خروجی:** پنجره‌های دسکتاپ با کنترل Close و Maximize/Restore و جابه‌جایی قابل‌دسترس در سطح دسکتاپ مانیتور.

## هدف و محدوده

پوستهٔ مشترک `DesktopWindow` را گسترش بده تا پنجره از نوار عنوان جابه‌جا شود و دکمهٔ maximize آن را در محدودهٔ دسکتاپ تصویرشده روی مانیتور بزرگ/بازگردانی کند. منظور از maximize، پرکردن سطح دسکتاپ داخل overlay است؛ نه Fullscreen API مرورگر و نه تغییر مقصد/فوکس دوربین. نوار وضعیت خود دسکتاپ در حالت maximize قابل‌دیدن و قابل‌استفاده می‌ماند.

`MonitorDesktop` در هر لحظه حداکثر یک پنجره نشان می‌دهد و `openAppId` را والد، `RoomPreview`، نگه می‌دارد. هندسه و حالت maximize باید در همین مسیر مشترک بمانند؛ پنجرهٔ موازی یا منطق اختصاصی برای هر اپ نساز. جابه‌جایی یک پنجره نباید صفحهٔ داخلی `iframe` اپ پروژه را بی‌دلیل unmount/remount کند. حالت geometry بین reloadها ذخیره نمی‌شود.

در این کارت هم تعامل pointer و هم روش بدون drag لازم است: دکمهٔ «Move window» یک حالت جابه‌جایی pointer فراهم کند که با کلیک/تپ روی مقصد جدید پایان یابد؛ Escape آن را لغو کند. وقتی عنوان فوکس دارد، کلیدهای جهت پنجره را با گام مشخص جابه‌جا کنند. این جایگزین‌ها برای پرهیز از وابستگی صرف به حرکت کشیدنی هستند.

## فایل‌های مورد بررسی و تغییر احتمالی

- `src/MonitorDesktop.tsx` و `src/MonitorDesktop.module.css` — state هندسه، دکمه‌های عنوان، drag و محدودکردن به محدوده
- `src/desktopDrag.ts` و تست واحد آن در صورت نیاز به منطق هندسی تازه
- `src/MonitorDesktop.test.tsx`, `tests/project-apps.spec.ts`, `tests/about-me.spec.ts` — قرارداد، پروژهٔ embedشونده و فایل About
- `src/RoomPreview.tsx` فقط اگر بررسی نشان دهد مالکیت `openAppId` برای رفتار موجود لازم است؛ انتقال بی‌دلیل state به والد خارج از دامنه است

## مراحل

- [x] قرارداد state را در `MonitorDesktop` روشن نگه دار: پنجرهٔ بسته geometry قابل‌رؤیت ندارد؛ هنگام تعویض `openAppId` پنجرهٔ تازه از جای پیش‌فرض شروع می‌شود؛ maximize/restore برای پنجرهٔ فعلی است و Close با کلیک، Escape و بازشدن اپ دیگر باید restore state کهنه را پاک کند.
- [x] دکمه‌های قابل‌دسترس Close و Maximize/Restore را در نوار عنوان مشترک قرار بده؛ نام دسترس‌پذیر دکمه‌ها بین دو حالت دقیق باشد و pointerdown دکمه‌ها drag را آغاز نکند.
- [x] pointer drag فقط از ناحیهٔ آزاد نوار عنوان شروع شود؛ رویدادهای pointer capture، `pointercancel`، رهاسازی خارج header، آستانهٔ حرکت، جلوگیری از انتخاب متن و `touch-action` را مدیریت کن. دکمه‌ها، لینک‌ها و ناحیهٔ محتوای پنجره drag-handle نیستند.
- [x] موقعیت پنجره را در واحدهای محلی `MonitorDesktop` نگه دار و مختصات pointer تصویرشده را با مقیاس overlay به این واحدها تبدیل کن؛ پنجره از محدوده بیرون نرود و نوار وضعیت را نپوشاند. پس از resize یا تغییر اندازهٔ DOM، موقعیت دوباره clamp شود.
- [x] maximize سطح کار دسکتاپ را از زیر نوار وضعیت تا لبهٔ قابل‌استفاده پر کند. موقعیت/اندازهٔ عادی پیش از maximize ذخیره و در Restore بازگردانده شود؛ اگر viewport هنگام maximize تغییر کرد، Restore geometry را به محدودهٔ تازه clamp کن. نوار عنوان و Close باید همیشه قابل‌دسترسی بمانند.
- [x] دکمهٔ «Move window» حالت جابه‌جایی بدون drag بسازد: مقصد pointer پنجره را با همان clamp جابه‌جا کند، Escape لغو کند و focus به کنترل Move برگردد. هنگام این حالت، click مقصد نباید محتوای زیر pointer را فعال کند. خود title bar فوکس‌پذیر باشد؛ Arrow keys فقط وقتی focus مستقیماً روی title bar است پنجره را با گام ثابت حرکت دهند، نه وقتی یکی از دکمه‌های فرزند focus دارد.
- [x] focus اولیه روی Close، بستن با Escape، بازگشت focus به آیکون آغازگر، محتوای قابل‌اسکرول و reduced motion حفظ شود. تغییر هندسه نباید محتوای اپ را remount کند.

## پذیرش و بررسی

- [x] drag از عنوان پنجره را حرکت می‌دهد؛ drag از Close، Maximize/Restore، Move، لینک «Open in new tab»، iframe و محتوای About پنجره را حرکت نمی‌دهد. drag با pointercancel و رهاسازی بیرون header گیر نمی‌کند.
- [x] حرکت به هر چهار گوشه clamp می‌شود؛ title bar کامل در دسترس می‌ماند، پنجره وارد نوار وضعیت نمی‌شود و resize به ۳۲۰/۳۷۵/۷۶۸/۱۰۲۴/۱۴۴۰ geometry خارج از محدوده ایجاد نمی‌کند.
- [x] Maximize سطح کار زیر نوار وضعیت را پر می‌کند؛ Restore geometry قبل از maximize را برمی‌گرداند؛ maximize↔restore چندباره، resize در حالت maximize، Close و بازکردن اپ بعدی state کهنه یا پنجرهٔ تکراری ایجاد نمی‌کنند.
- [x] Move mode با pointer و touch بدون drag قابل‌استفاده است، Escape آن را لغو می‌کند و focus بازمی‌گردد؛ Arrow keys پنجره را جابه‌جا می‌کنند و در لبه‌ها clamp می‌شوند.
- [x] focus آغازین Close، Escape برای بستن، focus restoration به آیکون، scroll پنجرهٔ About، embed و لینک مستقیم پروژه، keyboard و reduced motion رگرسیون ندارند.
- [x] تست واحد برای helperهای clamp/geometry و تست Chromium برای mouse, touch, keyboard, maximize/restore, resize, Escape, focus و حفظ iframe state پاس شوند؛ سپس `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, و `npm run test:e2e -- --workers=1` اجرا شوند.
- [x] مرور تصویری در ۷۶۸، ۱۰۲۴ و ۱۴۴۰ انجام شود؛ در ۳۲۰/۳۷۵ فقط کلیپ‌نشدن title bar، کنترل‌ها، برگشت keyboard و نبود overflow بررسی شود. این کارت به‌تنهایی اثبات پوشش Firefox/Safari یا دستگاه واقعی نیست.

## شواهد اجرا

- `npm test`: ۵۰ تست در ۱۲ فایل پاس شد.
- `npm run lint` و `npm run typecheck`: بدون خطا.
- `npm run build`: پاس شد؛ هشدار موجود Vite برای chunk بزرگ `RoomScene` (حدود ۹۷۱٫۷ kB، gzip حدود ۲۶۰ kB) باقی است و خطای build نیست.
- `npm run test:e2e -- --workers=1`: ۷۳ تست Chromium پاس شد؛ ۱۱ تست R10 در `tests/desktop-windows.spec.ts` شامل drag، keyboard، maximize/restore/resize، reload، Move/Escape/leaving، touch، iframe، narrow widths و clamp هستند.
- `npm audit --audit-level=high`: ۰ آسیب‌پذیری؛ `git diff --check`: بدون خطا.
- تصویرهای بررسی محلی در `test-results/` (خارج از Git): پنجرهٔ پیش‌فرض ۳۲۰/۳۷۵، پنجرهٔ جابه‌جاشده در ۷۶۸/۱۰۲۴/۱۴۴۰ و maximize در ۱۴۴۰. title bar و کنترل‌ها در این عرض‌ها کلیپ نشدند و overflow افقی دیده نشد.
- حالت‌های keyboard، mouse، touch شبیه‌سازی‌شده، reduced motion، focus restoration و حفظ iframe در همین مجموعه بررسی شدند؛ `pointercancel`/`lostpointercapture` در کد مدیریت می‌شوند و رهاسازی pointer بیرون header در تست drag پوشش داده شده است.

## محدودیت‌ها و مرز کارت

- بررسی فقط Chromium (Playwright) با پروجکشن SwiftShader است؛ Firefox/Safari و دستگاه لمسی واقعی بررسی نشدند. طراحی ویژهٔ موبایل خارج از دامنه است و ۳۲۰/۳۷۵ فقط smoke هستند.
- هندسه و حالت maximize طبق تصمیم کارت بین reloadها ذخیره نمی‌شوند؛ بازکردن اپ دیگر پنجره را از جای پیش‌فرض شروع می‌کند و بازفعال‌سازی همان اپ هندسه را حفظ می‌کند.
- اگر focus داخل iframe cross-origin اپ پروژه باشد، Escape به DOM والد نمی‌رسد؛ Close و بقیهٔ کنترل‌ها بیرون iframe باقی می‌مانند.
- این کارت به‌تنهایی مالکیت `openAppId` یا رفتار مقصدهای R11/R12 را تغییر نمی‌دهد و dependencyهای بعدی را تکمیل نمی‌کند.

