/**
 * تحلیل‌گر تصاویر
 * بررسی Alt تصاویر و نسبت تصویر به متن
 */

import { SEOAnalyzer } from './base-analyzer.js';
import { findKeyword } from '../utils/keyword-utils.js';
import { extractImages } from '../utils/dom-utils.js';

export class ImageAnalyzer extends SEOAnalyzer {
    constructor(config = {}) {
        super('ImageAnalyzer', {
            requiresKeyword: true,
            priority: 6,
            wordsPerImage: 350, // تعداد کلمات مناسب به ازای هر تصویر
            maxWordsPerImage: 400, // حداکثر قابل قبول
            ...config
        });
    }
    
    /**
     * تحلیل تصاویر
     */
    async analyze(analysisData) {
        const { content, mainKeyword, secondaryKeywords, stats } = analysisData;
        
        // استخراج تصاویر
        const images = extractImages(content);
        const totalImages = images.length;
        
        // اگر تصویری نداریم
        if (totalImages === 0) {
            return this.createWarningCheck(
                'تصاویر (Alt + نسبت)',
                'هیچ تصویری وجود ندارد',
                {
                    tooltip: 'تصاویر باید alt با کلمه کلیدی داشته باشند. نسبت مناسب: هر 300-400 کلمه یک تصویر.',
                    detail: 'لطفاً تصویر اضافه کنید'
                }
            );
        }
        
        // بررسی Alt
        let imagesWithMainKeyword = 0;
        let imagesWithSecondaryKeyword = 0;
        let imagesWithoutAlt = 0;
        
        images.forEach(img => {
            const altText = img.alt;
            if (!altText || altText.trim().length === 0) {
                imagesWithoutAlt++;
            } else {
                if (findKeyword(altText, mainKeyword).length > 0) {
                    imagesWithMainKeyword++;
                } else if (secondaryKeywords.some(kw => findKeyword(altText, kw).length > 0)) {
                    imagesWithSecondaryKeyword++;
                }
            }
        });
        
        const imagesWithKeywords = imagesWithMainKeyword + imagesWithSecondaryKeyword;
        const keywordCoverage = (imagesWithKeywords / totalImages) * 100;
        
        // بررسی نسبت
        const wordsPerImage = stats.totalWords / totalImages;
        const ratioOK = wordsPerImage <= this.config.maxWordsPerImage;
        
        // تعیین وضعیت
        let status, desc, detail;
        
        if (keywordCoverage >= 70 && ratioOK) {
            status = 'success';
            desc = `✓ ${imagesWithKeywords}/${totalImages} تصویر با کلمه کلیدی | نسبت مناسب`;
        } else if (keywordCoverage < 40 || !ratioOK) {
            status = 'error';
            desc = `${imagesWithKeywords}/${totalImages} تصویر با کلمه کلیدی | نسبت: ${Math.round(wordsPerImage)} کلمه/تصویر`;
            detail = imagesWithoutAlt > 0 ? `${imagesWithoutAlt} تصویر بدون alt` : null;
        } else {
            status = 'warning';
            desc = `${imagesWithKeywords}/${totalImages} تصویر با کلمه کلیدی | نسبت: ${Math.round(wordsPerImage)} کلمه/تصویر`;
            const recommendedImages = Math.ceil(stats.totalWords / this.config.wordsPerImage);
            detail = `توصیه: ${imagesWithoutAlt > 0 ? `${imagesWithoutAlt} تصویر بدون alt | ` : ''}حداقل ${recommendedImages} تصویر`;
        }
        
        return this.createCheckResult(
            status,
            'تصاویر (Alt + نسبت)',
            desc,
            {
                tooltip: 'تصاویر باید alt با کلمه کلیدی داشته باشند. نسبت مناسب: هر 300-400 کلمه یک تصویر.',
                detail
            }
        );
    }
}

export default ImageAnalyzer;
