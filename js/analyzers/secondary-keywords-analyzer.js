/**
 * تحلیل‌گر کلمات کلیدی فرعی
 * بررسی وجود کلمات کلیدی فرعی در متن
 */

import { SEOAnalyzer } from './base-analyzer.js';
import { findKeyword } from '../utils/keyword-utils.js';
import { displayText } from '../utils/text-utils.js';

export class SecondaryKeywordsAnalyzer extends SEOAnalyzer {
    constructor(config = {}) {
        super('SecondaryKeywordsAnalyzer', {
            requiresKeyword: false, // کلمه اصلی لازم نیست
            priority: 5,
            minPercentage: 70, // حداقل 70% باید در متن باشند
            ...config
        });
    }
    
    /**
     * بررسی اینکه آیا باید اجرا شود
     */
    shouldRun(analysisData) {
        if (!super.shouldRun(analysisData)) return false;
        
        // اگر کلمه فرعی نداریم، نیازی به چک نیست
        if (!analysisData.secondaryKeywords || analysisData.secondaryKeywords.length === 0) {
            return false;
        }
        
        return true;
    }
    
    /**
     * تحلیل کلمات فرعی
     */
    async analyze(analysisData) {
        const { plainText, secondaryKeywords } = analysisData;
        
        // اگر کلمه فرعی نداریم
        if (secondaryKeywords.length === 0) {
            return this.createWarningCheck(
                'کلمات کلیدی فرعی',
                'کلمه فرعی تعریف نشده',
                {
                    tooltip: 'کلمات فرعی به جذب ترافیک بیشتر کمک می‌کنند.',
                    detail: 'لطفاً کلمات فرعی را وارد کنید'
                }
            );
        }
        
        // جستجوی هر کلمه فرعی در متن
        const foundKeywords = [];
        const notFoundKeywords = [];
        
        for (const keyword of secondaryKeywords) {
            const matches = findKeyword(plainText, keyword);
            if (matches.length > 0) {
                foundKeywords.push(keyword);
            } else {
                notFoundKeywords.push(keyword);
            }
        }
        
        // محاسبه درصد
        const percentage = (foundKeywords.length / secondaryKeywords.length) * 100;
        const isGood = percentage >= this.config.minPercentage;
        
        // نتیجه
        const status = isGood ? 'success' : 'warning';
        const desc = `${foundKeywords.length} از ${secondaryKeywords.length} کلمه در متن`;
        
        let detail = null;
        if (foundKeywords.length > 0) {
            detail = `یافت شده: ${foundKeywords.map(k => displayText(k)).join('، ')}`;
        }
        if (notFoundKeywords.length > 0) {
            detail += detail ? `\nنیافته: ${notFoundKeywords.map(k => displayText(k)).join('، ')}` 
                             : `نیافته: ${notFoundKeywords.map(k => displayText(k)).join('، ')}`;
        }
        
        return this.createCheckResult(
            status,
            'کلمات کلیدی فرعی',
            desc,
            {
                tooltip: `حداقل ${this.config.minPercentage}% کلمات فرعی باید در متن باشند.`,
                detail
            }
        );
    }
}

export default SecondaryKeywordsAnalyzer;
