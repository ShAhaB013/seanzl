/**
 * ماژول پردازش و تحلیل متن
 * شامل: نرمال‌سازی، شمارش کلمات، تقسیم جملات
 */

// Regex های از پیش کامپایل شده (بهینه‌سازی)
const REGEX = {
    htmlTags: /<[^>]*>/g,
    cleanup: /[.!?؟۔،,;:\-_()[\]{}«»""'']/g,
    multiSpace: /\s+/g,
    digitOnly: /^[\d\s\u200c]+$/,
    punctuation: /[.,،؛:;!؟?\-_)(}{[\]«»""'']/g,
    sentenceEnders: /([.!?؟۔]\s+)|([.!?؟۔]$)|([.!?؟۔](?=\n))/g,
    punctuationOnly: /^[.!?؟۔\s]+$/,
    persianChars: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u200C\u200D]/,
    englishChars: /[a-zA-Z]/,
    cleanupFull: /[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u200C\u0020a-zA-Z0-9]/g,
    multipleZWNJ: /\u200c{2,}/g,
    zwnjaroundSpace: /\u200c\s+|\s+\u200c/g
};

/**
 * نرمال‌سازی نیم‌فاصله
 */
export function normalizeZWNJ(text) {
    if (!text) return '';
    return text
        .replace(REGEX.multipleZWNJ, '\u200c') // چند نیم‌فاصله -> یک نیم‌فاصله
        .replace(REGEX.zwnjaroundSpace, ' '); // نیم‌فاصله + فاصله -> فاصله
}

/**
 * نرمال‌سازی متن با مدیریت بهتر نیم‌فاصله
 */
export function normalizeText(text) {
    if (!text) return '';
    text = normalizeZWNJ(text);
    return text
        .replace(/\u200d/g, '') // حذف ZWJ
        .replace(/\u00a0/g, ' ') // تبدیل NBSP به فاصله
        .replace(/[\t\r\n]+/g, ' ') // تبدیل tab/newline به فاصله
        .replace(REGEX.multiSpace, ' ') // چند فاصله -> یک فاصله
        .trim()
        .toLowerCase();
}

/**
 * نرمال‌سازی متن برای جستجو (بدون lowercase)
 */
export function normalizeTextForSearch(text) {
    if (!text) return '';
    text = normalizeZWNJ(text);
    return text
        .replace(/\u200d/g, '')
        .replace(/\u00a0/g, ' ')
        .replace(/[\t\r\n]+/g, ' ')
        .replace(REGEX.multiSpace, ' ')
        .trim();
}

/**
 * نمایش متن با کاراکتر قابل مشاهده برای نیم‌فاصله
 */
export function displayText(text) {
    return text.replace(/\u200c/g, '‌');
}

/**
 * شمارش کلمات با مدیریت بهتر نیم‌فاصله
 */
export function countWords(text) {
    if (!text || text.trim().length === 0) return 0;
    
    text = text
        .replace(REGEX.htmlTags, ' ')
        .replace(/\u200d/g, '')
        .replace(/\u00a0/g, ' ');
    
    // نرمال‌سازی نیم‌فاصله
    text = normalizeZWNJ(text);
    
    text = text
        .replace(REGEX.cleanup, ' ')
        .replace(REGEX.multiSpace, ' ')
        .trim();
    
    const words = text.split(' ').filter(word => {
        const cleanWord = word.replace(/\u200c/g, '').trim();
        return cleanWord.length > 0 && !REGEX.digitOnly.test(cleanWord);
    });
    
    return words.length;
}

/**
 * تقسیم به کلمات
 */
export function splitIntoWords(text) {
    if (!text || text.trim().length === 0) return [];
    
    text = text.replace(REGEX.htmlTags, ' ');
    text = normalizeZWNJ(text);
    text = text
        .replace(/\u200d/g, '')
        .replace(/\u00a0/g, ' ')
        .replace(REGEX.multiSpace, ' ')
        .trim();
    text = text
        .replace(REGEX.cleanup, ' ')
        .replace(REGEX.multiSpace, ' ')
        .trim();
    
    return text.split(' ').filter(word => {
        const cleanWord = word.replace(/\u200c/g, '').trim();
        return cleanWord.length > 0 && !REGEX.digitOnly.test(cleanWord);
    });
}

/**
 * تقسیم به جملات فارسی با دقت بالا
 */
export function splitIntoSentences(text) {
    if (!text || text.trim().length === 0) return [];
    
    // نرمال‌سازی اولیه
    text = normalizeZWNJ(text);
    text = text.trim().replace(REGEX.multiSpace, ' ');
    
    const sentences = [];
    let currentSentence = '';
    let i = 0;
    
    while (i < text.length) {
        const char = text[i];
        const nextChar = text[i + 1];
        const prevChar = text[i - 1];
        
        currentSentence += char;
        
        // شناسایی پایان جمله
        const isEnder = /[.!?؟۔]/.test(char);
        
        if (isEnder) {
            // بررسی استثناها
            const isAbbreviation = isAbbreviationAt(text, i);
            const isDecimal = /\d/.test(prevChar) && /\d/.test(nextChar);
            const isEllipsis = char === '.' && text[i + 1] === '.' && text[i + 2] === '.';
            
            // اگر واقعاً پایان جمله است
            if (!isAbbreviation && !isDecimal && !isEllipsis) {
                // اضافه کردن فاصله‌های بعدی (اگر هست)
                while (i + 1 < text.length && /\s/.test(text[i + 1])) {
                    i++;
                    currentSentence += text[i];
                }
                
                // ذخیره جمله
                const trimmed = currentSentence.trim();
                if (trimmed.length > 0 && !REGEX.punctuationOnly.test(trimmed)) {
                    sentences.push(trimmed);
                }
                currentSentence = '';
            }
        }
        
        i++;
    }
    
    // جمله آخر (اگر باقی مانده)
    if (currentSentence.trim().length > 0) {
        const trimmed = currentSentence.trim();
        if (!REGEX.punctuationOnly.test(trimmed)) {
            sentences.push(trimmed);
        }
    }
    
    // ادغام جملات خیلی کوتاه
    return mergeTooShortSentences(sentences);
}

/**
 * تشخیص اختصارات
 */
function isAbbreviationAt(text, dotPosition) {
    const abbreviations = [
        'د.', 'م.', 'ک.', 'ص.', 'ج.', 'ر.ک', 'ه.ش', 'ه.ق',
        'Dr.', 'Mr.', 'Mrs.', 'Ms.', 'Prof.', 'etc.', 'e.g.', 'i.e.'
    ];
    
    const start = Math.max(0, dotPosition - 5);
    const end = Math.min(text.length, dotPosition + 5);
    const context = text.substring(start, end);
    
    return abbreviations.some(abbr => context.includes(abbr));
}

/**
 * ادغام جملات خیلی کوتاه
 */
function mergeTooShortSentences(sentences) {
    const merged = [];
    let i = 0;
    
    while (i < sentences.length) {
        const sentence = sentences[i];
        const wordCount = countWords(sentence);
        
        // اگر جمله کمتر از 3 کلمه دارد و جمله بعدی هم هست
        if (wordCount < 3 && i < sentences.length - 1) {
            sentences[i + 1] = sentence + ' ' + sentences[i + 1];
        } else if (sentence.length > 0) {
            merged.push(sentence);
        }
        i++;
    }
    
    // فیلتر نهایی
    return merged.filter(s => countWords(s) > 0);
}

/**
 * تحلیل پیچیدگی جمله
 */
export function analyzeSentenceComplexity(sentence) {
    const wordCount = countWords(sentence);
    const charCount = sentence.replace(REGEX.multiSpace, '').length;
    const avgWordLength = wordCount > 0 ? charCount / wordCount : 0;
    
    const conjunctions = ['که', 'اگر', 'چون', 'زیرا', 'هرچند', 'اما', 'ولی', 'لیکن', 'بنابراین', 'در نتیجه', 'همچنین'];
    let conjunctionCount = 0;
    const lowerSentence = sentence.toLowerCase();
    conjunctions.forEach(conj => {
        const matches = lowerSentence.match(new RegExp('\\b' + conj + '\\b', 'g'));
        if (matches) conjunctionCount += matches.length;
    });
    
    const commaCount = (sentence.match(/،/g) || []).length;
    let complexityScore = 0;
    
    if (wordCount > 25) complexityScore += 40;
    else if (wordCount > 20) complexityScore += 30;
    else if (wordCount > 15) complexityScore += 20;
    else complexityScore += 10;
    
    if (avgWordLength > 7) complexityScore += 20;
    else if (avgWordLength > 6) complexityScore += 15;
    else if (avgWordLength > 5) complexityScore += 10;
    else complexityScore += 5;
    
    complexityScore += Math.min(conjunctionCount * 5, 20);
    complexityScore += Math.min(commaCount * 4, 20);
    
    return {
        wordCount,
        charCount,
        avgWordLength: avgWordLength.toFixed(1),
        conjunctionCount,
        commaCount,
        complexityScore: Math.min(complexityScore, 100),
        isComplex: complexityScore > 60
    };
}

/**
 * دسته‌بندی جمله
 */
export function categorizeSentence(sentence) {
    const analysis = analyzeSentenceComplexity(sentence);
    const wordCount = analysis.wordCount;
    
    if (wordCount <= 12) {
        return { category: 'short', level: 'good', message: 'جمله کوتاه و واضح', color: '#10b981' };
    } else if (wordCount <= 18) {
        return { category: 'medium', level: 'good', message: 'جمله با طول مناسب', color: '#10b981' };
    } else if (wordCount <= 25) {
        if (analysis.complexityScore > 70) {
            return { category: 'long', level: 'warning', message: 'جمله بلند و پیچیده', color: '#f59e0b', suggestion: 'این جمله را به 2-3 جمله کوتاه‌تر تقسیم کنید' };
        }
        return { category: 'long', level: 'acceptable', message: 'جمله بلند اما قابل قبول', color: '#f59e0b' };
    } else {
        return { category: 'very_long', level: 'error', message: 'جمله خیلی بلند', color: '#ef4444', suggestion: 'حتماً این جمله را به چند جمله کوتاه‌تر تبدیل کنید' };
    }
}

/**
 * استخراج کلمات (برای تحلیل فرکانس)
 */
export function extractWords(text) {
    if (!text) return [];
    
    text = normalizeZWNJ(text);
    
    const cleanText = text
        .replace(/\u200d/g, '')
        .replace(/\u00a0/g, ' ')
        .replace(/[\t\r\n]+/g, ' ')
        .replace(REGEX.punctuation, ' ')
        .toLowerCase()
        .replace(REGEX.cleanupFull, ' ')
        .replace(REGEX.multiSpace, ' ')
        .trim();
    
    return cleanText.split(' ').filter(word => {
        if (!word || word.trim().length === 0) return false;
        const withoutZwnj = word.replace(/\u200c/g, '');
        if (withoutZwnj.trim().length === 0) return false;
        if (withoutZwnj.length === 1 && !/\d/.test(withoutZwnj)) return false;
        if (/^\d+$/.test(withoutZwnj)) return false;
        return true;
    });
}

/**
 * بررسی اینکه آیا کلمه معنادار است
 */
export function isMeaningfulWord(word) {
    if (word.length <= 1) return false;
    if (/^\d+$/.test(word)) return false;
    if (/(.)\1{2,}/.test(word)) return false;
    
    if (word.length > 3) {
        const hasPersian = REGEX.persianChars.test(word);
        const hasEnglish = REGEX.englishChars.test(word);
        if (hasPersian && hasEnglish && word.length < 6) return false;
    }
    return true;
}

/**
 * محاسبه درصد
 */
export function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return (value / total) * 100;
}

/**
 * فرمت اعشار
 */
export function formatDecimal(number, decimals = 2) {
    return Number(number).toFixed(decimals);
}

// Export همه توابع به صورت یک object
export default {
    normalizeZWNJ,
    normalizeText,
    normalizeTextForSearch,
    displayText,
    countWords,
    splitIntoWords,
    splitIntoSentences,
    analyzeSentenceComplexity,
    categorizeSentence,
    extractWords,
    isMeaningfulWord,
    calculatePercentage,
    formatDecimal
};
