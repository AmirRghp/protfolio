# R09 — عملکرد، مرورگر و تحویل بصری

**وضعیت:** تکمیل شد؛ شواهد فنی و بازبینی بصری انسانی در ۲۰۲۶-۱۰-۲۱ تأیید شدند. **وابستگی:** R01 تا R08. **Skill:** `performance-optimization`؛ پشتیبان: `verification-before-completion` و `browser-testing-with-devtools`. **خروجی:** شواهد نهایی کیفیت بصری، تعامل و عملکرد در محدودهٔ مصوب.

## فایل‌های مورد بررسی و تغییر احتمالی

- کل تغییرات `src/`, `tests/`, `public/assets/` و منبع تولید مدل‌های محلی
- خروجی `dist/`، گزارش Playwright و screenshotهای محلی (بدون افزودن artifact آزمایشی به Git)

## مراحل

- [x] از output production و گزارش‌های موجود شروع کن؛ اندازه‌گیری جدید را با ابزار/محدودیتش ثبت کن، به‌ویژه تفاوت SwiftShader با GPU واقعی.
- [x] تعداد مدل‌ها، اندازهٔ GLB/texture، draw calls، DPR، سایه و زمان فریم را روی یک مرورگر واقعی بررسی کن؛ بهینه‌سازی را فقط برای گلوگاه مشاهده‌شده انجام بده.
- [x] هزینهٔ دو WebGL context مستقل (Three.js و canvas مربوط به GradientWaves)، بارگذاری chunk سه‌بعدی و frame pacing موج‌ها را هنگام overview، focus و حرکت دوربین اندازه بگیر؛ اثرشان را جداگانه و با روش/دستگاه ثبت کن.
- [x] build production و کل تست‌های lint، typecheck، unit و e2e را اجرا کن؛ آزمون‌ها باید رفتار واقعی failure را از mock جدا کنند.
- [x] screenshotهای overview و هر مقصد را در 768، 1024 و 1440 ثبت و از نظر قاب، نور، متن، overlap و overflow بازبینی کن.
- [x] در 320 و 375 فقط smoke test مسیر HTML، عدم overflow و fallback را انجام بده؛ layout/ترکیب اختصاصی موبایل را تأیید یا ادعا نکن.
- [x] keyboard، focus-visible، reduced motion، WebGL unavailable و از دست‌رفتن context را برای هر دو context مستقل بررسی کن؛ شکست هرکدام نباید دسترسی HTML و wallpaper/صحنهٔ باقی‌مانده را مختل کند. loading/error مدل و fallback لینک/embed را هم بازبینی کن.
- [x] افت/بازگشت روانی حرکت دوربین از focus به overview و تغییر سریع مقصدها را همراه wallpaper متحرک مرور کن؛ زمان‌سنجی/فریم‌ریت را از مشاهدهٔ بصری جداگانه گزارش بده.
- [x] محدودیت دستگاه واقعی، GPU، مرورگر یا سرویس ثالث را صریح در گزارش بنویس؛ مورد بررسی‌نشده را پاس اعلام نکن.

## پذیرش و بررسی

- [x] معیارهای R01 تا R08 با شواهد واقعی تکمیل شده‌اند و همهٔ والدها فقط بعد از تکمیل معیارهایشان تیک خورده‌اند.
- [x] اندازه‌گیری‌ها به دستگاه/مرورگر و روش واقعی خود نسبت داده شده‌اند؛ نتیجهٔ شبیه‌ساز معادل سخت‌افزار واقعی نیست.
- [x] review بصری انسانی نهایی در ۲۰۲۶-۱۰-۲۱ انجام و صریحاً تأیید شد؛ نقص‌های باز، blockerها و محدودیت‌های پوشش ثبت شده‌اند.
- [x] Git diff/status بازبینی شده؛ فقط تغییرات مربوط به بازطراحی حضور دارند و بدون درخواست صریح commit/push انجام نمی‌شود.

## تغییرات اعمال‌شده

- `src/GradientWaves.tsx`: با دریافت `webglcontextlost`، حلقهٔ `requestAnimationFrame` متوقف، canvas مرده حذف و از `wake`/`fit`/`tick` بعدی جلوگیری می‌شود. زمینهٔ CSS wallpaper باقی می‌ماند و listener در cleanup حذف می‌شود.
- `tests/entry-page.spec.ts`: آزمون regression «a lost wallpaper context leaves the room usable and stops its frame loop». این آزمون پیش از اصلاح با ۷۰ draw call در یک ثانیه شکست می‌خورد؛ پس از اصلاح، پس از رویداد lost کمتر از ۵ draw call در یک ثانیه دارد و سپس HTML و صحنهٔ باقی‌مانده را بررسی می‌کند.
- مستندات: `README.md` به‌روزرسانی و ثبت شد؛ `docs/plans/R09-verification.md`، `docs/plans.md` و `docs/PRD.md` به‌صورت محلی (gitignored) به‌روزرسانی شدند. سه فایل tracked یعنی `README.md`، `src/GradientWaves.tsx` و `tests/entry-page.spec.ts` در commit `67dc9a5` ثبت شدند؛ push انجام نشد.

## محیط و روش اندازه‌گیری

- Ubuntu 24.04.5، Linux 7.0.0-38، Node `v24.19.0`، npm `11.17.0`.
- **GPU واقعی:** system Chrome `153.0.8010.52`، headless، با `--use-gl=angle --use-angle=gl --enable-gpu --ignore-gpu-blocklist`؛ renderer: `ANGLE (NVIDIA Corporation, NVIDIA GeForce RTX 3050 Laptop GPU/PCIe/SSE2, OpenGL 4.5.0)`. این اندازه‌گیری روی GPU واقعی است، اما در headless و بدون نمایشگر فیزیکی/پروفایلر درایور.
- **SwiftShader:** bundled Chromium `156.0.8078.4`، headless، بدون flagهای GPU؛ renderer: `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)`. این baseline فقط برای مقایسهٔ نرم‌افزاری است و معادل سخت‌افزار واقعی نیست.
- viewport اندازه‌گیری: `1440×900`، DPR 1؛ یک اجرای جداگانه با DPR 2 شبیه‌سازی‌شده. سرور production محلی؛ بدون throttle شبکه.
- draw callها با wrap کردن `drawArrays`/`drawElements` و مشتقات instanced، و فریم‌ها با `requestAnimationFrame` اندازه‌گیری شدند. شمارندهٔ contextها از `getContext("webgl2")` گرفته شده است.
- LCP/FCP/CLS/long taskها با `PerformanceObserver` و paint entries در همان سرور محلی ثبت شدند؛ این اعداد field data یا نتیجهٔ شبکهٔ واقعی نیستند.

## شواهد اندازه‌گیری

### دارایی‌ها و build

| مورد | مقدار |
| --- | --- |
| GLBها | ۳ فایل، مجموع ۲۵۹٬۲۴۸ بایت |
| arcade-cabinet.glb | ۵۲٬۰۱۲ بایت، ۱۷ mesh، ۶۲۸ triangle، ۰ texture/image |
| curved-monitor.glb | ۶۵٬۱۴۸ بایت، ۴ mesh، ۱٬۰۰۲ triangle، ۰ texture/image |
| room-furnishings.glb | ۱۴۲٬۰۸۸ بایت، ۶ mesh، ۱٬۴۱۶ triangle، ۰ texture/image |
| RoomScene chunk | ۹۷۱٬۶۸۱ بایت / ۲۵۷٬۰۴۶ بایت gzip |
| main JS | ۲۶۱٬۲۰۷ بایت / ۸۱٬۸۲۹ بایت gzip |
| CSS | ۱۳٬۱۷۷ بایت / ۳٬۷۲۰ بایت gzip |
| index.html | ۶۱۵ بایت / ۳۵۶ بایت gzip |

هشدار Vite برای chunk بزرگ‌تر از ۵۰۰ kB همچنان وجود دارد.

### frame pacing روی GPU واقعی

| حالت | FPS | میانه / p95 فریم | draw callها | یادداشت |
| --- | --- | --- | --- | --- |
| overview idle | ۶۰٫۰ | ۱۶٫۷ / ۱۶٫۷ ms | ۰ در ۳ ثانیه | فریم‌های >۲۰ms: ۰؛ دو context WebGL2 |
| monitor idle | ۵۹٫۶ | ۱۶٫۷ / ۱۶٫۷ ms | ۱۸۰ در ۱۸۰ فریم | ۱ draw call در هر فریم؛ فریم‌های >۲۰ms: ۰ |
| monitor wallpaper-only | ۵۹٫۴ | ۱۶٫۷ / ۱۶٫۷ ms | ۱۲۰ در ۱۲۰ فریم | canvas صحنه پنهان؛ ۱ draw call در هر فریم |
| scene transition | ۶۰٫۱ | ۱۶٫۷ / ۱۶٫۸ ms | ۲٬۵۳۴ در ۴۳ فریم | wallpaper پنهان؛ max ۶۶ draw call/فریم |
| both transition | ۶۰٫۰ | ۱۶٫۷ / ۱۶٫۷ ms | ۲٬۶۲۹ در ۹۵ فریم | حدود ۲٬۵۳۴ صحنه + ۹۵ wallpaper؛ max ۶۷ |
| rapid transitions | ۶۰٫۰ | ۱۶٫۷ / ۱۶٫۸ ms | ۴٬۹۳۰ در ۷۷ فریم | max ۶۷؛ فریم‌های >۲۰ms: ۰ |
| monitor + project iframe | ۵۹٫۵ | ۱۶٫۷ / ۱۶٫۷ ms | ۱ در هر فریم | iframe درخواست‌شده ولی GitHub با CSP مسدود شد؛ این عدد موفقیت اپ را اثبات نمی‌کند |
| arcade ready | ۵۹٫۹ | ۱۶٫۷ / ۱۶٫۷ ms | ۰ | — |
| arcade iframe | ۵۹٫۵ | ۱۶٫۷ / ۱۶٫۸ ms | ۰ | یک فریم ۳۳٫۳ms هنگام بارگذاری؛ محتوای PS1FUN سیاه ماند |

- DPR 2 شبیه‌سازی‌شده: overview ۵۹٫۹، monitor ۵۹٫۵ FPS؛ canvas صحنه `2160×1350` (clamp DPR 1.5) و wallpaper `2006×1014`. در overview، wallpaper در CSS حدود `425×215` دیده می‌شود و در focus به `1003×507` می‌رسد.
- دو context مستقل WebGL2 فعال‌اند. در طول جلسه ۷ texture، ۱۶۶ buffer، ۶ program و ۴ framebuffer **created** شمارش شد؛ این‌ها شمارندهٔ ساخت‌اند، نه تعداد زندهٔ منابع در یک فریم.
- `shadows="percentage"`، shadow map `1024×1024`، `frameloop="demand"` و DPR سه‌بعدی `[1, 1.5]` است. هزینهٔ سایه به‌صورت جداگانه benchmark نشد؛ عدد کلی transition شامل آن است.

### SwiftShader (baseline نرم‌افزاری)

- overview idle: ۵۹٫۹ FPS و ۰ draw call.
- monitor focus، پس از settle: **۸٫۷ FPS**؛ میانه ۱۱۶٫۷ms، p95 ۱۳۳٫۴ms، max ۱۵۰ms؛ ۲۷ فریم و ۲۷ draw call در ۳ ثانیه. در یک اجرای ترکیبی دیگر ۷٫۲ FPS ثبت شد؛ این نوسان طبیعی SwiftShader است.
- این اعداد نشان می‌دهند wallpaper و صحنه در حالت monitor با نرم‌افزار کند هستند؛ آن‌ها را به‌عنوان عملکرد GPU واقعی گزارش نکن.

### بارگذاری اولیه

- FCP و LCP: ۱۴۸ms؛ CLS: ۰.
- long taskهای ثبت‌شده: ۶۹ms و ۲۲۸ms در یک اجرای محلی؛ اجراهای قبلی ۱۰۴–۲۵۶ms برای LCP و یک long task حدود ۱۱۱–۲۱۵ms نشان داده بودند. این اعداد روی سرور محلی و بدون شبکهٔ واقعی‌اند.

## کیفیت و بررسی

| فرمان | نتیجه |
| --- | --- |
| `npm ci` | پاس |
| `npm run lint` | پاس |
| `npm run typecheck` | پاس |
| `npm test` | ۱۱ فایل، ۴۳ تست پاس |
| `npm run build` | پاس؛ هشدار chunk > 500 kB |
| `npm run test:e2e` | با ۸ worker پیش‌فرض: ۵۴ پاس و ۸ timeout ناشی از ازدحام SwiftShader؛ ۷ تست درگیر با یک worker جداگانه پاس شدند |
| `npx playwright test --workers=2` | **۶۲ از ۶۲ پاس** |
| `git diff --check` | پاس |
| `npm audit --audit-level=high` | ۰ آسیب‌پذیری |

CI واقعی GitHub Actions اجرا نشده است، چون push انجام نشده؛ workflow فعلی فقط `npm ci`، lint، typecheck، unit و build را اجرا می‌کند. E2E و اندازه‌گیری‌های R09 بررسی محلی اضافه‌اند.

## بازبینی بصری

- ۲۵ screenshot محلی در `docs/r09-screenshots/` ذخیره شد: ۱۲ تصویر overview/monitor/project board/arcade در ۷۶۸، ۱۰۲۴ و ۱۴۴۰؛ ۳۲۰/۳۷۵ overview و مسیر HTML؛ و حالت‌های about-me، project preview/loading/CSP/error، board detail، arcade playing/timeout.
- در هیچ عرضی horizontal overflow مشاهده نشد؛ `documentWidth` با viewport برابر بود. پنل board و arcade داخل قاب می‌مانند و متن/کنترل‌ها بیرون از overlap قابل‌مشاهده‌اند.
- در ۷۶۸ و ۱۰۲۴ اندازهٔ labelهای دسکتاپ ۹px و در ۱۴۴۰ برابر ۱۰٫۵۳px است. سرریز یا شکست چیدمان دیده نشد، اما خوانایی ۹px به قضاوت بازبینی انسانی سپرده شده و تغییر خودسرانه انجام نشد.
- در ۳۲۰/۳۷۵ ترکیب Hero بسیار کوچک و letterboxed است؛ این طرح موبایل نیست و فقط مسیر HTML، نبود overflow و fallback بررسی شد. محتوای HTML خوانا و قابل‌دسترس است.
- پنجرهٔ about-me در ۷۶۸ از نظر بصری بریده دیده می‌شود، اما body آن scrollable است و تست‌ها دسترسی/scroll را پاس می‌کنند.
- GitHub در iframe با `frame-ancestors 'none'` مسدود می‌شود. مرورگر صفحهٔ خطای خودش را نشان می‌دهد و راهنمای خنثی + لینک مستقیم باقی می‌ماند؛ پیام خطای صریح فقط وقتی ظاهر می‌شود که تا مهلت، load رخ ندهد. screenshot خطای واقعی با request معلق ثبت شد. این با محدودیت ثبت‌شدهٔ R07 هم‌خوان است و fallback موفق/ناموفق بودن embed را جعل نمی‌کند.
- PS1FUN در iframe بارگیری شد اما تصویر سیاه و خطاهای mixed-content از خود سرویس بیرونی داشت. Exit، لینک مستقیم و fallback هشت‌ثانیه‌ای در دسترس‌اند. مجوز embed و بارگیری زندهٔ بازی همچنان تأییدنشده است.
- **تأیید نهایی:** بازبینی بصری انسانی در ۲۰۲۶-۱۰-۲۱ صریحاً تأیید شد. خوانایی labelهای ۹px در ۷۶۸/۱۰۲۴ و ترکیب کوچک ۳۲۰/۳۷۵ به‌عنوان محدودیت پذیرفته شدند؛ هیچ نقص blocker باز نماند.

## محدودیت‌ها و موارد باز

- **وضعیت تحویل:** تأیید بصری انسانی در ۲۰۲۶-۱۰-۲۱ ثبت شد و R09 کامل است؛ R10 تا R12 بدون درخواست صریح شروع نمی‌شوند.
- Firefox/Safari، دستگاه لمسی واقعی و صفحه‌نمایش فیزیکی با نرخ >۶۰Hz بررسی نشدند. Playwright فقط Chromium و touch emulation است.
- headless Chrome فریم‌ها را حدود ۶۰Hz نگه می‌دارد؛ ادعای ۹۰/۱۲۰/۱۴۴Hz یا نبود افت روی نمایشگر واقعی وجود ندارد. پروفایل GPU درایور، حافظه/GC و soak test طولانی انجام نشد.
- GitHub CSP از والد قابل‌تشخیص نیست؛ خطای صریح project embed فقط برای timeout/عدم load قابل ارائه است. PS1FUN مجوز و عملکرد بازی تأییدنشده باقی مانده است.
- متن‌های ۹px در ۷۶۸/۱۰۲۴ و هشدار حجم chunk سه‌بعدی به‌عنوان محدودیت بصری/فنی باز ثبت شده‌اند؛ هیچ‌کدام بدون معیار و اندازه‌گیری تغییر نکردند.
- `docs/` در Git ردیابی نمی‌شود؛ شواهد و اسکرین‌شات‌ها فقط در checkout محلی‌اند. commit محلی `67dc9a5` انجام شده اما push و GitHub Actions واقعی بررسی نشده‌اند.

## گام بعدی

R09 کامل است و R01 تا R09 در `docs/plans.md` تیک خورده‌اند. R10 تا R12 فقط با درخواست صریح کاربر و پس از بررسی وابستگی‌هایشان شروع می‌شوند. اگر بازبینی تازه‌ای نقصی نشان دهد، فقط همان نقص با اندازه‌گیری/تست مرتبط اصلاح و مجموعهٔ checks دوباره اجرا می‌شود.
