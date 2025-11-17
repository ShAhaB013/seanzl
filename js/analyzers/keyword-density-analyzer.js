/**
 * تحلیل‌گر تراکم کلمه کلیدی
 * بررسی تراکم کلمه کلیدی در متن و هدینگ‌ها
 */

import { SEOAnalyzer } from './base-analyzer.js';
import { findKeyword } from '../utils/keyword-utils.js';
import { countWords, formatDecimal } from '../utils/text-utils.js';
import { extractTextWithoutHeadings, extractTextFromHeadings } from '../utils/dom-utils.js';

export class KeywordDensityAnalyzer extends SEOAnalyzer {
    constructor(config = {}) {
        super('KeywordDensityAnalyzer', {
            requiresKeyword: true,
            priority: 3,
            minDensity: 0.5,
            maxDensity: 2.5,
            minHeadingDensity: 3,
            maxHeadingDensity: 10,
            ...config
        });
    }
    
    /**
     * تحلیل تراکم
     */
    async analyze(analysisData) {
        const results = [];
        
        // چک تراکم در متن
        const textCheck = this.analyzeTextDensity(analysisData);
        if (textCheck) results.push(textCheck);
        
        // چک تراکم در هدینگ‌ها
        const headingCheck = this.analyzeHeadingDensity(analysisData);
        if (headingCheck) results.push(headingCheck);
        
        // اگر چند چک داریم، هر دو را برمی‌گردانیم
        // Engine باید تک تک را اضافه کند
        return results.length === 1 ? results[0] : results;
    }
    
    /**
     * تحلیل تراکم در متن
     */
    analyzeTextDensity(analysisData) {
        const { content, mainKeyword, stats } = analysisData;
        const { totalWordsWithoutHeadings, keywordCount, keywordDensity } = stats;
        
        if (totalWordsWithoutHeadings === 0) {
            return this.createWarningCheck(
                'تراکم کلمه کلیدی (متن)',
                'متنی برای تحلیل وجود ندارد',
                {
                    tooltip: `تراکم مناسب بین ${this.config.minDensity}-${this.config.maxDensity}% است.`
                }
            );
        }
        
        const { minDensity, maxDensity } = this.config;
        const densityOK = keywordDensity >= minDensity && keywordDensity <= maxDensity;
        
        let status, desc, detail;
        
        if (densityOK) {
            status = 'success';
            desc = `تراکم مناسب: ${formatDecimal(keywordDensity)}% ✓`;
        } else if (keywordDensity < minDensity) {
            status = 'warning';
            desc = `تراکم کم: ${formatDecimal(keywordDensity)}% (باید ${minDensity}-${maxDensity}%)`;
        } else {
            status = 'error';
            desc = `تراکم زیاد: ${formatDecimal(keywordDensity)}% (خطر Keyword Stuffing)`;
        }
        
        detail = `${keywordCount} بار از ${totalWordsWithoutHeadings} کلمه`;
        
        return this.createCheckResult(
            status,
            'تراکم کلمه کلیدی (متن)',
            desc,
            {
                tooltip: `تراکم مناسب بین ${minDensity}-${maxDensity}% است.`,
                detail
            }
        );
    }
    
    /**
     * تحلیل تراکم در هدینگ‌ها
     */
    analyzeHeadingDensity(analysisData) {
        const { content, mainKeyword } = analysisData;
        
        const headingsText = extractTextFromHeadings(content);
        const totalWordsInHeadings = countWords(headingsText);
        const keywordCountInHeadings = findKeyword(headingsText, mainKeyword).length;
        
        if (totalWordsInHeadings === 0) {
            return this.createWarningCheck(
                'تراکم کلمه کلیدی (هدینگ‌ها)',
                'هیچ هدینگی وجود ندارد',
                {
                    tooltip: `تراکم مناسب در هدینگ‌ها بین ${this.config.minHeadingDensity}-${this.config.maxHeadingDensity}% است.`,
                    detail: 'لطفاً هدینگ اضافه کنید'
                }
            );
        }
        
        if (keywordCountInHeadings === 0) {
            return this.createErrorCheck(
                'تراکم کلمه کلیدی (هدینگ‌ها)',
                'کلمه کلیدی در هدینگ‌ها یافت نشد',
                {
                    tooltip: `تراکم مناسب در هدینگ‌ها بین ${this.config.minHeadingDensity}-${this.config.maxHeadingDensity}% است.`,
                    detail: `0 بار از ${totalWordsInHeadings} کلمه`
                }
            );
        }
        
        const headingDensity = (keywordCountInHeadings / totalWordsInHeadings) * 100;
        const { minHeadingDensity, maxHeadingDensity } = this.config;
        
        let status, desc;
        
        if (headingDensity >= minHeadingDensity && headingDensity <= maxHeadingDensity) {
            status = 'success';
            desc = `تراکم مناسب: ${formatDecimal(headingDensity)}% ✓`;
        } else {
            status = 'warning';
            desc = `تراکم: ${formatDecimal(headingDensity)}% (باید ${minHeadingDensity}-${maxHeadingDensity}%)`;
        }
        
        return this.createCheckResult(
            status,
            'تراکم کلمه کلیدی (هدینگ‌ها)',
            desc,
            {
                tooltip: `تراکم مناسب در هدینگ‌ها بین ${minHeadingDensity}-${maxHeadingDensity}% است.`,
                detail: `${keywordCountInHeadings} بار از ${totalWordsInHeadings} کلمه`
            }
        );
    }
}

export default KeywordDensityAnalyzer;
