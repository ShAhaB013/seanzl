# 📝 ادیتور TinyMCE با تحلیل SEO - نسخه ES Module

یک ادیتور متن پیشرفته با **معماری ماژولار** و قابلیت تحلیل خودکار SEO و بررسی خوانایی محتوا.

🆕 تغییرات نسخه جدید

✅ معماری ES Module: تبدیل کامل به ماژول‌های مستقل
✅ Analysis Engine: موتور تحلیل مرکزی با قابلیت اجرای موازی
✅ Separation of Concerns: جداسازی کامل منطق تحلیل از UI
✅ Scalable Architecture: افزودن Analyzer جدید بدون تغییر در کد اصلی
✅ Clean Code: کد تمیز، خوانا و قابل نگهداری


🏗️ ساختار پروژه
project/
├── index.html              # فایل HTML اصلی
├── css/
│   ├── main.css           # استایل‌های عمومی و Layout
│   ├── editor.css         # استایل‌های ادیتور
│   ├── seo-panel.css      # استایل‌های پنل SEO
│   └── modal.css          # استایل‌های مودال
├── tinymce/               # ⚠️ فایل‌های TinyMCE (دست نزن)
│   └── ...
├── js/
│   ├── main.js            # 🎯 نقطه ورود - Orchestrator
│   │
│   ├── config/
│   │   └── constants.js   # تنظیمات و ثابت‌ها
│   │
│   ├── core/
│   │   ├── analysis-data.js      # 📊 مدل داده تحلیل
│   │   └── analysis-engine.js    # 🧠 موتور تحلیل مرکزی
│   │
│   ├── analyzers/         # 🔍 ماژول‌های تحلیل SEO
│   │   ├── base-analyzer.js      # کلاس پایه
│   │   ├── h1-analyzer.js
│   │   ├── keyword-density-analyzer.js
│   │   ├── first-paragraph-analyzer.js
│   │   ├── secondary-keywords-analyzer.js
│   │   ├── image-analyzer.js
│   │   ├── blue-keyword-analyzer.js
│   │   ├── link-analyzer.js
│   │   ├── paragraph-length-analyzer.js
│   │   └── index.js       # Export مرکزی
│   │
│   ├── utils/
│   │   ├── text-utils.js  # پردازش متن (normalize, count, split)
│   │   ├── dom-utils.js   # کار با DOM (extract, parse)
│   │   ├── keyword-utils.js # کار با کلمات کلیدی
│   │   └── helpers.js     # توابع کمکی (debounce, escape)
│   │
│   ├── ui/
│   │   ├── ui-controller.js      # 🎨 کنترلر اصلی UI
│   │   ├── score-display.js      # نمایش امتیاز
│   │   ├── checks-renderer.js    # رندر چک‌ها
│   │   ├── tabs-manager.js       # مدیریت تب‌ها
│   │   ├── keywords-input.js     # ورودی کلمات کلیدی
│   │   ├── modal-manager.js      # مدیریت مودال
│   │   └── index.js              # Export مرکزی
│   │
│   └── editor/
│       └── tinymce-manager.js    # مدیریت TinyMCE
└── README.md              # این فایل

🎯 ویژگی‌های اصلی
1. تحلیل SEO (7 Analyzer)

✅ بررسی کلمه کلیدی در H1
✅ بررسی تراکم کلمه کلیدی (متن + هدینگ)
✅ بررسی کلمه کلیدی در پاراگراف اول
✅ بررسی کلمات کلیدی فرعی
✅ بررسی Alt تصاویر و نسبت تصویر به متن
✅ بررسی رنگ آبی برای کلمه کلیدی (توصیه)
✅ بررسی لینک‌دهی با کلمات کلیدی

2. تحلیل خوانایی (1 Analyzer)

✅ تشخیص پاراگراف‌های بلند (استاندارد Yoast: حداکثر 25%)

3. پیشنهاد کلمات کلیدی

✅ تشخیص خودکار کلمات کلیدی اصلی
✅ تشخیص خودکار کلمات کلیدی فرعی
✅ محاسبه کیفیت (Quality) و ارتباط (Relevance)

4. رابط کاربری

✅ نمایش امتیاز کلی SEO (0-100)
✅ Progress Bar خطی زیبا
✅ نمایش آمار کلمات و کلیدواژه‌ها
✅ توضیحات تعاملی برای هر چک
✅ طراحی Responsive


🧠 معماری Analysis Engine
جریان کار (Workflow)
┌──────────────────────────────────────────────────────────┐
│                        main.js                           │
│                  (Entry Point)                           │
└────────────────┬─────────────────────┬───────────────────┘
                 │                     │
                 ▼                     ▼
    ┌────────────────────┐   ┌─────────────────────┐
    │  Analysis Engine   │   │   UI Controller     │
    │   (Core Logic)     │   │   (Presentation)    │
    └────────┬───────────┘   └──────────▲──────────┘
             │                          │
             │ AnalysisData             │ Display Results
             ▼                          │
    ┌─────────────────────────────────────────┐
    │         Analyzer Registry               │
    │  ┌──────────┐  ┌──────────┐           │
    │  │ H1       │  │ Keyword  │  ...      │
    │  │ Analyzer │  │ Density  │           │
    │  └──────────┘  └──────────┘           │
    └─────────────────────────────────────────┘
             │
             ▼
    ┌─────────────────────┐
    │   Utils & Helpers   │
    │  (Text, DOM, etc.)  │
    └─────────────────────┘
مراحل اجرا

User Input → تغییر محتوا یا کلمات کلیدی
main.js → scheduleAnalysis() با debounce
Analysis Engine → تصمیم‌گیری:

اگر کلمه کلیدی دارد → اجرای SEO + Readability Analyzers
اگر کلمه کلیدی ندارد → اجرای Suggestion Analyzers


AnalysisData → جمع‌آوری نتایج
UI Controller → نمایش نتایج


🔧 نحوه افزودن Analyzer جدید
مرحله 1: ساخت کلاس Analyzer
javascript// js/analyzers/my-new-analyzer.js
import { SEOAnalyzer } from './base-analyzer.js';

export class MyNewAnalyzer extends SEOAnalyzer {
    constructor(config = {}) {
        super('MyNewAnalyzer', {
            requiresKeyword: true,
            priority: 9, // اولویت (1-20)
            ...config
        });
    }
    
    async analyze(analysisData) {
        const { content, mainKeyword } = analysisData;
        
        // منطق تحلیل...
        const isValid = this.checkSomething(content, mainKeyword);
        
        if (isValid) {
            return this.createSuccessCheck(
                'عنوان چک',
                'توضیح موفقیت',
                { tooltip: 'راهنما' }
            );
        } else {
            return this.createErrorCheck(
                'عنوان چک',
                'توضیح خطا',
                { tooltip: 'راهنما' }
            );
        }
    }
    
    checkSomething(content, keyword) {
        // منطق بررسی
        return true;
    }
}

export default MyNewAnalyzer;
مرحله 2: اضافه کردن به index.js
javascript// js/analyzers/index.js
export { MyNewAnalyzer } from './my-new-analyzer.js';

export function createSEOAnalyzers(config = {}) {
    return [
        // ... سایر Analyzer ها
        new MyNewAnalyzer(config.myNew || {})
    ];
}
مرحله 3: اضافه کردن به Config (اختیاری)
javascript// js/config/constants.js
ANALYZERS: {
    seo: {
        // ...
        myNew: {
            enabled: true,
            priority: 9,
            customOption: 'value'
        }
    }
}
تمام! ✅ Analyzer شما اضافه شد بدون تغییر در کد اصلی.

📦 کلاس‌های پایه
1. BaseAnalyzer
برای همه Analyzer ها:
javascriptclass BaseAnalyzer {
    analyze(analysisData)          // متد اصلی تحلیل
    shouldRun(analysisData)        // بررسی شرایط اجرا
    createSuccessCheck(...)        // ساخت چک موفق
    createWarningCheck(...)        // ساخت چک هشدار
    createErrorCheck(...)          // ساخت چک خطا
}
2. SEOAnalyzer (extends BaseAnalyzer)
برای تحلیل‌های SEO:
javascriptclass SEOAnalyzer extends BaseAnalyzer {
    // requiresKeyword: بررسی نیاز به کلمه کلیدی
    // hasScore: true (در نمره تاثیر دارد)
}
3. ReadabilityAnalyzer (extends BaseAnalyzer)
برای تحلیل‌های خوانایی:
javascriptclass ReadabilityAnalyzer extends BaseAnalyzer {
    // hasScore: false (در نمره تاثیر ندارد)
}
4. SuggestionAnalyzer (extends BaseAnalyzer)
برای پیشنهادات:
javascriptclass SuggestionAnalyzer extends BaseAnalyzer {
    // فقط زمانی اجرا می‌شود که کلمه کلیدی نباشد
}

🛠️ API و توابع کمکی
Text Utils
javascriptimport { normalizeText, countWords, splitIntoSentences } from './utils/text-utils.js';

normalizeText(text)           // نرمال‌سازی متن
countWords(text)              // شمارش کلمات
splitIntoSentences(text)      // تقسیم به جملات
extractWords(text)            // استخراج کلمات
DOM Utils
javascriptimport { extractText, parseHTML, hasKeywordInSection } from './utils/dom-utils.js';

extractText(html)                    // استخراج متن از HTML
parseHTML(html)                      // پارس کامل HTML
hasKeywordInSection(html, kw, sel)   // جستجوی کلیدواژه در بخش
extractImages(html)                  // استخراج تصاویر
extractLinks(html)                   // استخراج لینک‌ها
Keyword Utils
javascriptimport { findKeyword, suggestKeywords, calculateKeywordQuality } from './utils/keyword-utils.js';

findKeyword(text, keyword)              // جستجوی کلمه کلیدی
countKeyword(text, keyword)             // شمارش تکرار
calculateKeywordDensity(text, keyword)  // محاسبه تراکم
suggestKeywords(text, max)              // پیشنهاد کلمات
detectMainKeyword(text, max)            // تشخیص کلمه اصلی
detectSecondaryKeywords(text, max)      // تشخیص کلمات فرعی
Helpers
javascriptimport { debounce, escapeHtml, formatDecimal } from './utils/helpers.js';

debounce(func, delay)        // تاخیر در اجرا
throttle(func, limit)        // محدودسازی اجرا
escapeHtml(text)             // محافظت XSS
deepClone(obj)               // کلون عمیق
delay(ms)                    // انتظار (Promise)
retry(fn, attempts)          // تلاش مجدد

🎨 سفارشی‌سازی
تغییر محدودیت‌های SEO
javascript// js/config/constants.js
SEO_LIMITS: {
    MIN_KEYWORD_DENSITY: 0.5,   // حداقل تراکم
    MAX_KEYWORD_DENSITY: 2.5,   // حداکثر تراکم
    MAX_PARAGRAPH_WORDS: 150,   // حداکثر کلمات پاراگراف
}
غیرفعال کردن یک Analyzer
javascript// js/config/constants.js
ANALYZERS: {
    seo: {
        blueKeyword: {
            enabled: false  // ✅ غیرفعال
        }
    }
}
تغییر اولویت اجرا
javascript// اولویت کمتر = اجرای زودتر
ANALYZERS: {
    seo: {
        h1: {
            priority: 1  // اول اجرا می‌شود
        },
        image: {
            priority: 10  // آخر اجرا می‌شود
        }
    }
}

🐛 دیباگ و مشکل‌یابی
فعال کردن لاگ‌ها
کد از قبل لاگ‌های کافی دارد:
javascriptconsole.log('✅ Analysis Engine راه‌اندازی شد');
console.log('🔍 تحلیل شروع شد...');
console.log('  ⏳ H1Analyzer اجرا شد');
console.log('✅ تحلیل کامل شد (1234ms)');
بررسی وضعیت Engine
javascript// در Console مرورگر:
window.MainApp.engine.getInfo()

// نتیجه:
{
    isRunning: false,
    analyzers: {
        seo: [...],
        readability: [...]
    },
    config: {...}
}
دسترسی به آخرین AnalysisData
javascriptwindow.MainApp.engine.currentAnalysis

⚡ بهینه‌سازی عملکرد
1. Debouncing
تحلیل با تاخیر 500ms انجام می‌شود:
javascriptANALYSIS: {
    DEBOUNCE_DELAY: 500
}
2. Parallel Execution
Analyzer ها به صورت موازی اجرا می‌شوند:
javascriptANALYSIS: {
    PARALLEL_EXECUTION: true
}
3. Caching
المان‌های DOM یکبار کش می‌شوند.
4. Efficient Updates
تغییرات UI به صورت بهینه اعمال می‌شوند.

🔒 امنیت
1. XSS Protection
تمام ورودی‌ها escape می‌شوند:
javascriptimport { escapeHtml } from './utils/helpers.js';
const safe = escapeHtml(userInput);
2. Input Sanitization
HTML paste شده تمیز می‌شود:
javascriptprocessPastedHTML(html) // در TinyMCEManager

📊 معیارهای تحلیل
امتیازدهی SEO

80-100: عالی ✅
60-79: خوب ⚠️
0-59: ضعیف ❌

استانداردهای Yoast

پاراگراف‌ها: حداکثر 25% بلندتر از 150 کلمه


📋 لیست کامل Analyzer ها
SEO Analyzers (7 مورد)
Analyzerاولویتنیاز به کلمه کلیدیتوضیحH1Analyzer1✅بررسی وجود کلمه کلیدی در H1FirstParagraphAnalyzer2✅بررسی کلمه کلیدی در پاراگراف اولKeywordDensityAnalyzer3✅بررسی تراکم در متن و هدینگ (2 چک)SecondaryKeywordsAnalyzer5❌بررسی وجود کلمات فرعیImageAnalyzer6✅Alt تصاویر + نسبت تصویر به متنBlueKeywordAnalyzer7✅رنگ آبی برای کلمه کلیدی (توصیه)LinkAnalyzer8✅لینک‌دهی با کلمات کلیدی
Readability Analyzers (1 مورد)
AnalyzerاولویتتوضیحParagraphLengthAnalyzer11پاراگراف‌های بلند (>150 کلمه)

🤝 مشارکت
برای افزودن ویژگی جدید:

ماژول مربوطه را شناسایی کنید
از کلاس‌های پایه ارث‌بری کنید
تغییرات را اعمال کنید
تست کنید
مستندات را به‌روز کنید


🎓 منابع آموزشی
ES Modules

MDN: JavaScript Modules

TinyMCE

TinyMCE Documentation

SEO Best Practices

Yoast SEO Guidelines
Google Search Central


🚀 شروع سریع
bash# 1. آپلود فایل‌ها به هاست
# 2. مطمئن شوید TinyMCE در مسیر /0/tinymce/ قرار دارد
# 3. باز کردن index.html در مرورگر
# 4. شروع تایپ و تحلیل خودکار!

📝 نسخه‌ها
نسخه فعلی: 2.1.0 (ES Module - Optimized)
تاریخ: 2025
وضعیت: ✅ آماده برای استفاده
تغییرات نسخه 2.1.0

❌ حذف ابزار بررسی طول جملات (موقت - طراحی مجدد در آینده)
✅ بهبود عملکرد تحلیل خوانایی
✅ بهینه‌سازی ساختار Analyzer ها
✅ افزایش سرعت و پایداری