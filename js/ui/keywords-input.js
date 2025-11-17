/**
 * مدیریت ورودی کلمات کلیدی
 */

export class KeywordsInput {
    constructor(onChangeCallback) {
        this.elements = {
            mainKeyword: null,
            secondaryKeywords: null,
            keywordsTags: null
        };
        this.secondaryKeywordsArray = [];
        this.onChangeCallback = onChangeCallback;
    }
    
    /**
     * مقداردهی اولیه
     */
    init() {
        this.cacheElements();
        this.attachEventListeners();
    }
    
    /**
     * کش کردن المان‌ها
     */
    cacheElements() {
        this.elements.mainKeyword = document.getElementById('mainKeyword');
        this.elements.secondaryKeywords = document.getElementById('secondaryKeywords');
        this.elements.keywordsTags = document.getElementById('keywordsTags');
    }
    
    /**
     * اتصال event listener ها
     */
    attachEventListeners() {
        // کلمه کلیدی اصلی
        this.elements.mainKeyword.addEventListener('input', () => {
            if (this.onChangeCallback) {
                this.onChangeCallback();
            }
        });
        
        // کلمات فرعی - Enter برای افزودن
        this.elements.secondaryKeywords.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addKeywordTag();
            } else if (e.key === 'Backspace' && e.target.value === '') {
                this.removeLastKeywordTag();
            }
        });
        
        // جلوگیری از submit فرم
        this.elements.secondaryKeywords.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }
    
    /**
     * افزودن تگ کلمه کلیدی
     */
    addKeywordTag() {
        const input = this.elements.secondaryKeywords;
        const keyword = input.value.trim();
        
        if (!keyword) return;
        
        if (this.secondaryKeywordsArray.includes(keyword)) {
            this.showTemporaryMessage('این کلمه قبلاً اضافه شده است', 'warning');
            input.value = '';
            return;
        }
        
        this.secondaryKeywordsArray.push(keyword);
        this.renderKeywordTags();
        input.value = '';
        
        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
    }
    
    /**
     * حذف آخرین تگ
     */
    removeLastKeywordTag() {
        if (this.secondaryKeywordsArray.length === 0) return;
        
        this.secondaryKeywordsArray.pop();
        this.renderKeywordTags();
        
        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
    }
    
    /**
     * حذف یک تگ خاص
     */
    removeKeywordTag(keyword) {
        const index = this.secondaryKeywordsArray.indexOf(keyword);
        if (index > -1) {
            this.secondaryKeywordsArray.splice(index, 1);
            this.renderKeywordTags();
            
            if (this.onChangeCallback) {
                this.onChangeCallback();
            }
        }
    }
    
    /**
     * رندر تگ‌های کلمات کلیدی
     */
    renderKeywordTags() {
        const container = this.elements.keywordsTags;
        const fragment = document.createDocumentFragment();
        
        this.secondaryKeywordsArray.forEach(keyword => {
            const tag = document.createElement('div');
            tag.className = 'keyword-tag';
            
            const text = document.createElement('span');
            text.className = 'keyword-tag-text';
            text.textContent = keyword;
            text.title = keyword;
            
            const removeBtn = document.createElement('span');
            removeBtn.className = 'keyword-tag-remove';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', () => {
                this.removeKeywordTag(keyword);
            });
            
            tag.appendChild(text);
            tag.appendChild(removeBtn);
            fragment.appendChild(tag);
        });
        
        container.innerHTML = '';
        container.appendChild(fragment);
    }
    
    /**
     * دریافت کلمات کلیدی
     */
    getKeywords() {
        return {
            mainKeyword: this.elements.mainKeyword.value.trim(),
            secondaryKeywords: this.secondaryKeywordsArray
        };
    }
    
    /**
     * تنظیم کلمات کلیدی
     */
    setKeywords(mainKeyword, secondaryKeywords = []) {
        this.elements.mainKeyword.value = mainKeyword;
        this.secondaryKeywordsArray = [...secondaryKeywords];
        this.renderKeywordTags();
    }
    
    /**
     * نمایش پیام موقت
     */
    showTemporaryMessage(message, type = 'info') {
        const colors = {
            success: '#10b981',
            warning: '#f59e0b',
            info: '#667eea'
        };
        
        const messageEl = document.createElement('div');
        messageEl.className = `temporary-message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-family: 'Vazir', Tahoma, sans-serif;
            font-size: 14px;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }
}

export default KeywordsInput;
