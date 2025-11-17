/**
 * توابع کمکی عمومی
 * شامل: debounce, throttle, escape, format
 */

/**
 * Debounce - تاخیر در اجرای تابع
 * @param {Function} func - تابع مورد نظر
 * @param {Number} delay - تاخیر به میلی‌ثانیه
 * @returns {Function}
 */
export function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle - محدود کردن تعداد اجرای تابع
 * @param {Function} func - تابع مورد نظر
 * @param {Number} limit - حداقل فاصله بین اجراها
 * @returns {Function}
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Escape کردن HTML (جلوگیری از XSS)
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Un-escape کردن HTML
 */
export function unescapeHtml(text) {
    const div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent || div.innerText || '';
}

/**
 * محاسبه درصد
 */
export function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return (value / total) * 100;
}

/**
 * فرمت کردن اعشار
 */
export function formatDecimal(number, decimals = 2) {
    return Number(number).toFixed(decimals);
}

/**
 * فرمت کردن عدد با جداکننده هزارگان
 */
export function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * کلون عمیق object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Object) {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * ادغام objects (shallow merge)
 */
export function mergeObjects(...objects) {
    return Object.assign({}, ...objects);
}

/**
 * ادغام عمیق objects
 */
export function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();
    
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    
    return deepMerge(target, ...sources);
}

/**
 * بررسی اینکه آیا متغیر یک object است
 */
export function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * بررسی اینکه آیا string خالی است
 */
export function isEmpty(str) {
    return !str || str.trim().length === 0;
}

/**
 * بررسی اینکه آیا متغیر undefined یا null است
 */
export function isNullOrUndefined(value) {
    return value === null || value === undefined;
}

/**
 * تبدیل رشته به slug (URL-friendly)
 */
export function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

/**
 * محدود کردن طول رشته
 */
export function truncate(text, length, suffix = '...') {
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + suffix;
}

/**
 * Capitalize کردن اولین حرف
 */
export function capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * تبدیل camelCase به kebab-case
 */
export function camelToKebab(text) {
    return text.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * تبدیل kebab-case به camelCase
 */
export function kebabToCamel(text) {
    return text.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * تاخیر (Promise-based)
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry - تلاش مجدد در صورت خطا
 */
export async function retry(fn, maxAttempts = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) throw error;
            console.warn(`تلاش ${attempt} ناموفق بود، تلاش مجدد...`);
            await delay(delayMs);
        }
    }
}

/**
 * اجرای توابع به صورت ترتیبی
 */
export async function sequential(tasks) {
    const results = [];
    for (const task of tasks) {
        results.push(await task());
    }
    return results;
}

/**
 * اجرای توابع به صورت موازی
 */
export async function parallel(tasks) {
    return Promise.all(tasks.map(task => task()));
}

/**
 * تولید UUID ساده
 */
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * تولید ID تصادفی کوتاه
 */
export function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * دریافت زمان فعلی به فرمت خوانا
 */
export function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('fa-IR');
}

/**
 * دریافت تاریخ فعلی به فرمت خوانا
 */
export function getCurrentDate() {
    const now = new Date();
    return now.toLocaleDateString('fa-IR');
}

/**
 * محاسبه اختلاف زمان
 */
export function getTimeDiff(startTime, endTime = Date.now()) {
    const diff = endTime - startTime;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    return {
        milliseconds: diff,
        seconds: seconds % 60,
        minutes: minutes % 60,
        hours: hours,
        total: {
            seconds,
            minutes,
            hours
        }
    };
}

/**
 * فرمت زمان به صورت خوانا
 */
export function formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * انتظار تا وقوع شرط
 */
export async function waitFor(condition, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    
    while (!condition()) {
        if (Date.now() - startTime > timeout) {
            throw new Error('Timeout: شرط برآورده نشد');
        }
        await delay(interval);
    }
}

/**
 * Cache ساده با TTL
 */
export function createCache(ttl = 60000) {
    const cache = new Map();
    
    return {
        get(key) {
            const item = cache.get(key);
            if (!item) return null;
            
            if (Date.now() > item.expiry) {
                cache.delete(key);
                return null;
            }
            
            return item.value;
        },
        
        set(key, value) {
            cache.set(key, {
                value,
                expiry: Date.now() + ttl
            });
        },
        
        has(key) {
            return this.get(key) !== null;
        },
        
        delete(key) {
            cache.delete(key);
        },
        
        clear() {
            cache.clear();
        },
        
        size() {
            return cache.size;
        }
    };
}

/**
 * لاگ کردن با رنگ (برای console)
 */
export function log(message, type = 'info') {
    const styles = {
        info: 'color: #3498db',
        success: 'color: #2ecc71',
        warning: 'color: #f39c12',
        error: 'color: #e74c3c'
    };
    
    console.log(`%c${message}`, styles[type] || styles.info);
}

/**
 * گروه‌بندی آرایه بر اساس کلید
 */
export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const groupKey = typeof key === 'function' ? key(item) : item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
}

/**
 * حذف تکراری‌ها از آرایه
 */
export function unique(array) {
    return [...new Set(array)];
}

/**
 * اجتماع آرایه‌ها
 */
export function flatten(array) {
    return array.reduce((acc, val) => 
        Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), 
    []);
}

/**
 * تصادفی کردن آرایه
 */
export function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * انتخاب تصادفی از آرایه
 */
export function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Export همه توابع
export default {
    debounce,
    throttle,
    escapeHtml,
    unescapeHtml,
    calculatePercentage,
    formatDecimal,
    formatNumber,
    deepClone,
    mergeObjects,
    deepMerge,
    isObject,
    isEmpty,
    isNullOrUndefined,
    slugify,
    truncate,
    capitalize,
    camelToKebab,
    kebabToCamel,
    delay,
    retry,
    sequential,
    parallel,
    generateUUID,
    generateId,
    getCurrentTime,
    getCurrentDate,
    getTimeDiff,
    formatDuration,
    waitFor,
    createCache,
    log,
    groupBy,
    unique,
    flatten,
    shuffle,
    randomElement
};
