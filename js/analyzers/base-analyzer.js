/**
 * کلاس پایه برای تمام Analyzer ها
 * تمام تحلیل‌گرها باید از این کلاس ارث‌بری کنند
 */

export class BaseAnalyzer {
    constructor(name, config = {}) {
        if (new.target === BaseAnalyzer) {
            throw new Error('BaseAnalyzer نمی‌تواند مستقیماً instantiate شود');
        }
        
        this.name = name;
        this.config = config;
        this.enabled = config.enabled !== false; // پیش‌فرض: فعال
        this.priority = config.priority || 10; // پیش‌فرض: اولویت متوسط (1-20)
    }
    
    /**
     * متد اصلی تحلیل - باید توسط کلاس فرزند override شود
     * @param {AnalysisData} analysisData - داده تحلیل
     * @returns {Object|null} نتیجه چک یا null
     */
    async analyze(analysisData) {
        throw new Error(`متد analyze() باید در ${this.name} پیاده‌سازی شود`);
    }
    
    /**
     * بررسی اینکه آیا این analyzer باید اجرا شود
     * @param {AnalysisData} analysisData
     * @returns {boolean}
     */
    shouldRun(analysisData) {
        if (!this.enabled) return false;
        if (!analysisData.hasContent()) return false;
        return true;
    }
    
    /**
     * ساخت یک نتیجه چک استاندارد
     */
    createCheckResult(status, title, desc, options = {}) {
        const validStatuses = ['success', 'warning', 'error'];
        if (!validStatuses.includes(status)) {
            throw new Error(`وضعیت نامعتبر: ${status}`);
        }
        
        return {
            status,
            title,
            desc,
            tooltip: options.tooltip || title,
            detail: options.detail || null,
            hasScore: options.hasScore !== false, // پیش‌فرض: در نمره تاثیر دارد
            suggestions: options.suggestions || null,
            metadata: {
                analyzer: this.name,
                timestamp: Date.now(),
                ...options.metadata
            }
        };
    }
    
    /**
     * ساخت چک موفق
     */
    createSuccessCheck(title, desc, options = {}) {
        return this.createCheckResult('success', title, desc, options);
    }
    
    /**
     * ساخت چک هشدار
     */
    createWarningCheck(title, desc, options = {}) {
        return this.createCheckResult('warning', title, desc, options);
    }
    
    /**
     * ساخت چک خطا
     */
    createErrorCheck(title, desc, options = {}) {
        return this.createCheckResult('error', title, desc, options);
    }
    
    /**
     * log کردن خطا
     */
    logError(error, context = '') {
        console.error(`[${this.name}] خطا${context ? ' در ' + context : ''}:`, error);
    }
    
    /**
     * log کردن هشدار
     */
    logWarning(message) {
        console.warn(`[${this.name}] هشدار:`, message);
    }
    
    /**
     * اطلاعات analyzer
     */
    getInfo() {
        return {
            name: this.name,
            enabled: this.enabled,
            priority: this.priority,
            config: this.config
        };
    }
    
    /**
     * فعال/غیرفعال کردن
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

/**
 * کلاس پایه برای تحلیل‌گرهای SEO
 */
export class SEOAnalyzer extends BaseAnalyzer {
    constructor(name, config = {}) {
        super(name, config);
        this.type = 'seo';
    }
    
    /**
     * بررسی نیاز به کلمه کلیدی
     */
    shouldRun(analysisData) {
        if (!super.shouldRun(analysisData)) return false;
        
        // اگر نیاز به کلمه کلیدی دارد
        if (this.config.requiresKeyword && !analysisData.hasMainKeyword()) {
            return false;
        }
        
        return true;
    }
}

/**
 * کلاس پایه برای تحلیل‌گرهای خوانایی
 */
export class ReadabilityAnalyzer extends BaseAnalyzer {
    constructor(name, config = {}) {
        super(name, config);
        this.type = 'readability';
    }
    
    /**
     * چک‌های خوانایی در نمره تاثیر ندارند
     */
    createCheckResult(status, title, desc, options = {}) {
        return super.createCheckResult(status, title, desc, {
            ...options,
            hasScore: false // خوانایی در نمره SEO تاثیر ندارد
        });
    }
}

/**
 * کلاس پایه برای تحلیل‌گرهای پیشنهادی
 */
export class SuggestionAnalyzer extends BaseAnalyzer {
    constructor(name, config = {}) {
        super(name, config);
        this.type = 'suggestion';
    }
    
    /**
     * پیشنهادات فقط زمانی اجرا می‌شوند که کلمه کلیدی نباشد
     */
    shouldRun(analysisData) {
        if (!super.shouldRun(analysisData)) return false;
        
        // فقط اگر کلمه کلیدی نداریم
        if (analysisData.hasMainKeyword()) return false;
        
        // حداقل 50 کلمه
        if (analysisData.stats.totalWords < 50) return false;
        
        return true;
    }
}

export default BaseAnalyzer;
