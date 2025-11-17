/**
 * نقطه ورود اصلی برنامه
 * Orchestrator - هماهنگی تمام ماژول‌ها
 */

// Core
import AnalysisEngine from './core/analysis-engine.js';
import AnalysisData from './core/analysis-data.js';

// Config
import CONFIG from './config/constants.js';

// Analyzers
import { createSEOAnalyzers, createReadabilityAnalyzers } from './analyzers/index.js';

// UI
import { UIController } from './ui/index.js';

// Editor
import TinyMCEManager from './editor/tinymce-manager.js';

// Utils
import { extractText } from './utils/dom-utils.js';
import { detectMainKeyword, detectSecondaryKeywords } from './utils/keyword-utils.js';
import { debounce } from './utils/helpers.js';

/**
 * کلاس اصلی برنامه
 */
class Application {
    constructor() {
        // Core Components
        this.engine = null;
        this.editorManager = null;
        this.uiController = null;
        
        // State
        this.analysisTimeout = null;
        this._lastAnalysis = {
            content: '',
            mainKeyword: '',
            secondaryKeywords: [],
            timestamp: 0
        };
    }
    
    /**
     * راه‌اندازی برنامه
     */
    async init() {
        try {
            console.log('🚀 راه‌اندازی برنامه...');
            
            // 1. راه‌اندازی TinyMCE
            this.editorManager = new TinyMCEManager();
            await this.editorManager.init(() => this.scheduleAnalysis());
            
            // 2. راه‌اندازی Analysis Engine
            this.engine = new AnalysisEngine({
                parallel: CONFIG.ANALYSIS.PARALLEL_EXECUTION,
                timeout: CONFIG.ANALYSIS.TIMEOUT
            });
            
            // ثبت Analyzer ها
            const seoAnalyzers = createSEOAnalyzers(CONFIG.ANALYZERS.seo);
            const readabilityAnalyzers = createReadabilityAnalyzers(CONFIG.ANALYZERS.readability);
            
            this.engine.registerAnalyzers(seoAnalyzers, 'seo');
            this.engine.registerAnalyzers(readabilityAnalyzers, 'readability');
            
            console.log('✅ Analysis Engine راه‌اندازی شد');
            console.log(`   - ${seoAnalyzers.length} SEO Analyzer`);
            console.log(`   - ${readabilityAnalyzers.length} Readability Analyzer`);
            
            // 3. راه‌اندازی UI
            this.uiController = new UIController(this.editorManager);
            this.uiController.init(() => this.scheduleAnalysis());
            
            // 4. Event Listeners
            this.attachEventListeners();
            
            console.log('✅ برنامه با موفقیت راه‌اندازی شد');
            
        } catch (error) {
            console.error('❌ خطا در راه‌اندازی برنامه:', error);
        }
    }
    
    /**
     * اتصال Event Listeners
     */
    attachEventListeners() {
        // Listen به event های engine
        this.engine.on('start', () => {
            console.log('🔍 تحلیل شروع شد...');
        });
        
        this.engine.on('progress', (data) => {
            console.log(`  ⏳ ${data.analyzer} اجرا شد`);
        });
        
        this.engine.on('complete', (data) => {
            console.log(`✅ تحلیل کامل شد (${data.duration}ms)`);
            console.log(`   امتیاز: ${data.analysisData.score}/100`);
        });
        
        this.engine.on('error', (data) => {
            console.error('❌ خطا در تحلیل:', data.error);
        });
    }
    
    /**
     * زمان‌بندی تحلیل با debounce
     */
    scheduleAnalysis() {
        clearTimeout(this.analysisTimeout);
        this.analysisTimeout = setTimeout(() => {
            this.performAnalysis();
        }, CONFIG.ANALYSIS.DEBOUNCE_DELAY);
    }
    
    /**
     * بررسی تغییرات (بهینه‌سازی)
     */
    shouldAnalyze(content, mainKeyword, secondaryKeywords) {
        const now = Date.now();
        if (now - this._lastAnalysis.timestamp < 500) return false;
        
        return content !== this._lastAnalysis.content || 
               mainKeyword !== this._lastAnalysis.mainKeyword || 
               JSON.stringify(secondaryKeywords) !== JSON.stringify(this._lastAnalysis.secondaryKeywords);
    }
    
    /**
     * ذخیره وضعیت تحلیل
     */
    saveAnalysisState(content, mainKeyword, secondaryKeywords) {
        this._lastAnalysis = {
            content,
            mainKeyword,
            secondaryKeywords: [...secondaryKeywords],
            timestamp: Date.now()
        };
    }
    
    /**
     * انجام تحلیل
     */
    async performAnalysis() {
        if (!this.editorManager.isReady()) {
            console.warn('⚠️ ادیتور هنوز آماده نیست');
            return;
        }
        
        // دریافت داده‌ها
        const content = this.editorManager.getContent();
        const plainText = extractText(content);
        const { mainKeyword, secondaryKeywords } = this.uiController.getKeywords();
        
        // بررسی تغییرات
        if (!this.shouldAnalyze(content, mainKeyword, secondaryKeywords)) {
            return;
        }
        
        // حالت 1: بدون کلمه کلیدی - پیشنهاد
        if (!mainKeyword || mainKeyword.trim().length === 0) {
            await this.handleNoKeywordMode(plainText, content);
            this.saveAnalysisState(content, mainKeyword, secondaryKeywords);
            return;
        }
        
        // حالت 2: با کلمه کلیدی - تحلیل کامل
        await this.handleAnalysisMode(content, plainText, mainKeyword, secondaryKeywords);
        this.saveAnalysisState(content, mainKeyword, secondaryKeywords);
    }
    
    /**
     * حالت بدون کلمه کلیدی (پیشنهادات)
     */
    async handleNoKeywordMode(plainText, content) {
        const wordCount = plainText.trim().split(/\s+/).length;
        
        if (wordCount < 50) {
            this.uiController.showNoKeywordState();
            return;
        }
        
        // تشخیص کلمات کلیدی
        const mainSuggestions = detectMainKeyword(plainText, 3);
        const secondarySuggestions = detectSecondaryKeywords(plainText, 5);
        
        if (mainSuggestions.length === 0 && secondarySuggestions.length === 0) {
            this.uiController.showNoKeywordState();
            return;
        }
        
        // نمایش پیشنهادات
        this.uiController.showSuggestionsState(
            {
                mainKeywords: mainSuggestions,
                secondaryKeywords: secondarySuggestions
            },
            wordCount
        );
    }
    
    /**
     * حالت تحلیل کامل
     */
    async handleAnalysisMode(content, plainText, mainKeyword, secondaryKeywords) {
        try {
            // اجرای تحلیل
            const analysisData = await this.engine.analyze(
                content,
                plainText,
                mainKeyword,
                secondaryKeywords
            );
            
            // نمایش نتایج
            this.uiController.updateAnalysisResults(analysisData);
            
        } catch (error) {
            console.error('❌ خطا در تحلیل:', error);
        }
    }
    
    /**
     * تحلیل دستی (برای استفاده خارجی)
     */
    async analyzeManually() {
        await this.performAnalysis();
    }
}

// ✅ بهینه‌سازی: فیلتر خطاهای extension
const originalError = console.error;
console.error = function(...args) {
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('CRLError') || args[0].includes('detector.js'))) {
        return;
    }
    originalError.apply(console, args);
};

// راه‌اندازی برنامه
const app = new Application();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.init();
    });
} else {
    app.init();
}

// Export برای دسترسی جهانی
window.MainApp = app;

export default app;
