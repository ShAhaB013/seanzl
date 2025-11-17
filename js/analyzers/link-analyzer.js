/**
 * تحلیل‌گر لینک‌ها
 * بررسی لینک‌دهی با کلمات کلیدی
 */

import { SEOAnalyzer } from './base-analyzer.js';
import { extractLinks } from '../utils/dom-utils.js';

export class LinkAnalyzer extends SEOAnalyzer {
    constructor(config = {}) {
        super('LinkAnalyzer', {
            requiresKeyword: true,
            priority: 8,
            minPercentage: 50, // حداقل 50% لینک‌ها باید با کلمه کلیدی مرتبط باشند
            ...config
        });
    }
    
    /**
     * تحلیل لینک‌ها
     */
    async analyze(analysisData) {
        const { content, mainKeyword, secondaryKeywords } = analysisData;
        
        // استخراج لینک‌ها
        const links = extractLinks(content);
        
        // اگر لینکی نداریم
        if (links.length === 0) {
            return this.createWarningCheck(
                'لینک‌دهی با کلمات کلیدی',
                'هیچ لینکی وجود ندارد',
                {
                    tooltip: 'لینک‌ها باید با کلمات کلیدی مرتبط باشند.',
                    detail: 'توصیه: حداقل یک لینک با کلمه کلیدی اضافه کنید'
                }
            );
        }
        
        // بررسی لینک‌ها
        const mainKeywordLower = mainKeyword.toLowerCase();
        const secondaryKeywordsLower = secondaryKeywords.map(k => k.toLowerCase());
        
        let totalKeywordLinks = 0;
        const keywordLinks = [];
        
        for (const link of links) {
            const linkText = link.text.toLowerCase().trim();
            
            if (linkText.includes(mainKeywordLower)) {
                totalKeywordLinks++;
                keywordLinks.push({ text: link.text, type: 'اصلی' });
            } else if (secondaryKeywordsLower.some(kw => linkText.includes(kw))) {
                totalKeywordLinks++;
                keywordLinks.push({ text: link.text, type: 'فرعی' });
            }
        }
        
        // محاسبه درصد
        const percentage = (totalKeywordLinks / links.length) * 100;
        const isGood = percentage >= this.config.minPercentage;
        
        // نتیجه
        let status, desc, detail;
        
        if (isGood) {
            status = 'success';
            desc = `${totalKeywordLinks}/${links.length} لینک با کلمه کلیدی ✓`;
            detail = null;
        } else {
            status = 'warning';
            desc = `${totalKeywordLinks}/${links.length} لینک با کلمه کلیدی (${Math.round(percentage)}%)`;
            detail = percentage < this.config.minPercentage 
                ? 'توصیه: لینک‌های بیشتری با کلمات کلیدی اضافه کنید' 
                : null;
        }
        
        return this.createCheckResult(
            status,
            'لینک‌دهی با کلمات کلیدی',
            desc,
            {
                tooltip: `حداقل ${this.config.minPercentage}% لینک‌ها باید با کلمات کلیدی مرتبط باشند.`,
                detail
            }
        );
    }
}

export default LinkAnalyzer;
