/**
 * Index فایل برای تمام Analyzer ها
 * Import و Export مرکزی
 */

// Base Classes
export { BaseAnalyzer, SEOAnalyzer, ReadabilityAnalyzer, SuggestionAnalyzer } from './base-analyzer.js';

// SEO Analyzers
export { H1Analyzer } from './h1-analyzer.js';
export { KeywordDensityAnalyzer } from './keyword-density-analyzer.js';
export { FirstParagraphAnalyzer } from './first-paragraph-analyzer.js';
export { SecondaryKeywordsAnalyzer } from './secondary-keywords-analyzer.js';
export { ImageAnalyzer } from './image-analyzer.js';
export { BlueKeywordAnalyzer } from './blue-keyword-analyzer.js';
export { LinkAnalyzer } from './link-analyzer.js';

// Import کلاس‌ها برای استفاده داخلی
import { H1Analyzer } from './h1-analyzer.js';
import { KeywordDensityAnalyzer } from './keyword-density-analyzer.js';
import { FirstParagraphAnalyzer } from './first-paragraph-analyzer.js';
import { SecondaryKeywordsAnalyzer } from './secondary-keywords-analyzer.js';
import { ImageAnalyzer } from './image-analyzer.js';
import { BlueKeywordAnalyzer } from './blue-keyword-analyzer.js';
import { LinkAnalyzer } from './link-analyzer.js';

/**
 * تابع کمکی: ساخت تمام Analyzer های SEO
 */
export function createSEOAnalyzers(config = {}) {
    return [
        new H1Analyzer(config.h1 || {}),
        new KeywordDensityAnalyzer(config.keywordDensity || {}),
        new FirstParagraphAnalyzer(config.firstParagraph || {}),
        new SecondaryKeywordsAnalyzer(config.secondaryKeywords || {}),
        new ImageAnalyzer(config.image || {}),
        new BlueKeywordAnalyzer(config.blueKeyword || {}),
        new LinkAnalyzer(config.link || {})
    ];
}

/**
 * تابع کمکی: ساخت تمام Analyzer های خوانایی
 */
export function createReadabilityAnalyzers(config = {}) {
    return [
        // خالی - بعداً Analyzer های دیگر اضافه می‌شود
    ];
}

/**
 * تابع کمکی: ساخت تمام Analyzer ها
 */
export function createAllAnalyzers(config = {}) {
    return {
        seo: createSEOAnalyzers(config.seo || {}),
        readability: createReadabilityAnalyzers(config.readability || {})
    };
}

// Default export
export default {
    createSEOAnalyzers,
    createReadabilityAnalyzers,
    createAllAnalyzers
};