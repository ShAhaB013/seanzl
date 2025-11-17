/**
 * رندر کننده چک‌های SEO و خوانایی
 */

import { STATUS_ICONS } from '../config/constants.js';
import { escapeHtml } from '../utils/helpers.js';

export class ChecksRenderer {
    constructor(modalManager) {
        this.modalManager = modalManager;
        this.elements = {
            checksList: null,
            readabilityChecks: null,
            suggestionsContent: null,
            wordCount: null,
            keywordCount: null
        };
    }
    
    /**
     * مقداردهی اولیه
     */
    init() {
        this.cacheElements();
    }
    
    /**
     * کش کردن المان‌ها
     */
    cacheElements() {
        this.elements.checksList = document.getElementById('checksList');
        this.elements.readabilityChecks = document.getElementById('readabilityChecks');
        this.elements.suggestionsContent = document.getElementById('suggestionsContent');
        this.elements.wordCount = document.getElementById('wordCount');
        this.elements.keywordCount = document.getElementById('keywordCount');
    }
    
    /**
     * رندر چک‌های SEO
     */
    renderSEOChecks(checks) {
        this.renderChecks(checks, this.elements.checksList, false);
    }
    
    /**
     * رندر چک‌های خوانایی
     */
    renderReadabilityChecks(checks) {
        this.renderChecks(checks, this.elements.readabilityChecks, true);
    }
    
    /**
     * رندر چک‌ها
     */
    renderChecks(checks, container, isReadability = false) {
        if (!container) return;
        
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');
        
        if (isReadability) {
            tempDiv.innerHTML = checks.map(check => this.createReadabilityCheckHTML(check)).join('');
        } else {
            tempDiv.innerHTML = checks.map(check => this.createCheckHTML(check)).join('');
        }
        
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }
        
        container.innerHTML = '';
        container.appendChild(fragment);
        
        // اتصال event listeners
        this.attachCheckEventListeners(container, isReadability);
    }
    
    /**
     * ساخت HTML چک عادی
     */
    createCheckHTML(check) {
        const icon = STATUS_ICONS[check.status];
        const escapedTitle = escapeHtml(check.title);
        const escapedTooltip = escapeHtml(check.tooltip);
        
        const suggestionsHTML = this.buildSuggestionsHTML(check);
        
        return `
            <div class="check-item">
                <div class="check-header">
                    <div class="check-icon ${check.status}">${icon}</div>
                    <div class="check-title">${check.title}</div>
                    <div class="check-info" data-title="${escapedTitle}" data-tooltip="${escapedTooltip}">ℹ</div>
                </div>
                <div class="check-desc">${check.desc}</div>
                ${check.detail ? `<div class="check-detail">${check.detail}</div>` : ''}
                ${suggestionsHTML}
            </div>
        `;
    }
    
    /**
     * ساخت HTML چک خوانایی
     */
    createReadabilityCheckHTML(check) {
    const icon = STATUS_ICONS[check.status];
    const escapedTitle = escapeHtml(check.title);
    const escapedTooltip = escapeHtml(check.tooltip);
    
    return `
        <div class="readability-check-item">
            <div class="readability-check-header">
                <div class="readability-check-icon ${check.status}">${icon}</div>
                <div class="readability-check-title">${check.title}</div>
                <div class="check-info" data-title="${escapedTitle}" data-tooltip="${escapedTooltip}">ℹ</div>
            </div>
            <div class="readability-check-desc">${check.desc}</div>
            ${check.detail ? `<div class="check-detail">${check.detail}</div>` : ''}
        </div>
    `;
    }
    
    /**
     * ساخت HTML پیشنهادات کلمات کلیدی
     */
    buildSuggestionsHTML(check) {
        if (!check.suggestions || check.suggestions.length === 0) return '';
        
        const suggestionsClass = check.title.includes('اصلی') ? 'main-keyword-suggestions' : 
                               check.title.includes('فرعی') ? 'secondary-keyword-suggestions' : 
                               'keyword-suggestions';
        
        const items = check.suggestions.map(s => `
            <div class="keyword-suggestion-item" data-keyword="${escapeHtml(s.keyword)}">
                <div class="keyword-suggestion-text">${escapeHtml(s.keyword)}</div>
                <div class="keyword-suggestion-meta">
                    <span class="keyword-suggestion-count">${s.frequency}</span>
                    <span class="keyword-suggestion-type">${s.type}</span>
                    ${s.quality ? `<span class="keyword-suggestion-quality">Q:${s.quality}</span>` : ''}
                    ${s.relevance ? `<span class="keyword-suggestion-relevance">R:${s.relevance}</span>` : ''}
                </div>
            </div>
        `).join('');
        
        return `<div class="keyword-suggestions ${suggestionsClass}">${items}</div>`;
    }
    
    /**
     * اتصال event listeners به چک‌ها
     */
    attachCheckEventListeners(container, isReadability) {
        if (!container || !container.parentNode) return;
        
        // Event delegation
        container.addEventListener('click', (e) => {
            // کلیک روی آیکون اطلاعات
            const infoIcon = e.target.closest('.check-info');
            if (infoIcon) {
                const title = infoIcon.getAttribute('data-title');
                const tooltip = infoIcon.getAttribute('data-tooltip');
                this.modalManager.show(title, tooltip);
                return;
            }
            
            // کلیک روی پیشنهاد کلمه کلیدی
            const suggestionItem = e.target.closest('.keyword-suggestion-item');
            if (suggestionItem) {
                const keyword = suggestionItem.getAttribute('data-keyword');
                // این event را به UI Controller ارسال می‌کنیم با originalEvent
                const customEvent = new CustomEvent('keywordSuggestionClick', { 
                    detail: { 
                        keyword,
                        originalEvent: e 
                    } 
                });
                document.dispatchEvent(customEvent);
            }
        });
    }
    
    /**
     * به‌روزرسانی آمار
     */
    updateStats(totalWords, keywordCount) {
        if (this.elements.wordCount) {
            this.elements.wordCount.textContent = totalWords;
        }
        if (this.elements.keywordCount) {
            this.elements.keywordCount.textContent = keywordCount;
        }
    }
    
    /**
     * پاک کردن چک‌ها
     */
    clearChecks() {
        if (this.elements.checksList) {
            this.elements.checksList.innerHTML = '';
        }
        if (this.elements.readabilityChecks) {
            this.elements.readabilityChecks.innerHTML = '';
        }
        if (this.elements.suggestionsContent) {
            this.elements.suggestionsContent.innerHTML = '';
        }
    }
    
    /**
     * نمایش پیام خالی
     */
    showEmptyMessage(container, message) {
        if (!container) return;
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #6c757d;">
                <div style="font-size: 48px; margin-bottom: 20px;">📝</div>
                <div style="font-size: 16px;">${message}</div>
            </div>
        `;
    }
}

export default ChecksRenderer;