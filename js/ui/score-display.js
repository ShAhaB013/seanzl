/**
 * مدیریت نمایش امتیاز و Progress Bar
 */

import { SCORE_THRESHOLDS, MESSAGES } from '../config/constants.js';

export class ScoreDisplay {
    constructor() {
        this.elements = {
            scoreCircle: null,
            scoreLabel: null,
            scoreDesc: null,
            progressFill: null
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
        this.elements.scoreCircle = document.getElementById('scoreCircle');
        this.elements.scoreLabel = document.getElementById('scoreLabel');
        this.elements.scoreDesc = document.getElementById('scoreDesc');
        this.elements.progressFill = document.querySelector('.score-progress-fill');
    }
    
    /**
     * به‌روزرسانی امتیاز
     */
    updateScore(score) {
        // تنظیم عدد امتیاز
        this.elements.scoreCircle.textContent = score;
        
        // تعیین پیام و کلاس
        let message, colorClass;
        
        if (score >= SCORE_THRESHOLDS.EXCELLENT) {
            message = MESSAGES.EXCELLENT;
            colorClass = 'excellent';
        } else if (score >= SCORE_THRESHOLDS.GOOD) {
            message = MESSAGES.GOOD;
            colorClass = 'good';
        } else {
            message = MESSAGES.POOR;
            colorClass = 'poor';
        }
        
        // آپدیت متن‌ها
        this.elements.scoreLabel.textContent = message.label;
        this.elements.scoreDesc.textContent = message.desc;
        
        // آپدیت progress bar
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = score + '%';
            this.elements.progressFill.className = 'score-progress-fill ' + colorClass;
        }
    }
    
    /**
     * نمایش حالت "بدون کلمه کلیدی"
     */
    showNoKeyword() {
        this.elements.scoreCircle.textContent = '--';
        this.elements.scoreLabel.textContent = MESSAGES.NO_KEYWORD.label;
        this.elements.scoreDesc.textContent = MESSAGES.NO_KEYWORD.desc;
        
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = '0%';
            this.elements.progressFill.className = 'score-progress-fill';
        }
    }
    
    /**
     * نمایش حالت "در حال تحلیل"
     */
    showAnalyzing() {
        this.elements.scoreCircle.textContent = '...';
        this.elements.scoreLabel.textContent = MESSAGES.ANALYZING.label;
        this.elements.scoreDesc.textContent = MESSAGES.ANALYZING.desc;
    }
    
    /**
     * نمایش حالت "پیشنهادات"
     */
    showSuggestions() {
        this.elements.scoreCircle.textContent = '💡';
        this.elements.scoreLabel.textContent = 'پیشنهادات آماده است';
        this.elements.scoreDesc.textContent = 'به تب "پیشنهادات" بروید';
        
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = '0%';
            this.elements.progressFill.className = 'score-progress-fill';
        }
    }
    
    /**
     * تنظیم سفارشی
     */
    setCustom(icon, label, desc) {
        this.elements.scoreCircle.textContent = icon;
        this.elements.scoreLabel.textContent = label;
        this.elements.scoreDesc.textContent = desc;
    }
}

export default ScoreDisplay;
