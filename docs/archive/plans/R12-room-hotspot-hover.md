# R12 — بازخورد hover نقاط انتخاب اتاق

**وضعیت:** تکمیل‌شده در ۲۰۲۶-۱۰-۲۲. **وابستگی:** R09؛ مستقل از R10 و R11. **خروجی:** برجسته‌سازی نقطهٔ قابل‌انتخاب زیر pointer و راهنمای `USE COMPUTER` برای hotspot مانیتور در overview.

## هدف و محدوده

در حالت overview و پیش از فوکس دوربین روی مانیتور، hotspotهای موجود اتاق هنگام hover ماوس بازخورد بدهند. برای hotspot مانیتور، متن انگلیسی `USE COMPUTER` نزدیک و کمی زیر cursor نمایش داده شود؛ مرجع تصویری این برچسب را روی تصویر مانیتور نشان می‌دهد، ولی قرارداد این کارت آن را tooltip HTML متصل به cursor تعریف می‌کند تا متن قابل‌خواندن بماند. راهنما صرفاً affordance است: نباید focus، destination یا activation را تغییر دهد. آیکون‌های HTML دسکتاپ در overview همچنان inert می‌مانند؛ تعامل آن‌ها در R11 است.

تعامل فعلی در `FocusHotspot` یک mesh نامرئی است که برای click-to-focus raycast می‌شود؛ `CameraFocus` نیز با raycaster حرکت idle را روی hotspot متوقف می‌کند. رفتار pointerover باید از همین هندسه استفاده کند و hotspot/canvas موازی نسازد. همهٔ hotspotهای قابل‌انتخاب هنگام hover بازخورد بصری می‌گیرند، ولی فقط برای مانیتور copy مشخص‌شدهٔ `USE COMPUTER` نمایش داده می‌شود. متن تازه برای برد/آرکید خارج از محدوده است.

برای جلوگیری از renderهای React در هر pointermove، React state فقط برای ورود/خروج یا عوض‌شدن hotspot تغییر کند؛ موقعیت tooltip با CSS transform/ref یا مسیر کم‌هزینهٔ مشابه به‌روزرسانی شود. tooltip باید داخل `RoomPreview`, خارج canvas، و `pointer-events: none` باشد. در خروج از hotspot/canvas، تغییر destination، شکست یا unmount صحنه، blur پنجره و از دست‌رفتن context باید پاک شود.

## فایل‌های مورد بررسی و تغییر احتمالی

- `src/RoomScene.tsx` — رویدادهای hover برای `FocusHotspot`, گزارش hotspot/مختصات pointer و حالت highlight
- `src/RoomPreview.tsx` و `src/RoomPreview.module.css` — نمایش tooltip متصل به cursor و پاک‌سازی در navigation/failure
- `tests/room-navigation.spec.ts`, `tests/monitor.spec.ts` و در صورت نیاز یک تست واحد کوچک برای helper موقعیت tooltip — hover، click و پاک‌سازی

## مراحل

- [x] قرارداد callback بین `RoomScene` و `RoomPreview` را حداقلی نگه دار: مقصد hotspot، ورود/خروج، و مختصات client pointer. callback نباید باعث setState والد در هر حرکت pointer شود.
- [x] highlight روی hotspot هدف بماند و با hover change/out برداشته شود؛ از hit-test فعلی استفاده کن، click propagation و `onNavigate` فعلی را نگه دار و parallax فعلی روی hotspot را reset کن.
- [x] tooltip مانیتور را نزدیک/زیر cursor render کن؛ لبه‌های viewport را با clamp حساب کن تا کل label داخل صفحه بماند. از portal، dependency یا API جدید استفاده نکن مگر تست ثابت کند ساختار فعلی مانع لازم است.
- [x] tooltip فقط برای mouse/fine hover فعال باشد؛ pointer touch/pen، keyboard focus، reduced motion و camera transition نباید tooltip شناور باقی‌مانده نشان دهند. مسیر nav بالای صفحه و click/keyboard activation فعلی بدون tooltip همچنان کار کنند.
- [x] پاک‌سازی را برای pointerleave canvas/hotspot، destination change, scene failure/context loss, window blur/visibility و unmount انجام بده.

## پذیرش و بررسی

- [x] hover روی هر hotspot موجود، همان hotspot را highlight می‌کند؛ فقط مانیتور متن `USE COMPUTER` دارد. pointerleave هم tooltip و هم highlight را پاک می‌کند.
- [x] label کمی زیر cursor است و در همهٔ چهار گوشهٔ viewport clamp می‌شود؛ tooltip `pointer-events: none` دارد، target را نمی‌پوشاند و هیچ focus/navigation را trigger نمی‌کند.
- [x] کلیک مستقیم روی مانیتور همچنان focus مقصد مانیتور را آغاز می‌کند؛ click برد/آرکید، navigation بالای صفحه، parallax خالی اتاق و reset idle روی hotspot قبلی تغییر نمی‌کنند.
- [x] هنگام رفتن به مقصد دیگر، برگشت به room، GLB failure، WebGL context loss، blur و hidden tab tooltip باقی‌مانده دیده نمی‌شود؛ در touch/keyboard هیچ hover state stuck نیست.
- [x] تست Chromium از overview با مختصات hotspot تصویرشده (نه selector آیکون HTML) tooltip را assert کند، سپس pointer را بیرون ببرد و ناپدیدشدن را assert کند؛ click روی hotspot همان مقصد را باز کند. تست‌های hover نباید فقط با dispatch مصنوعی pointer event ادعای واقعی hit testing کنند.
- [x] تست‌های `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, و `npm run test:e2e -- --workers=1` پاس شوند. مرور بصری در ۷۶۸، ۱۰۲۴ و ۱۴۴۰؛ در ۳۲۰/۳۷۵ فقط smoke برای overflow/نمایش کامل tooltip باشد. SwiftShader را به‌جای GPU واقعی گزارش نکن.

## شواهد اجرا

- `npm test`: ۵۴ تست در ۱۳ فایل پاس شد؛ ۳ تست تازه برای clamp موقعیت tooltip اضافه شد.
- `npm run lint` و `npm run typecheck`: بدون خطا.
- `npm run build`: پاس شد؛ هشدار موجود Vite دربارهٔ chunk بزرگ `RoomScene` (۹۷۳٫۳۳ kB، gzip ۲۶۰٫۴۵ kB) باقی است و خطای build نیست.
- `npm run test:e2e -- --workers=1`: ۷۹ تست Chromium پاس شد. تست‌های تازه با mouse API واقعی Playwright، نه dispatch مصنوعی، hover هر سه hotspot، tooltip مانیتور، خروج/فوکوس/blur، تغییر مقصد، شکست صحنه، ازدست‌رفتن context و عرض‌های ۳۲۰/۳۷۵ را پوشش دادند.
- `npm audit --audit-level=high`: صفر آسیب‌پذیری.
- `.github/workflows/ci.yml` شامل `npm ci`، lint، typecheck، test و build است؛ همان فرمان‌ها به‌صورت محلی پاس شدند. hosted workflow اجرا نشد.
- مرور بصری در ۷۶۸، ۱۰۲۴ و ۱۴۴۰ انجام شد: کادر accent و tint ملایم روی هر سه hotspot دیده شد و tooltip مانیتور کامل و نزدیک cursor بود. در ۳۲۰/۳۷۵ smoke انجام شد و tooltip کامل داخل viewport ماند و overflow افقی نداشت. `prefers-reduced-motion` نیز بررسی شد: highlight می‌ماند و tooltip پنهان می‌شود.
- این بررسی در Chromium و رندر SwiftShader انجام شد؛ GPU واقعی، Firefox/Safari و دستگاه لمسی واقعی بررسی نشدند. tooltip عمداً فقط برای mouse/fine hover فعال است.
- هیچ schema، API یا dependency تازه‌ای لازم نشد؛ فقط فایل‌های موجود، helper کوچک hover و تست‌های آن تغییر کردند.

