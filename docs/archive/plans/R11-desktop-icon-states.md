# R11 — حالت hover و انتخاب آیکون‌های دسکتاپ

**وضعیت:** تکمیل‌شده در ۲۰۲۶-۱۰-۲۲. **وابستگی:** R09، R10. **خروجی:** حالت‌های بصری روشن برای hover، فوکس صفحه‌کلیدی و انتخاب آیکون در دسکتاپ مانیتور.

## هدف و محدوده

بازخورد تعاملی آیکون‌های موجود را در `MonitorDesktop` کامل کن. حالت hover، focus-visible و انتخاب باید مستقل از هم قابل‌فهم باشند: hover فقط اشارهٔ موقت است؛ focus-visible محل keyboard focus را نشان می‌دهد؛ selected آخرین آیکون انتخاب‌شده را تا انتخاب بعدی نگه می‌دارد. برای buttonهای بازکننده از `aria-pressed` استفاده نکن، چون این‌ها toggle button نیستند؛ وضعیت بصری selected را در DOM به‌صورت غیرگمراه‌کننده (مثلاً data attribute) بیان کن.

انتخاب به `MonitorDesktop` تعلق دارد؛ reducer ناوبری اتاق، دادهٔ پروژه و URLها تغییر نمی‌کنند. انتخاب اول `about-me.txt` باید همان فایل را highlight کند، ولی activation همچنان double-click/tap یا Enter طبق رفتار فعلی باشد. بازشدن اپ پروژه انتخاب را به همان آیکون منتقل می‌کند. بستن پنجره، highlight آخرین انتخاب را پاک نمی‌کند و focus مطابق قرارداد موجود به آیکون آغازگر بازمی‌گردد. این کارت hover در overview را اضافه نمی‌کند؛ آن رفتار در R12 است. جابه‌جایی آیکون همچنان رفتار R07 است و این کارت ادعای رفع محدودیت دسترس‌پذیری drag آن را نمی‌کند.

## فایل‌های مورد بررسی و تغییر احتمالی

- `src/MonitorDesktop.tsx` و `src/MonitorDesktop.module.css` — state انتخاب و حالت‌های hover/focus-visible/selected
- `src/MonitorDesktop.test.tsx`, `tests/project-apps.spec.ts`, `tests/about-me.spec.ts` — state و رفتار مرورگر هر دو نوع activation

## مراحل

- [x] کلاس/selectorهای متمرکز برای hover، `:focus-visible` و selected بساز؛ نشانگر selection دور tile/label قابل‌دیدن باشد، outline keyboard با hover اشتباه نشود و متن/گلیف contrast کافی داشته باشد.
- [x] `selectedAppId` محلی اضافه کن: pointer click اول `about-me.txt` آن را انتخاب می‌کند و activation دوم همان فایل را باز می‌کند؛ Enter روی About طبق رفتار فعلی مستقیماً پنجره را باز می‌کند و هم‌زمان همان آیکون را انتخاب می‌کند. کلیک اپ پروژه آن را انتخاب و باز می‌کند. اگر `openAppId` کنترل‌شده از والد به شناسهٔ تازه‌ای تغییر کرد، selection همگام شود؛ null شدن آن هنگام Close انتخاب را پاک نکند. hover یا صرف جابه‌جایی focus selection را عوض نکند.
- [x] بازشدن اپ تک‌کلیکی، بازشدن فایل با double-click/tap یا Enter، drag آیکون، pointercancel، و focus restoration را حفظ کن. اپ بازشده باید آیکون selected خودش را نشان دهد؛ بستن پنجره selection را پاک نکند.
- [x] اطمینان بده که overlay در overview همچنان inert است؛ hover highlight آیکون‌ها فقط وقتی دسکتاپ تعاملی/focused است.

## پذیرش و بررسی

- [x] hover با خروج pointer ناپدید می‌شود؛ focus-visible هنگام tab/keyboard روشن و بدون focus ring کاذب روی pointer click نمایش داده می‌شود؛ selected تا انتخاب تازه یا unmount باقی می‌ماند.
- [x] فقط یک آیکون selected است؛ انتخاب بین پروژه‌ها و About جابه‌جا می‌شود؛ close آیکون آغازگر را فوکس می‌کند و selection را نگه می‌دارد.
- [x] hover/selection هیچ اپی را باز نمی‌کند؛ activation و double-activation با drag، drag آستانه‌ای، pointercancel و Enter قاطی نمی‌شود. Enter روی About همان رفتار فعلیِ بازکردن فوری را دارد.
- [x] در overview، `inert` بودن دسکتاپ حفظ می‌شود و هیچ آیکون نامرئی focus/pointer target نمی‌شود. هیچ پیام یا hover tooltip تازه‌ای روی hotspotهای سه‌بعدی ایجاد نمی‌شود.
- [x] تست واحد برای رندر/attribute حالت‌ها و تست Chromium برای mouse hover، click selection، جابه‌جایی selection، keyboard focus/Enter، double activation، close/restore و overview inert پاس شدند؛ سپس `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, و `npm run test:e2e -- --workers=1` اجرا شدند.
- [x] screenshot و مرور در ۷۶۸، ۱۰۲۴ و ۱۴۴۰؛ در ۳۲۰/۳۷۵ smoke برای خوانایی highlight و نبود overflow انجام شد. reduced motion نیز بررسی شد.

## شواهد اجرا

- `npm test`: ۵۱ تست در ۱۲ فایل پاس شد.
- `npm run lint` و `npm run typecheck`: بدون خطا.
- `npm run build`: پاس شد؛ هشدار موجود Vite دربارهٔ chunk بزرگ `RoomScene` باقی است و خطای build نیست.
- `npm run test:e2e -- --workers=1`: ۷۴ تست Chromium پاس شد.
- `.github/workflows/ci.yml` شامل `npm ci`, lint, typecheck, test و build است؛ فرمان‌های lint/typecheck/test/build به‌صورت محلی پاس شدند. اجرای hosted workflow انجام نشد.
- `npm audit --audit-level=high`: صفر آسیب‌پذیری.
- مرور Chromium محلی با reduced motion در ۷۶۸، ۱۰۲۴ و ۱۴۴۰ انجام شد؛ کادر selection در هر سه viewport واضح بود. در ۱۴۴۰ حلقهٔ `:focus-visible` طلایی با کادر selection آبی متمایز بود؛ در ۳۲۰/۳۷۵ smoke موجود suite پاس شد.
- هیچ schema، API یا dependency تازه‌ای لازم نشد؛ فقط همین برنامهٔ محلی و index آن به‌روزرسانی شدند.

