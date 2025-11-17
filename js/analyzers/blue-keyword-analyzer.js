/**
 * تحلیل‌گر رنگ آبی برای کلمه کلیدی
 * بررسی اینکه آیا کلمه کلیدی با رنگ آبی هایلایت شده است
 */

import { SEOAnalyzer } from './base-analyzer.js';
import { checkBlueKeywordInHTML } from '../utils/dom-utils.js';

export class BlueKeywordAnalyzer extends SEOAnalyzer {
    constructor(config = {}) {
        super('BlueKeywordAnalyzer', {
            requiresKeyword: true,
            priority: 7,
            ...config
        });
    }
    
    /**
     * تحلیل رنگ آبی
     */
    async analyze(analysisData) {
        const { content, mainKeyword } = analysisData;
        
        // بررسی وجود کلمه کلیدی با رنگ آبی
        const hasBlueKeyword = checkBlueKeywordInHTML(content, mainKeyword);
        
        // نتیجه
        if (hasBlueKeyword) {
            return this.createSuccessCheck(
                'رنگ آبی برای کلمه کلیدی',
                'کلمه کلیدی به رنگ آبی است ✓',
                {
                    tooltip: 'رنگ آبی کلمه کلیدی را برجسته می‌کند.',
                    hasScore: false // این چک در نمره تاثیر ندارد
                }
            );
        } else {
            return this.createWarningCheck(
                'رنگ آبی برای کلمه کلیدی',
                'توصیه: کلمه کلیدی را آبی کنید',
                {
                    tooltip: 'رنگ آبی کلمه کلیدی را برجسته می‌کند.',
                    hasScore: false // این چک در نمره تاثیر ندارد
                }
            );
        }
    }
}

export default BlueKeywordAnalyzer;
