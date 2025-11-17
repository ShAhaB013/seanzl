/**
 * تحلیل‌گر طول پاراگراف‌ها
 * بررسی پاراگراف‌های بلند (بیش از 150 کلمه) - استاندارد Yoast
 */

import { ReadabilityAnalyzer } from './base-analyzer.js';
import { countWords } from '../utils/text-utils.js';
import { extractParagraphs } from '../utils/dom-utils.js';

export class ParagraphLengthAnalyzer extends ReadabilityAnalyzer {
    constructor(config = {}) {
        super('ParagraphLengthAnalyzer', {
            priority: 11,
            maxLongParagraphPercentage: 25, // حداکثر 25% پاراگراف‌های بلند
            longParagraphThreshold: 150, // بیش از 150 کلمه = بلند
            ...config
        });
    }
    
    /**
     * تحلیل طول پاراگراف‌ها
     */
    async analyze(analysisData) {
        const { content } = analysisData;
        
        // استخراج پاراگراف‌ها
        const paragraphs = extractParagraphs(content);
        
        if (paragraphs.length === 0) {
            return this.createWarningCheck(
                'طول پاراگراف‌ها',
                'هیچ پاراگرافی یافت نشد',
                {
                    tooltip: `حداکثر ${this.config.maxLongParagraphPercentage}% از پاراگراف‌ها می‌توانند بیش از ${this.config.longParagraphThreshold} کلمه داشته باشند.`
                }
            );
        }
        
        // دسته‌بندی پاراگراف‌ها
        const shortParagraphs = [];   // ≤100 کلمه
        const mediumParagraphs = [];  // 101-150 کلمه
        const longParagraphs = [];    // >150 کلمه
        
        paragraphs.forEach(paragraph => {
            const wordCount = countWords(paragraph);
            if (wordCount <= 100) {
                shortParagraphs.push({ text: paragraph, wordCount });
            } else if (wordCount <= this.config.longParagraphThreshold) {
                mediumParagraphs.push({ text: paragraph, wordCount });
            } else {
                longParagraphs.push({ text: paragraph, wordCount });
            }
        });
        
        // محاسبه درصد
        const totalParagraphs = paragraphs.length;
        const longPercentage = (longParagraphs.length / totalParagraphs) * 100;
        
        // تعیین وضعیت (استاندارد Yoast: حداکثر 25%)
        let status, desc;
        
        if (longPercentage <= this.config.maxLongParagraphPercentage) {
            status = 'success';
            desc = `✓ ${longPercentage.toFixed(1)}% پاراگراف بلند (حداکثر ${this.config.maxLongParagraphPercentage}%)`;
        } else if (longPercentage <= 35) {
            status = 'warning';
            desc = `⚠️ ${longPercentage.toFixed(1)}% پاراگراف بلند (توصیه: کمتر از ${this.config.maxLongParagraphPercentage}%)`;
        } else {
            status = 'error';
            desc = `✕ ${longPercentage.toFixed(1)}% پاراگراف بلند (بسیار زیاد!)`;
        }
        
        const stats = `کوتاه (≤100): ${shortParagraphs.length} | متوسط (101-150): ${mediumParagraphs.length} | بلند (>150): ${longParagraphs.length}`;
        
        return this.createCheckResult(
            status,
            'طول پاراگراف‌ها',
            desc,
            {
                tooltip: `حداکثر ${this.config.maxLongParagraphPercentage}% از پاراگراف‌ها می‌توانند بیش از ${this.config.longParagraphThreshold} کلمه داشته باشند.`,
                detail: stats,
                metadata: {
                    longParagraphs: longParagraphs // برای هایلایت در UI
                }
            }
        );
    }
}

export default ParagraphLengthAnalyzer;
