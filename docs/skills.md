# بررسی و رتبه‌بندی skillها برای این پروژه

تاریخ: ۲۰۲۶-۱۰-۱۶. ارزیابی بر اساس برنامهٔ تأییدشدهٔ اتاق سه‌بعدی پورتفولیو و snapshot نصب‌های همان روز است. این گزارش نتیجهٔ اجرای عملی همهٔ skillها نیست.

## روش و پوشش

- ۲۳۹ فایل `SKILL.md` در سه ریشه پیدا شد؛ هفت کپی سازگاری `.cursor` و `.openclaw` جدا شدند. **۲۳۲ مسیر canonical، با ۲۲۵ نام متمایز، تک‌تک ارزیابی شدند.** نام یکسان به معنی محتوا یا نسخهٔ یکسان نیست.
- در ۱۴۴ مورد کل entrypoint خوانده شد؛ در ۸۸ مورد workflow، محدودیت‌ها، پیش‌نیازها و منابع مرتبط بررسی شدند و مثال‌های بلند یا بخش‌های غیرمرتبط کامل بازخوانی نشدند. ستون پوشش این تفاوت را ثبت می‌کند؛ بررسی تک‌تک با ادعای خواندن تمام بایت‌های همهٔ مثال‌ها یکسان نیست.
- موارد مرتبط برای منابع لازم و وابستگی‌ها نیز بررسی شدند. اسکن امنیتی، آموزش مدل، job ابری، انتشار، اتصال حساب و workflow ابزارهای خارجی اجرا نشد.
- هر معیار ۰ تا ۵: **ت** تناسب با همین پروژه؛ **ک** کاربرد عملی؛ **خ** کمک احتمالی به کاهش خطا؛ **س** کم‌بودن سربار. امتیاز نهایی `(۲×ت + ک + خ + س) ÷ ۵` است. این نمره قضاوت مقایسه‌ای است، نه benchmark یا تضمین کاهش توهم/باگ.
- رتبه‌ها در هر حوزه‌اند. گزینهٔ اصلی نیز فقط هنگام کار مرتبط خوانده می‌شود؛ امتیاز بالا مجوز نصب همهٔ گزینه‌های مشابه یا اجرای تمام workflowها نیست.
- ستون محدودیت، وضعیت **نسخهٔ نصب‌شدهٔ اصلی هنگام audit** را توصیف می‌کند. اصلاح منابع نسخهٔ پروژه در بخش بسته‌های محلی و manifest جدا ثبت شده است.
- نام‌های هم‌معنی از ارائه‌دهنده‌های متفاوت ردیف جدا دارند. نسخهٔ محلی را با مسیر دقیق انتخاب کنید؛ Codex الزاماً هم‌نام سراسری را کنار نمی‌زند.

### وضعیت کشف و نصب

- `codex plugin list --json`: ۳۵ افزونهٔ نصب‌شده، همگی enabled. فایل داخل cache به‌تنهایی دلیل فعال‌بودن یا نمایش‌داده‌شدن آن skill نیست.
- پاسخ واقعی `skills/list` در Codex app-server: **۱۴۲ skill** شامل **۲۶ مورد با scope=repo**، ۱۱۰ user و ۶ system؛ هیچ خطای کشف برای پروژه گزارش نشد. این بررسی مدل یا thread جدیدی اجرا نکرد.
- همهٔ ۲۶ مسیر محلی کشف شدند. CLI و فهرست افزونه‌های remote این نشست لزوماً پوشش یکسان ندارند؛ «در CLI نیامد» در جدول به معنی غیرفعال‌بودن قطعی در desktop نیست.
- در این audit مورد disabled در پاسخ کشف مشاهده نشد. همهٔ مسیرهای cache، حتی موارد دیده‌نشده در CLI، برای کامل‌بودن inventory بررسی شدند.

## انتخاب‌های پروژه

۲۶ بستهٔ جدول بعد به‌صورت کپی واقعی نگهداری شده‌اند. این انتخاب، مجموعهٔ پایهٔ مصوب و مکمل‌هایش است؛ بعضی رقیب‌ها نیز امتیاز بالا دارند ولی برای جلوگیری از تکرار workflow نصب نشده‌اند. نام‌ها و metadata اصلی حفظ شده‌اند.

| skill محلی | منشأ snapshot | کاربرد و وضعیت |
| --- | --- | --- |
| [browser-testing-with-devtools](../.agents/skills/browser-testing-with-devtools/SKILL.md) | https://github.com/addyosmani/agent-skills.git؛ installed folder hash 42be59520831 (commit نیست) | بررسی واقعی مرورگر؛ نام/قابلیت ابزار استفاده‌شده صادقانه گزارش شود. |
| [code-review-and-quality](../.agents/skills/code-review-and-quality/SKILL.md) | https://github.com/addyosmani/agent-skills.git؛ installed folder hash 8c26aef07c0a (commit نیست) | بازبینی correctness، سادگی، امنیت و عملکرد در دامنهٔ تغییر. |
| [code-simplification](../.agents/skills/code-simplification/SKILL.md) | https://github.com/addyosmani/agent-skills.git؛ installed folder hash 15b6e2192418 (commit نیست) | فقط در صورت پیچیدگی اثبات‌شده؛ بدون refactor نامرتبط. |
| [context-engineering](../.agents/skills/context-engineering/SKILL.md) | https://github.com/addyosmani/agent-skills.git؛ installed folder hash 5da634152562 (commit نیست) | اصلی برای context و handoff؛ سند/فایل مرتبط، نه کل inventory. |
| [context7-mcp](../.agents/skills/context7-mcp/SKILL.md) | https://github.com/upstash/context7 @ 1.0.2 | مکمل؛ به Context7 MCP و شبکه وابسته است، نه صرفاً فایل skill. |
| [documentation-and-adrs](../.agents/skills/documentation-and-adrs/SKILL.md) | https://github.com/addyosmani/agent-skills.git؛ installed folder hash eeff83d93dd3 (commit نیست) | ثبت تصمیم و دلیل؛ فایل‌های موازی و ADR بی‌نیاز تولید نشوند. |
| [emil-design-eng](../.agents/skills/emil-design-eng/SKILL.md) | https://github.com/emilkowalski/skills.git؛ installed folder hash db7a20dc1d8a (commit نیست) | راهنمای تعامل و حرکت هدفمند؛ نه جایگزین مستندات R3F. |
| [frontend-design](../.agents/skills/frontend-design/SKILL.md) | Codex installed frontend-design | اصلی برای حفظ رفرنس ثابت و جلوگیری از قالب عمومی. |
| [frontend-ui-engineering](../.agents/skills/frontend-ui-engineering/SKILL.md) | https://github.com/addyosmani/agent-skills.git؛ installed folder hash 8fdd24f2b93c (commit نیست) | اصلی برای HTML، responsive و دسترس‌پذیری؛ نمونه dialog باید با رفتار واقعی بررسی شود. |
| [git-workflow-and-versioning](../.agents/skills/git-workflow-and-versioning/SKILL.md) | https://github.com/addyosmani/agent-skills.git؛ installed folder hash 92d87ae1fe98 (commit نیست) | Git در دامنهٔ مجاز؛ دستور commit/branch عمومی بر منع مصوب مقدم نیست. |
| [gsap-core](../.agents/skills/gsap-core/SKILL.md) | https://github.com/greensock/gsap-skills.git؛ installed folder hash 135754edd728 (commit نیست) | مشروط به نیاز واقعی GSAP در اجرا؛ این نصب کتابخانه npm را اضافه نکرده است. |
| [gsap-performance](../.agents/skills/gsap-performance/SKILL.md) | https://github.com/greensock/gsap-skills.git؛ installed folder hash 34dec2f05187 (commit نیست) | مشروط به GSAP و گلوگاه اندازه‌گیری‌شده. |
| [gsap-react](../.agents/skills/gsap-react/SKILL.md) | https://github.com/greensock/gsap-skills.git؛ installed folder hash ac01a338b96f (commit نیست) | مشروط به استفادهٔ واقعی GSAP در React و نیاز cleanup. |
| [gsap-timeline](../.agents/skills/gsap-timeline/SKILL.md) | https://github.com/greensock/gsap-skills.git؛ installed folder hash 37eb5d623c3e (commit نیست) | مشروط به نیاز واقعی به توالی حرکت. |
| [impeccable](../.agents/skills/impeccable/SKILL.md) | https://github.com/pbakaus/impeccable.git؛ installed folder hash 01fe78e7bc25 (commit نیست) | مشروط و پرهزینه‌تر؛ engine/live/دانلود ابزار یا تولید جهت جدید در این آماده‌سازی فعال نشده است. |
| [no-ai-slop](../.agents/skills/no-ai-slop/SKILL.md) | https://github.com/petergyang/no-ai-slop @ 1.0.6 | ویرایش متن واقعی و چک eval.md؛ صحت برنامه را تضمین نمی‌کند. |
| [performance-optimization](../.agents/skills/performance-optimization/SKILL.md) | https://github.com/addyosmani/agent-skills.git؛ installed folder hash d7cc0bec4238 (commit نیست) | اندازه‌گیری پیش از بهینه‌سازی؛ تست محلی معادل تضمین سخت‌افزار دیگر نیست. |
| [planning-and-task-breakdown](../.agents/skills/planning-and-task-breakdown/SKILL.md) | https://github.com/addyosmani/agent-skills.git؛ installed folder hash 3045f95a156d (commit نیست) | اصلی برای همین plans.md و پذیرش هر تسک. |
| [ponytail](../.agents/skills/ponytail/SKILL.md) | https://github.com/DietrichGebert/ponytail @ 5.3.0 | اصلی برای کوچک‌ترین تغییر کامل؛ سطح full. |
| [ponytail-review](../.agents/skills/ponytail-review/SKILL.md) | https://github.com/DietrichGebert/ponytail @ 5.3.0 | مکمل بازبینی کوچک و مرتبط با استفادهٔ واقعی. |
| [review-animations](../.agents/skills/review-animations/SKILL.md) | https://github.com/emilkowalski/skills.git؛ installed folder hash 0e0d3cb3e07c (commit نیست) | بازبینی انیمیشن ساخته‌شده؛ معیارهای UI با دوربین scene اشتباه نشوند. |
| [source-driven-development](../.agents/skills/source-driven-development/SKILL.md) | https://github.com/addyosmani/agent-skills.git؛ installed folder hash 29e1dcc180d5 (commit نیست) | اصلی برای تصمیم وابسته به نسخه و مستندات رسمی. |
| [test-driven-development](../.agents/skills/test-driven-development/SKILL.md) | https://github.com/addyosmani/agent-skills.git؛ installed folder hash b812b07dc0c5 (commit نیست) | برای منطق غیرساده و رفع باگ؛ مستندسازی و کپی فایل تست ساختگی نمی‌خواهد. |
| [vercel-react-best-practices](../.agents/skills/vercel-react-best-practices/SKILL.md) | https://github.com/vercel-labs/agent-skills.git؛ installed folder hash 343db72180d0 (commit نیست) | مکمل برای React؛ بخش‌های server/Next.js الزام این برنامه نیستند. |
| [verification-before-completion](../.agents/skills/verification-before-completion/SKILL.md) | https://github.com/obra/superpowers @ 6.4.2 | شواهد اجرای واقعی پیش از ادعای تکمیل. |
| [writing-plans](../.agents/skills/writing-plans/SKILL.md) | https://github.com/obra/superpowers @ 6.4.2 | مکمل مشروط برای جزئیات برنامه؛ زنجیرهٔ upstream Superpowers به‌طور خودکار نصب/اجرا نشده است. |

### تمامیت، مجوز و تفاوت‌های محلی

- [manifest](../.agents/skills-lock.json) نام، نسخهٔ موجود یا folder hash، SHA-256 entrypoint اصلی و SHA-256 همهٔ فایل‌های vendored را ثبت می‌کند. commit ناشناخته با `null` مشخص است؛ folder hash به‌جای commit معرفی نشده است. این فایل installer یا ابزار update نیست.
- تمام پوشهٔ منتخب، metadata، منابع، اسکریپت‌ها و قالب‌های داخل آن کپی شد؛ هیچ hook یا MCP سراسری فعال نشد. همهٔ entrypointها بایت‌به‌بایت با نصب اصلی یکسان‌اند.
- پنج مرجع مشترک `definition-of-done`، `accessibility-checklist`، `performance-checklist`، `security-checklist` و `testing-patterns` از `addyosmani/agent-skills` در commit `aeac41d4d005999432bb7312f7ff06383a91d59d` به `.agents/references/` افزوده شد. متن نصب‌شدهٔ skillها ارتقا نیافت؛ revision منابع جدا ثبت شده چون برخی entrypointها با HEAD upstream متفاوت بودند.
- تنها تغییر در فایل vendored: سه لینک `vercel-react-best-practices/AGENTS.md` به فایل‌های موجود در `rules/` اصلاح شد. نسخهٔ اولیه واقعاً در تست لینک شکست خورد؛ متن قواعد تغییر نکرد.
- مجوز frontend-design در همان `LICENSE.txt` باقی است؛ مجوزهای سایر ارائه‌دهنده‌ها در `.agents/licenses/` نگهداری می‌شوند. licenseهای بازیابی‌شدهٔ Context7 و Impeccable با Git blob و SHA-256 ثبت شده‌اند.
- upstream مهارت Vercel در metadata و README عبارت MIT دارد ولی در snapshot مخزن فایل LICENSE مستقل نداشت. [NOTICE](../.agents/licenses/vercel-react-best-practices/NOTICE.md) همین محدودیت و permalink را حفظ می‌کند؛ متن copyright ساختگی اضافه نشده است.
- متن مجوزهای Addy، Emil و GSAP از revision بازیابی‌شدهٔ همان مخزن آمده و fingerprint مستقل دارد؛ این به معنی اثبات commit اولیهٔ نصب skill نیست.

### پیش‌نیازهایی که با کپی فراهم نمی‌شوند

| مورد | وضعیت آماده‌سازی |
| --- | --- |
| Context7 | راهنمای محلی موجود؛ MCP/شبکه پیش‌نیاز است. در مرحلهٔ برنامه‌ریزی یک درخواست Context7 با fetch failed روبه‌رو شد و مستندات رسمی مستقیم جایگزین شد؛ اتصال تضمین‌شده فرض نشود. |
| مرورگر | مسیر browser check و ابزارهای موجود ثبت شده‌اند؛ Chrome DevTools اختصاصی به‌وسیلهٔ این نصب ایجاد نشده است. Playwright/CUA فقط با گزارش واقعی ابزار، جایگزین بررسی مناسب می‌شوند. |
| Impeccable | پوشهٔ کامل reference/scripts/data/agents کپی شد؛ engine همراه بسته نبود. launcher ممکن است آن را دانلود کند. هیچ launcher، hook، live service یا باینری در این مرحله اجرا/نصب نشد. |
| Superpowers writing-plans | دو skill منتخب محلی‌اند؛ sibling skills و scripts زنجیرهٔ اجرای upstream جزو این بسته نیستند. AGENTS.md صریحاً workflow مصوب inline و ledger واحد را جایگزین handoffهای اضافی می‌کند؛ اجرای کامل plugin مستقل ادعا نمی‌شود. |
| GSAP / React / R3F | فایل راهنما موجود؛ هیچ وابستگی npm یا کد برنامه نصب نشده است. |
| GLB / Blender / بازی | مدل نهایی و Blender وجود نداشت؛ game Embed و کیفیت روی دستگاه واقعی آزموده نشده‌اند. این موارد در تسک‌های ساخت بررسی می‌شوند. |

## رتبه‌بندی تک‌تک مسیرها

در ستون اعداد، ترتیب **ت/ک/خ/س → نمره** است. «کامل» یعنی entrypoint کامل؛ «workflow» یعنی همهٔ مراحل عملی، محدودیت‌ها و پیش‌نیازهای لازم بررسی شده‌اند و مثال‌های بلند/بخش‌های غیرمرتبط کامل بازخوانی نشده‌اند.

شناسه‌های منبع: `U` = نصب کاربر در `~/.agents/skills`؛ `C` = نصب Codex در `~/.codex/skills`؛ `P` = cache افزونه در `~/.codex/plugins/cache`. این مسیرها فقط provenance هستند؛ استفادهٔ پروژه از مسیرهای محلی جدول بالاست. hash هر ردیف مربوط به فایل اصلی `SKILL.md` قبل از کپی است.

### مدیریت context و صحت منابع

| رتبه | skill و شناسه | ت/ک/خ/س → نمره | تصمیم | دلیل کاربرد | پیش‌نیاز / محدودیت | پوشش؛ کشف CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [context-engineering](../.agents/skills/context-engineering/SKILL.md) · S018 | 5/5/5/4 → **4.8** | اصلی؛ محلی نصب شد | ثبت دامنه، تصمیم‌ها و فرمان‌های واقعی مانع فراموش‌شدن room frontal و محدودیت‌های MVP می‌شود. | بدون وابستگی اجباری؛ سند و status را کوتاه نگه دارد؛ پرسش‌ها فقط برای ابهام واقعی، نه بازپرسیدن تصمیم‌های تأییدشده. | کامل؛ دیده شد |
| 2 | [context7-mcp](../.agents/skills/context7-mcp/SKILL.md) · S081 | 5/5/5/4 → **4.8** | اصلی؛ محلی نصب شد | برای APIهای React و R3F و loaderهای GLB مستندات نسخه‌دار می‌آورد و حدس را کم می‌کند. | به MCP فعال Context7 و شبکه وابسته است؛ کپی SKILL به‌تنهایی اتصال را ایجاد نمی‌کند؛ metadata مجوز MIT دارد اما متن مجوز در بسته محلی نیست.؛ متن مجوز برای کپی پروژه جداگانه بازیابی و ثبت شد. | کامل؛ دیده شد |
| 3 | `using-agent-skills` · S070 | 3/3/4/2 → **3.0** | مشروط؛ نصب پروژه ندارد | اصل فرض‌زدایی، سادگی و شواهد خوب است اما چند skill مشابه همین کار را می‌کنند. | meta-workflow و definition-of-done مفقود؛ بار همه skillها را وارد هر turn نکند؛ دستور تغییر ندادن خارج دامنه معتبر است. | workflow؛ دیده شد |
| 4 | `i-have-adhd` · S082 | 1/2/1/4 → **1.8** | مشروط؛ نصب پروژه ندارد | خروجی مرحله‌ای و کوتاه را برای خواننده‌ای که خودش این حالت را بخواهد تنظیم می‌کند. | فقط فراخوانی صریح؛ حالت تا پایان نشست پایدار است و برآورد زمان و پرسش‌های اضافه ممکن است با سبک کار فعلی ناسازگار شود. | کامل؛ دیده شد |
| 5 | `graphify` · S231 | 1/2/2/0 → **1.2** | ناسازگار با مسیر فعلی؛ نصب پروژه ندارد | برای مخزن کوچک پورتفولیو ساخت graph پایدار و semantic extraction از خواندن مستقیم پرهزینه‌تر است. | workflow نصب graphifyy حتی --break-system-packages و graphify-out و subagent پیشنهاد می‌کند؛ APIهای spawn/wait/close نمونه با ابزار فعلی یکسان نیستند؛ فقط با نیاز واقعی graph و دامنه روشن قابل توجیه است. | کامل؛ دیده شد |
| 6 | `using-superpowers` · S192 | 1/2/2/0 → **1.2** | ناسازگار با مسیر فعلی؛ نصب پروژه ندارد | قاعده احتمال یک‌درصد بارگذاری مهارت‌ها دامنه و context را برای پروژه کوچک بی‌جهت گسترش می‌دهد. | وابستگی به platform reference و زنجیره process skills دارد؛ استفاده انتخابی براساس وظیفه از blanket invocation مناسب‌تر است؛ خود skill برای subagent استثنا دارد. | کامل؛ در CLI نیامد |
| 7 | `gather-business-context` · S106 | 0/1/2/1 → **0.8** | خارج از دامنه؛ نصب پروژه ندارد | زمینه کسب‌وکار را با جست‌وجوی منابع متصل جمع می‌کند؛ brief سایت از قبل مشخص است. | منابع سازمانی و analytical question لازم دارد؛ جست‌وجوی حساب‌ها برای portfolio مجاز نشده است. | کامل؛ در CLI نیامد |
| 8 | `create-data-context` · S104 | 0/1/2/0 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | ترجیحات و تعاریف تحلیل را به skill و plugin قابل نصب تبدیل می‌کند؛ مهارت عمومی مدیریت context پروژه نیست. | مخاطب شخصی یا مشترک و منابع باید روشن شود؛ persistence و نصب اضافی لازم نیست. | workflow؛ در CLI نیامد |

### برنامه‌ریزی و اجرای مرحله‌ای

| رتبه | skill و شناسه | ت/ک/خ/س → نمره | تصمیم | دلیل کاربرد | پیش‌نیاز / محدودیت | پوشش؛ کشف CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `incremental-implementation` · S048 | 5/5/5/4 → **4.8** | اصلی؛ نصب پروژه ندارد | prototype اتاق، تعامل مانیتور، برد و سپس GLB را به برش‌های قابل سنجش تقسیم می‌کند. | مرجع definition-of-done مفقود است؛ commit هر برش تابع مجوز کاربر است و فعلاً ممنوع؛ feature flag بی‌نیاز اضافه نشود. | workflow؛ دیده شد |
| 2 | [planning-and-task-breakdown](../.agents/skills/planning-and-task-breakdown/SKILL.md) · S058 | 5/5/5/4 → **4.8** | اصلی؛ محلی نصب شد | وابستگی taskها، acceptance و checkpoint را پیش از کد واضح می‌کند. | تعریف done در ../../references مفقود؛ plan ناقص موجود را overwrite نمی‌کند؛ Plan Mode ابزار نیست، رفتار read-only است.؛ منابع مشترک لازم در کپی پروژه بازیابی شده‌اند. | کامل؛ دیده شد |
| 3 | `spec-driven-development` · S065 | 5/5/5/3 → **4.6** | اصلی؛ نصب پروژه ندارد | تعریف دامنه و acceptance پیش از implementation با ترجیح کاربر سازگار است. | چهار gate و احتمال module map؛ برای portfolio کوچک به یک spec روشن محدود بماند؛ تأیید آماده‌سازی تأیید کدنویسی نیست. | workflow؛ دیده شد |
| 4 | `constraint-driven-development` · S017 | 4/4/5/1 → **3.6** | مشروط؛ نصب پروژه ندارد | می‌تواند budget، کیفیت و ممنوعیت backend را به قرارداد قابل اجرا تبدیل کند. | چهار پرسش و نصب ابزار و floor guard دارد؛ بسته کامل Stryker/Semgrep برای پروژه کوچک زیاد است؛ بدون انتخاب کاربر ابزار نصب نشود. | workflow؛ دیده شد |
| 5 | [writing-plans](../.agents/skills/writing-plans/SKILL.md) · S194 | 4/4/4/2 → **3.6** | مشروط؛ محلی نصب شد | نقشه فایل‌ها و interface و command پذیرش، تبدیل prototype به GLB را قابل تحویل می‌کند. | spec تاییدشده و plan artifact و handoff به executing/SDD لازم دارد؛ الزام test و commit هر task برای تغییرهای ظاهری باید در دامنه واقعی اعمال شود؛ یک SKILL به‌تنهایی زنجیره را کامل نمی‌کند. | کامل؛ در CLI نیامد |
| 6 | `executing-plans` · S184 | 3/4/4/1 → **3.0** | مشروط؛ نصب پروژه ندارد | اجرای inline برنامه تاییدشده و ledger از تکرار task بعد از compaction جلوگیری می‌کند. | تنها SKILL کافی نیست: scripts/task-start و task-done و sibling SDD scripts و TDD و review و finishing لازم‌اند؛ worktree و commitهای متعدد و reviewer نهایی سربارند. | کامل؛ در CLI نیامد |
| 7 | `apex` · S004 | 3/3/4/1 → **2.8** | مشروط؛ نصب پروژه ندارد | قرارداد، شواهد و توقف امن را در چرخه کامل توسعه نگه می‌دارد. | ده مرحله، state در .agents/apex/runs و Python؛ برای آماده‌سازی کوچک زیاد است؛ شروع اجرا از آن فعلاً مجاز نیست. | کامل؛ دیده شد |
| 8 | `brainstorming` · S181 | 3/4/4/0 → **2.8** | مشروط؛ نصب پروژه ندارد | برای روشن‌کردن brief و معیار پذیرش مفید است اما چند gate spec و plan برای این جهت مشخص تکرار ایجاد می‌کند. | پروژه تازه architectural محسوب می‌شود و gateهای جدا و commit spec و handoff اجباری دارد؛ تحت دستور صریح کاربر و اجازه‌های قبلی باید تفسیر شود؛ visual companion اختیاری و Node/server dependent است. | کامل؛ در CLI نیامد |
| 9 | `doubt-driven-development` · S025 | 3/4/4/0 → **2.8** | مشروط؛ نصب پروژه ندارد | برای فرض پرخطر embed بازی یا دارایی GLB یک بررسی مستقل مفید است. | reviewer تازه و پیشنهاد اجباری cross-model در هر چرخه؛ orchestration-patterns مرجع مفقود است؛ اصطکاک زیاد برای استفاده پیش‌فرض. | workflow؛ دیده شد |
| 10 | `dispatching-parallel-agents` · S183 | 2/3/3/2 → **2.4** | مشروط؛ نصب پروژه ندارد | برای تحقیق asset و بررسی مستقل بخش‌ها در صورت مجوز موازی‌کاری مفید است. | فقط وظایف مستقل بدون فایل مشترک؛ ابزار subagent و verification ادغام لازم است؛ هماهنگی دوربین و صحنه را نباید خودکار موازی کرد. | کامل؛ در CLI نیامد |
| 11 | `idea-refine` · S044 | 2/3/3/2 → **2.4** | مشروط؛ نصب پروژه ندارد | اگر ایده یک تعامل هنوز باز باشد، واگرایی سپس همگرایی کمک می‌کند. | طرح اتاق و دامنه قبلاً تثبیت شده؛ بازکردن تمام تصمیم‌ها هدررفت است؛ ذخیره one-pager نیازمند تأیید است. | workflow؛ دیده شد |
| 12 | `improve` · S047 | 2/3/4/1 → **2.4** | مشروط؛ نصب پروژه ندارد | بعد از ایجاد کد برای audit و برنامه اصلاحِ شاهددار مفید است. | فقط plans می‌نویسد؛ اجرای مستقیم را رد می‌کند و برای execute agent/worktree می‌خواهد؛ برای پروژه خالی اضافه است. | workflow؛ دیده شد |
| 13 | `interview-me` · S049 | 2/3/4/1 → **2.4** | مشروط؛ نصب پروژه ندارد | برای یک ابهام محصولی آینده مناسب است. | پرسش تک‌تک و confidence و تأیید صریح؛ تصمیم‌های تأییدشده portfolio را دوباره مصاحبه نکند. | workflow؛ دیده شد |
| 14 | `subagent-driven-development` · S188 | 2/3/4/0 → **2.2** | ناسازگار با مسیر فعلی؛ نصب پروژه ندارد | ledger و review task مفیدند ولی fresh implementer و reviewer برای هر گام با تغییر کوچک و سریع این سایت همخوان نیست. | ابزار agent و چند prompt و scripts و worktree و Git history و model selection و پنج دور fix لازم‌اند؛ بدون درخواست صریح delegation نباید فعال شود؛ کپی تنها SKILL workflow ناقص می‌دهد. | کامل؛ در CLI نیامد |
| 15 | `design-kpis` · S105 | 1/2/3/2 → **1.8** | مشروط؛ نصب پروژه ندارد | تعریف شاخص موفقیت مدل را برای شواهد پروژه روشن می‌کند؛ طراحی سنجه کل سایت هدف نیست. | baseline و denominator و داده واقعی لازم است؛ نباید KPI نمایشی اختراع شود. | کامل؛ در CLI نیامد |
| 16 | `figma-use-figjam` · S131 | 1/1/3/1 → **1.4** | مشروط؛ نصب پروژه ندارد | اگر کاربر board برنامه‌ریزی در FigJam خواست، نوع node و فونت و connector را درست مدیریت می‌کند. | board داخل اتاق portfolio با FigJam board یکی نیست؛ Figma MCP لازم است. | کامل؛ در CLI نیامد |
| 17 | `grill-me` · S034 | 1/1/1/0 → **0.8** | ناسازگار با مسیر فعلی؛ نصب پروژه ندارد | این فایل فقط واسط است و workflow مستقلی برای بررسی برنامه ندارد. | تنها دستور آن فراخوانی skill به نام grilling است؛ در inventory و فهرست موجود چنین skillای نیست. | کامل؛ دیده شد |
| 18 | `product-business-analysis` · S112 | 0/1/2/1 → **0.8** | خارج از دامنه؛ نصب پروژه ندارد | توصیه محصول و کسب‌وکار را از داده و tradeoff استخراج می‌کند؛ معماری frontend یا گزینش skill هدفش نیست. | سؤال تصمیم و داده معتبر و مقایسه لازم است. | کامل؛ در CLI نیامد |
| 19 | `market-sizing` · S110 | 0/0/1/1 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | TAM و SAM و SOM و sensitivity فرصت بازار را محاسبه می‌کند؛ تصمیم طراحی اتاق یا انتخاب پروژه نیست. | منابع بازار و مفروضات و مدل قابل ممیزی لازم است. | کامل؛ در CLI نیامد |

### سادگی و جلوگیری از over-engineering

| رتبه | skill و شناسه | ت/ک/خ/س → نمره | تصمیم | دلیل کاربرد | پیش‌نیاز / محدودیت | پوشش؛ کشف CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [ponytail](../.agents/skills/ponytail/SKILL.md) · S212 | 5/5/4/5 → **4.8** | اصلی؛ محلی نصب شد | ویژگی‌های حذف‌شده را حذف نگه می‌دارد و prototype سپس GLB را با کمترین کد و تست منطقی اجرا می‌کند. | standalone و بدون حساب است؛ full نباید accessibility و تست لازم و calibration GPU را حذف کند؛ برای انتقال مجوز MIT و notice بسته حفظ شود. | کامل؛ دیده شد |
| 2 | [code-simplification](../.agents/skills/code-simplification/SKILL.md) · S016 | 4/4/4/4 → **4.0** | مشروط؛ محلی نصب شد | پس از prototype برای حذف wrapper و state اضافه بدون تغییر رفتار مفید است. | فقط فایل‌های درگیر و با baseline تست؛ برای شروع پروژه خالی یا بازطراحی آزاد نیست. | workflow؛ دیده شد |
| 3 | `thermo-nuclear-code-quality-review` · S067 | 2/3/4/1 → **2.4** | مشروط؛ نصب پروژه ندارد | برای بدهی ساختاری جدی بعدی بررسی سخت‌گیرانه می‌دهد؛ برای prototype کوچک شدت زیاد دارد. | disable-model-invocation و بازبینی بلند؛ structural refactor نباید از آستانه‌های مکانیکی یا خارج scope نتیجه شود. | workflow؛ دیده شد |

### پیاده‌سازی رابط وب

| رتبه | skill و شناسه | ت/ک/خ/س → نمره | تصمیم | دلیل کاربرد | پیش‌نیاز / محدودیت | پوشش؛ کشف CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [frontend-ui-engineering](../.agents/skills/frontend-ui-engineering/SKILL.md) · S031 | 5/5/5/4 → **4.8** | اصلی؛ محلی نصب شد | ساخت DOM overlay قابل دسترس، state محدود و responsive را برای مانیتور و برد پوشش می‌دهد. | مرجع ../../references/accessibility-checklist.md مفقود است؛ R3F/GLB تخصصی را پوشش نمی‌دهد؛ backend از مثال‌ها وارد نشود. نمونه &lt;dialog open&gt; برخلاف comment آن focus trap واقعی ایجاد نمی‌کند؛ برای modal از showModal یا primitive معتبر استفاده شود.؛ منابع مشترک لازم در کپی پروژه بازیابی شده‌اند. | کامل؛ دیده شد |
| 2 | [vercel-react-best-practices](../.agents/skills/vercel-react-best-practices/SKILL.md) · S074 | 5/5/5/4 → **4.8** | اصلی؛ محلی نصب شد | lazy-load صحنه، bundle و جلوگیری از rerender پرهزینه برای R3F و overlayها مرتبط‌اند. | AGENTS.md و ruleها باید کامل vendor شوند؛ بخش server/RSC/Next خارج Vite است؛ render-loop تخصص Three را جایگزین نمی‌کند. | کامل؛ دیده شد |
| 3 | `web-design-guidelines` · S078 | 4/4/5/4 → **4.2** | مشروط؛ نصب پروژه ندارد | بازبینی terse با file:line برای keyboard، focus و overlay مفید است. | راهنما را هر review از URL GitHub fetch می‌کند؛ bundle محلی به تنهایی offline کامل نیست؛ این audit remote را واکشی نکرده. | workflow؛ دیده شد |
| 4 | `make-interfaces-feel-better` · S050 | 4/4/4/4 → **4.0** | مشروط؛ نصب پروژه ندارد | hit area، focus، تایپوگرافی و border/shadow روی panelهای DOM کیفیت می‌دهد. | قواعد عددی اجباری مانند scale .96 را با حرکت 3D یکی نگیرید؛ با animate/emil هم‌پوشان است؛ styling جدید اضافه نمی‌کند. | workflow؛ دیده شد |
| 5 | `vercel-composition-patterns` · S072 | 3/4/4/4 → **3.6** | مشروط؛ نصب پروژه ندارد | هنگام رشد panelها، composition و state provider را روشن می‌کند. | ruleها و AGENTS.md باید همراه باشند؛ React 19 با نسخه نصب‌شده تطبیق بخورد؛ compound component برای دو پنل ساده الزام نیست. | workflow؛ دیده شد |
| 6 | `figma-design-to-code` · S122 | 3/4/4/3 → **3.4** | مشروط؛ نصب پروژه ندارد | اگر مرجع Figma ارائه شد، کد را با screenshot و assets و conventions پروژه تطبیق می‌دهد. | Figma MCP و فایل قابل دسترسی لازم است؛ مستقیماً مدل GLB یا صحنه R3F تولید نمی‌کند. | کامل؛ در CLI نیامد |
| 7 | `pick-ui-library` · S057 | 3/3/3/4 → **3.2** | مشروط؛ نصب پروژه ندارد | اگر dialog یا primitive واقعی لازم شد، استفاده از وابستگی موجود را مقدم می‌داند. | فهرست توصیه کتابخانه تخصص GLB نیست؛ فقط برای نیاز واقعی dependency اضافه شود؛ انتخاب تحمیلی با MVP ساده تعارض می‌سازد. | workflow؛ دیده شد |
| 8 | `ui-styling` · S068 | 3/4/4/2 → **3.2** | مشروط؛ نصب پروژه ندارد | اگر Tailwind/shadcn انتخاب شوند، dialog و responsive و theme کمک می‌کند. | Tailwind/shadcn هنوز نیاز قطعی نیستند؛ مخلوط الگوهای config نسخه‌ها باید با dependency واقعی چک شود؛ به Three styling مربوط نیست. | workflow؛ دیده شد |
| 9 | `21st-ui-build` · S225 | 3/3/3/1 → **2.6** | مشروط؛ نصب پروژه ندارد | حفظ token و primitive و accessibility برای DOM مناسب است ولی کاتالوگ محور بودن برای صحنه سفارشی ارزش محدودی دارد. | به CLI و فایل .21st/design.json و review command وابسته است؛ init و نصب و credit را نباید فقط به‌علت نام UI اجرا کرد. | کامل؛ دیده شد |
| 10 | `21st-cli-use` · S222 | 2/3/2/2 → **2.2** | مشروط؛ نصب پروژه ندارد | برای جزء DOM قابل استفاده مثل پنل معرفی می‌توان کاتالوگ را جستجو کرد؛ صحنه مخصوص اتاق از آن درنمی‌آید. | CLI و retrieval quota و احتمال نصب dependency دارد؛ دستور search-before-every-component برای هندسه ساده R3F سربار دارد؛ اتصال و مجوز asset باید مستقل بررسی شوند. | کامل؛ دیده شد |
| 11 | `ask-sonner` · S009 | 1/1/2/4 → **1.8** | مشروط؛ نصب پروژه ندارد | فقط اگر کپی ایمیل یا عملیات واقعی نیازمند toast شد کاربرد دارد. | نیازمند Sonner؛ برای سایت فعلی toast و وابستگی آن لازم نیست؛ Toaster باید یک‌بار mount شود. | workflow؛ دیده شد |
| 12 | `build-dashboard` · S100 | 0/1/2/0 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | داشبورد اندازه‌گیری با shell و فیلتر و provenance مخصوص Data می‌سازد؛ اتاق سه‌بعدی portfolio نیست. | starter و runtime و snapshot قراردادی Data لازم است؛ نباید آن‌ها را وارد Vite portfolio کرد. | کامل؛ در CLI نیامد |
| 13 | `transformers-js` · S149 | 0/1/2/0 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | inference واقعی در مرورگر بدون server ممکن می‌کند، ولی دانلود مدل و WebGPU و مصرف حافظه به هدف portfolio ربطی ندارد. | AI demo در scope نیست؛ پیش از فعال‌سازی بودجه model و سازگاری مرورگر و fallback مستقل لازم است. | workflow؛ در CLI نیامد |

### طراحی و وفاداری بصری

| رتبه | skill و شناسه | ت/ک/خ/س → نمره | تصمیم | دلیل کاربرد | پیش‌نیاز / محدودیت | پوشش؛ کشف CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [frontend-design](../.agents/skills/frontend-design/SKILL.md) · S228 | 5/5/4/5 → **4.8** | اصلی؛ محلی نصب شد | brief صریح اتاق را مقدم می‌داند و جسارت را در یک عنصر اصلی متمرکز می‌کند؛ برای پرهیز از portfolio قالبی مناسب است. | برنامه token و typography و screenshot لازم است؛ ابزار یا حساب بیرونی نمی‌خواهد؛ LICENSE.txt Apache-2.0 همراه نگهداری شود؛ کیفیت GLB و GPU خارج تخصص متن است. | کامل؛ دیده شد |
| 2 | `impeccable` · S045 | 4/5/5/2 → **4.0** | مشروط؛ نصب پروژه ندارد | shape و craft-floor و بازبینی محدود می‌توانند جهت هنری اتاق و overlay را دقیق کنند. | launcher context ممکن است binary دانلود کند؛ PRODUCT/DESIGN و تأیید جهت می‌خواهد؛ جایگزین R3F تخصصی نیست و در این audit اجرا نشده. | workflow؛ دیده شد |
| 3 | [emil-design-eng](../.agents/skills/emil-design-eng/SKILL.md) · S026 | 4/4/4/3 → **3.8** | مشروط؛ محلی نصب شد | کیفیت panel، خوانایی و حس حرکت را بهبود می‌دهد. | با animate هم‌پوشانی زیاد دارد؛ قواعد DOM و جدول Before/After؛ درباره pipeline مدل سه‌بعدی راهنمای اختصاصی ندارد. | workflow؛ دیده شد |
| 4 | `ui-ux-pro-max` · S069 | 4/4/4/3 → **3.8** | مشروط؛ نصب پروژه ندارد | راهنمای contrast، touch، حرکت و جستجوی threejs برای این رابط مفید است. | Python stdlib و CSVها؛ script مسیر مطلق ~/.agents دارد و برای vendoring باید به نسخه محلی هدایت شود؛ توصیه dataset سند رسمی R3F نیست. | workflow؛ دیده شد |
| 5 | [impeccable](../.agents/skills/impeccable/SKILL.md) · S151 | 4/4/4/1 → **3.4** | مشروط؛ محلی نصب شد | حالت Experience و الزام وفاداری به brief برای اتاق نمای روبه‌رو مفید است؛ چرخه کامل آن هزینه زیادی دارد. | کپی تنها SKILL ناکافی است: reference و scripts و data و agents لازم‌اند؛ launcher باینری نسخه 0.1.5 می‌خواهد و ممکن است دانلود کند؛ بسته باینری همراه ندارد، cache محلی موجود است؛ metadata Apache-2.0 دارد اما متن LICENSE محلی نیست. concept-seed، صفحه انتخاب، comp و reviewer/documenter برای این brief محدود سربارند.؛ متن مجوز برای کپی پروژه جداگانه بازیابی و ثبت شد. | کامل؛ در CLI نیامد |
| 6 | `imagegen` · S216 | 3/4/3/3 → **3.2** | مشروط؛ نصب پروژه ندارد | برای concept اتاق یا texture bitmap مناسب است؛ هندسه تعاملی و GLB تولید نمی‌کند. | پیش‌فرض built-in بدون کلید است؛ CLI فقط انتخاب صریح و کلید می‌خواهد؛ references prompting/sample-prompts و alpha واقعی و کپی asset منتخب به workspace لازم‌اند. | کامل؛ دیده شد |
| 7 | `prototype` · S059 | 3/4/4/2 → **3.2** | مشروط؛ نصب پروژه ندارد | برای آزمودن چند جهت مشخص اتاق با تعامل واقعی و harness جدا مفید است. | الزام سه variant و picker با یک prototype منتخب برابر نیست؛ تنها اگر مقایسه خواسته شد اجرا شود؛ فایل PICKER باید همراه کپی شود. | workflow؛ دیده شد |
| 8 | `apple-design` · S007 | 3/3/4/2 → **3.0** | مشروط؛ نصب پروژه ندارد | پیوستگی فضایی و پاسخ فوری به کلیک برای تجربه اتاق کاربرد دارد. | بخش عمده drag، momentum و haptics خارج دامنه است؛ اصول وب را گزینشی بخوانید؛ تست سخت‌افزار لازم است. | workflow؛ دیده شد |
| 9 | `brand` · S011 | 3/3/3/2 → **2.8** | مشروط؛ نصب پروژه ندارد | هماهنگی لحن انگلیسی، رنگ و معرفی مهندس AI را پشتیبانی می‌کند. | Node و سند brand-guidelines ورودی؛ tokenها خروجی پروژه‌اند؛ گردش‌کار کامل هویت بصری برای این دامنه سنگین است. | workflow؛ دیده شد |
| 10 | `design-system` · S022 | 3/3/3/2 → **2.8** | مشروط؛ نصب پروژه ندارد | توکن مشترک رنگ، نور و typography برای DOM و صحنه مفید است. | سه لایه کامل و بخش slide زیاده‌روی است؛ Node برای generatorها؛ assets/design-tokens فایل خروجی است، نه منبع ازدست‌رفته. | workflow؛ دیده شد |
| 11 | `visualize` · S083 | 2/3/2/3 → **2.4** | مشروط؛ نصب پروژه ندارد | برای مقایسه طرح اتاق در گفتگو مفید است؛ خروجی آن پیاده‌سازی سایت یا نمونه واقعی R3F نیست. | قالب HTML محدود به CSP و CDNهای مجاز است و شبکه API ندارد؛ tweak.md برای گزینه‌های طراحی لازم می‌شود؛ سکوت اجباری آن زیر دستورهای بالاتر قرار می‌گیرد. | کامل؛ دیده شد |
| 12 | `21st-ai` · S221 | 2/3/2/1 → **2.0** | مشروط؛ نصب پروژه ندارد | طرح HTML چندگزینه‌ای برای لایه DOM می‌دهد اما اتاق WebGL را در stack نهایی پیاده نمی‌کند. | CLI یا MCP و login و AI-enabled صریح و credit لازم است؛ خام HTML باید در React بازسازی شود؛ نبود AI مجوز fallback generation نیست. | کامل؛ دیده شد |
| 13 | `21st-ui-explore` · S226 | 2/3/2/1 → **2.0** | مشروط؛ نصب پروژه ندارد | فقط وقتی جهت بصری باز باشد گزینه‌های معنادار و مقایسه‌پذیر می‌سازد. | جهت اتاق frontal تا حد زیادی مشخص است؛ CLI و design context و سه preview و انتخاب کاربر سربارند؛ AI generation فقط با access صریح. | کامل؛ دیده شد |
| 14 | `design` · S023 | 2/3/2/1 → **2.0** | مشروط؛ نصب پروژه ندارد | برای لوگو یا asset مخصوص در صورت درخواست بعدی قابل استفاده است. | Python و Gemini key/کتابخانه‌ها؛ مسیرهای .claude و وابستگی ai-multimodal؛ مجموعه CIP و slide با اتاق R3F ارتباط مستقیم ندارد. | workflow؛ دیده شد |
| 15 | `figma-generate-design` · S123 | 2/2/3/1 → **2.0** | مشروط؛ نصب پروژه ندارد | در صورت نیاز به طرح دوبعدی پنل مانیتور، لایه‌های editable و design token را در Figma می‌سازد. | Figma output و design system باید خواسته شود؛ برای یک اتاق سه‌بعدی مرحله اجباری نیست. | workflow؛ در CLI نیامد |
| 16 | `figma-create-new-file` · S121 | 1/1/3/3 → **1.8** | مشروط؛ نصب پروژه ندارد | انتخاب plan و نوع editor برای فایل Figma جدید را درست انجام می‌دهد. | تنها اگر طراحی در Figma انتخاب شود؛ plan و دسترسی زنده باید بررسی شود. | کامل؛ در CLI نیامد |
| 17 | `visualize-data` · S118 | 1/3/3/1 → **1.8** | مشروط؛ نصب پروژه ندارد | برای شکل ثابت benchmark در case study، مقیاس و عدم قطعیت و accessibility نمودار را روشن می‌کند. | اعداد reviewed و renderer سطح انتخاب‌شده لازم است؛ palette روشن و Data runtime نباید به اتاق تاریک تحمیل شود. | workflow؛ در CLI نیامد |
| 18 | `banner-design` · S010 | 1/2/2/1 → **1.4** | خارج از دامنه؛ نصب پروژه ندارد | تولید بنر چنداندازه‌ای ارتباط مستقیم با اتاق سه‌بعدی ندارد. | Python، Gemini و مسیرهای .claude/skills/ai-artist، ai-multimodal و chrome-devtools؛ موجودبودن وابستگی‌های خارجی تأیید نشده. | workflow؛ دیده شد |
| 19 | `figma-generate-library` · S125 | 1/1/3/0 → **1.2** | خارج از دامنه؛ نصب پروژه ندارد | سیستم design token و component library در Figma می‌سازد؛ برای سایت کوچک library جدا نیاز نیست. | figma-use و ledger و کنترل variant و binding لازم است؛ از full library بدون درخواست پرهیز شود. دستور اجرای ترتیبی use_figma با fan-out موازی چندصفحه‌ای در figma-use ناسازگار است؛ قبل از استفاده باید حل شود. | workflow؛ در CLI نیامد |
| 20 | `figma-shaders` · S128 | 0/1/2/0 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | shader effect یا fill را در کتابخانه Figma با WebGPU می‌نویسد؛ راهنمای Three.js یا GLSL سایت نیست. | Figma shader tool و plan و authoring contract لازم است؛ فعال‌سازی به خاطر واژه shader نادرست است. | کامل؛ در CLI نیامد |
| 21 | `figma-use-slides` · S133 | 0/1/2/0 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | ساخت اسلاید در Figma با layout و speaker note را پوشش می‌دهد؛ deck خواسته نشده است. | figma-use و Slides file و API اختصاصی لازم است. اشاره به closePlugin در validation با figma-use که closePlugin را منع می‌کند ناسازگار است. | workflow؛ در CLI نیامد |
| 22 | `gpt-taste` · S033 | 0/1/1/0 → **0.4** | ناسازگار با مسیر فعلی؛ نصب پروژه ندارد | AIDA، فاصله‌های عظیم، بِنْتو و ScrollTrigger اجباری با اتاق compact frontal تضاد دارد. | تصادفی‌سازی شبیه‌سازی‌شده و اجبار GSAP و hover روی همه کارت‌ها؛ نباید به صورت پیش‌فرض فعال یا vendor شود. | workflow؛ دیده شد |

### موشن و انیمیشن

| رتبه | skill و شناسه | ت/ک/خ/س → نمره | تصمیم | دلیل کاربرد | پیش‌نیاز / محدودیت | پوشش؛ کشف CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `animate` · S002 | 5/5/5/4 → **4.8** | اصلی؛ نصب پروژه ندارد | حرکت هدفمند برای بازشدن پروفایل و برد؛ انتخاب ابزار سبک و reduced-motion از ابتدا. | قواعد DOM/CSS برای خود صحنه R3F کافی نیست؛ وابستگی اجباری ندارد و Motion فقط در صورت نیاز. | workflow؛ دیده شد |
| 2 | [review-animations](../.agents/skills/review-animations/SKILL.md) · S060 | 4/4/5/4 → **4.2** | مشروط؛ محلی نصب شد | قبل از polish، reduced-motion، interruption و origin پنل را کنترل می‌کند. | فقط review و معیارهای عمدتاً DOM؛ بررسی perceptual روی مرورگر و سنجش GPU صحنه همچنان لازم است. | workflow؛ دیده شد |
| 3 | [gsap-react](../.agents/skills/gsap-react/SKILL.md) · S039 | 3/4/5/4 → **3.8** | مشروط؛ محلی نصب شد | در صورت انتخاب GSAP، scoping و revert و callback امن در React خطاهای cleanup را کم می‌کند. | gsap و در مسیر ترجیحی @gsap/react؛ این skill نباید انتخاب کتابخانه را بدون نیاز تحمیل کند. | workflow؛ دیده شد |
| 4 | [gsap-timeline](../.agents/skills/gsap-timeline/SKILL.md) · S041 | 3/4/4/4 → **3.6** | مشروط؛ محلی نصب شد | اگر ورود به اتاق یا زوم مانیتور چندمرحله‌ای شد، timeline به هماهنگی کمک می‌کند. | نیازمند GSAP و یک sequence واقعی؛ برای transition ساده CSS/R3F کافی است. | workflow؛ دیده شد |
| 5 | `find-animation-opportunities` · S027 | 3/3/4/4 → **3.4** | مشروط؛ نصب پروژه ندارد | بعد از prototype فرصت حرکت محدود و هدفمند را با رد گزینه‌های اضافه پیدا می‌کند. | فقط گزارش read-only و حداکثر ۵ تا ۷ پیشنهاد؛ قبل از وجود UI سود کمی دارد. | workflow؛ دیده شد |
| 6 | [gsap-core](../.agents/skills/gsap-core/SKILL.md) · S035 | 3/4/4/3 → **3.4** | مشروط؛ محلی نصب شد | در صورت انتخاب GSAP، tween دوربین/نور یا پنل‌ها را قابل‌کنترل می‌کند. | gsap هنوز تصمیم لازم پروژه نیست؛ به جای R3F useFrame یا CSS برای تغییر ساده تحمیل نشود؛ مستندات نسخه نصب‌شده بررسی شود. | workflow؛ دیده شد |
| 7 | `animation-vocabulary` · S003 | 3/3/2/5 → **3.2** | مشروط؛ نصب پروژه ندارد | برای نام‌گذاری دقیق zoom، reveal و transition هنگام گفتگو درباره اتاق مفید است. | صرفاً واژه‌نامه است؛ پیاده‌سازی یا سنجش عملکرد ندارد؛ متن تعریف را عیناً می‌خواهد. | workflow؛ دیده شد |
| 8 | `figma-implement-motion` · S127 | 3/4/4/2 → **3.2** | مشروط؛ نصب پروژه ندارد | در صورت مرجع animated Figma، زمان‌بندی و easing و pivot را به motion موجود پروژه ترجمه می‌کند. | get_motion_context و design context لازم است؛ حرکت سه‌بعدی R3F را پوشش مستقیم نمی‌دهد و fallback video برای این scope مناسب نیست. راهنمای asset URL موقت در این مهارت با الزام download asset در figma-design-to-code نیازمند هماهنگی است. | کامل؛ در CLI نیامد |
| 9 | `gsap-utils` · S042 | 2/3/3/4 → **2.8** | مشروط؛ نصب پروژه ندارد | clamp و interpolation در صورت حضور GSAP مفیدند. | فقط به خاطر چند محاسبه نباید GSAP نصب کرد؛ ریاضی ساده و Three ابزارهای موجود اولویت دارند. | workflow؛ دیده شد |
| 10 | `gsap-plugins` · S038 | 2/3/3/2 → **2.4** | مشروط؛ نصب پروژه ندارد | تنها برای یک نیاز صریح مانند متن یا SVG می‌تواند مفید باشد. | بیشتر pluginها مانند Draggable و ScrollSmoother خارج MVP‌اند؛ نصب و ثبت فقط plugin لازم، نه مجموعه کامل. | workflow؛ دیده شد |
| 11 | `improve-animations` · S046 | 2/3/4/1 → **2.4** | مشروط؛ نصب پروژه ندارد | پس از داشتن motion برای برنامه اصلاح دقیق و مستقل مفید است. | read-only و plans؛ هم‌پوشان با review-animations و برای این اندازه معمولاً سنگین‌تر است. | workflow؛ دیده شد |
| 12 | `gsap-scrolltrigger` · S040 | 1/2/3/2 → **1.8** | خارج از دامنه؛ نصب پروژه ندارد | اتاق fixed frontal به scroll narrative نیاز ندارد؛ pin و scrub جزء طرح نیست. | gsap/ScrollTrigger؛ فقط اگر کاربر بعداً تجربه scroll را انتخاب کرد، refresh و cleanup بررسی شود. | workflow؛ دیده شد |
| 13 | `figma-use-motion` · S132 | 1/2/3/1 → **1.6** | مشروط؛ نصب پروژه ندارد | keyframe و timeline را داخل Figma مدیریت و با نمونه فریم کنترل می‌کند. | metronome flag لازم است؛ export_video کند است و screenshot حرکت را ثابت نمی‌کند؛ برای وب R3F ضروری نیست. | کامل؛ در CLI نیامد |
| 14 | `vercel-react-view-transitions` · S076 | 1/2/3/1 → **1.6** | ناسازگار با مسیر فعلی؛ نصب پروژه ندارد | برای تغییر viewهای DOM مفید است اما راهنمای این نسخه در Vite نصب React canary را لازم می‌داند. | React canary با stable stack ریسک غیرضروری دارد؛ Next App Router در پروژه نیست؛ گذار دوربین R3F مسئله دیگری است. این نیاز canary ادعای متن نصب‌شده است و وضعیت روز React در audit زنده بررسی نشده. | workflow؛ دیده شد |
| 15 | `gsap-frameworks` · S036 | 0/1/2/3 → **1.2** | خارج از دامنه؛ نصب پروژه ندارد | برای Vue، Nuxt و Svelte است؛ پروژه React از gsap-react استفاده می‌کند. | GSAP و lifecycle فریم‌ورک دیگر؛ الگوی غیرReact را وارد نکنید. | workflow؛ دیده شد |

### تست، بازبینی و اثبات تکمیل

| رتبه | skill و شناسه | ت/ک/خ/س → نمره | تصمیم | دلیل کاربرد | پیش‌نیاز / محدودیت | پوشش؛ کشف CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [ponytail-review](../.agents/skills/ponytail-review/SKILL.md) · S211 | 5/5/5/5 → **5.0** | اصلی؛ محلی نصب شد | بازبینی diff همراه caller باگ واقعی و overhead اضافی را همزمان هدف می‌گیرد و تغییر نمی‌دهد. | به diff و کد متصل نیاز دارد؛ no-finding باید صادقانه باشد؛ برای صحت visual و GPU هنوز browser و سخت‌افزار لازم‌اند. | کامل؛ دیده شد |
| 2 | `review-agent` · S218 | 5/5/5/5 → **5.0** | اصلی؛ نصب پروژه ندارد | بازبینی مستقل تغییر را با regression واقعی و caller و test محدود می‌کند و بدون یافته خروجی خالی می‌دهد. | برای delegation بازبینی طراحی شده؛ diff معتبر و AGENTS و merge-base لازم‌اند؛ ارسال نظر یا commit یا واگذاری مجدد مجاز نیست. | کامل؛ دیده شد |
| 3 | `debugging-and-error-recovery` · S019 | 5/5/5/4 → **4.8** | اصلی؛ نصب پروژه ندارد | بازتولید، محدودکردن خطا و تست regression برای اشکال کلیک، asset و build کاربرد مستقیم دارد. | ابتدا پروژه قابل اجرا و خطای واقعی لازم است؛ دستورهای داخل error داده‌اند؛ تست و مرورگر بعد از fix لازم است. | workflow؛ دیده شد |
| 4 | [verification-before-completion](../.agents/skills/verification-before-completion/SKILL.md) · S193 | 5/5/5/4 → **4.8** | اصلی؛ محلی نصب شد | build یا تست یا تکمیل requirement را فقط با خروجی واقعی تایید می‌کند و جلوی ادعای انجام browser check نرفته را می‌گیرد. | خود متن self-contained است؛ فرمان مناسب پروژه و تست مرورگر برای ادعای بصری لازم است؛ خروجی تکراری روی ورودی ثابت صرفاً برای تشریفات نباید اجرا شود. | کامل؛ در CLI نیامد |
| 5 | [browser-testing-with-devtools](../.agents/skills/browser-testing-with-devtools/SKILL.md) · S012 | 5/5/5/3 → **4.6** | اصلی؛ محلی نصب شد | رندر واقعی، کنسول، شبکه و accessibility را بررسی می‌کند؛ برای WebGL ضروری است. | Chrome DevTools MCP باید در دسترس باشد؛ دستور تأیید برای کلیک برنامه‌ای و ناوبری دارد که با مجوز موجود باید تفسیر شود؛ معادل Playwright عین ابزار ذکرشده نیست. | workflow؛ دیده شد |
| 6 | [code-review-and-quality](../.agents/skills/code-review-and-quality/SKILL.md) · S015 | 5/5/5/3 → **4.6** | اصلی؛ محلی نصب شد | بازبینی correctness، سادگی و cleanup و شدت‌بندی یافته‌ها جلوی خطای تعامل و نشت resource را می‌گیرد. | دو checklist در ../../references موجود نیست؛ بازبینی چندمدلی اختیاری و نیازمند مجوز است؛ شواهد build/browser باید واقعی باشد.؛ منابع مشترک لازم در کپی پروژه بازیابی شده‌اند. | workflow؛ دیده شد |
| 7 | `systematic-debugging` · S189 | 4/4/5/3 → **4.0** | مشروط؛ نصب پروژه ندارد | برای صفحه سیاه WebGL و خطای loader و build، بازتولید و یک فرضیه در هر بار از آزمون تصادفی جلوگیری می‌کند. | برای bug واقعی؛ references tracing/waiting و TDD و verification باید همراه باشند؛ نمونه چاپ env ممکن است secret نشان دهد و نباید عیناً اجرا شود؛ سه شکست توقف معماری دارد. | کامل؛ در CLI نیامد |
| 8 | [test-driven-development](../.agents/skills/test-driven-development/SKILL.md) · S066 | 4/4/5/3 → **4.0** | مشروط؛ محلی نصب شد | برای state باز/بسته، keyboard و fallback آزمون رفتار پیش از کد سودمند است. | testing-patterns مرجع مفقود؛ تست config و محتوای ثابت را مستثنا می‌کند؛ کیفیت تصویر و FPS از unit test ثابت نمی‌شود.؛ منابع مشترک لازم در کپی پروژه بازیابی شده‌اند. | workflow؛ دیده شد |
| 9 | `ponytail-audit` · S207 | 3/4/4/4 → **3.6** | مشروط؛ نصب پروژه ندارد | پس از شکل‌گرفتن مخزن، نقص و کد اضافی را با سناریوی واقعی و کوچک‌ترین اصلاح گزارش می‌کند. | read-only audit صریح؛ برای مخزن خالی ارزش کمی دارد؛ benchmark یا مقیاس Backend نباید جای بودجه GPU و دسترس‌پذیری بنشیند. | کامل؛ دیده شد |
| 10 | `receiving-code-review` · S186 | 3/4/4/3 → **3.4** | مشروط؛ نصب پروژه ندارد | پیشنهاد reviewer را با repo و caller می‌سنجد و از افزودن feature حرفه‌ای بی‌مصرف جلوگیری می‌کند. | فقط هنگام دریافت feedback؛ توقف همه اصلاح‌ها به‌خاطر یک مورد مبهم ممکن است کار مستقل را کند کند؛ پاسخ GitHub همچنان اجازه صریح کاربر می‌خواهد. | کامل؛ در CLI نیامد |
| 11 | `requesting-code-review` · S187 | 3/4/4/2 → **3.2** | مشروط؛ نصب پروژه ندارد | برای feature بزرگ بازبینی مستقل با requirement و commit range مشخص می‌خواهد. | template code-reviewer.md و ابزار subagent لازم است؛ HEAD~1 برای task چندکامیتی کافی نیست و باید BASE واقعی انتخاب شود؛ همه ریزتغییرها review مستقل نمی‌خواهند. | کامل؛ در CLI نیامد |
| 12 | `test-driven-development` · S190 | 3/4/4/1 → **3.0** | مشروط؛ نصب پروژه ندارد | برای state تعامل و بازوبسته‌شدن پنل و fallback رفتارمحور مفید است؛ برای هر تغییر ظاهر قالب سخت دارد. | writing-good-tests.md لازم است؛ هر function و حتی refactor را red-green می‌خواهد و prototype exception نیازمند گفتگو دارد؛ با بررسی browser و تغییر کم‌اثر باید متناسب شود. | کامل؛ در CLI نیامد |
| 13 | `21st-ui-review` · S227 | 3/3/3/2 → **2.8** | مشروط؛ نصب پروژه ندارد | بررسی deterministic و جداسازی سلیقه از نقص واقعی برای UI نهایی مفید است. | 21st CLI و context آن لازم است؛ lint بصری WebGL یا عملکرد واقعی keyboard را اثبات نمی‌کند؛ fix فقط درخواست‌شده و deterministic. | کامل؛ دیده شد |
| 14 | `gh-fix-ci` · S230 | 2/3/4/2 → **2.6** | مشروط؛ نصب پروژه ندارد | وقتی checks واقعی GitHub Actions شکست بخورند لاگ و failure context دقیق می‌آورد. | PR و gh auth و script با Python لازم‌اند؛ provider خارجی فقط URL؛ workflow برای اجرای اصلاح gate تایید جدا دارد و CI هنوز ضرورت فعلی نیست. | کامل؛ دیده شد |
| 15 | `analyze-data-quality` · S099 | 1/2/3/2 → **1.8** | مشروط؛ نصب پروژه ندارد | اگر اعداد benchmark واقعی در شرح پروژه قرار گرفت، grain و missingness و تازگی آن‌ها را بررسی می‌کند. | داده و تعریف اندازه‌گیری لازم است؛ بانک داده یا notebook جدید برای سایت لازم نیست. | کامل؛ در CLI نیامد |
| 16 | `validate-data` · S117 | 1/2/3/1 → **1.6** | مشروط؛ نصب پروژه ندارد | اعداد و ادعاهای مهم پروژه را در صورت وجود گزارش تحلیلی واقعی مستقلاً چک می‌کند. | standalone review پیش‌فرض deep با ۲۰ تا ۳۰ دقیقه و احتمال repair است؛ audit-only باید حفظ شود. | کامل؛ در CLI نیامد |
| 17 | `metric-diagnostics` · S111 | 0/1/2/1 → **0.8** | خارج از دامنه؛ نصب پروژه ندارد | تغییر شاخص را با decomposition و بررسی driver توضیح می‌دهد؛ هیچ داده زمانی یا مسئله شاخص مطرح نیست. | تعریف metric و baseline و منابع قابل اجرا لازم است؛ متن marketing جای آن نیست. | کامل؛ در CLI نیامد |
| 18 | `huggingface-community-evals` · S141 | 0/1/2/0 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | ارزیابی واقعی مدل با inspect-ai یا lighteval و backend محلی را اجرا می‌کند؛ ساخت سایت ارزیابی ML نیست. | GPU یا provider و token و داده benchmark لازم است؛ این audit اجرای مدل را مجاز نمی‌کند. | کامل؛ در CLI نیامد |

### مستندات، نگارش و محتوای مستند

| رتبه | skill و شناسه | ت/ک/خ/س → نمره | تصمیم | دلیل کاربرد | پیش‌نیاز / محدودیت | پوشش؛ کشف CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [documentation-and-adrs](../.agents/skills/documentation-and-adrs/SKILL.md) · S024 | 5/5/5/5 → **5.0** | اصلی؛ محلی نصب شد | تصمیم R3F، راهبرد prototype سپس GLB و محدودیت embed را با دلیل ثبت می‌کند. | وابستگی اجرایی ندارد؛ قالب پروژه موجود مقدم است؛ تنها تصمیم مهم ADR بخواهد و مستندات ادعای اجرای انجام‌نشده نکنند. | کامل؛ دیده شد |
| 2 | [no-ai-slop](../.agents/skills/no-ai-slop/SKILL.md) · S152 | 4/4/4/5 → **4.2** | مشروط؛ محلی نصب شد | متن انگلیسی معرفی و brief پروژه‌ها را کوتاه و دقیق می‌کند و از ادعای مهارت یا آمار ساختگی جلوگیری می‌کند. | به پیش‌نویس واقعی نیاز دارد؛ eval.md باید همراه SKILL کپی شود؛ MIT موجود است و notice باید حفظ شود؛ بازنویسی محتوا مجوز جدا از ارزیابی متن می‌خواهد. | کامل؛ در CLI نیامد |
| 3 | `writing-guidelines` · S080 | 4/4/4/4 → **4.0** | مشروط؛ نصب پروژه ندارد | برای briefهای انگلیسی پروژه و معرفی پروفایل، وضوح و حذف ادعاهای مبهم مفید است. | راهنمای تازه remote لازم است؛ صحت ادعاهای شغلی و محتوا باید از کاربر بیاید؛ URL در audit واکشی نشده. | workflow؛ دیده شد |
| 4 | `huggingface-papers` · S147 | 2/3/3/3 → **2.6** | مشروط؛ نصب پروژه ندارد | برای توصیف دقیق روش علمی یک پروژه، مقاله و metadata و پیوند GitHub را از منبع عمومی می‌خواند. | فقط با paper یا arXiv مشخص؛ خلاصه پژوهش جای ادعای تجربه شخصی نیست و write endpoints مجاز نیستند. | کامل؛ در CLI نیامد |
| 5 | `ponytail-debt` · S208 | 2/2/2/5 → **2.6** | مشروط؛ نصب پروژه ندارد | اگر shortcut برای مدل موقت یا fallback ثبت شود ledger آن trigger ارتقا را قابل دیدن می‌کند. | فقط comment واقعی؛ persist نیازمند درخواست است؛ فرمان git grep نمونه باید با نسخه Git و ignoreهای پروژه بررسی شود. | کامل؛ دیده شد |
| 6 | `figma-generate-diagram` · S124 | 1/2/3/2 → **1.8** | مشروط؛ نصب پروژه ندارد | برای نمودار معماری واقعی پروژه قابل ارائه در case study، FigJam editable می‌سازد. | فقط پنج خانواده Mermaid پشتیبانی می‌شود؛ connector و خروجی Figma لازم است؛ خود اتاق سه‌بعدی را طراحی نمی‌کند. | کامل؛ در CLI نیامد |
| 7 | `jupyter-notebooks` · S108 | 1/2/3/2 → **1.8** | مشروط؛ نصب پروژه ندارد | برای پیوند به notebook قابل اجرا به عنوان مدرک یک پروژه AI مناسب است. | فقط اگر notebook یا محاسبه قابل بازتولید جزو محتوای واقعی باشد؛ runtime وب را تغییر نمی‌دهد. | کامل؛ در CLI نیامد |
| 8 | `build-report` · S101 | 1/2/3/1 → **1.6** | مشروط؛ نصب پروژه ندارد | برای گزارش فنی مستقل از نتایج پروژه می‌تواند روایت مستند و caveat روشن بسازد. | خروجی report app و runtime محافظت‌شده Data دارد؛ برای متن کوتاه کارت پروژه سنگین است. | کامل؛ در CLI نیامد |
| 9 | `figma-spec` · S129 | 1/1/3/2 → **1.6** | مشروط؛ نصب پروژه ندارد | brief یا PRD را فقط وقتی محل آن Figma Spec باشد با editContent دقیق نگه می‌دارد. | specs_enabled برای plan همان فایل و دسترسی Figma لازم است؛ Markdown محلی ساده‌تر است. | کامل؛ در CLI نیامد |
| 10 | `pdf` · S200 | 1/1/1/3 → **1.4** | مشروط؛ نصب پروژه ندارد | در صورت درخواست رزومه PDF قابل دانلود، بررسی چیدمان و خوانایی آن مفید می‌شود. | فعلاً PDF درخواست نشده؛ Poppler و کتابخانه‌های runtime و marker محیطی لازم‌اند؛ استخراج متن به‌تنهایی QA بصری نیست. | کامل؛ دیده شد |
| 11 | `huggingface-paper-publisher` · S146 | 1/1/2/1 → **1.2** | مشروط؛ نصب پروژه ندارد | فقط اگر مقاله واقعی خود کاربر جزو سوابق باشد، citation و لینک model یا dataset را منظم می‌کند. | claim authorship و index و upload نوشتن خارجی است؛ source و مقاله واقعی لازم است. | workflow؛ در CLI نیامد |
| 12 | `documents` · S199 | 1/1/1/1 → **1.0** | خارج از دامنه؛ نصب پروژه ندارد | فقط برای رزومه Word احتمالی مناسب است؛ briefها در سایت به artifact DOCX نیاز ندارند. | runtime و renderer اجباری و PNG همه صفحات لازم است؛ برخی مسیرها به container_tools محیط وابسته‌اند. | کامل؛ دیده شد |
| 13 | `kpi-reporting` · S109 | 0/1/2/1 → **0.8** | خارج از دامنه؛ نصب پروژه ندارد | گزارش دوره‌ای KPI با target و pacing و driver می‌سازد؛ سایت شخصی scorecard کسب‌وکار نیست. | منابع و دوره و تعاریف KPI لازم است؛ محتوا و benchmark فرضی نباید ساخته شود. | کامل؛ در CLI نیامد |
| 14 | `slides` · S063 | 0/1/1/2 → **0.8** | خارج از دامنه؛ نصب پروژه ندارد | هدف خروجی presentation است و سایت portfolio اسلاید ندارد. | references create و layout دارد؛ مسیر پارامتری {subcommand} یک placeholder است؛ نیاز جدید slide اضافه نشود. | workflow؛ دیده شد |
| 15 | `share-artifact-summary` · S116 | 0/1/1/1 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | خلاصه Data artifact را برای مقصد صریح آماده یا ارسال می‌کند؛ محتوای portfolio یا workflow Git نیست. | منبع قابل اشتراک و مقصد تأییدشده لازم است؛ ارسال خارجی از این audit مجاز نیست. | کامل؛ در CLI نیامد |
| 16 | `artifact-template-analytics-dashboard` · S157 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | داشبورد KPI در spreadsheet خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 17 | `artifact-template-business-review` · S158 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | مرور کسب‌وکار در deck خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 18 | `artifact-template-design-report` · S159 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | گزارش طراحی در Word خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 19 | `artifact-template-experiment-analysis` · S160 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | تحلیل آزمایش در Word خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 20 | `artifact-template-financial-budget` · S161 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | بودجه مالی در workbook خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 21 | `artifact-template-investment-committee-memo` · S162 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | یادداشت کمیته سرمایه‌گذاری خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 22 | `artifact-template-legal-memorandum` · S163 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | یادداشت حقوقی خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 23 | `artifact-template-market-trends-report` · S164 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | گزارش روند بازار در deck خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 24 | `artifact-template-minimal-letterhead` · S165 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | سربرگ نامه اداری خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 25 | `artifact-template-operating-calendar` · S166 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | تقویم عملیاتی در workbook خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 26 | `artifact-template-operating-review` · S167 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | مرور عملیات در deck خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 27 | `artifact-template-project-kickoff` · S168 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | جلسه kickoff در deck خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 28 | `artifact-template-project-tracker` · S169 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | پیگیری پروژه در spreadsheet خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 29 | `artifact-template-sales-pipeline` · S170 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | pipeline فروش در workbook خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 30 | `artifact-template-simple-dark-mode` · S171 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | قالب dark برای PowerPoint خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 31 | `artifact-template-simple-light-mode` · S172 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | قالب light برای PowerPoint خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 32 | `artifact-template-strategy-memorandum` · S173 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | یادداشت راهبردی خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 33 | `artifact-template-system-design` · S174 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | معماری سیستم در Word خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 34 | `artifact-template-team-alignment` · S175 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | هم‌راستایی تیم در deck خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 35 | `artifact-template-three-statement-forecast` · S176 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | پیش‌بینی سه صورت مالی خروجی وب و صحنه اتاق تولید نمی‌کند. | فقط با انتخاب صریح قالب و capability artifact مربوط؛ clone مرجع و render اجباری است؛ reference و preview محلی هر دو موجودند. | کامل؛ در CLI نیامد |
| 36 | `google-docs` · S135 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | ویرایش native Google Doc با حفظ تب‌ها و revision به محتوای محلی این پورتفولیو نیازی ندارد. | فایل مشخص و اتصال Drive لازم است؛ با ادعای router درباره اجبار DOCX برای همه اسناد جدید اختلاف دارد. | کامل؛ در CLI نیامد |
| 37 | `google-drive-comments` · S136 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | ثبت نظر دارای شاهد روی اسناد Google برای سایت بدون گردش بازبینی Drive کاربردی ندارد. | فایل و اتصال و اجازه صریح ارسال نظر لازم است؛ anchor در UI ممکن است دیده نشود. | کامل؛ در CLI نیامد |
| 38 | `Presentations` · S201 | 0/0/0/1 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | قواعد deck و speaker notes و export PPTX برای صفحات معرفی پروژه در وب نیست. | artifact-tool و runtime و render لازم دارد؛ رسم تزئینی برنامه‌ای را ممنوع می‌کند و نباید به هندسه R3F تعمیم یابد. | کامل؛ دیده شد |
| 39 | `Spreadsheets` · S203 | 0/0/0/1 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | فرمول و recalculation و XLSX به فهرست ثابت پروژه‌ها زیرساخت نامربوط اضافه می‌کند. | به runtime artifact-tool و چند reference لازم وابسته است؛ authoring با بسته‌های محلی repo را رد می‌کند. | کامل؛ دیده شد |
| 40 | `convert-to-doc` · S102 | 0/0/1/0 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | Data app موجود را به Word یا Google Doc تبدیل می‌کند؛ خروجی فعلی وب ایستا است. | Data app تأییدشده و Documents plugin و بررسی تمام صفحات لازم است. | کامل؛ در CLI نیامد |
| 41 | `convert-to-slides` · S103 | 0/0/1/0 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | Data app را با حفظ نمودار و scope به اسلاید تبدیل می‌کند؛ deck در دامنه نیست. | Presentations plugin و Data snapshot و render همه اسلایدها لازم است. | کامل؛ در CLI نیامد |
| 42 | `google-sheets` · S138 | 0/0/0/1 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | ویرایش range و فرمول و جدول native Sheets جزئی از محتوای ثابت پروژه‌ها نیست. | اتصال Google و چند مرجع اجباری و گاهی ساخت XLSX با runtime لازم دارد. | کامل؛ در CLI نیامد |
| 43 | `google-slides` · S139 | 0/0/0/1 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | کپی exemplar و کنترل masterهای Google Slides خروجی وب اتاق سه‌بعدی را جلو نمی‌برد. | deck مرجع و اتصال و renderer و runtime لازم است؛ برای deck جدید از صفر به Presentations ارجاع می‌دهد. | کامل؛ در CLI نیامد |
| 44 | `report-to-pdf` · S114 | 0/0/1/0 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | گزارش Data موجود را مستقیم به PDF تبدیل می‌کند؛ PDF خواسته نشده است. | PDF plugin و HTML و snapshot و presentation معتبر لازم است. | کامل؛ در CLI نیامد |

### Git و بازخورد GitHub

| رتبه | skill و شناسه | ت/ک/خ/س → نمره | تصمیم | دلیل کاربرد | پیش‌نیاز / محدودیت | پوشش؛ کشف CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [git-workflow-and-versioning](../.agents/skills/git-workflow-and-versioning/SKILL.md) · S032 | 5/5/5/4 → **4.8** | اصلی؛ محلی نصب شد | حفاظت از تغییرات موجود و diff محدود برای آماده‌سازی و مراحل بعد لازم است. | commit early دستور مجوز نیست؛ اکنون commit و push ممنوع‌اند؛ branch/worktree تنها با نیاز واقعی. | workflow؛ دیده شد |
| 2 | `finishing-a-development-branch` · S185 | 2/3/4/1 → **2.4** | مشروط؛ نصب پروژه ندارد | در پایان branch واقعی، تست نهایی و preservation worktree و انتخاب integration را روشن می‌کند. | full suite و base branch معلوم و انتخاب منو لازم است؛ git pull/merge/push خودکار از صرف پایان کار مجاز نمی‌شود؛ پایان فایل ایستا نباید بی‌دلیل این منو را باز کند. | کامل؛ در CLI نیامد |
| 3 | `gh-address-comments` · S229 | 2/3/3/2 → **2.4** | مشروط؛ نصب پروژه ندارد | فقط پس از وجود PR و بازخورد واقعی، commentها را به اصلاح‌های قابل انتخاب تبدیل می‌کند. | gh احرازشده و scripts/fetch_comments.py لازم است؛ انتخاب comment و اجازه reply باید روشن باشد؛ escalation در این محیط ممنوع است. | کامل؛ دیده شد |
| 4 | `using-git-worktrees` · S191 | 2/3/4/1 → **2.4** | مشروط؛ نصب پروژه ندارد | وقتی checkout کار جاری کاربر را در خود دارد isolation ارزشمند است و native tool را مقدم می‌داند. | Git repo و تصمیم worktree و baseline لازم دارد؛ در fallback تغییر .gitignore و commit و npm install تجویز می‌کند؛ اینها نباید به کار read-only یا بدون نیاز isolation تحمیل شوند. | کامل؛ در CLI نیامد |

### عملکرد و اندازه‌گیری

| رتبه | skill و شناسه | ت/ک/خ/س → نمره | تصمیم | دلیل کاربرد | پیش‌نیاز / محدودیت | پوشش؛ کشف CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [performance-optimization](../.agents/skills/performance-optimization/SKILL.md) · S056 | 5/5/5/3 → **4.6** | اصلی؛ محلی نصب شد | اندازه‌گیری bundle، بارگذاری asset و interaction قبل و بعد برای اتاق WebGL ضروری است. | checklist خارجی محلی مفقود؛ RUM برای prototype بی‌ترافیک قابل اثبات نیست؛ draw call، texture و GPU را باید با راهنمای Three جدا پوشش داد.؛ منابع مشترک لازم در کپی پروژه بازیابی شده‌اند. | workflow؛ دیده شد |
| 2 | [gsap-performance](../.agents/skills/gsap-performance/SKILL.md) · S037 | 3/4/4/4 → **3.6** | مشروط؛ محلی نصب شد | اگر GSAP استفاده شد، batching و quickSetter و cleanup مانع jank می‌شود. | نکته‌های compositor برای DOM با عملکرد mesh/shader یکی نیست؛ نیازمند GSAP واقعی و اندازه‌گیری. | workflow؛ دیده شد |
| 3 | `vercel-optimize` · S073 | 1/2/3/0 → **1.4** | خارج از دامنه؛ نصب پروژه ندارد | متریک هزینه route و function Vercel برای سایت static منتشرنشده سود کمی دارد. | CLI v53+، Node20+، linked project و Observability Plus برای تحلیل route؛ بسیاری از مراحل script/cloud هنوز بدون داده‌اند. | workflow؛ دیده شد |

### بک‌اند، داده و API

| رتبه | skill و شناسه | ت/ک/خ/س → نمره | تصمیم | دلیل کاربرد | پیش‌نیاز / محدودیت | پوشش؛ کشف CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `api-and-interface-design` · S005 | 1/2/2/3 → **1.8** | خارج از دامنه؛ نصب پروژه ندارد | بخش unionهای TypeScript قابل استفاده است اما هسته گردش‌کار endpoint و idempotency است. | هیچ API یا backend در دامنه نیست؛ pagination و قرارداد شبکه نباید به پروژه اضافه شود. | workflow؛ دیده شد |
| 2 | `deprecation-and-migration` · S021 | 0/1/2/2 → **1.0** | خارج از دامنه؛ نصب پروژه ندارد | سیستم قدیمی، مصرف‌کننده و داده مهاجرتی در این پروژه وجود ندارد. | جایگزین اثبات‌شده، اطلاع‌رسانی و migration تدریجی می‌خواهد؛ این تشریفات به prototype اضافه نشود. | workflow؛ دیده شد |
| 3 | `huggingface-gradio` · S143 | 0/1/2/1 → **0.8** | ناسازگار با مسیر فعلی؛ نصب پروژه ندارد | رابط Python Gradio و event backend می‌سازد؛ با React TypeScript Vite ایستا و بدون backend سازگار نیست. | فقط به عنوان پروژه مستقل موجود می‌تواند لینک شود؛ نباید جای UI اتاق را بگیرد. | workflow؛ در CLI نیامد |
| 4 | `supabase-postgres-best-practices` · S179 | 0/0/0/3 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | قواعد index و pooling و query PostgreSQL برای صحنه GLB و لینک پروژه‌ها موضوعیت ندارد. | تنها با ایجاد نیاز واقعی Postgres؛ فایل‌های rules باید با skill همراه باشند. | کامل؛ در CLI نیامد |
| 5 | `supabase-postgres-best-practices` · S205 | 0/0/0/3 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | trigger گسترده‌تر Postgres همچنان برای پروژه بدون دیتابیس فعال نمی‌شود. | با community عیناً یکسان است؛ قواعد referenced باید همراه منتقل شوند و نباید برای TypeScript اجرا شود. | کامل؛ دیده شد |
| 6 | `supabase-postgres-best-practices` · S214 | 0/0/0/3 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | نسخه community قواعد Postgres را تکرار می‌کند و چیزی به سایت static نمی‌افزاید. | بایت‌به‌بایت با plugins-cli برابر است؛ metadata نسخه یکسان، متن curated متفاوت است. | کامل؛ در CLI نیامد |
| 7 | `openai-api-troubleshooting` · S155 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | طبقه‌بندی خطاهای شبکه و quota OpenAI وقتی هیچ API زنده‌ای وجود ندارد فعال نمی‌شود. | فقط پس از خطای واقعی API؛ دستور escalation آن در محیط approval-never قابل اجرا نیست. | کامل؛ در CLI نیامد |
| 8 | `agents` · S153 | 0/0/0/1 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | ساخت Agents API و session و sandbox برای معرفی شغل AI Engineer لازم نیست. | نیازمند API key و access و مستندات زنده است؛ از عنوان شغلی نباید نیاز به agent زنده برداشت شود. | کامل؛ در CLI نیامد |
| 9 | `supabase` · S180 | 0/0/0/1 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | Auth و RLS و migration Supabase در سایت ایستا هیچ مسئله‌ای را حل نمی‌کند. | Backend و دیتابیس عمداً خارج دامنه‌اند؛ این نسخه در برابر نسخه CLI درباره schema declarative راهنمای محدودتری دارد. | کامل؛ در CLI نیامد |
| 10 | `supabase` · S206 | 0/0/0/1 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | نسخه CLI قابلیت schema declarative و debugging Supabase دارد که این سایت به هیچ‌کدام نیاز ندارد. | با نسخه community از نظر SHA یکسان و با curated از نظر متن متفاوت است؛ واردکردن آن فقط با نیاز Backend موجه است. | کامل؛ دیده شد |
| 11 | `supabase` · S215 | 0/0/0/1 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | نسخه community همان جریان Supabase CLI را تکرار می‌کند و برای backend حذف‌شده کاربردی ندارد. | بایت‌به‌بایت با plugins-cli برابر است؛ فعال‌سازی هم‌زمان نسخه‌های هم‌نام سبب ابهام انتخاب می‌شود. | کامل؛ در CLI نیامد |

### امنیت و ارزیابی ریسک

| رتبه | skill و شناسه | ت/ک/خ/س → نمره | تصمیم | دلیل کاربرد | پیش‌نیاز / محدودیت | پوشش؛ کشف CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `security-and-hardening` · S061 | 4/4/5/2 → **3.8** | مشروط؛ نصب پروژه ندارد | برای مرز iframe بازی، لینک‌ها، CSP و وابستگی‌ها سودمند است. | مرجع security-checklist مفقود؛ auth و session و RAG از مثال‌ها خارج دامنه‌اند؛ runtimeِ host بازی را تضمین نمی‌کند. | workflow؛ دیده شد |
| 2 | `security-best-practices` · S232 | 3/3/4/3 → **3.2** | مشروط؛ نصب پروژه ندارد | برای embed اختیاری arcade و لینک‌های خارجی و عدم افشای secret بررسی frontend هدفمند دارد. | فقط درخواست امنیت یا secure-by-default؛ refs JavaScript/React لازم‌اند؛ static بودن دلیل اجرای audit Backend نیست؛ هیچ permission انتشار نظر از آن حاصل نمی‌شود. | کامل؛ دیده شد |
| 3 | `assess-patch-risk` · S084 | 2/3/4/1 → **2.4** | مشروط؛ نصب پروژه ندارد | ریسک تغییر را با هویت ثابت patch و شواهد مسیرهای اجرایی می‌سنجد؛ برای بازبینی انتشار حساس مفید است. | patch تغییرناپذیر و rubric و schema و validator همراه لازم است؛ برای تغییر کوچک تشریفات زیاد دارد. | کامل؛ در CLI نیامد |
| 4 | `security-diff-scan` · S091 | 2/3/4/1 → **2.4** | مشروط؛ نصب پروژه ندارد | همه فایل‌های تغییرکرده را با حفظ baseline امنیتی مرور می‌کند؛ پیش از انتشار یا افزودن بازی ثالث مفید است. | سرور اسکن یا ابزارهای terminal و artifact pipeline لازم است؛ فقط هنگام درخواست مرور امنیتی. | کامل؛ در CLI نیامد |
| 5 | `verify-fix` · S097 | 1/2/3/3 → **2.0** | مشروط؛ نصب پروژه ندارد | بسته‌شدن مسیر آسیب‌پذیری گزارش‌شده را بدون ویرایش بررسی می‌کند. | فقط درخواست صریح تأیید اصلاح امنیتی؛ نقص اولیه و کنترل مسیر سالم باید در دسترس باشد. | کامل؛ در CLI نیامد |
| 6 | `fix-finding` · S089 | 1/2/4/1 → **1.8** | مشروط؛ نصب پروژه ندارد | نقص امنیتی مشخص را در باریک‌ترین مرز مشترک اصلاح و مسیر سالم را دوباره بررسی می‌کند. | فقط پس از گزارش نقص واقعی؛ تحقیق و بازبینی مستقل و آزمون‌های امنیتی لازم دارد. | کامل؛ در CLI نیامد |
| 7 | `threat-model` · S093 | 1/2/3/2 → **1.8** | مشروط؛ نصب پروژه ندارد | اعتماد به لینک‌های پروژه و محتوای ثالث را می‌توان در مدل تهدید محدود ثبت کرد. | نیازمند شواهد معماری واقعی و قرارداد ذخیره artifacts است؛ بدون تهدید جدید ضرورتی ندارد. | کامل؛ در CLI نیامد |
| 8 | `triage-finding` · S095 | 1/2/3/2 → **1.8** | مشروط؛ نصب پروژه ندارد | گزارش آسیب‌پذیری موجود را صرفاً از روی کد و سیاست تأیید یا رد یا نیازمند بررسی می‌کند. | گزارش مشخص لازم دارد؛ تست و build و PoC اجرا نمی‌کند و پوشش جامع ادعا نمی‌کند. | کامل؛ در CLI نیامد |
| 9 | `validation` · S096 | 1/2/4/1 → **1.8** | مشروط؛ نصب پروژه ندارد | کاندید امنیتی را با reproduction متناسب یا trace محدود می‌سنجد؛ نتیجه اسکن را واقعی‌تر می‌کند. | کاندید و rubric و artifact contract لازم است؛ می‌تواند build و harness موقت بخواهد. | کامل؛ در CLI نیامد |
| 10 | `security-scan` · S092 | 1/2/3/1 → **1.6** | مشروط؛ نصب پروژه ندارد | اسکن تک‌مرحله‌ای کل scope را با مرزها و اثبات یافته‌ها انجام می‌دهد. | راه‌اندازی capability و سیاست امنیتی و خروجی canonical لازم است؛ برای ساخت معمول سایت فعال نشود. | کامل؛ در CLI نیامد |
| 11 | `attack-path-analysis` · S085 | 1/1/3/1 → **1.4** | مشروط؛ نصب پروژه ندارد | زنجیره مهاجم تا sink و شدت را برای یافته موجود تحلیل می‌کند؛ ابزار شروع ساخت یا اسکن نیست. | مدل تهدید و یافته معتبر یا محتمل لازم دارد؛ به تنهایی وارد پروژه نشود. | کامل؛ در CLI نیامد |
| 12 | `find-security-vulnerabilities-in-code` · S028 | 1/2/3/0 → **1.4** | خارج از دامنه؛ نصب پروژه ندارد | به کد و نمونه اجرا برای اثبات exploit نیاز دارد؛ فعلاً کدی نداریم. | Strix و Docker/LLM یا Cloud؛ یافته static تأییدشده نیست؛ سرویس ثالث بازی خارج مجوز است. | workflow؛ دیده شد |
| 13 | `finding-discovery` · S088 | 1/1/3/1 → **1.4** | مشروط؛ نصب پروژه ندارد | کشف کاندیدهای امنیتی را به source و کنترل و sink متصل می‌کند؛ برای بررسی هدفمند لینک یا embed قابل استفاده است. | فاز تخصصی با مدل تهدید و سیاست و قرارداد artifacts است؛ جایگزین مرور سبک frontend نیست. | کامل؛ در CLI نیامد |
| 14 | `define-security-policy` · S087 | 1/1/2/1 → **1.2** | مشروط؛ نصب پروژه ندارد | سیاست SECURITY.md را از مرزهای واقعی استخراج می‌کند؛ تنها با نیاز صریح سیاست امنیتی. | مسیر و استثناها و diff به تأیید مالک نیاز دارند؛ ایجاد سیاست عمومی فعلاً لازم نیست. | کامل؛ در CLI نیامد |
| 15 | `fix-security-vulnerabilities-with-strix` · S030 | 1/1/3/0 → **1.2** | خارج از دامنه؛ نصب پروژه ندارد | فقط پس از finding معتبر و مجوز اصلاح آن ارزش دارد؛ اکنون finding نداریم. | گزارش Strix، re-scan و بازاجرای PoC؛ اجرای امنیتی یا هزینه scan در دامنه فعلی نیست. | workflow؛ دیده شد |
| 16 | `owasp-top-10-testing` · S054 | 1/1/3/0 → **1.2** | خارج از دامنه؛ نصب پروژه ندارد | طبقه‌بندی OWASP برای آزمون درخواست‌شده امنیت مناسب است، نه آماده‌سازی سایت static. | Strix، مجوز و بودجه؛ taxonomy تست کامل را اثبات نمی‌کند؛ iframe ثالث نباید هدف scan شود. | workflow؛ دیده شد |
| 17 | `penetration-testing-with-strix` · S055 | 1/1/3/0 → **1.2** | خارج از دامنه؛ نصب پروژه ندارد | pentest خودکار با exploit برای MVP بدون backend تناسب کمی دارد. | Docker/Strix/LLM key یا Cloud/auth/credits؛ ابزار نصب یا سرویس اسکن در این مرحله مجاز نیست. | workflow؛ دیده شد |
| 18 | `web-app-penetration-testing` · S077 | 1/1/3/0 → **1.2** | خارج از دامنه؛ نصب پروژه ندارد | برای pentest سایت زنده با scope صریح است، نه آماده‌سازی portfolio. | Strix و هدف مجاز و حساب/بودجه؛ وابستگی third-party Crash هدف خودکار اسکن نیست. | workflow؛ دیده شد |
| 19 | `application-security-testing` · S008 | 1/1/2/0 → **1.0** | خارج از دامنه؛ نصب پروژه ندارد | دارایی‌ها را به چند pentest هدایت می‌کند؛ برای پرتفولیوی static بدون حساب و داده هزینه زیادی دارد. | وابسته به Strix و مجوز صریح اسکن؛ آماده‌سازی مجوز اجرای pentest نمی‌دهد. | workflow؛ دیده شد |
| 20 | `ci-security-scanning-with-strix` · S014 | 0/1/2/0 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | pentest هوشمند روی هر PR برای سایت static کوچک تناسب اندکی دارد. | Strix یا حساب Cloud، Docker/LLM key یا credits؛ اتصال SCM و ارسال SARIF جهش دامنه است. | workflow؛ دیده شد |
| 21 | `managed-pentesting-with-strix` · S051 | 0/1/2/0 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | حساب cloud، credits و اسکن دارایی برای دامنه فعلی ضرورتی ندارد. | ارسال کد به cloud، auth و تأیید snapshot و هدف؛ خرید اعتبار و اتصال SCM هرگز ضمنی نیست. | workflow؛ دیده شد |
| 22 | `propose-security-hardening` · S090 | 0/1/2/0 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | پرتفوی گزینه‌های بازطراحی امنیتی با نمودار و tradeoff می‌سازد؛ پیچیدگی معماری سایت چنین نیازی ندارد. | یافته یا disclosure و شواهد pinned لازم دارد؛ مجوز تغییر کد از پیشنهاد حاصل نمی‌شود. | کامل؛ در CLI نیامد |
| 23 | `vulnerability-writeup` · S098 | 0/1/2/0 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | گزارش disclosure قابل بازتولید برای آسیب‌پذیری می‌سازد؛ محتوای معرفی پروژه نیست. | source دقیق و تاریخچه نسخه و drafting agent برای هر نقص لازم دارد؛ هیچ یافته‌ای عرضه نشده است. | کامل؛ در CLI نیامد |
| 24 | `api-security-testing` · S006 | 0/0/1/0 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | برای API احراز هویت‌شده و اثبات BOLA طراحی شده و اینجا API نداریم. | Strix، schema، توکن‌های تست و مجوز هدف؛ اجرای exploit روی سرویس بازی ثالث مجاز نیست. | workflow؛ دیده شد |
| 25 | `deep-security-scan` · S086 | 0/0/1/0 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | اسکن‌های مستقل تکراری و تجمیع طولانی برای این سایت ایستا توجیه ندارد. | سرور Codex Security و بودجه اسکن عمیق لازم است؛ زمان پیش‌فرض می‌تواند بسیار طولانی باشد. | کامل؛ در CLI نیامد |
| 26 | `openai-platform-api-key` · S156 | 0/0/0/1 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | خود متن skill، frontend ثابت و mockup بدون رفتار API را از دروازه کلید مستثنا می‌کند. | اگر بعداً API اضافه شود تصمیم reuse/new و مقصد تاییدشده لازم است؛ این سایت کلید نمی‌خواهد. | کامل؛ در CLI نیامد |
| 27 | `track-findings` · S094 | 0/0/1/0 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | یافته sealed را پس از duplicate check به tracker یا advisory می‌برد؛ به ساخت portfolio کمکی ندارد. | مقصد و حساب و مخاطب و payload باید صریحاً تأیید شود؛ دسترسی نوشتن خارجی لازم است. | کامل؛ در CLI نیامد |

### استقرار و عملیات

| رتبه | skill و شناسه | ت/ک/خ/س → نمره | تصمیم | دلیل کاربرد | پیش‌نیاز / محدودیت | پوشش؛ کشف CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `deploy-to-vercel` · S020 | 3/4/4/3 → **3.4** | مشروط؛ نصب پروژه ندارد | وقتی انتشار خواسته شد مسیر preview و انتخاب تیم را روشن می‌کند. | Vercel CLI/auth یا resources/deploy*.sh؛ push فقط با مجوز؛ منع fetch URL در این skill جای تست عملکرد سایت را نمی‌گیرد؛ اکنون انتشار مجاز نیست. | workflow؛ دیده شد |
| 2 | `ci-cd-and-automation` · S013 | 3/3/4/2 → **3.0** | مشروط؛ نصب پروژه ندارد | پس از وجود برنامه، typecheck، build و تست مرورگر را روی PR تکرارپذیر می‌کند. | GitHub Actions و تنظیمات branch protection؛ نمونه DB و rollout برای این سایت لازم نیست؛ فعلاً CI یا انتشار اجرا نشود. | workflow؛ دیده شد |
| 3 | `shipping-and-launch` · S062 | 3/4/4/1 → **3.0** | مشروط؛ نصب پروژه ندارد | نزدیک انتشار، browser، audit و rollback را یادآوری می‌کند. | چهار checklist خارجی مفقود؛ rollout و error budget سرویس برای سایت static زیاد است؛ انتشار اکنون مجاز نیست. | workflow؛ دیده شد |
| 4 | `vercel-cli-with-tokens` · S071 | 2/3/4/2 → **2.6** | مشروط؛ نصب پروژه ندارد | فقط اگر انتشار با token انتخاب شد روش مدیریت scope و token را روشن می‌کند. | Vercel CLI، token و project/org؛ نمونه کشف token ممکن است مقدار را چاپ کند و نباید اجرا/نقل شود؛ انتشار فعلاً مجاز نیست. | workflow؛ دیده شد |
| 5 | `sites` · S178 | 2/2/2/1 → **1.8** | مشروط؛ نصب پروژه ندارد | فقط اگر میزبانی Sites انتخاب شود مسیر source و archive و deployment را کامل می‌کند. | local-only پشتیبانی دارد؛ مسیر پیش‌فرض buildless/Vinext و انتشار خودکار با مخزن Vite و برنامه فعلی نباید جایگزین شود؛ helperهای plugin root و اتصال Sites لازم‌اند. | کامل؛ در CLI نیامد |
| 6 | `21st-design-sync` · S223 | 0/0/0/1 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | انتشار theme عمومی در 21st هدف سایت شخصی نیست و به صحنه کمکی نمی‌کند. | publish public است و API key واقعی و تایید لازم دارد؛ هر فراخوانی theme تازه می‌سازد؛ نیاز دو palette ممکن است dark-only brief را گسترش دهد. | کامل؛ دیده شد |
| 7 | `21st-registry` · S224 | 0/0/0/1 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | انتشار component و template یا جایگزینی بورد حساب 21st از انتشار این پورتفولیو مستقل است. | CLI و حساب و review زنده و cover لازم‌اند؛ profile set جایگزینی کامل است؛ theme/template کلید واقعی می‌خواهند؛ workflow ارزیابی شد و مثال‌های کد طولانی حذف شدند. | workflow؛ دیده شد |
| 8 | `publish-artifact-to-sites` · S113 | 0/0/1/0 → **0.2** | ناسازگار با مسیر فعلی؛ نصب پروژه ندارد | انتشار Data app به Sites صریحاً Worker و D1 و R2 متصل می‌کند؛ با شرط بدون backend و database تعارض دارد. | Sites owner authorization و snapshot و packaging و env مخصوص لازم دارد؛ برای انتشار Vite استفاده نشود. | کامل؛ در CLI نیامد |
| 9 | `schedule-refresh-jobs` · S115 | 0/0/1/0 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | refresh زمان‌بندی‌شده Data app را در cloud task می‌سازد؛ سایت با محتوای ایستا چنین چرخه‌ای ندارد. | cloud scheduler و پروژه و منبع بازخوانی‌پذیر و مجوز task لازم است. | کامل؛ در CLI نیامد |

### ابزارها و مدیریت محیط

| رتبه | skill و شناسه | ت/ک/خ/س → نمره | تصمیم | دلیل کاربرد | پیش‌نیاز / محدودیت | پوشش؛ کشف CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [source-driven-development](../.agents/skills/source-driven-development/SKILL.md) · S064 | 5/5/5/3 → **4.6** | اصلی؛ محلی نصب شد | API نسخه واقعی React، R3F و Drei را به مستند رسمی متصل می‌کند و hallucination را کم می‌کند. | به شبکه/مستند رسمی یا Context7 نیاز دارد؛ citation برای هر pattern می‌تواند پرحجم شود؛ منبع remote در audit اجرا نشده. | workflow؛ دیده شد |
| 2 | `skill-creator` · S219 | 2/3/3/4 → **2.8** | مشروط؛ نصب پروژه ندارد | برای تنظیم skillهای انتخابی پروژه و جلوگیری از scope creep راهنمای مناسبی دارد. | اجرای workflow ساخت فقط با درخواست ایجاد یا تغییر skill؛ quick_validate رفتار مدل را اثبات نمی‌کند؛ مثال redlining/ooxml درباره skill فرضی است و dependency واقعی این skill نیست. | کامل؛ دیده شد |
| 3 | `figma-use` · S134 | 2/2/4/1 → **2.2** | مشروط؛ نصب پروژه ندارد | اجرای Plugin API و فونت و page و return ID را برای کار انتخاب‌شده Figma کم‌خطاتر می‌کند. | فقط همراه عملیات Figma لازم است؛ اتصال و editor context باید مشخص باشد. fan-out موازی چندصفحه‌ای را الزام می‌کند؛ figma-generate-library اجرای هم‌زمان use_figma را ممنوع می‌کند. | workflow؛ در CLI نیامد |
| 4 | `find-skills` · S029 | 2/2/2/3 → **2.2** | مشروط؛ نصب پروژه ندارد | برای یافتن خلأ مشخص آینده قابل استفاده است؛ inventory محلی اکنون کامل‌تر و مرتبط‌تر است. | شبکه و npx skills؛ install count معیار سودمندی پروژه نیست؛ نصب جهانی با vendoring محلی خواسته‌شده فرق دارد. | workflow؛ دیده شد |
| 5 | `ponytail-help` · S210 | 1/1/1/5 → **1.8** | خارج از دامنه؛ نصب پروژه ندارد | کارت راهنمای mode فقط هنگام سوال درباره Ponytail لازم است و به خروجی سایت کمکی نمی‌کند. | تنظیم global و auto-update صرف خواندن help مجاز نمی‌شود؛ دستور Claude Code به Codex تعمیم داده نشود. | کامل؛ دیده شد |
| 6 | `hf-cli` · S140 | 1/2/2/2 → **1.6** | مشروط؛ نصب پروژه ندارد | اگر مدل یا Space موجود برای اثبات پروژه معرفی شد، metadata و لینک Hub را می‌توان با CLI بررسی کرد. | HF_TOKEN برای داده خصوصی لازم است؛ نصب و upload و endpoint و job از scope سایت خارج است. | کامل؛ در CLI نیامد |
| 7 | `observability-and-instrumentation` · S053 | 1/2/3/1 → **1.6** | خارج از دامنه؛ نصب پروژه ندارد | هسته logs/metrics/traces و alert برای سرویس است؛ این portfolio سرویس ندارد. | SDK یا backend telemetry و checklist مفقود؛ فقط error boundary محلی آینده کافی است، بدون افزودن سامانه مانیتورینگ. | workflow؛ دیده شد |
| 8 | `openai-docs` · S217 | 1/1/2/3 → **1.6** | مشروط؛ نصب پروژه ندارد | برای پرسش درباره خود Codex یا قواعد skill مفید است؛ عنوان AI Engineer سایت را API-backed نمی‌کند. | مستندات رسمی با جستجو و بازکردن صفحه لازم است؛ برای وب عمومی و R3F مسیر اصلی نیست؛ منابع تخصصی فقط طبق route خوانده شوند. | کامل؛ دیده شد |
| 9 | `plugin-management` · S177 | 1/1/1/4 → **1.6** | مشروط؛ نصب پروژه ندارد | برای بررسی وابستگی و اجازه افزونه‌ها مفید است اما اجرای پورتفولیو به حساب بیرونی متکی نیست. | فقط هنگام نیاز واقعی به سرویس خارجی؛ نصب یا تغییر permission از ارزیابی skill نتیجه نمی‌شود. | کامل؛ در CLI نیامد |
| 10 | `figma-code-connect` · S119 | 1/1/3/1 → **1.4** | مشروط؛ نصب پروژه ندارد | mapping کامپوننت‌های منتشرشده Figma به template صحیح .figma.ts را بدون اشتباه parser-based انجام می‌دهد. | Figma MCP و library منتشرشده و Organization یا Enterprise لازم است؛ برای یک portfolio هزینه اضافی دارد. | workflow؛ در CLI نیامد |
| 11 | `figma-code-workflows` · S120 | 1/1/3/1 → **1.4** | مشروط؛ نصب پروژه ندارد | فقط در صورت درخواست خروجی Figma پروژه را به Design یا Code Layer یا Make می‌برد. | نوع خروجی باید روشن باشد؛ upload خارجی و feature code_layers_enabled لازم است؛ اکنون local code هدف است. | کامل؛ در CLI نیامد |
| 12 | `huggingface-datasets` · S142 | 1/1/2/2 → **1.4** | مشروط؛ نصب پروژه ندارد | برای معرفی dataset واقعی یک پروژه، split و آمار و provenance عمومی را می‌خواند. | Dataset Viewer و شناسه دقیق dataset لازم است؛ dataset یا API جدید داخل سایت ایجاد نشود. | کامل؛ در CLI نیامد |
| 13 | `huggingface-trackio` · S148 | 1/2/2/1 → **1.4** | مشروط؛ نصب پروژه ندارد | اگر نتایج آزمایش موجود باید به عنوان مدرک ارائه شود، metric ثبت‌شده را read-only استخراج می‌کند. | run واقعی و ابزار CLI لازم است؛ dashboard و sync Space و webhook نباید به سایت افزوده شود. | کامل؛ در CLI نیامد |
| 14 | `skill-installer` · S220 | 1/1/1/3 → **1.4** | خارج از دامنه؛ نصب پروژه ندارد | نصب global از GitHub برای استفاده از مهارت‌های ازقبل موجود یا کپی پروژه‌ای لازم نیست. | scriptهای شبکه در CODEX_HOME می‌نویسند؛ نیاز به نصب باید صریح باشد؛ توصیه escalation زیر محدودیت approval-never قابل اجرا نیست. | کامل؛ دیده شد |
| 15 | `writing-skills` · S195 | 1/2/3/0 → **1.4** | خارج از دامنه؛ نصب پروژه ندارد | تست فشار روی skill تازه فقط هنگام تالیف workflow شخصی کاربرد دارد؛ ساخت پورتفولیو چنین تالیفی نیست. | TDD background و subagent baseline و پنج تکرار wording و pressure scenario و منابع authoring لازم است؛ برای کپی بدون تغییر skill نباید بی‌دلیل چرخه کامل ایجاد شود. | کامل؛ در CLI نیامد |
| 16 | `figma-generative-plugins` · S126 | 0/0/2/0 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | plugin قابل تنظیم داخل Figma Design می‌سازد؛ محصول خواسته‌شده وب‌سایت است. | plan و scaffold و فایل‌های code.ts و ui.html و authoring reference لازم است؛ secrets مجاز نیست. | کامل؛ در CLI نیامد |
| 17 | `google-drive` · S137 | 0/0/0/2 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | کشف و جابه‌جایی و export فایل‌های Drive جای نگهداری brief ثابت در مخزن را نمی‌گیرد. | حساب Drive و شناسه فایل لازم است؛ بخش routing ساخت Docs با sibling فعلی هماهنگ نیست. | کامل؛ در CLI نیامد |
| 18 | `huggingface-jobs` · S144 | 0/0/1/0 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | اجرای workload روی HF Jobs با هزینه و secret و hardware و persistence را مدیریت می‌کند. | حساب و اعتبار و token و timeout و Hub ذخیره لازم است؛ هیچ job مجاز یا لازم نیست. | workflow؛ در CLI نیامد |
| 19 | `huggingface-llm-trainer` · S145 | 0/0/1/0 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | fine-tune مدل زبانی با TRL و LoRA و GPU و GGUF را برنامه‌ریزی و اجرا می‌کند. | داده train و token و هزینه و validation لازم است؛ AI Engineer بودن سایت مجوز training نیست. | workflow؛ در CLI نیامد |
| 20 | `huggingface-vision-trainer` · S150 | 0/0/1/0 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | آموزش detection و classification و segmentation روی GPU و Hub را انجام می‌دهد؛ نیاز asset سه‌بعدی نیست. | dataset و GPU job و token و هزینه و push لازم است؛ تمرین مدل با تولید GLB تفاوت دارد. | workflow؛ در CLI نیامد |
| 21 | `template-creator` · S204 | 0/0/0/1 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | تبدیل مرجع به skill قالب شخصی هدف این وب‌سایت یا audit فعلی نیست. | در ~/.codex/skills می‌نویسد و به script موفق نیاز دارد؛ کپی ساده یا ویرایش cache را ایجاد template نمی‌داند. | کامل؛ دیده شد |
| 22 | `diagnosing-superpowers` · S182 | 0/0/0/0 → **0.0** | خارج از دامنه؛ نصب پروژه ندارد | تحلیل هزینه و انحراف نشست Superpowers مسئله محصول پورتفولیو نیست. | intake اجباری و transcript و هفت analyst و نوشتن ~/.superpowers لازم دارد؛ audit skill با عیب‌یابی یک نشست اشتباه گرفته نشود؛ export و issue gate مستقل دارند. | کامل؛ در CLI نیامد |
| 23 | `excel-live-control` · S202 | 0/0/0/0 → **0.0** | خارج از دامنه؛ نصب پروژه ندارد | کنترل workbook باز Excel هیچ نقشی در ساخت رابط پورتفولیو ندارد. | Excel Desktop و add-in و ورود و session و ابزار native لازم دارد؛ native computer این محیط غیرفعال است. | کامل؛ دیده شد |

### موبایل و پلتفرم‌های بومی

| رتبه | skill و شناسه | ت/ک/خ/س → نمره | تصمیم | دلیل کاربرد | پیش‌نیاز / محدودیت | پوشش؛ کشف CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `mobile-native` · S052 | 4/4/5/4 → **4.2** | مشروط؛ نصب پروژه ندارد | dvh، safe-area، hover capability و حفظ zoom برای نمای موبایل اتاق بسیار کاربردی‌اند. | تست سخت‌افزار واقعی را اجباری می‌داند؛ emulation تأیید نهایی نیست؛ همه تنظیمات touch نباید جهانی اعمال شوند. | workflow؛ دیده شد |
| 2 | `mobile-web-app` · S213 | 1/1/1/1 → **1.0** | خارج از دامنه؛ نصب پروژه ندارد | transition بین routeهای اپ موبایل برای اتاق frontal تک‌صحنه‌ای لازم نیست. | SSGOI و router و راهنمای آنلاین llms.txt می‌خواهد؛ صرف responsive بودن دلیل نصب این وابستگی نیست. | کامل؛ دیده شد |
| 3 | `vercel-react-native-skills` · S075 | 0/1/2/2 → **1.0** | خارج از دامنه؛ نصب پروژه ندارد | FlatList و navigation بومی به سایت Vite مربوط نیست. | React Native/Expo و ruleهای بومی؛ responsive وب را با Native اشتباه نگیرید. | workflow؛ دیده شد |
| 4 | `write-swift` · S079 | 0/0/1/2 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | قواعد value type، Swift concurrency و ARC با TypeScript/Vite تطبیق مستقیم ندارند. | نیازمند Swift toolchain/SwiftUI و تست Apple؛ هیچ کد Swift در دامنه نیست. | workflow؛ دیده شد |
| 5 | `animate-expo` · S001 | 0/0/1/1 → **0.4** | خارج از دامنه؛ نصب پروژه ندارد | چرخه اجرا روی UI runtime و gesture بومی Expo است؛ سایت Vite از آن استفاده نمی‌کند. | نیازمند Expo، Reanimated، Worklets و سخت‌افزار واقعی؛ با وب جایگزین نشود. | workflow؛ دیده شد |
| 6 | `figma-swiftui` · S130 | 0/0/1/0 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | SwiftUI و Figma را دوطرفه ترجمه می‌کند؛ responsive React وب با پروژه iOS تفاوت دارد. | فایل Swift یا هدف iOS لازم است؛ هیچ نیازی در scope فعلی نیست. | کامل؛ در CLI نیامد |

### سایر کاربردها

| رتبه | skill و شناسه | ت/ک/خ/س → نمره | تصمیم | دلیل کاربرد | پیش‌نیاز / محدودیت | پوشش؛ کشف CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `ponytail-gain` · S209 | 0/0/0/5 → **1.0** | خارج از دامنه؛ نصب پروژه ندارد | نمایش آمار benchmark خود Ponytail هیچ تصمیم طراحی یا کارایی این پورتفولیو را اثبات نمی‌کند. | منبع benchmark بسته باید موجود و خوانده شود؛ درصدها مربوط به این repo نیستند و نباید به آن نسبت داده شوند. | کامل؛ دیده شد |
| 2 | `i-have-adhd` · S043 | 0/1/1/2 → **0.8** | خارج از دامنه؛ نصب پروژه ندارد | سبک ارتباطی ماندگار برای درخواست صریح کاربر است و کیفیت محصول را مستقیم بهبود نمی‌دهد. | disable-model-invocation و حالت پایدار؛ بدون درخواست شخصی فعال نشود و درباره وضعیت کاربر فرض نشود. | workflow؛ دیده شد |
| 3 | `devday-guide` · S154 | 0/0/0/3 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | راهنمای برنامه و حضور DevDay موضوع محتوایی این پورتفولیو نیست. | برای پرسش رویداد باید سال و شهر و منابع رسمی تازه بررسی شوند. | کامل؛ در CLI نیامد |
| 4 | `index` · S107 | 0/1/2/0 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | روتر مجموعه تحلیل داده با intake و source execution و تحویل Data است؛ برای coding عمومی صراحتاً کاربرد ندارد. | فعال‌سازی آن فقط به دلیل AI Engineer بودن عنوان شغلی اشتباه است. | workflow؛ در CLI نیامد |
| 5 | `pets` · S197 | 0/0/0/3 → **0.6** | خارج از دامنه؛ نصب پروژه ندارد | انتخاب و حذف pet حساب ChatGPT به بازدیدکننده اتاق پورتفولیو مربوط نیست. | شناسه pet و اتصال Pets؛ حذف فقط با درخواست صریح مالک مجاز است. | کامل؛ در CLI نیامد |
| 6 | `update-pet` · S198 | 0/0/0/1 → **0.2** | خارج از دامنه؛ نصب پروژه ندارد | اصلاح spritesheet pet موجود ابزار اصلاح asset سه‌بعدی وب نیست. | pet سفارشی موجود و ImageGen و Library و قرارداد upload لازم است. | کامل؛ در CLI نیامد |
| 7 | `create-pet` · S196 | 0/0/0/0 → **0.0** | خارج از دامنه؛ نصب پروژه ندارد | ساخت pet در ChatGPT با شخصیت یا مدل صحنه وب متفاوت است و avatar هم حذف شده است. | Library و ImageGen و Pillow و scripts و Pets MCP لازم دارد؛ atlas یازده‌ردیفی هیچ خروجی GLB نمی‌دهد. | کامل؛ در CLI نیامد |

## فهرست منبع و fingerprint هر ردیف

| شناسه | مسیر snapshot اصلی | SHA-256 فایل اصلی |
| --- | --- | --- |
| S001 | `U/animate-expo/SKILL.md` | `9a01a91701e6563c67677dde6b66ab30f066a5341d42c21a90ba51d99679274a` |
| S002 | `U/animate/SKILL.md` | `b8ede161270458e6ae2e45e8a1985373515d4c63de5568ddb0f9012d7634356c` |
| S003 | `U/animation-vocabulary/SKILL.md` | `40d2b27adfdfeb0570a9f20e7d0255109d9233c50603878bcd0dcd04c923fd94` |
| S004 | `U/apex/SKILL.md` | `a205cbb13015c05f53e9a9fe437546132573e25fe0c4446d2cc4843f6f40b9dd` |
| S005 | `U/api-and-interface-design/SKILL.md` | `5dafd0c44a3aabf11cae5bcb34f6fcc24dfa5c01ba6e0d3176bce997f4d68bc8` |
| S006 | `U/api-security-testing/SKILL.md` | `bd04c90d87be2353ebefee33363af0818746345e25c80ed36f63fcdd2b25509c` |
| S007 | `U/apple-design/SKILL.md` | `77bb63b7043bb93aca2ff4ab040c249484eef35682bb6ff7163433c31d30adc7` |
| S008 | `U/application-security-testing/SKILL.md` | `b3041c800a9a1d34e04164c5f700b6d12bbc237f098d760c09ec076c92d2a654` |
| S009 | `U/ask-sonner/SKILL.md` | `39f3ee185b3aa2cf70a689052ff078953ce7ba5915ed7a9391d232e9d4dcf57f` |
| S010 | `U/banner-design/SKILL.md` | `913d9c4b2a3b405d638d50131e0dd3fe2787c839423d79287b7858ac29255acc` |
| S011 | `U/brand/SKILL.md` | `6a450ee1a83a403d47cec2ede9030feb60a67a81fc425d2406e975339313bd44` |
| S012 | `U/browser-testing-with-devtools/SKILL.md` | `4e3aacd6a380cd25bc6c2d67fdd1c926a9b22535b8a62109ecd33cefd909e3d9` |
| S013 | `U/ci-cd-and-automation/SKILL.md` | `a6ed8ed56456b01ff8314c44eefc69897d9905ae4e06bb2b7036286efb79b5f0` |
| S014 | `U/ci-security-scanning-with-strix/SKILL.md` | `715bdf9ce1f358189e37a34941d65f909f5519a4ced43b14b3b96c5c48be55e1` |
| S015 | `U/code-review-and-quality/SKILL.md` | `8f3cabca581bbf7cb5f0add3f7454e7a4523f9d4353a6a4a217e6fa515309612` |
| S016 | `U/code-simplification/SKILL.md` | `f0c5ed754057eb0c1e027e2587f59de816651feb5e837242296c43ea21cf621d` |
| S017 | `U/constraint-driven-development/SKILL.md` | `06479d4305f286d23cfb99f5dc85695896785269664e1f6a8d800e3b71e70c10` |
| S018 | `U/context-engineering/SKILL.md` | `8b736cb9e55b82b265ab6ff78349c0e826e8a6df550deddf665b7fb3ff858b63` |
| S019 | `U/debugging-and-error-recovery/SKILL.md` | `21f3960f5d7ae2cc95c40896545004dbbcbbd752ea65fc2d53962554d4174220` |
| S020 | `U/deploy-to-vercel/SKILL.md` | `cfcc3dd479ab2e0ae721ddf39b8af84d977321487672f1487c8d6855f576927b` |
| S021 | `U/deprecation-and-migration/SKILL.md` | `6a624f942e09c69863a4219b9bd5d56975026b67b0c70bc83385ffd2120b6142` |
| S022 | `U/design-system/SKILL.md` | `655468bb723a6bc9d17fcb09a6a005e10e313d63b879f4d74fb2abdc3041ae3f` |
| S023 | `U/design/SKILL.md` | `413f4ab913d07f7fd92acbadc25d71aad63443be0c40d11234944aea688603b6` |
| S024 | `U/documentation-and-adrs/SKILL.md` | `87ae44a0c7bb3eefc2131a9d11caabcc14e4d8dcb27d66a3a675551ee2ce1671` |
| S025 | `U/doubt-driven-development/SKILL.md` | `6fa1fcd8420c28daf7e53c5b08b0f20b907911efd2a6d9bce0b9740da20a4008` |
| S026 | `U/emil-design-eng/SKILL.md` | `ffbe68e6007fb42cb8149f089b400a1ca007d59ba23e8948e2be4476f3175939` |
| S027 | `U/find-animation-opportunities/SKILL.md` | `d52a377819b84a71930f0c822cfe2849f40301605a2d5c7eccbfa3b257700df2` |
| S028 | `U/find-security-vulnerabilities-in-code/SKILL.md` | `e7c25f1a0aea437d011d96dd306736b644597b07aa5a6dbc5588eefaab248e0a` |
| S029 | `U/find-skills/SKILL.md` | `c00eeea0e13e74fe4a9d84ba0a8542205a1b736d65f13134fe1a6647eb14976f` |
| S030 | `U/fix-security-vulnerabilities-with-strix/SKILL.md` | `bb1b351fd60c91e4875207f3fe4f35774ff5194261a00aea9f4752e459f24a9f` |
| S031 | `U/frontend-ui-engineering/SKILL.md` | `549044e9bd8d7fe993ce8e5c0d2b0f5465650676dc15805329973f936179eb1e` |
| S032 | `U/git-workflow-and-versioning/SKILL.md` | `b7465d187935c52546d39fdc7bd6ac36d94eda25a9500ef8c18b767d2eb116ea` |
| S033 | `U/gpt-taste/SKILL.md` | `2e64c269953f2656c21bf5a0fa6b4568e82fe0c72b36e8f84758e090349966a5` |
| S034 | `U/grill-me/SKILL.md` | `caaf8b8de1684f96e26b28f3c29189db5c89cce4b73e1c93d86164f66ef88637` |
| S035 | `U/gsap-core/SKILL.md` | `3887b47e050ab5afbe2a9a820f23d39fa02ab785e06a343be44c6f91d84d12b3` |
| S036 | `U/gsap-frameworks/SKILL.md` | `842d9d3659ec3ddc8abbdc524708f8facf81f468ac25d0577f48c759c4fa31e6` |
| S037 | `U/gsap-performance/SKILL.md` | `cb5408d6fba707aabcbfe3320317a14c1f8fca6070074e5261047930f50d441e` |
| S038 | `U/gsap-plugins/SKILL.md` | `5838b856c74c07fbc9fa99b6dfd1eee34ea554c3e530c30e0d58014b707d70a4` |
| S039 | `U/gsap-react/SKILL.md` | `88e2a5312b45e8cc7b3c496637ff5bc9af2ae9c925b555c8b235b34cbc989d74` |
| S040 | `U/gsap-scrolltrigger/SKILL.md` | `9351b6666a4749c0740406ea363aaccb99a087ff45cc5e8b99a0f367facf3ef4` |
| S041 | `U/gsap-timeline/SKILL.md` | `1a8b0f39cc4be3ed3d834b89672e4ae2f151b901dc3450bebf10bbc45379fe02` |
| S042 | `U/gsap-utils/SKILL.md` | `1927bcc4ea95b38203404ad5ea1d060b15c4a886c65ae53e885ff1793aabe0ba` |
| S043 | `U/i-have-adhd/SKILL.md` | `3170b16ace00aecb0dd7feb54c0b5aa642e7502acda06ecd24fd89a11c7127e9` |
| S044 | `U/idea-refine/SKILL.md` | `79e773058963adc7646b0115b4f8a4afc974c5ff95843e4ef1cafff3cb51899e` |
| S045 | `U/impeccable/SKILL.md` | `6eeec6ef2028388a17de9f17a56c9cb7dbc7c8e7e1a8c15b831b0ba3e42168ac` |
| S046 | `U/improve-animations/SKILL.md` | `73962447464433476343e2c12cd08ab39cc99a9e5f3c118c5fb54ed897574ef6` |
| S047 | `U/improve/SKILL.md` | `1599aa29e9b16424cb767779efac53fa56e3f38be92dff4ac587393a1ad5070a` |
| S048 | `U/incremental-implementation/SKILL.md` | `df66536610071727feae1ca95f3c391c248ad828041750ccd3699cce763aa00b` |
| S049 | `U/interview-me/SKILL.md` | `ace4b675999bb504593d572e0f73f3d7e803ad6fddf318445598c82c11939db2` |
| S050 | `U/make-interfaces-feel-better/SKILL.md` | `c1d508fa7bef8e47ee682b4f214c7a4ed1416b91d05a97285e555bad1c41a23e` |
| S051 | `U/managed-pentesting-with-strix/SKILL.md` | `45e1432ea897e59e67a5102513a4b9aac7372a5666d68d620ee867bbfa8b290b` |
| S052 | `U/mobile-native/SKILL.md` | `888b7651d66d66dbac4e72b7c554638eb19bd971d686d6cbdf030a5ef3788f55` |
| S053 | `U/observability-and-instrumentation/SKILL.md` | `e7fcb0820306d46268de9594d676ad98e35040858926c412b7000faa52a61f87` |
| S054 | `U/owasp-top-10-testing/SKILL.md` | `02b1cbe60d40c44493309418c7824f1f681d9f32bf0299ca246892c46cb130af` |
| S055 | `U/penetration-testing-with-strix/SKILL.md` | `b1aaa191ede5d714af5be4b5dbbc78da22991dcfbb526cdd74e3edcb040a512c` |
| S056 | `U/performance-optimization/SKILL.md` | `00694d0c69bbde674d0e39de24052d90afea32d9fef9553eaee21a50a7e9b8cf` |
| S057 | `U/pick-ui-library/SKILL.md` | `675fdce308683256ed617351a9b74d23457a5fbd0a562d9831b9c764b8c5e682` |
| S058 | `U/planning-and-task-breakdown/SKILL.md` | `ed0f90cc5951ddd4bcab7f871f64efec93a49af9279ef93bc470da77ad8da3f7` |
| S059 | `U/prototype/SKILL.md` | `bba39c955eb1871c5a02733976ceec5d0324198e0812e667604756489c89f7b9` |
| S060 | `U/review-animations/SKILL.md` | `6ff590d29e436766135aa3d137be1fac2a867165c7257fc315b189361f1873af` |
| S061 | `U/security-and-hardening/SKILL.md` | `2e3fc60eed5aba97fe416f3f3c9317fdb014a682925ec70a733c3ff99e4b9858` |
| S062 | `U/shipping-and-launch/SKILL.md` | `af610cf4892db7eab2e91c899e33feba90e1000bac4528b2f8dde930816ac125` |
| S063 | `U/slides/SKILL.md` | `2b90bdaf63f231919a01f4962f374ecd84af101a7e7545f8d9c68e049025accb` |
| S064 | `U/source-driven-development/SKILL.md` | `c59faf851377f0eeda45306398d16eb96d77ab1c2fd3e1a7fb58e9a0af33c1e9` |
| S065 | `U/spec-driven-development/SKILL.md` | `f7129bca8742bad73f60209bd237e8b10dab6f1fae8576dc552fb1923bc1e721` |
| S066 | `U/test-driven-development/SKILL.md` | `7c0c6ac057c19d7f8be65d9f49c3a638703b868f4625c78b70da5439d5d74fca` |
| S067 | `U/thermo-nuclear-code-quality-review/SKILL.md` | `7faca08b51b643b2ddd0836f92af15574444024685dcc1e677dbbb39ae8c9e8f` |
| S068 | `U/ui-styling/SKILL.md` | `f8b6c3832d2af51f67b3932e3c4a79bcd8a8596cc61ce1547a686fc951e5c62d` |
| S069 | `U/ui-ux-pro-max/SKILL.md` | `8b827fe03b349aeea99a7d6cf4ccd892e6065b672859fdb11e13a1919453eddc` |
| S070 | `U/using-agent-skills/SKILL.md` | `30787ef2c77bf1a4729fffed0f6523ba6fcbe81bdc436b36371b78c21394d3c3` |
| S071 | `U/vercel-cli-with-tokens/SKILL.md` | `c06bea99e75eab07fde4fae26069baa002f82f39b53f07981704c2901551dd4c` |
| S072 | `U/vercel-composition-patterns/SKILL.md` | `e38e0eaa609316b10423a9a138ed95e35099accd3f735585295c8a8f165c28a3` |
| S073 | `U/vercel-optimize/SKILL.md` | `95ae2683b30d892d165af92a350c5628b68106f395a59b448857b654e306ed91` |
| S074 | `U/vercel-react-best-practices/SKILL.md` | `71ed7794962fa6e803ee83030517b5b93a9f70fbfeb431ec4535c5480a8d8355` |
| S075 | `U/vercel-react-native-skills/SKILL.md` | `4012750a5ccbe064ca04af3835d5d1b011979d2d09d9b6df1c8128fac58e0a66` |
| S076 | `U/vercel-react-view-transitions/SKILL.md` | `1520343c8814c972fee001cac6d6185976d6eb3f4edcac33afe95c10f3b3228b` |
| S077 | `U/web-app-penetration-testing/SKILL.md` | `2e8df0b9233971c496d0c0c7660808fc717c08d4165455a0423229045389608a` |
| S078 | `U/web-design-guidelines/SKILL.md` | `f4647ca866a3accf763777f83e7682954f0187cd6bea7eea0399796652414e8f` |
| S079 | `U/write-swift/SKILL.md` | `16a4b6adb74e338e55e704ce5753ad54d825438b8a63930eeaede9f3c04c9447` |
| S080 | `U/writing-guidelines/SKILL.md` | `89a5f581193289b80af58b980090aeed535047c8df2b55ccbaae0de40283a99d` |
| S081 | `P/context7-marketplace/context7/1.0.2/skills/context7-mcp/SKILL.md` | `d1ea3447e915a7fc49ad7c6635fc4eb264ce2b15d87e4d5aa42703b5efb9d726` |
| S082 | `P/i-have-adhd/i-have-adhd/0.4.1/skills/i-have-adhd/SKILL.md` | `88955c019bbb1419ff4b49dbb1f80a867467de6233d7865af2e06a7d7b76c7d3` |
| S083 | `P/openai-bundled/visualize/1.0.50/skills/visualize/SKILL.md` | `766f4e5ee250af9d3c68353d0b8609e40e0ce5926a625d7ca88e073525360d25` |
| S084 | `P/openai-curated-remote/codex-security/0.1.32/skills/assess-patch-risk/SKILL.md` | `c3b62a8c1d6135945a055134f50329047bb908972fc7b320a592edbc3d38b419` |
| S085 | `P/openai-curated-remote/codex-security/0.1.32/skills/attack-path-analysis/SKILL.md` | `9465d2750182acbf6dd8f61e60bb47dc1ca502be5cc3f4a71da7ad39935d1eb1` |
| S086 | `P/openai-curated-remote/codex-security/0.1.32/skills/deep-security-scan/SKILL.md` | `d6aed0d9b47065a1384a96d0a45c843b0cda8ba48e3d2cbe96c65357c6e55ee3` |
| S087 | `P/openai-curated-remote/codex-security/0.1.32/skills/define-security-policy/SKILL.md` | `2817e1a03980a7ebea478c8d9e6c622e3c6205123e767a1e32f0204c06729cc7` |
| S088 | `P/openai-curated-remote/codex-security/0.1.32/skills/finding-discovery/SKILL.md` | `14cc797e750ca4bdd8b060c4cf96d7d32f25b132aa8f80d0a0837683fe010790` |
| S089 | `P/openai-curated-remote/codex-security/0.1.32/skills/fix-finding/SKILL.md` | `ba7311f43b2c0742da0d5c6bdb2f0b26601c09cc59747cf8c62a09f8d0bb86d2` |
| S090 | `P/openai-curated-remote/codex-security/0.1.32/skills/propose-security-hardening/SKILL.md` | `ad07d88da7c2bc9e551849cdde686b0daad380ed0aac798e6c06444681d75959` |
| S091 | `P/openai-curated-remote/codex-security/0.1.32/skills/security-diff-scan/SKILL.md` | `f85962d46f141227d794a25253a39232bc4e1ad756509ecd3d8769b85b735136` |
| S092 | `P/openai-curated-remote/codex-security/0.1.32/skills/security-scan/SKILL.md` | `104e2f93fc965c34e91970f517a89e330d5b29dbb243dcea5d95d83f14d135cf` |
| S093 | `P/openai-curated-remote/codex-security/0.1.32/skills/threat-model/SKILL.md` | `42568e50c787c4c0bfb9495ad67e72ab6c1a951bb910ecba2c67cff8961c4d56` |
| S094 | `P/openai-curated-remote/codex-security/0.1.32/skills/track-findings/SKILL.md` | `a6d2f30e6d5ca7bd9d74d83017f2f5481c5829585941208a1673b82c683d292b` |
| S095 | `P/openai-curated-remote/codex-security/0.1.32/skills/triage-finding/SKILL.md` | `83081950bd4b29ff37cf82d137aec164532ae56b03dbaad3f4dd1d5423e758a7` |
| S096 | `P/openai-curated-remote/codex-security/0.1.32/skills/validation/SKILL.md` | `3c4660f79b12a92728e6bb25027064c3a911d0960d39aeafc8fda9e42ce517a5` |
| S097 | `P/openai-curated-remote/codex-security/0.1.32/skills/verify-fix/SKILL.md` | `3d4530484c7e4c18b6afe7c6527247e96517dce1ebd1bda9d349cd367ecb0ae3` |
| S098 | `P/openai-curated-remote/codex-security/0.1.32/skills/vulnerability-writeup/SKILL.md` | `d08582d9963ce3bfbc3fe81b6e85a01e6fe306713d7951bfd8dd2fbc3df75de4` |
| S099 | `P/openai-curated-remote/data-analytics/1.0.11/skills/analyze-data-quality/SKILL.md` | `b55f1fea16306899bc28060d2a46c5318e15f85da62f3f533926861458a6dc15` |
| S100 | `P/openai-curated-remote/data-analytics/1.0.11/skills/build-dashboard/SKILL.md` | `d3d3f4a3daf77c5a099e6fc13b7ab6d975688f80a6a927e731dc32e118f705f0` |
| S101 | `P/openai-curated-remote/data-analytics/1.0.11/skills/build-report/SKILL.md` | `a464dc6bcda8bf5659ba951a9ccba52020cf9c5d6f5f40e05d0e6a42149b51cf` |
| S102 | `P/openai-curated-remote/data-analytics/1.0.11/skills/convert-to-doc/SKILL.md` | `71a4616d6e111c4e8e570b0c986ad62631fb39aff26ba08837961eedff4fe2a2` |
| S103 | `P/openai-curated-remote/data-analytics/1.0.11/skills/convert-to-slides/SKILL.md` | `5708f54bd5674d3c92ae96c52c85ea3bd0d42b5699eb12df10e5591945f178b7` |
| S104 | `P/openai-curated-remote/data-analytics/1.0.11/skills/create-data-context/SKILL.md` | `dd46e2acf43bf3fd0e7290ddee9ed4f4b97eea23c27a7f031af225a1c71c88e8` |
| S105 | `P/openai-curated-remote/data-analytics/1.0.11/skills/design-kpis/SKILL.md` | `6f3f3841371e4269d8bc6be406537145de3e86d7ca8d34d65af21548dfff2d46` |
| S106 | `P/openai-curated-remote/data-analytics/1.0.11/skills/gather-business-context/SKILL.md` | `c61aaab29796c5c5a101f8d802a9ab0d1c4366e31a5acadddec56ca4849d7237` |
| S107 | `P/openai-curated-remote/data-analytics/1.0.11/skills/index/SKILL.md` | `a139924dda9dcab3e0207f69947b68de2b45f5d1bd997548c304735de397271e` |
| S108 | `P/openai-curated-remote/data-analytics/1.0.11/skills/jupyter-notebooks/SKILL.md` | `91a1a7f03544d4136544a60ef98e750ed694ab85768815861bbc7c4eec08a987` |
| S109 | `P/openai-curated-remote/data-analytics/1.0.11/skills/kpi-reporting/SKILL.md` | `e790badb05ee3d77b68815d57658e350d26737b10e1b9bb8d2d30d1ad335b3e5` |
| S110 | `P/openai-curated-remote/data-analytics/1.0.11/skills/market-sizing/SKILL.md` | `ed8661862b1ed7d0da1dc5d0d418cc8e631df81345af087e40eedcdf4e0b2a9b` |
| S111 | `P/openai-curated-remote/data-analytics/1.0.11/skills/metric-diagnostics/SKILL.md` | `e3a591bf256a84cfdb59efdc4ff5a1e6938d7e2a2a42f43144e5ad204bf054b2` |
| S112 | `P/openai-curated-remote/data-analytics/1.0.11/skills/product-business-analysis/SKILL.md` | `036b89f9cc9c982fad224cd17e3d93339e5eef8080bbe3d8d2b28731a0a62113` |
| S113 | `P/openai-curated-remote/data-analytics/1.0.11/skills/publish-artifact-to-sites/SKILL.md` | `cf2f48b318af56a8902b7ec804bb44b62491f18a142a0276c68e870d271015f0` |
| S114 | `P/openai-curated-remote/data-analytics/1.0.11/skills/report-to-pdf/SKILL.md` | `e07c3607824d25243aaf698db16029445e16da34a1e7c107861b7bcc6ba3cb63` |
| S115 | `P/openai-curated-remote/data-analytics/1.0.11/skills/schedule-refresh-jobs/SKILL.md` | `6166180cd0fa05f9f761862a15e6ccb12aa8e1edbec3af52c4479123e02cb362` |
| S116 | `P/openai-curated-remote/data-analytics/1.0.11/skills/share-artifact-summary/SKILL.md` | `793e661b277a0bea0a4c3a6d147b33db3a14a8794f09f9d156d12444a84d5317` |
| S117 | `P/openai-curated-remote/data-analytics/1.0.11/skills/validate-data/SKILL.md` | `8f67c4ccd8fe55555a3d0f1d0a1d798279d08ef40473b19c228422123ae587dd` |
| S118 | `P/openai-curated-remote/data-analytics/1.0.11/skills/visualize-data/SKILL.md` | `91868fdcc816e487ad65f188c4911ce98f400692cd5024157e7ddcb37cc1912b` |
| S119 | `P/openai-curated-remote/figma/16.0.0/skills/figma-code-connect/SKILL.md` | `87af3996edb167d6aa3c044cb1bbb6a0d8e2d631c731bb896b1e1e8669640415` |
| S120 | `P/openai-curated-remote/figma/16.0.0/skills/figma-code-workflows/SKILL.md` | `ac69b52d96a5d1b1832be9f0be99c221cfd861f8aad2260a0508386229982c7c` |
| S121 | `P/openai-curated-remote/figma/16.0.0/skills/figma-create-new-file/SKILL.md` | `bb7bc48c487f0ad7e738c23d0685bad5ec0bbbca8f5b5bb6295dc0666cc9ddf1` |
| S122 | `P/openai-curated-remote/figma/16.0.0/skills/figma-design-to-code/SKILL.md` | `a6e852421e4db72260b2ca641929b1f84684e5b067aead081e35111f5b5feee4` |
| S123 | `P/openai-curated-remote/figma/16.0.0/skills/figma-generate-design/SKILL.md` | `f4f05f29f69a5b4628d4574359910fea926735af78c5e264a1c4cd16f69315b0` |
| S124 | `P/openai-curated-remote/figma/16.0.0/skills/figma-generate-diagram/SKILL.md` | `7297638dbf2130d1b37bfd85df65d290a4dd0b11a11b54abafcf7d07565922b5` |
| S125 | `P/openai-curated-remote/figma/16.0.0/skills/figma-generate-library/SKILL.md` | `b5277050191d1985f59e162e0acc82523a0a39a8cf614069a3d63753d5990f27` |
| S126 | `P/openai-curated-remote/figma/16.0.0/skills/figma-generative-plugins/SKILL.md` | `b97eb184a1f6b6545f3b8266a4d1a1e29304888904db7daed2864b9fd036b124` |
| S127 | `P/openai-curated-remote/figma/16.0.0/skills/figma-implement-motion/SKILL.md` | `2e26e67284d47c6a74aedf9dca7543f4c8817dafc59a11abb156d4f7feedb2c2` |
| S128 | `P/openai-curated-remote/figma/16.0.0/skills/figma-shaders/SKILL.md` | `c7e34c5a4eb316cfe84768cb419fe71b3ce840b29561ecd0f90eb402a72e1adf` |
| S129 | `P/openai-curated-remote/figma/16.0.0/skills/figma-spec/SKILL.md` | `7bc6c406d19906217724279f254d773193bac45d385b35d5db6b58673c73f7e3` |
| S130 | `P/openai-curated-remote/figma/16.0.0/skills/figma-swiftui/SKILL.md` | `868c4defe2c0854f5a3e27594d3fa0f20347c86a9b15d103483b7488bfa8affe` |
| S131 | `P/openai-curated-remote/figma/16.0.0/skills/figma-use-figjam/SKILL.md` | `8d566444a1aaf31c122682a5fbe3d6f14c6a844a4e05164cda3de872752cea24` |
| S132 | `P/openai-curated-remote/figma/16.0.0/skills/figma-use-motion/SKILL.md` | `d74fa8c9435a5260f8a61e3a8fbf11c068f940ae3423e9be2efde8b5e785d78c` |
| S133 | `P/openai-curated-remote/figma/16.0.0/skills/figma-use-slides/SKILL.md` | `0a69a65e686dcc223581afb409a4d31cf318716e2c65cc9c926839a8737e71a4` |
| S134 | `P/openai-curated-remote/figma/16.0.0/skills/figma-use/SKILL.md` | `ac385b80a05c850b5abc6bcae7c56625c4576318510545453a568aa5f21b8a95` |
| S135 | `P/openai-curated-remote/google-drive/0.1.20/skills/google-docs/SKILL.md` | `272fb227fb084a0edb435582703c432a0a11d930cb63891424d0cda30f880798` |
| S136 | `P/openai-curated-remote/google-drive/0.1.20/skills/google-drive-comments/SKILL.md` | `a3077375a8f7558b9e052c98047747b8a4a1a90a9a90b552009c28fcdadfe94a` |
| S137 | `P/openai-curated-remote/google-drive/0.1.20/skills/google-drive/SKILL.md` | `dabae8a192c861b76cf7b5742bdf14f8ed35e67d8e6cacfd5f746ffbefd6da5c` |
| S138 | `P/openai-curated-remote/google-drive/0.1.20/skills/google-sheets/SKILL.md` | `1851109d8f2c182236d28db136fb161d30c85287e5bc4fa79cf137673184c58d` |
| S139 | `P/openai-curated-remote/google-drive/0.1.20/skills/google-slides/SKILL.md` | `f85bd1d7080becf8c043a3646b6c3a53fbcd6d2a77c62a15112b8d89e01a4b83` |
| S140 | `P/openai-curated-remote/hugging-face/1.0.0/skills/cli/SKILL.md` | `ee85209886c4ec3d3d850489368be193d11a8a3fa589012b39a4a5bbf7c7da2e` |
| S141 | `P/openai-curated-remote/hugging-face/1.0.0/skills/community-evals/SKILL.md` | `a97f1c703f55b72427453a76af858237e6392a447fcafa9eeb85f7ac67f0155d` |
| S142 | `P/openai-curated-remote/hugging-face/1.0.0/skills/datasets/SKILL.md` | `5af74f3e042313efadf02e85c316a2576bdc0b0ff92c43c3ba5dcb6e2dae1ded` |
| S143 | `P/openai-curated-remote/hugging-face/1.0.0/skills/gradio/SKILL.md` | `e2f4c232c38682bccfc73115ca7d0a5427f7d625e6fd56b32515fe4c0900f997` |
| S144 | `P/openai-curated-remote/hugging-face/1.0.0/skills/jobs/SKILL.md` | `b85252f49569e97adc3d85e75ea37ed505028249fe1d9991069a6c52d0a64f35` |
| S145 | `P/openai-curated-remote/hugging-face/1.0.0/skills/llm-trainer/SKILL.md` | `6628c305a8ae8de81fea38d05c4712b54a97fed4e19e776b1edc18e392d98f48` |
| S146 | `P/openai-curated-remote/hugging-face/1.0.0/skills/paper-publisher/SKILL.md` | `04b59406cf88054ab365f5bbbc57fe2e2fcb369e942dff2841c4f4297318c353` |
| S147 | `P/openai-curated-remote/hugging-face/1.0.0/skills/papers/SKILL.md` | `985c2d5c7261aba2b157811cde0c2b30134663694a4ab701280de28f941eb3b2` |
| S148 | `P/openai-curated-remote/hugging-face/1.0.0/skills/trackio/SKILL.md` | `893ac9695f8677db4c4f0c15795e789346946f6142305c89d7ee57774e22ffb1` |
| S149 | `P/openai-curated-remote/hugging-face/1.0.0/skills/transformers.js/SKILL.md` | `89a70a8a0604fc90cf6ae1063cb0f7d2f625bdf4d337f4f24e3f19cea4f99511` |
| S150 | `P/openai-curated-remote/hugging-face/1.0.0/skills/vision-trainer/SKILL.md` | `c7aba4de75fa6595ffdaf5c50136786e8346aba0c9ff0261eaee656af4a3b0d9` |
| S151 | `P/openai-curated-remote/impeccable/4.3.1/skills/impeccable/SKILL.md` | `5ce02fc8f353d7f659535fb80e453963dc047a07c4396adf098fe010b479e7c0` |
| S152 | `P/openai-curated-remote/no-ai-slop/1.0.6/skills/no-ai-slop/SKILL.md` | `73f87f7f79bd3540c4d8494b5c43d37d25584be6886212e1516fdd8d1c539846` |
| S153 | `P/openai-curated-remote/openai-developers/1.3.6/skills/agents/SKILL.md` | `1918f74c7509ef03916f0a5c6fd85a35c66faba65e26948e41cd2351cf61f334` |
| S154 | `P/openai-curated-remote/openai-developers/1.3.6/skills/devday-guide/SKILL.md` | `ce990a4ea0a0bdba54c1a361aeedad17809048c862c6ac979333a6fba961d774` |
| S155 | `P/openai-curated-remote/openai-developers/1.3.6/skills/openai-api-troubleshooting/SKILL.md` | `63d0a10934b6f999aa85fee64ef6086907e2cfeff15e614b5ce5b07d421d6956` |
| S156 | `P/openai-curated-remote/openai-developers/1.3.6/skills/openai-platform-api-key/SKILL.md` | `d2f9fddd383f1830fac5b938fe3145fbb7f0b5a93ed923c1a5e9f9f443c6c46c` |
| S157 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-analytics-dashboard/SKILL.md` | `cf5360fd8b197673bb237c52c603c97fa319c875c3dfa2cd8efff52d4422f513` |
| S158 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-business-review/SKILL.md` | `27721fc1d67d1b41949caa75ac8f94f81952ff124406878af6524047929e60d2` |
| S159 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-design-report/SKILL.md` | `563722f53854e606f8a9f87e37e72d7ef70a22d46d5836b8e4d6abfb1b79e9e0` |
| S160 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-experiment-analysis/SKILL.md` | `0b05effc47df0a14f8e0c3e3597e6722224747435546385d38a2cae279bd20b9` |
| S161 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-financial-budget/SKILL.md` | `c0b6b7a62a15597aaf2b1ec679e21da48f533b756127f0aef957cdfe9f3da738` |
| S162 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-investment-committee-memo/SKILL.md` | `68abd08cfe5e073e3c446a3f675f44c5bf98f57434dba679e8acd8a763379a8b` |
| S163 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-legal-memorandum/SKILL.md` | `51fb9d21baf6119c4ccb1903638a6bac0e859210de63460fffa7025d52e997e0` |
| S164 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-market-trends-report/SKILL.md` | `d58d019b89cb6f292ac3ab991d561489eef477ff53ce05fb024a0c936f5af26a` |
| S165 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-minimal-letterhead/SKILL.md` | `880ef094d4d0c89a7bde5ce9bbe4086625c186651e9e6efc8ba8bdd7cc77f9d5` |
| S166 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-operating-calendar/SKILL.md` | `33bb660791a0b9a21628a42c34934932220203b6aabd84e98cb1b45327d0384c` |
| S167 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-operating-review/SKILL.md` | `6d63c5cd025ffe936e7bab5db3023672bbaec26af55c2bb8b057d38c202c9c32` |
| S168 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-project-kickoff/SKILL.md` | `aa893ebd89e7c8d1db4261d01cc2b1add35d78d00785871ccaaa5fc8db783ec9` |
| S169 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-project-tracker/SKILL.md` | `d97d5be20189b7f53dd269b6e1c5f694eaf53e5a72f6559fcb1578911b7cda82` |
| S170 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-sales-pipeline/SKILL.md` | `15cfeeedf440021f16ed3f3ad8c7c1ef6d48898b9447741e223d2fb41cfc9800` |
| S171 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-simple-dark-mode/SKILL.md` | `b7c8d0c05f75878b9bc21e56a57c41ec1aa29700aca0a24822be0f9f1bd53207` |
| S172 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-simple-light-mode/SKILL.md` | `7c68430c6cf57b55b457d4735dbd1a46b889bef135a32222902dd0848b6e1752` |
| S173 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-strategy-memorandum/SKILL.md` | `51d7882ac94e8e57b323394825728c33925af878806e37277217c2dc12a912e5` |
| S174 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-system-design/SKILL.md` | `87f7b7ed1b0d8410f5e5971cd7f7db9a4165e2f37069e97e52dbfb469b75a57c` |
| S175 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-team-alignment/SKILL.md` | `26d7cafdcd1899a937b325c5d02ac57c162d45002153be33a934d35f81eb6110` |
| S176 | `P/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-three-statement-forecast/SKILL.md` | `74f4a5cccec0107b861548b157e04c51d9b58ec13a990c86394b4c529b8ecf41` |
| S177 | `P/openai-curated-remote/plugin-management/0.1.0/skills/plugin-management/SKILL.md` | `653841cc21205269f08b0ce135891e1518dac616a766bcfb0b57d788d3f68b10` |
| S178 | `P/openai-curated-remote/sites/1.0.0/skills/sites/SKILL.md` | `5a942cda3c1a22a94b71f24ace3e3489b6e5dd72b1ec9da69d17fd400031647a` |
| S179 | `P/openai-curated-remote/supabase/1.0.0/skills/supabase-postgres-best-practices/SKILL.md` | `ccd6e4596bd51cf344fe76c464867c541ccc16b6d90ae7a9db449fb17588613b` |
| S180 | `P/openai-curated-remote/supabase/1.0.0/skills/supabase/SKILL.md` | `1171386737b231610fa42485707272765c3516a9bbc0bd2c6c161a8cee3d7d33` |
| S181 | `P/openai-curated-remote/superpowers/6.4.2/skills/brainstorming/SKILL.md` | `a32d2255354775aa124855aa7100cf276bea096fff4ebb3a0edf57be216e6c72` |
| S182 | `P/openai-curated-remote/superpowers/6.4.2/skills/diagnosing-superpowers/SKILL.md` | `5a652f8132cc901eb5ca61f89157839f87a2f20aed037fc7a2b51051bc37cd19` |
| S183 | `P/openai-curated-remote/superpowers/6.4.2/skills/dispatching-parallel-agents/SKILL.md` | `1968923066f3b707eb01d1992cdf4c42284c3855f70253b9cd5000ff45fca13c` |
| S184 | `P/openai-curated-remote/superpowers/6.4.2/skills/executing-plans/SKILL.md` | `f38e8f2ddcf079f65493adc713c1fed78421dfaf5f4dbf6b3a6b2b1d95466e71` |
| S185 | `P/openai-curated-remote/superpowers/6.4.2/skills/finishing-a-development-branch/SKILL.md` | `8db5a922b242dd4e1bf824cb91c13b3e8d8e8a86d6ceaf7f0774eb9cce909d65` |
| S186 | `P/openai-curated-remote/superpowers/6.4.2/skills/receiving-code-review/SKILL.md` | `091df1629510af1b92fc4abd6f96732ebedb4cb2c0f3457e8f2740b0504a2438` |
| S187 | `P/openai-curated-remote/superpowers/6.4.2/skills/requesting-code-review/SKILL.md` | `cfcee1b06774e7c0517f1e09be1a11f2d5680257072723e709ddbcf7e08b795a` |
| S188 | `P/openai-curated-remote/superpowers/6.4.2/skills/subagent-driven-development/SKILL.md` | `8dde5589ee083fb4999106d116f01c8fdaf3116a8a9813fdedeb80329de49046` |
| S189 | `P/openai-curated-remote/superpowers/6.4.2/skills/systematic-debugging/SKILL.md` | `808fc5717aa88ad65efff312b11c186294d3e6ee301afb584e2f86599b137787` |
| S190 | `P/openai-curated-remote/superpowers/6.4.2/skills/test-driven-development/SKILL.md` | `64b03fce4aee5a97a93160cea8111f3ba13a17b7c001db4bd5836d67fd10705d` |
| S191 | `P/openai-curated-remote/superpowers/6.4.2/skills/using-git-worktrees/SKILL.md` | `8cfb86f121269e8f7f12361e6795c4f6738828340e28964c9229d365666c9edd` |
| S192 | `P/openai-curated-remote/superpowers/6.4.2/skills/using-superpowers/SKILL.md` | `82c5c8866ad7f5dd4440ce66bd7806ba48a2f13771beae5cf112e53f08fe36ba` |
| S193 | `P/openai-curated-remote/superpowers/6.4.2/skills/verification-before-completion/SKILL.md` | `2befe7fc55bcadaa3d97dd9e8efeb633d2561c0ebe74c5a8b17c4d9e7e4520b3` |
| S194 | `P/openai-curated-remote/superpowers/6.4.2/skills/writing-plans/SKILL.md` | `a6c67c1900064347c2a329990dd3c555657c51c3ec53b259a08aa01a2c26139a` |
| S195 | `P/openai-curated-remote/superpowers/6.4.2/skills/writing-skills/SKILL.md` | `bbdfe742f853562e643a3d40d64476359d47881e39cef80a189283fa26d11ab9` |
| S196 | `P/openai-curated-remote/work-pets/0.1.6/skills/create-pet/SKILL.md` | `841354fb8116f8fdfd3b643b30828f5180196c594d3fed9b669b948b88892af1` |
| S197 | `P/openai-curated-remote/work-pets/0.1.6/skills/pets/SKILL.md` | `1bf5d45fd6a6390aab777229293fb05cef7cf898aac882f8955e40c378e52fcd` |
| S198 | `P/openai-curated-remote/work-pets/0.1.6/skills/update-pet/SKILL.md` | `c63c98d67b6ad781a72a8f9837ba1fb5e2d2a8054a2562e4025890a97d8a0e67` |
| S199 | `P/openai-primary-runtime/documents/26.1013.11914/skills/documents/SKILL.md` | `c9b9ba61ac15f20a600220bc10a380c7753992bbd3c323bfe33fae864adefc21` |
| S200 | `P/openai-primary-runtime/pdf/26.1013.11914/skills/pdf/SKILL.md` | `a6e20f4ae66364a06d577dd51e0ce66ee2ef955be129cbe195e0a27f403daaf8` |
| S201 | `P/openai-primary-runtime/presentations/26.1013.11914/skills/presentations/SKILL.md` | `bb3726eff35cb82241fd2c3b09fcdb18cc3bf3daefddf8df929d2e0bd4d2af2f` |
| S202 | `P/openai-primary-runtime/spreadsheets/26.1013.11914/skills/excel-live-control/SKILL.md` | `1c27488fa2a59ce2cc8925a12527ee9c7aa40ccf0701f3f2719ab17858586e8b` |
| S203 | `P/openai-primary-runtime/spreadsheets/26.1013.11914/skills/spreadsheets/SKILL.md` | `dd22f4bae5bf3f76457c80eb1f079ba7a47b87db52b144edeb1e5f4585dc8f34` |
| S204 | `P/openai-primary-runtime/template-creator/26.1013.11914/skills/template-creator/SKILL.md` | `f1d14fd2847a2e879611a8b8f872f5dc4676a0607958d015274d2dc61e812deb` |
| S205 | `P/plugins-cli/supabase/0.1.15/skills/supabase-postgres-best-practices/SKILL.md` | `ad65e776f45e761bafc609d3f506c77c1032225aa65e0c4c02f241b8071e5855` |
| S206 | `P/plugins-cli/supabase/0.1.15/skills/supabase/SKILL.md` | `16817870f69bb9db58343cfa41c6fb864713c01f3680a64e0fb869605a5d81c3` |
| S207 | `P/ponytail/ponytail/5.3.0/skills/ponytail-audit/SKILL.md` | `2b3223a02c386d1263e1b08343cb8eb3a53e444cdafb1d79e26c8ec2a8fcad28` |
| S208 | `P/ponytail/ponytail/5.3.0/skills/ponytail-debt/SKILL.md` | `b5ec2762f6ba8c4af9ea7173aa6c9f91b88655a25e43f9de0264f6ce8722b25f` |
| S209 | `P/ponytail/ponytail/5.3.0/skills/ponytail-gain/SKILL.md` | `231034a896d6762e4b5c8468287083422c56b499119976ec9f76821f7d083090` |
| S210 | `P/ponytail/ponytail/5.3.0/skills/ponytail-help/SKILL.md` | `7fb330460bd0efe935dcae72ff2c0e14e5366542b5f04ff2f2a05c7b58366386` |
| S211 | `P/ponytail/ponytail/5.3.0/skills/ponytail-review/SKILL.md` | `33fe4ebe22a460924e5d4a261e223df22e409cc94ab76182bee9fb91a3ef022e` |
| S212 | `P/ponytail/ponytail/5.3.0/skills/ponytail/SKILL.md` | `9badd22a32e19cb884e46dfa8d3aae82bb81dfa5484105b8b4f0262df823a509` |
| S213 | `P/ssgoi/ssgoi/0.1.0/skills/mobile-web-app/SKILL.md` | `abf6c09f09bf6627d6069f291e8108541093ec50f7fa8d8bc4d15a3d59b135bf` |
| S214 | `P/supabase-community-supabase-plugin/supabase/f3f332e0164c34a8392772811737fda0cb972d06/skills/supabase-postgres-best-practices/SKILL.md` | `ad65e776f45e761bafc609d3f506c77c1032225aa65e0c4c02f241b8071e5855` |
| S215 | `P/supabase-community-supabase-plugin/supabase/f3f332e0164c34a8392772811737fda0cb972d06/skills/supabase/SKILL.md` | `16817870f69bb9db58343cfa41c6fb864713c01f3680a64e0fb869605a5d81c3` |
| S216 | `C/.system/imagegen/SKILL.md` | `681ddb4ad6d06a2acc78a3535b583f8d0c1ea800ecda3d56370d3310fd2cd4ba` |
| S217 | `C/.system/openai-docs/SKILL.md` | `aa6829e21df2223167c85d2e49b6337a7345c84c1033f1ec10182c7882b36d45` |
| S218 | `C/.system/review-agent/SKILL.md` | `07079efd0dc76f05fade424e5dfb048dce1de2df7626e1a4f56292a4f3f92228` |
| S219 | `C/.system/skill-creator/SKILL.md` | `6656e54755638e8efcf275a472b9672eaa8a9a1b9e59dc210e275b03b59e1e66` |
| S220 | `C/.system/skill-installer/SKILL.md` | `d68b77e5bbb34dedab89d134da52855f140fc4b4299b80104f534e3b9e98f8ee` |
| S221 | `C/21st-ai/SKILL.md` | `229119802d835ec000e860186ffab60dac272b7aeb2ef2fd90d5f9780c786012` |
| S222 | `C/21st-cli-use/SKILL.md` | `88ff054abb4334a5095462dd20b5c4ec214c9b99f3256eae60dadb384d136bca` |
| S223 | `C/21st-design-sync/SKILL.md` | `65cc94c842e066f69d8914af3dd94923545418b28e1fb23059473bff52bd0fe4` |
| S224 | `C/21st-registry/SKILL.md` | `b1dd7ca00383b73d89bfa6b26e8bcd9724c8f03c83b2c66abd70bdae18a09b74` |
| S225 | `C/21st-ui-build/SKILL.md` | `151dbc3e97289a4ba945438f6552c0f597a40d8b5b1dc5d917dd9a5b65389641` |
| S226 | `C/21st-ui-explore/SKILL.md` | `1b94d8d00e7ae87c3737e37c2019cbdc680393ef17a96388e9845f541367f1ec` |
| S227 | `C/21st-ui-review/SKILL.md` | `78939e830bceb64b8e2d32f831b80472008d5d2e50b31c8a8f38af5e5a015088` |
| S228 | `C/frontend-design/SKILL.md` | `d91970639e9f5c37682ac7ab60094d35f1c7c1f38d731bd56396563aee10c1d3` |
| S229 | `C/gh-address-comments/SKILL.md` | `77389eefd3fb6584210668ca8e43f4b8de87e7722ddd953474bc9e24cdfaaedd` |
| S230 | `C/gh-fix-ci/SKILL.md` | `7b326b4a2f0f5f85122144628ec02077e48841e0e0e82efce88b3415bcfb7c26` |
| S231 | `C/graphify/SKILL.md` | `3898b1042721cad27d6f87ca44f638415a7f763203aefd86b90f9358ffea3a43` |
| S232 | `C/security-best-practices/SKILL.md` | `7b3dae1ffc5434d890f3c65c8f552af52d0307fab3b35dec13013c9ca3844c4f` |

## نسخه‌های تکراری و کپی‌های سازگاری

- موارد هم‌نام: Impeccable کاربر/افزونه، TDD کاربر/Superpowers، ADHD کاربر/افزونه و سه نصب Supabase و Postgres. امتیاز و مسیر هرکدام مستقل است؛ محتوای برخی یکسان و برخی متفاوت است.
- دو entrypoint Supabase و Postgres در `plugins-cli` و `supabase-community-supabase-plugin` بایت‌به‌بایت یکسان بودند؛ در inventory هر دو مسیر حفظ شده است، نه دو قابلیت جدید.
- هفت فایل زیر mirror مخصوص host دیگر هستند؛ parent canonical آن‌ها در جدول بررسی شده و تکرارشان تعداد skill مستقل را بالا نمی‌برد:

- `P/i-have-adhd/i-have-adhd/0.4.1/.cursor/skills/i-have-adhd/SKILL.md`
- `P/ponytail/ponytail/5.3.0/.openclaw/skills/ponytail/SKILL.md`
- `P/ponytail/ponytail/5.3.0/.openclaw/skills/ponytail-audit/SKILL.md`
- `P/ponytail/ponytail/5.3.0/.openclaw/skills/ponytail-debt/SKILL.md`
- `P/ponytail/ponytail/5.3.0/.openclaw/skills/ponytail-gain/SKILL.md`
- `P/ponytail/ponytail/5.3.0/.openclaw/skills/ponytail-help/SKILL.md`
- `P/ponytail/ponytail/5.3.0/.openclaw/skills/ponytail-review/SKILL.md`

## نکات مؤثر در تصمیم نهایی

- `gpt-taste` با الزام randomization، AIDA، bento و ScrollTrigger رفرنس ثابت اتاق را تغییر می‌دهد؛ انتخاب پیش‌فرض نیست.
- `graphify` برای این مخزن کوچک graph/index و وابستگی اضافه تولید می‌کند؛ workflow آن حتی fallback نصب سیستمی دارد. نصب یا اجرا نشده است.
- SDD کامل، blanket trigger یک‌درصدی و بازبینی چندایجنتی هر تصمیم سربار و تعارض workflow دارند؛ مسیر اصلی پروژه نمی‌شوند. استفادهٔ محدود از بررسی مستقل در آماده‌سازی، الزام دائمی برای ساخت ایجاد نمی‌کند.
- `frontend-ui-engineering` در یک مثال `<dialog open>` را با focus trap توصیف می‌کند؛ این نمونه برای modal کافی نیست. در پروژه `showModal()` یا primitive مناسب و تست focus لازم است.
- `grill-me` به skill دیگری با نام `grilling` ارجاع می‌دهد که در inventory وجود ندارد؛ قابل‌انتقال مستقل فرض نشده است.
- skillهای Figma فقط با ورودی واقعی Figma و ابزار مربوط مفیدند. دستورهای متناقض هم‌زمانی/خروج/asset میان چند workflow آن ثبت شده‌اند؛ از آن‌ها نیاز جدید برای پروژه ساخته نمی‌شود.
- skillهای Data/Sites ممکن است Worker، D1 و R2 یا انتشار اضافه کنند؛ برای پورتفولیوی ایستای مصوب دلیل افزودن backend نیستند.
- پیشنهادهای React canary، Next.js server، Native، Swift، fine-tuning و Supabase با نیاز نسخهٔ اول هم‌راستا نیستند؛ ارتباط نام پروژه با AI دلیل اجرای مدل/SDK نیست.

## بررسی این تحویل

- کشف Codex: ۲۶/۲۶ محلی، scope=repo، صفر خطای کشف؛ درخواست read-only به app-server و بدون inference.
- checksum تصویر نهایی: `eb011b4e36926879118524fdec52bc11a205edffa9fa7ecc3604fb03e417b737`.
- نتایج نهایی metadata، checksum، لینک‌ها، پاک‌سازی و Git در [plans.md](plans.md) ثبت می‌شوند.
- اعتبارسنجی ساختار و شناسایی skill معادل آزمون کیفیت پاسخ هر ۲۶ workflow نیست. هیچ برنامه‌ای در این تحویل ساخته نشده تا build یا تست UI آن ادعا شود.

### نتیجهٔ اعتبارسنجی نهایی

- ۱۷۴/۱۷۴ فایل vendored با manifest تطبیق داشتند؛ مجموعهٔ فایل و permission هر ۲۶ پوشه با منبع نصب‌شده برابر بود، جز سه اصلاح مسیر لینک که صریحاً ثبت شده‌اند.
- ۱۶۳ لینک فایل Markdown نسبی، منابع ضروری با مسیر backtick، YAML metadata، نبود symlink و نبود مسیر شخصی اجرایی بررسی شد؛ هیچ مسیر فایل شکسته یا خروج از ریشهٔ پروژه باقی نماند.
- hash هر ۲۳۲ entrypoint اصلی دوباره تطبیق داده شد؛ نصب‌های اولیه تغییر نکرده‌اند. ۲۳۲ ردیف رتبه‌بندی و fingerprint با inventory یکسان‌اند.
- ابزار عمومی `quick_validate.py` نتیجهٔ **۲۴ از ۲۶** داشت. برای `ponytail` فیلد `argument-hint` و برای `review-animations` فیلد `disable-model-invocation` را خارج از schema محدود خودش دانست. این دو فیلد اصلی حذف نشدند؛ YAML و نام/شرح معتبر است و **خود Codex هر ۲۶ بسته را enabled و بدون خطای کشف پذیرفت**. نتیجهٔ helper به‌عنوان ۲۶ موفق گزارش نشده است.
- بازبین مستقل ساختار، hashها، کامل‌بودن بسته‌ها، ردیف‌های گزارش، لینک‌ها، رفرنس و دامنهٔ مجاز را بررسی کرد و ایراد قابل‌اقدامی گزارش نکرد.
- تصویر ۱۶۷۲×۹۴۱ و hash آن تأیید شد؛ ۲۱ فایل قبلی در دو پوشه با `gio trash` به سطل زباله رفتند و وجود هر دو ورودی بازیابی بررسی شد. فقط `docs/reference.png` در پروژه باقی است.
- مخزن روی `main`، بدون commit یا remote است؛ همهٔ فایل‌های آماده‌سازی عمداً هنوز untracked هستند. هیچ کد برنامه، وابستگی npm یا scene ساخته نشد.

### بررسی مجدد تمامیت snapshot

این فرمان را از ریشهٔ پروژه اجرا کنید؛ فقط فایل‌ها و checksum را بررسی می‌کند و هیچ فایل یا تنظیمی تغییر نمی‌دهد. نتیجهٔ موفق، اعتبار رفتار workflowها یا اصالت رمزنگاری‌شدهٔ manifest را اثبات نمی‌کند.

```bash
python3 - <<'PY'
from pathlib import Path
import hashlib
import json

root = Path.cwd()
lock_path = root / '.agents/skills-lock.json'
lock = json.loads(lock_path.read_text())
actual = {
    str(path.relative_to(root)): hashlib.sha256(path.read_bytes()).hexdigest()
    for path in sorted((root / '.agents').rglob('*'))
    if path.is_file() and path != lock_path
}
assert actual == lock['files'], 'Vendored file set or checksum changed'
assert not any(path.is_symlink() for path in (root / '.agents').rglob('*'))
assert len(lock['packages']) == 26
for package in lock['packages']:
    entrypoint = root / package['path'] / 'SKILL.md'
    assert hashlib.sha256(entrypoint.read_bytes()).hexdigest() == package['source_entrypoint_sha256']
print(f"Verified {len(lock['packages'])} packages and {len(actual)} vendored files")
PY
```
