/**
 * کنترلر اصلی UI
 * هماهنگی بین تمام ماژول‌های UI
 */

import ScoreDisplay from './score-display.js';
import TabsManager from './tabs-manager.js';
import ModalManager from './modal-manager.js';
import KeywordsInput from './keywords-input.js';
import ChecksRenderer from './checks-renderer.js';

export class UIController {
    constructor(editorManager) {
        this.editorManager = editorManager;
        
        // ماژول‌های UI
        this.scoreDisplay = null;
        this.tabsManager = null;
        this.modalManager = null;
        this.keywordsInput = null;
        this.checksRenderer = null;
        
        // Callback برای تغییرات
        this.onChangeCallback = null;
    }
    
    /**
     * مقداردهی اولیه
     */
    init(onChangeCallback) {
        this.onChangeCallback = onChangeCallback;
        
        // مقداردهی ماژول‌ها
        this.scoreDisplay = new ScoreDisplay();
        this.scoreDisplay.init();
        
        this.tabsManager = new TabsManager();
        this.tabsManager.init();
        
        this.modalManager = new ModalManager();
        this.modalManager.init();
        
        this.keywordsInput = new KeywordsInput(() => {
            if (this.onChangeCallback) {
                this.onChangeCallback();
            }
        });
        this.keywordsInput.init();
        
        this.checksRenderer = new ChecksRenderer(this.modalManager);
        this.checksRenderer.init();
        
        // Event listeners سراسری
        this.attachGlobalListeners();
        
        console.log('✅ UI Controller راه‌اندازی شد');
    }
    
    /**
     * اتصال event listener های سراسری
     */
    attachGlobalListeners() {
        // کلیک روی پیشنهاد کلمه کلیدی
        document.addEventListener('keywordSuggestionClick', (e) => {
            this.handleKeywordSuggestionClick(e.detail.keyword, e.detail.originalEvent);
        });
    }
    
    /**
     * به‌روزرسانی نتایج تحلیل
     */
    updateAnalysisResults(analysisData) {
        const { seoChecks, readabilityChecks, stats, score } = analysisData;
        
        this.scoreDisplay.updateScore(score);
        this.checksRenderer.updateStats(stats.totalWords, stats.keywordCount);
        this.checksRenderer.renderSEOChecks(seoChecks);
        this.checksRenderer.renderReadabilityChecks(readabilityChecks);
        
        this.tabsManager.updateBadge('seo', this.countErrors(seoChecks));
        this.tabsManager.updateBadge('readability', this.countErrors(readabilityChecks));
    }
    
    /**
     * نمایش حالت بدون کلمه کلیدی
     */
    showNoKeywordState() {
        this.scoreDisplay.showNoKeyword();
        this.checksRenderer.updateStats(0, 0);
        this.checksRenderer.clearChecks();
    }
    
    /**
     * نمایش حالت پیشنهادات
     */
    showSuggestionsState(suggestions, wordCount) {
        this.scoreDisplay.showSuggestions();
        this.checksRenderer.updateStats(wordCount, 0);
        
        // نمایش پیام در تب SEO
        const message = `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 20px;">💡</div>
                <div style="font-size: 16px; font-weight: 600; color: #667eea; margin-bottom: 10px;">
                    پیشنهادات کلمه کلیدی آماده است!
                </div>
                <div style="font-size: 14px; color: #6c757d; line-height: 1.8;">
                    ${suggestions.mainKeywords.length} پیشنهاد برای کلمه کلیدی اصلی<br>
                    ${suggestions.secondaryKeywords.length} پیشنهاد برای کلمات کلیدی فرعی<br><br>
                    👉 به تب <strong>"پیشنهادات"</strong> بروید و روی هر کلمه کلیک کنید
                </div>
            </div>
        `;
        
        const checksListEl = document.getElementById('checksList');
        if (checksListEl) {
            checksListEl.innerHTML = message;
        }
        
        // رندر پیشنهادات در تب پیشنهادات
        this.renderSuggestions(suggestions);
    }
    
    /**
     * رندر پیشنهادات
     */
    renderSuggestions(suggestions) {
        const checks = [];
        
        if (suggestions.mainKeywords && suggestions.mainKeywords.length > 0) {
            checks.push({
                status: 'success',
                title: 'تشخیص کلمه کلیدی اصلی',
                tooltip: 'کلمه کلیدی اصلی مهم‌ترین عبارت در محتوا است که باید در عنوان، پاراگراف اول و چندین بار در متن تکرار شود.',
                desc: `${suggestions.mainKeywords.length} پیشنهاد یافت شد`,
                detail: suggestions.mainKeywords.map(s => 
                    `${s.keyword}: ${s.frequency} بار (کیفیت: ${s.quality}, ارتباط: ${s.relevance})`
                ).join('\n'),
                suggestions: suggestions.mainKeywords
            });
        }
        
        if (suggestions.secondaryKeywords && suggestions.secondaryKeywords.length > 0) {
            checks.push({
                status: 'success',
                title: 'تشخیص کلمات کلیدی فرعی',
                tooltip: 'کلمات کلیدی فرعی عبارات مرتبط با موضوع اصلی هستند که به بهبود سئو و جذب ترافیک بیشتر کمک می‌کنند.',
                desc: `${suggestions.secondaryKeywords.length} پیشنهاد یافت شد`,
                detail: suggestions.secondaryKeywords.map(s => 
                    `${s.keyword}: ${s.frequency} بار (کیفیت: ${s.quality}, ارتباط: ${s.relevance})`
                ).join('\n'),
                suggestions: suggestions.secondaryKeywords
            });
        }
        
        // رندر در تب پیشنهادات
        const suggestionsContent = document.getElementById('suggestionsContent');
        if (suggestionsContent && checks.length > 0) {
            this.checksRenderer.renderChecks(checks, suggestionsContent, false);
        }
    }
    
    /**
     * مدیریت کلیک روی پیشنهاد کلمه کلیدی
     */
    handleKeywordSuggestionClick(keyword, originalEvent = null) {
        // اگر event ارسال شده، از آن استفاده کن
        let clickedElement = null;
        if (originalEvent && originalEvent.target) {
            clickedElement = originalEvent.target.closest('.keyword-suggestion-item');
        } else {
            // fallback: پیدا کردن المان از طریق keyword
            const items = document.querySelectorAll('.keyword-suggestion-item');
            for (let item of items) {
                if (item.getAttribute('data-keyword') === keyword) {
                    clickedElement = item;
                    break;
                }
            }
        }
        
        if (!clickedElement) return;
        
        const parentSuggestions = clickedElement.closest('.keyword-suggestions');
        const isMainKeywordSuggestion = parentSuggestions && parentSuggestions.classList.contains('main-keyword-suggestions');
        const isSecondaryKeywordSuggestion = parentSuggestions && parentSuggestions.classList.contains('secondary-keyword-suggestions');
        
        if (isMainKeywordSuggestion) {
            // تنظیم کلمه کلیدی اصلی
            const currentKeywords = this.keywordsInput.getKeywords();
            this.keywordsInput.setKeywords(keyword, currentKeywords.secondaryKeywords);
            this.keywordsInput.showTemporaryMessage('کلمه کلیدی اصلی تنظیم شد: ' + keyword, 'success');
            
        } else if (isSecondaryKeywordSuggestion) {
            // افزودن کلمه فرعی
            const currentKeywords = this.keywordsInput.getKeywords();
            if (!currentKeywords.secondaryKeywords.includes(keyword)) {
                currentKeywords.secondaryKeywords.push(keyword);
                this.keywordsInput.setKeywords(currentKeywords.mainKeyword, currentKeywords.secondaryKeywords);
                this.keywordsInput.showTemporaryMessage('کلمه کلیدی فرعی اضافه شد: ' + keyword, 'success');
            } else {
                this.keywordsInput.showTemporaryMessage('این کلمه قبلاً اضافه شده است', 'warning');
            }
            
        } else {
            // پیشنهاد عمومی - اگر کلمه اصلی نداریم، آن را اصلی کن
            const currentKeywords = this.keywordsInput.getKeywords();
            
            if (!currentKeywords.mainKeyword) {
                this.keywordsInput.setKeywords(keyword, currentKeywords.secondaryKeywords);
                this.keywordsInput.showTemporaryMessage('کلمه کلیدی اصلی تنظیم شد: ' + keyword, 'success');
            } else {
                // وگرنه فرعی کن
                if (!currentKeywords.secondaryKeywords.includes(keyword)) {
                    currentKeywords.secondaryKeywords.push(keyword);
                    this.keywordsInput.setKeywords(currentKeywords.mainKeyword, currentKeywords.secondaryKeywords);
                    this.keywordsInput.showTemporaryMessage('کلمه کلیدی فرعی اضافه شد: ' + keyword, 'success');
                } else {
                    this.keywordsInput.showTemporaryMessage('این کلمه قبلاً اضافه شده است', 'warning');
                }
            }
        }
        
        // اجرای تحلیل مجدد
        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
    }
    
    /**
     * شمارش خطاها
     */
    countErrors(checks) {
        return checks.filter(c => c.status === 'error').length;
    }
    
    /**
     * دریافت کلمات کلیدی
     */
    getKeywords() {
        return this.keywordsInput.getKeywords();
    }
}

export default UIController;