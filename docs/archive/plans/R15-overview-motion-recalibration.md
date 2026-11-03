# R15 — کالیبراسیون حرکت نمای کلی برای میز عمیق‌تر

**وضعیت:** در ۲۰۲۶-۱۰-۲۲ پیاده‌سازی و بررسی فنی تکمیل شد؛ شواهد در همین فایل ثبت شده‌اند. **وابستگی:** R13 با تأیید انسانی، R14 و R12. **خروجی:** parallax نرم و محدود در قاب تازه، همراه با hotspot hover و انتقال‌های پایدار.

## هدف و خط مبنا

عمق بیشتر میز سبب می‌شود حرکت اندک دوربین هم در پیش‌زمینه محسوس‌تر شود. رفتار BFCM در مشاهدهٔ زنده حرکت نرمِ اشاره‌گر و اختلاف حرکت پیش‌زمینه/پس‌زمینه دارد، ولی اندازه و الگوریتم داخلی آن معلوم نیست. هدف این کارت کپی مقدار حرکت BFCM نیست: کاربر باید عمق میز را حس کند، در حالی که سه مقصد، لبه‌های صحنه و کنترل‌های HTML پایدار بمانند.

کد فعلی `roomParallaxOffset` در `src/roomCamera.ts` جابه‌جایی افقی/عمودی محدود دارد و `CameraFocus` در `src/RoomScene.tsx` آن را با `frameloop="demand"` و easing در حالت idle اعمال می‌کند. `FocusHotspot`/R12 روی همین canvas و raycast کار می‌کنند؛ پیاده‌سازی مسیر pointer یا canvas دوم مجاز نیست.

## مرز تغییر

- فقط حرکت idle نمای کلی و رفتار انتقال/بازگشت آسیب‌دیده از قاب تازه را تنظیم کن. pose مصوب R13، مدل میز R14، هندسهٔ hotspot و متن tooltip R12 را بدون دلیل دوباره طراحی نکن.
- کنترل‌های HTML روی Hero ثابت می‌مانند. حرکت با touch، keyboard یا reduced motion جایگزین ناوبری نیست. اسکرول صفحه انیمیشن دوربین نیست.
- `ROOM_FOV` و `ROOM_TRANSITION_SECONDS` را فقط در صورت شواهد مشخصِ رگرسیون و با بررسی همهٔ مقصدها عوض کن؛ مقدارهای فعلی تصمیم شروع‌اند، نه الزام کپی BFCM.

## مسیرهای خواندن و تغییر احتمالی

- `src/roomCamera.ts`, `src/roomCamera.test.ts`, `src/RoomScene.tsx`: محاسبهٔ offset، pose، raycast و loop حرکت.
- `src/RoomPreview.tsx` و CSS آن: مرز Hero، کنترل‌های HTML و tooltip R12؛ `tests/room-navigation.spec.ts` و تست‌های R12: pointer، focus، بازگشت و hover.
- `src/monitorProjection.ts`, `tests/monitor.spec.ts`, `tests/destinations.spec.ts`: نگاشت دسکتاپ و انتقال‌های چندمقصدی. فایل‌های دیگر فقط پس از یافتن caller واقعی تغییر کنند.

## مراحل

- [x] از R13/R14 baseline تصویری و مقادیر pose را بخوان. در حالت خنثی، چهار گوشه و مرکز pointer، مختصات/مرزهای میز و مقصدها را در `768`, `1024`, `1440` و viewport مرجع ثبت کن؛ کلیپ مجازِ پایین قاب را از نمایان‌شدن مرز خالی جدا کن.
- [x] اگر offset/easing فعلی در قاب تازه کافی و سالم است، همان را نگه دار و فقط شواهد را ثبت کن. اگر نه، کوچک‌ترین تغییر در helper/loop موجود را بده. حرکت نهایی باید نرم، محدود، بدون jitter، بدون overshoot قابل‌دیدن و با توقف زمانی پس از رسیدن به هدف باشد؛ `frameloop="demand"` را به حلقهٔ دائمی تبدیل نکن.
- [x] ورود/خروج pointer، `pointercancel` در صورت اثر، blur، visibility loss، resize، تغییر media query اشاره‌گر و تغییر `prefers-reduced-motion` را بررسی کن. هنگام transition، focus مقصد، روی کنترل‌های HTML و hotspot فعال، parallax باید طبق قرارداد موجود متوقف/خنثی شود و hover مصوب R12 همچنان درست باشد.
- [x] انتقال `room↔monitor`, `room↔board`, `room↔arcade` و تغییر سریع مقصد میانهٔ حرکت را بررسی کن؛ شروع حرکت بعدی از pose جاری باشد. بازگشت به room باید دقیقاً pose خنثی جدید را بازگرداند. نگاشت overlay مانیتور در همهٔ فریم‌های مرتبط از صفحه جدا نشود.
- [x] برای هر منطق غیرسادهٔ تازه یک تست کوچک unit/interaction اضافه کن؛ تست‌های قبلی مقدار offset را فقط در صورت تغییر واقعی قرارداد به‌روزرسانی کن. تصاویر/ویدئوی مرورگر را با وضعیت موس و viewport ثبت کن؛ صرف screenshot ثابت اثبات نرمی حرکت نیست.

## پذیرش و بررسی

- [x] حرکت موس در سطح آزاد Hero عمق میز را ملموس اما ظریف نشان می‌دهد؛ در مرکز به قاب مصوب R13 برمی‌گردد و در چهار گوشه board/monitor/arcade، لبه‌های صحنه و کنترل‌ها سالم‌اند.
- [x] حرکت روی hotspotها با highlight/tooltip R12 رقابت نمی‌کند؛ کلیک همان مقصد را انتخاب می‌کند و tooltip هنگام transition/خروج پاک می‌شود. کنترل‌های HTML جابه‌جا نمی‌شوند.
- [x] touch و reduced motion حرکت idle ندارند؛ keyboard navigation، focus/return و مسیر بدون WebGL محفوظ‌اند. پس از خروج/blur/resize، دوربین در offset کهنه گیر نمی‌کند.
- [x] `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` و E2E مرتبط با نتیجهٔ واقعی ثبت شود؛ مرور واقعی mouse/keyboard و touch emulation در عرض‌های هدف انجام شود. مرورگر/دستگاه بررسی‌نشده را پوشش‌یافته ننام.

## تحویل

مقدارهای offset/easing قبل و بعد، علت تغییر یا حفظشان، شواهد حرکت در چهار سمت، نتایج رگرسیون مقصدها و وضعیت Git را ثبت کن. R16 بازبینی یکپارچهٔ جداگانه است.

## شواهد اجرا — ۲۰۲۶-۱۰-۲۲

### مقدارهای قبل و بعد

| مورد | قبل | بعد | علت |
| --- | --- | --- | --- |
| حداکثر offset افقی | `±0.12` واحد world | `±0.24` | در قاب R13/R14 لبهٔ جلوی میز فقط حدود `±5px` (افقی) و `±2px` (عمودی) در `1440×900` جابه‌جا می‌شد؛ در `768×900` حدود `±1.5px`/`±0.6px` و عملاً تخت بود. با دو برابر شدن، سفر پیش‌زمینه به حدود `±10px`/`±4px` می‌رسد و اختلاف عمق میز با عناصر عقب دیده می‌شود. |
| حداکثر offset عمودی | `±0.06` | `±0.12` | همان نسبت، تا سمت پایین قاب هم عمق را نشان دهد. |
| easing | نمایی، ثابت زمانی `0.12s`، آستانهٔ `0.0005` | **بدون تغییر** | یکنوا و بدون overshoot است، حدود `0.4s` به آرامش می‌رسد و بعد از آن `invalidate` نمی‌کند؛ `frameloop="demand"` حفظ شد. |
| `ROOM_FOV`، `ROOM_TRANSITION_SECONDS`، pose R13، میز R14، hotspot و متن R12 | — | **بدون تغییر** | شواهدی از رگرسیون دیده نشد. |

### علت تغییر و یافته‌های جانبی

- کالیبراسیون لازم بود: مقدار قدیمی از زمان R02 (میز کم‌عمق) باقی مانده بود و در قاب تازه تقریباً بدون جلوه دیده می‌شد.
- نوار پایین Hero (حدود `40px` آخر، متن `.caption`) قبلاً `pointermove` را از canvas می‌گرفت؛ بنابراین گوشه‌های پایین اصلاً parallax نداشتند (شاهد `docs/r13-screenshots/r13-final-corner-bottom-left.png` و `bottom-right.png` باینری یکسان‌اند). `.caption` تعاملی نیست، پس `pointer-events: none` گرفت تا pointer به canvas برسد؛ متن و دسترس‌پذیری آن بدون تغییر ماند.
- `onPointerCapabilityChange` فقط hover را پاک می‌کرد؛ اگر pointer از fine به coarse تغییر کند، idle offset کهنه می‌ماند. حالا `clearPointerState()` صدا می‌زند تا hover و offset هر دو ریست شوند.

### فایل‌های تغییرکرده

- `src/roomCamera.ts`: حدهای offset و توضیح دلیل.
- `src/RoomScene.tsx`: ریست کامل در تغییر قابلیت pointer.
- `src/RoomPreview.module.css`: `pointer-events: none` برای `.caption`.
- `src/roomCamera.test.ts`: انتظارهای قرارداد offset.
- `tests/room-navigation.spec.ts`: تست parallax گسترش یافت (چهار گوشه، هر دو محور، ثابت‌ماندن کنترل‌های HTML، `pointercancel`، `blur`، `visibilitychange`).
- بدون افزودن dependency، backend، state library یا refactor نامرتبط.

### نتایج فرمان‌ها

- `npm test` → ۱۳ فایل / ۵۶ تست پاس.
- `npm run lint` → بدون خطا. `npm run typecheck` → بدون خطا.
- `npm run build` → موفق؛ فقط هشدار قدیمیِ chunk بزرگ‌تر از `500kB` برای `RoomScene`.
- `npx playwright test tests/room-navigation.spec.ts tests/monitor.spec.ts --workers=1` → ۳۳ تست پاس.
- `npm run test:e2e -- --workers=1` → ۷۹ تست پاس (کل مجموعه).
- `git diff --check` → تمیز.

### شواهد مرورگر

- تصاویر قبل/بعد در `docs/r15-screenshots/`: `before-neutral-{768x900,1024x768,1440x900,1920x905}.png`، `before-corner-{top-left,top-right,bottom-left,bottom-right}.png` و همان‌ها با پیشوند `after-` به‌علاوهٔ `after-focus-{monitor,project-board,arcade}-1440x900.png` و `after-return-1440x900.png`.
- ویدئوی sweep اشاره‌گر و گذار `room↔monitor` و `room↔board`: `docs/r15-screenshots/r15-motion-sweep.webm`.
- بررسی چشمی در `768×900`, `1024×768`, `1440×900`, `1920×905`: لبهٔ میز و مقصدها داخل قاب مصوب R13 ماندند، هیچ مرز خالی تازه‌ای ظاهر نشد، کنترل‌های HTML تکان نخوردند و overlay مانیتور در طول حرکت از صفحه جدا نشد.

### محدودیت‌ها

- فقط Chromium با SwiftShader (بدون GPU واقعی) بررسی شد؛ Firefox/Safari و دستگاه لمسی واقعی پوشش داده نشده‌اند. touch فقط شبیه‌سازی شده است.
- `visibilitychange` در تست با بازنویسی `document.hidden` ساختگی است؛ تعویض واقعی media query اشاره‌گر در مرورگر شبیه‌سازی‌شدنی نبود و فقط از روی کد بررسی شد.

### وضعیت Git

- تغییرها فقط در `src/` و `tests/` هستند؛ `docs/` محلی و gitignored است.
- هیچ commit یا push انجام نشد.
