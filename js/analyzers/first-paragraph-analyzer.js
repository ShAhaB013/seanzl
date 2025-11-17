/**
 * تحلیل‌گر پاراگراف اول
 * بررسی وجود کلمه کلیدی در اولین پاراگراف
 */

import { SEOAnalyzer } from './base-analyzer.js';
import { findKeyword } from '../utils/keyword-utils.js';
import { displayText } from '../utils/text-utils.js';
import { getFirstParagraph } from '../utils/dom-utils.js';

export class FirstParagraphAnalyzer extends SEOAnalyzer {
    constructor(config = {}) {
        super('FirstParagraphAnalyzer', {
            requiresKeyword: true,
            priority: 2,
            maxPreviewLength: 80,
            ...config
        });
    }
    
    /**
     * تحلیل پاراگراف اول
     */
    async analyze(analysisData) {
        const { content, mainKeyword } = analysisData;
        
        // دریافت اولین پاراگراف (بدون H1)
        const firstPara = getFirstParagraph(content);
        
        // بررسی وجود پاراگراف
        if (!firstPara || firstPara.trim().length === 0) {
            return this.createErrorCheck(
                'کلمه کلیدی در پاراگراف اول',
                'هیچ پاراگرافی یافت نشد',
                {
                    tooltip: 'پاراگراف اول باید شامل کلمه کلیدی باشد.',
                    detail: 'لطفاً محتوا اضافه کنید'
                }
            );
        }
        
        // جستجوی کلمه کلیدی
        const keywordMatches = findKeyword(firstPara, mainKeyword);
        const found = keywordMatches.length > 0;
        
        // ساخت preview
        const maxLength = this.config.maxPreviewLength;
        const preview = firstPara.length > maxLength
            ? displayText(firstPara.substring(0, maxLength)) + '...'
            : displayText(firstPara);
        
        // نتیجه
        if (found) {
            return this.createSuccessCheck(
                'کلمه کلیدی در پاراگراف اول',
                'پاراگراف اول شامل کلمه کلیدی است ✓',
                {
                    tooltip: 'پاراگراف اول شامل کلمه کلیدی است.',
                    detail: preview
                }
            );
        } else {
            return this.createErrorCheck(
                'کلمه کلیدی در پاراگراف اول',
                'پاراگراف اول باید شامل کلمه کلیدی باشد',
                {
                    tooltip: 'پاراگراف اول باید شامل کلمه کلیدی باشد.',
                    detail: `محتوای فعلی: ${preview}`
                }
            );
        }
    }
}

export default FirstParagraphAnalyzer;
