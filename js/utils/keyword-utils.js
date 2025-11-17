/**
 * ماژول کار با کلمات کلیدی
 * شامل: جستجو، تحلیل فرکانس، پیشنهاد کلمات
 */

import { normalizeText, extractWords, countWords, isMeaningfulWord } from './text-utils.js';
import { extractTextFromHeadings, getFirstParagraph, extractParagraphs, hasKeywordInSection } from './dom-utils.js';

/**
 * جستجوی کلمه کلیدی در متن
 * @returns {Array} آرایه موقعیت‌ها
 */
export function findKeyword(text, keyword) {
    if (!keyword) return [];
    const normalizedText = normalizeText(text);
    const normalizedKeyword = normalizeText(keyword);
    const positions = [];
    let index = 0;

    while ((index = normalizedText.indexOf(normalizedKeyword, index)) !== -1) {
        positions.push(index);
        index += normalizedKeyword.length;
    }
    return positions;
}

/**
 * شمارش تعداد تکرار کلمه کلیدی
 */
export function countKeyword(text, keyword) {
    return findKeyword(text, keyword).length;
}

/**
 * محاسبه تراکم کلمه کلیدی
 */
export function calculateKeywordDensity(text, keyword) {
    const totalWords = countWords(text);
    if (totalWords === 0) return 0;
    
    const keywordCount = countKeyword(text, keyword);
    return (keywordCount / totalWords) * 100;
}

/**
 * تولید n-grams از آرایه کلمات
 */
export function generateNGrams(words, n = 2) {
    const ngrams = [];
    for (let i = 0; i <= words.length - n; i++) {
        ngrams.push(words.slice(i, i + n).join(' '));
    }
    return ngrams;
}

/**
 * شمارش فرکانس کلمات (با n-grams)
 */
export function countWordFrequencies(text) {
    const words = extractWords(text);
    const wordCounts = new Map();
    
    // bigrams (2 کلمه)
    const bigrams = generateNGrams(words, 2);
    bigrams.forEach(bigram => {
        wordCounts.set(bigram, (wordCounts.get(bigram) || 0) + 1);
    });
    
    // trigrams (3 کلمه)
    const trigrams = generateNGrams(words, 3);
    trigrams.forEach(trigram => {
        wordCounts.set(trigram, (wordCounts.get(trigram) || 0) + 1);
    });
    
    // 4-grams (4 کلمه)
    const fourgrams = generateNGrams(words, 4);
    fourgrams.forEach(fourgram => {
        wordCounts.set(fourgram, (wordCounts.get(fourgram) || 0) + 1);
    });
    
    return wordCounts;
}

/**
 * فیلتر کلمات مرتبط (حذف stop words)
 */
export function filterRelevantWords(wordCounts) {
    const stopWords = new Set([
        'از', 'در', 'به', 'با', 'برای', 'تا', 'بر', 'روی', 'زیر', 'کنار',
        'که', 'اگر', 'چون', 'زیرا', 'لذا', 'پس', 'اما', 'ولی', 'یا', 'و',
        'من', 'تو', 'او', 'ما', 'شما', 'آنها', 'این', 'آن',
        'خود', 'خودش', 'خودت', 'خودم',
        'همه', 'هر', 'هیچ', 'برخی', 'بعضی', 'تمام',
        'است', 'بود', 'باشد', 'شود', 'خواهد', 'دارد', 'کرد', 'کند',
        'بوده', 'شده', 'می', 'نمی', 'باید', 'نباید',
        'خیلی', 'بسیار', 'بیشتر', 'کمتر', 'خوب', 'بد', 'فقط', 'تنها',
        'چه', 'چی', 'کی', 'کجا', 'چرا', 'چگونه', 'چطور', 'کدام', 'چند',
        'یک', 'دو', 'سه', 'چهار', 'پنج',
        'بعد', 'قبل', 'حالا', 'الان', 'همیشه', 'هنوز', 'دیگر',
        'همچنین', 'بنابراین', 'به طور', 'به عنوان',
        'کلمات', 'کلمه', 'محتوا', 'محتوای', 'متن', 'ویرایشگر', 'ابزار', 'موجود',
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may',
        'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    ]);
    
    const filtered = {};
    for (const [word, count] of wordCounts) {
        const lowerWord = word.toLowerCase();
        const words = word.split(' ');
        const hasStopWord = words.some(w => stopWords.has(w.toLowerCase()));
        
        if (isMeaningfulWord(word) && !hasStopWord && count > 1 && word.length > 2 && isRelevantPhrase(word)) {
            filtered[word] = count;
        }
    }
    return filtered;
}

/**
 * بررسی اینکه آیا عبارت مرتبط است
 */
export function isRelevantPhrase(phrase) {
    const punctuation = /[.,،؛:;!؟?\-_)(}{[\]«»""'']/g;
    if (punctuation.test(phrase)) return false;
    
    const irrelevantPatterns = [
        /است که/, /بود که/, /می باشد/,
        /است در/, /است به/, /است از/, /است با/,
        /این که/, /آن که/, /برای که/,
        /^.+ است$/, /^.+ بود$/, /^است .+$/,
        /^در .+$/, /^به .+$/, /^از .+$/, /^با .+$/,
        /^.+ در$/, /^.+ به$/, /^.+ از$/, /^.+ با$/,
        /^که .+$/, /^.+ که$/,
        /محتوای موجود/, /^موجود/, /ویرایشگر/, /^ابزار/,
        /عمل کن/, /^کن/, /استفاده می/
    ];
    
    for (let pattern of irrelevantPatterns) {
        if (pattern.test(phrase)) return false;
    }
    
    const words = phrase.split(' ');
    const uniqueWords = new Set(words);
    if (words.length > uniqueWords.size) return false;
    
    const meaningfulWords = words.filter(w => 
        w.length > 2 && !['است', 'بود', 'می', 'که', 'این', 'آن', 'را', 'کن', 'محتوا', 'موجود', 'ابزار'].includes(w)
    );
    if (words.length >= 3 && meaningfulWords.length < 2) return false;
    if (words.length === 2 && meaningfulWords.length < 1) return false;
    
    return true;
}

/**
 * محاسبه کیفیت کلمه کلیدی
 */
export function calculateKeywordQuality(keyword, frequency, textContext = null) {
    let quality = 0;
    const wordCount = keyword.split(' ').length;
    const totalWords = textContext ? countWords(textContext) : 0;
    
    // 1. امتیاز تعداد کلمات (0-8)
    if (wordCount === 4) quality += 8;
    else if (wordCount === 3) quality += 6;
    else if (wordCount === 2) quality += 4;
    else quality += 1;
    
    // 2. امتیاز فرکانس پیوسته (0-10)
    quality += Math.min(10, Math.log2(frequency + 1) * 2);
    
    if (textContext) {
        // 3. امتیاز موقعیت در H1 (0-15)
        const h1Check = hasKeywordInSection(textContext, keyword, 'h1');
        if (h1Check.found) {
            quality += 15;
        }
        
        // 4. امتیاز موقعیت در سایر headings (0-8)
        const headingsText = extractTextFromHeadings(textContext);
        const headingMatches = findKeyword(headingsText, keyword).length;
        if (headingMatches > 0 && !h1Check.found) {
            quality += Math.min(8, headingMatches * 3);
        }
        
        // 5. امتیاز پاراگراف اول (0-10)
        const firstPara = getFirstParagraph(textContext);
        if (findKeyword(firstPara, keyword).length > 0) {
            quality += 10;
        }
        
        // 6. امتیاز تراکم مناسب (0-5)
        if (totalWords > 0) {
            const density = (frequency / totalWords) * 100;
            if (density >= 0.5 && density <= 2.5) {
                quality += 5;
            } else if (density >= 0.3 && density <= 3.5) {
                quality += 3;
            }
        }
    }
    
    // نرمال‌سازی (حداکثر 45، حداقل 0)
    quality = Math.max(0, Math.min(45, quality));
    
    return Math.round(quality);
}

/**
 * محاسبه ارتباط کلمه کلیدی
 */
export function calculateRelevance(phrase, text) {
    let relevance = 0;
    const temp = document.createElement('div');
    temp.innerHTML = text;
    
    // 1. وزن‌دهی سلسله‌مراتبی برای headings (0-15)
    const h1 = temp.querySelectorAll('h1');
    const h2 = temp.querySelectorAll('h2');
    const h3 = temp.querySelectorAll('h3');
    const h4h5h6 = temp.querySelectorAll('h4, h5, h6');
    
    h1.forEach(h => {
        if (h.textContent.toLowerCase().includes(phrase.toLowerCase())) 
            relevance += 10;
    });
    
    h2.forEach(h => {
        if (h.textContent.toLowerCase().includes(phrase.toLowerCase())) 
            relevance += 5;
    });
    
    h3.forEach(h => {
        if (h.textContent.toLowerCase().includes(phrase.toLowerCase())) 
            relevance += 3;
    });
    
    h4h5h6.forEach(h => {
        if (h.textContent.toLowerCase().includes(phrase.toLowerCase())) 
            relevance += 1;
    });
    
    const headingScore = Math.min(15, relevance);
    relevance = headingScore;
    
    // 2. امتیاز پاراگراف اول (0-8)
    const firstPara = getFirstParagraph(text);
    if (firstPara.toLowerCase().includes(phrase.toLowerCase())) {
        relevance += 8;
    }
    
    // 3. تحلیل پراکندگی در کل متن (0-7)
    const paragraphs = extractParagraphs(text);
    if (paragraphs.length > 0) {
        let paragraphsWithPhrase = 0;
        paragraphs.forEach(p => {
            if (p.toLowerCase().includes(phrase.toLowerCase())) {
                paragraphsWithPhrase++;
            }
        });
        
        const distribution = (paragraphsWithPhrase / paragraphs.length) * 100;
        
        if (distribution >= 40) relevance += 7;
        else if (distribution >= 25) relevance += 5;
        else if (distribution >= 15) relevance += 3;
        else if (distribution >= 5) relevance += 1;
    }
    
    relevance = Math.min(30, relevance);
    
    return relevance;
}

/**
 * پیشنهاد کلمات کلیدی
 */
export function suggestKeywords(text, maxSuggestions = 10) {
    const wordCounts = countWordFrequencies(text);
    const filteredCounts = filterRelevantWords(wordCounts);
    
    const meaningfulPhrases = {};
    Object.entries(filteredCounts).forEach(([word, count]) => {
        const wordCount = word.split(' ').length;
        if (wordCount >= 2 && wordCount <= 4) {
            meaningfulPhrases[word] = count;
        }
    });
    
    const nlpEnhanced = enhanceWithNLP(meaningfulPhrases, text);
    
    const sortedWords = Object.entries(nlpEnhanced)
        .sort(([,a], [,b]) => {
            if (a.quality !== b.quality) return b.quality - a.quality;
            if (a.relevance !== b.relevance) return b.relevance - a.relevance;
            return b.frequency - a.frequency;
        })
        .slice(0, maxSuggestions);
    
    return sortedWords.map(([word, data]) => ({
        keyword: word,
        frequency: data.frequency,
        type: word.split(' ').length === 2 ? 'دو کلمه' : word.split(' ').length === 3 ? 'سه کلمه' : 'چهار کلمه',
        quality: data.quality,
        relevance: data.relevance
    }));
}

/**
 * تقویت با NLP (محاسبه quality و relevance)
 */
function enhanceWithNLP(phrases, originalText) {
    const enhanced = {};
    Object.entries(phrases).forEach(([phrase, frequency]) => {
        const quality = calculateKeywordQuality(phrase, frequency, originalText);
        const relevance = calculateRelevance(phrase, originalText);
        enhanced[phrase] = { frequency, quality, relevance };
    });
    return enhanced;
}

/**
 * تشخیص کلمه کلیدی اصلی
 */
export function detectMainKeyword(text, maxSuggestions = 5) {
    const wordCount = countWords(text);
    const suggestions = suggestKeywords(text, maxSuggestions * 3);
    if (suggestions.length === 0) return [];
    
    let qualityThreshold = wordCount < 200 ? 2 : wordCount < 400 ? 3 : wordCount < 700 ? 4 : wordCount < 1000 ? 5 : 6;
    let relevanceThreshold = wordCount < 200 ? 1 : wordCount < 700 ? 2 : wordCount < 1000 ? 3 : 4;
    
    let mainKeywords = suggestions.filter(s => s.quality >= qualityThreshold && s.relevance >= relevanceThreshold);
    if (mainKeywords.length < maxSuggestions) {
        mainKeywords = suggestions.sort((a, b) => (b.quality + b.relevance) - (a.quality + a.relevance));
    }
    return mainKeywords.slice(0, maxSuggestions);
}

/**
 * تشخیص کلمات کلیدی فرعی
 */
export function detectSecondaryKeywords(text, maxSuggestions = 10) {
    const wordCount = countWords(text);
    const suggestions = suggestKeywords(text, maxSuggestions * 2);
    if (suggestions.length === 0) return [];
    
    let qualityThreshold = wordCount < 200 ? 1 : wordCount < 400 ? 2 : wordCount < 700 ? 3 : wordCount < 1000 ? 4 : 5;
    let relevanceThreshold = wordCount < 700 ? 1 : wordCount < 1000 ? 2 : 3;
    
    let secondaryKeywords = suggestions.filter(s => s.quality >= qualityThreshold && s.relevance >= relevanceThreshold);
    if (secondaryKeywords.length < maxSuggestions) {
        secondaryKeywords = suggestions.sort((a, b) => (b.quality + b.relevance) - (a.quality + a.relevance));
    }
    return secondaryKeywords.slice(0, maxSuggestions);
}

// Export همه توابع
export default {
    findKeyword,
    countKeyword,
    calculateKeywordDensity,
    generateNGrams,
    countWordFrequencies,
    filterRelevantWords,
    isRelevantPhrase,
    calculateKeywordQuality,
    calculateRelevance,
    suggestKeywords,
    detectMainKeyword,
    detectSecondaryKeywords
};
