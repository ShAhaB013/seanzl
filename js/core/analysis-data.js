/**
 * مدل داده تحلیل SEO
 * این کلاس تمام داده‌های تحلیل شده را نگهداری می‌کند
 */

export class AnalysisData {
    constructor() {
        // اطلاعات اولیه
        this.content = '';
        this.plainText = '';
        this.mainKeyword = '';
        this.secondaryKeywords = [];
        
        // آمار کلی
        this.stats = {
            totalWords: 0,
            totalWordsWithoutHeadings: 0,
            keywordCount: 0,
            keywordDensity: 0,
            imageCount: 0,
            linkCount: 0,
            paragraphCount: 0,
            sentenceCount: 0
        };
        
        // نتایج چک‌های SEO
        this.seoChecks = [];
        
        // نتایج چک‌های خوانایی
        this.readabilityChecks = [];
        
        // پیشنهادات کلمات کلیدی
        this.suggestions = {
            mainKeywords: [],
            secondaryKeywords: []
        };
        
        // امتیاز کلی
        this.score = 0;
        
        // وضعیت تحلیل
        this.status = 'idle'; // idle | analyzing | completed | error
        
        // زمان تحلیل
        this.timestamp = Date.now();
    }
    
    /**
     * تنظیم محتوای اولیه
     */
    setContent(content, plainText) {
        this.content = content;
        this.plainText = plainText;
        this.timestamp = Date.now();
    }
    
    /**
     * تنظیم کلمات کلیدی
     */
    setKeywords(mainKeyword, secondaryKeywords = []) {
        this.mainKeyword = mainKeyword;
        this.secondaryKeywords = Array.isArray(secondaryKeywords) 
            ? secondaryKeywords 
            : [];
    }
    
    /**
     * به‌روزرسانی آمار
     */
    updateStats(stats) {
        this.stats = { ...this.stats, ...stats };
    }
    
    /**
     * افزودن چک SEO
     */
    addSEOCheck(check) {
        // ✅ اگر آرایه است، هر یک را جداگانه اضافه کن
        if (Array.isArray(check)) {
            check.forEach(c => {
                if (this.isValidCheck(c)) {
                    this.seoChecks.push(c);
                } else {
                    console.warn('چک نامعتبر:', c);
                }
            });
            return;
        }
        
        // چک تکی
        if (!this.isValidCheck(check)) {
            console.warn('چک نامعتبر:', check);
            return;
        }
        this.seoChecks.push(check);
    }
    
    /**
     * افزودن چک خوانایی
     */
    addReadabilityCheck(check) {
        // ✅ اگر آرایه است، هر یک را جداگانه اضافه کن
        if (Array.isArray(check)) {
            check.forEach(c => {
                if (this.isValidCheck(c)) {
                    this.readabilityChecks.push(c);
                } else {
                    console.warn('چک نامعتبر:', c);
                }
            });
            return;
        }
        
        // چک تکی
        if (!this.isValidCheck(check)) {
            console.warn('چک نامعتبر:', check);
            return;
        }
        this.readabilityChecks.push(check);
    }
    
    /**
     * اعتبارسنجی چک
     */
    isValidCheck(check) {
        return check &&
               typeof check.status === 'string' &&
               typeof check.title === 'string' &&
               typeof check.desc === 'string';
    }
    
    /**
     * تنظیم پیشنهادات
     */
    setSuggestions(mainKeywords = [], secondaryKeywords = []) {
        this.suggestions.mainKeywords = mainKeywords;
        this.suggestions.secondaryKeywords = secondaryKeywords;
    }
    
    /**
     * محاسبه امتیاز کلی
     */
    calculateScore() {
        // فقط چک‌های SEO که hasScore !== false
        const scoreAffectingChecks = this.seoChecks.filter(
            check => check.hasScore !== false
        );
        
        if (scoreAffectingChecks.length === 0) {
            this.score = 0;
            return 0;
        }
        
        const successCount = scoreAffectingChecks.filter(
            check => check.status === 'success'
        ).length;
        
        this.score = Math.round((successCount / scoreAffectingChecks.length) * 100);
        return this.score;
    }
    
    /**
     * تنظیم وضعیت
     */
    setStatus(status) {
        this.status = status;
    }
    
    /**
     * بررسی اینکه آیا کلمه کلیدی اصلی وجود دارد
     */
    hasMainKeyword() {
        return this.mainKeyword && this.mainKeyword.trim().length > 0;
    }
    
    /**
     * بررسی اینکه آیا محتوا وجود دارد
     */
    hasContent() {
        return this.content && this.content.trim().length > 0;
    }
    
    /**
     * دریافت خلاصه تحلیل
     */
    getSummary() {
        return {
            score: this.score,
            totalWords: this.stats.totalWords,
            keywordCount: this.stats.keywordCount,
            keywordDensity: this.stats.keywordDensity,
            seoChecksCount: this.seoChecks.length,
            readabilityChecksCount: this.readabilityChecks.length,
            status: this.status,
            hasMainKeyword: this.hasMainKeyword()
        };
    }
    
    /**
     * دریافت تمام چک‌ها
     */
    getAllChecks() {
        return {
            seo: [...this.seoChecks],
            readability: [...this.readabilityChecks]
        };
    }
    
    /**
     * پاک کردن تمام داده‌ها
     */
    reset() {
        this.content = '';
        this.plainText = '';
        this.mainKeyword = '';
        this.secondaryKeywords = [];
        this.stats = {
            totalWords: 0,
            totalWordsWithoutHeadings: 0,
            keywordCount: 0,
            keywordDensity: 0,
            imageCount: 0,
            linkCount: 0,
            paragraphCount: 0,
            sentenceCount: 0
        };
        this.seoChecks = [];
        this.readabilityChecks = [];
        this.suggestions = {
            mainKeywords: [],
            secondaryKeywords: []
        };
        this.score = 0;
        this.status = 'idle';
        this.timestamp = Date.now();
    }
    
    /**
     * دریافت نسخه JSON
     */
    toJSON() {
        return {
            mainKeyword: this.mainKeyword,
            secondaryKeywords: this.secondaryKeywords,
            stats: this.stats,
            seoChecks: this.seoChecks,
            readabilityChecks: this.readabilityChecks,
            suggestions: this.suggestions,
            score: this.score,
            status: this.status,
            timestamp: this.timestamp
        };
    }
    
    /**
     * بارگذاری از JSON
     */
    fromJSON(json) {
        if (!json) return;
        
        this.mainKeyword = json.mainKeyword || '';
        this.secondaryKeywords = json.secondaryKeywords || [];
        this.stats = json.stats || this.stats;
        this.seoChecks = json.seoChecks || [];
        this.readabilityChecks = json.readabilityChecks || [];
        this.suggestions = json.suggestions || this.suggestions;
        this.score = json.score || 0;
        this.status = json.status || 'idle';
        this.timestamp = json.timestamp || Date.now();
    }
}

export default AnalysisData;