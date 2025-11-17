/**
 * تحلیل‌گر H1
 * بررسی وجود کلمه کلیدی در عنوان اصلی (H1)
 */

import { SEOAnalyzer } from './base-analyzer.js';
import { findKeyword } from '../utils/keyword-utils.js';
import { displayText } from '../utils/text-utils.js';

export class H1Analyzer extends SEOAnalyzer {
    constructor(config = {}) {
        super('H1Analyzer', {
            requiresKeyword: true,
            priority: 1, // بالاترین اولویت
            ...config
        });
    }
    
    /**
     * تحلیل H1
     */
    async analyze(analysisData) {
        const { content, mainKeyword } = analysisData;
        
        // پارس HTML
        const temp = document.createElement('div');
        temp.innerHTML = content;
        const h1Elements = temp.querySelectorAll('h1');
        
        // بررسی وجود H1
        if (h1Elements.length === 0) {
            return this.createErrorCheck(
                'کلمه کلیدی در عنوان (H1)',
                'هیچ عنوان H1 وجود ندارد',
                {
                    tooltip: 'عنوان اصلی (H1) باید شامل کلمه کلیدی باشد.',
                    detail: 'لطفاً یک عنوان H1 اضافه کنید'
                }
            );
        }
        
        // جستجوی کلمه کلیدی در H1 ها
        let found = false;
        let h1Text = '';
        
        for (let h1 of h1Elements) {
            const text = h1.textContent || '';
            if (findKeyword(text, mainKeyword).length > 0) {
                found = true;
                h1Text = text.trim();
                break;
            }
        }
        
        // نتیجه
        if (found) {
            return this.createSuccessCheck(
                'کلمه کلیدی در عنوان (H1)',
                'عنوان شامل کلمه کلیدی است ✓',
                {
                    tooltip: 'عنوان اصلی شامل کلمه کلیدی است.',
                    detail: `عنوان: "${displayText(h1Text)}"`
                }
            );
        } else {
            return this.createErrorCheck(
                'کلمه کلیدی در عنوان (H1)',
                'عنوان باید شامل کلمه کلیدی باشد',
                {
                    tooltip: 'عنوان اصلی باید شامل کلمه کلیدی باشد.',
                    detail: h1Elements.length > 0 
                        ? `عنوان فعلی: "${displayText(h1Elements[0].textContent.trim())}"` 
                        : null
                }
            );
        }
    }
}

export default H1Analyzer;
