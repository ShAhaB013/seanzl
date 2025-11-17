/**
 * ماژول کار با DOM و HTML
 * شامل: استخراج متن، پردازش HTML، پارس کردن
 */

import { normalizeZWNJ } from './text-utils.js';

/**
 * استخراج متن از HTML
 */
export function extractText(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return normalizeZWNJ(text);
}

/**
 * استخراج متن بدون هدینگ‌ها
 */
export function extractTextWithoutHeadings(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const headings = div.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => heading.remove());
    const text = div.textContent || div.innerText || '';
    return normalizeZWNJ(text);
}

/**
 * استخراج متن فقط از هدینگ‌ها
 */
export function extractTextFromHeadings(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const headings = div.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let headingsText = '';
    headings.forEach(heading => {
        headingsText += (heading.textContent || heading.innerText || '') + ' ';
    });
    return normalizeZWNJ(headingsText.trim());
}

/**
 * استخراج پاراگراف‌ها
 */
export function extractParagraphs(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return Array.from(temp.querySelectorAll('p'))
        .map(p => (p.textContent || '').trim())
        .filter(p => p.length > 0);
}

/**
 * دریافت اولین پاراگراف
 */
export function getFirstParagraph(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // حذف H1 ها
    temp.querySelectorAll('h1').forEach(h1 => h1.remove());
    
    const paragraphs = temp.querySelectorAll('p');
    for (let p of paragraphs) {
        const text = (p.textContent || p.innerText).trim();
        if (text.length > 0) return text;
    }
    return '';
}

/**
 * پارس کردن HTML و دریافت عناصر مهم
 */
export function parseHTML(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    return {
        dom: temp,
        h1: temp.querySelectorAll('h1'),
        h2h3: temp.querySelectorAll('h2, h3, h4, h5, h6'),
        allHeadings: temp.querySelectorAll('h1, h2, h3, h4, h5, h6'),
        paragraphs: temp.querySelectorAll('p'),
        images: temp.querySelectorAll('img'),
        links: temp.querySelectorAll('a[href]'),
        
        // متدهای کمکی
        getText() {
            return (temp.textContent || temp.innerText || '').trim();
        },
        
        getTextWithoutHeadings() {
            const clone = temp.cloneNode(true);
            clone.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => h.remove());
            return (clone.textContent || clone.innerText || '').trim();
        },
        
        hasElement(selector) {
            return temp.querySelector(selector) !== null;
        },
        
        countElements(selector) {
            return temp.querySelectorAll(selector).length;
        }
    };
}

/**
 * بررسی وجود کلمه کلیدی در بخش خاص
 */
export function hasKeywordInSection(html, keyword, selector) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const elements = temp.querySelectorAll(selector);
    
    const normalizedKeyword = keyword.toLowerCase().trim();
    
    for (let element of elements) {
        if (element.tagName === 'IMG') {
            const altText = element.getAttribute('alt') || '';
            if (altText.toLowerCase().includes(normalizedKeyword)) {
                return { found: true, text: altText.trim() };
            }
        } else {
            const text = element.textContent || element.innerText;
            if (text.toLowerCase().includes(normalizedKeyword)) {
                return { found: true, text: text.trim() };
            }
        }
    }
    return { found: false, text: '' };
}

/**
 * بررسی کلمه کلیدی در عناصر با رنگ آبی
 */
export function checkBlueKeywordInHTML(html, keyword) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const blueElements = temp.querySelectorAll('[style*="color"]');
    
    const normalizedKeyword = keyword.toLowerCase().trim();
    
    for (let el of blueElements) {
        const style = el.style.color;
        if (style && (
            style.includes('blue') || 
            style.includes('rgb(0, 0, 255)') || 
            style.includes('#00f')
        )) {
            const text = el.textContent || '';
            if (text.toLowerCase().includes(normalizedKeyword)) {
                return true;
            }
        }
    }
    return false;
}

/**
 * استخراج تمام لینک‌ها با متن آنها
 */
export function extractLinks(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const links = temp.querySelectorAll('a[href]');
    
    return Array.from(links).map(link => ({
        href: link.getAttribute('href'),
        text: (link.textContent || '').trim(),
        title: link.getAttribute('title') || ''
    }));
}

/**
 * استخراج تمام تصاویر با alt آنها
 */
export function extractImages(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const images = temp.querySelectorAll('img');
    
    return Array.from(images).map(img => ({
        src: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || '',
        title: img.getAttribute('title') || ''
    }));
}

/**
 * شمارش تصاویر با alt
 */
export function countImagesWithAlt(html) {
    const images = extractImages(html);
    return images.filter(img => img.alt && img.alt.trim().length > 0).length;
}

/**
 * شمارش تصاویر بدون alt
 */
export function countImagesWithoutAlt(html) {
    const images = extractImages(html);
    return images.filter(img => !img.alt || img.alt.trim().length === 0).length;
}

/**
 * پردازش HTML paste شده (تمیز کردن)
 */
export function cleanPastedHTML(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // استایل‌های مجاز
    const allowedStyles = [
        'color', 'background-color', 'font-size', 'font-family', 
        'font-weight', 'font-style', 'text-decoration', 'text-align',
        'line-height', 'margin', 'padding', 'border', 'border-radius',
        'width', 'height', 'max-width', 'display'
    ];
    
    // پردازش تمام عناصر
    const processElement = (element) => {
        if (element.nodeType === Node.ELEMENT_NODE) {
            // حذف کلاس‌های غیرضروری
            if (element.className) {
                element.removeAttribute('class');
            }
            
            // حذف ID های غیرضروری
            if (element.id) {
                element.removeAttribute('id');
            }
            
            // حفظ استایل‌های مجاز
            if (element.style) {
                const computedStyle = window.getComputedStyle(element);
                const newStyle = {};
                
                allowedStyles.forEach(style => {
                    const value = computedStyle.getPropertyValue(style);
                    if (value && value !== 'initial' && value !== 'inherit' && value !== 'auto') {
                        newStyle[style] = value;
                    }
                });
                
                // اعمال استایل‌های مجاز
                Object.assign(element.style, newStyle);
            }
            
            // پردازش فرزندان
            Array.from(element.children).forEach(processElement);
        }
    };
    
    processElement(tempDiv);
    
    // تمیز کردن HTML نهایی
    let cleanHTML = tempDiv.innerHTML;
    
    // حذف تگ‌های غیرضروری
    cleanHTML = cleanHTML.replace(/<meta[^>]*>/gi, '');
    cleanHTML = cleanHTML.replace(/<link[^>]*>/gi, '');
    cleanHTML = cleanHTML.replace(/<script[^>]*>.*?<\/script>/gi, '');
    cleanHTML = cleanHTML.replace(/<style[^>]*>.*?<\/style>/gi, '');
    
    return cleanHTML;
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
 * بررسی اینکه آیا HTML خالی است
 */
export function isEmptyHTML(html) {
    if (!html) return true;
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const text = (temp.textContent || temp.innerText || '').trim();
    return text.length === 0;
}

/**
 * شمارش عناصر خاص
 */
export function countElements(html, selector) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.querySelectorAll(selector).length;
}

/**
 * دریافت محتوای عنصر اول
 */
export function getFirstElementContent(html, selector) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const element = temp.querySelector(selector);
    if (!element) return null;
    return (element.textContent || element.innerText || '').trim();
}

/**
 * دریافت تمام محتوای عناصر
 */
export function getAllElementsContent(html, selector) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const elements = temp.querySelectorAll(selector);
    return Array.from(elements).map(el => (el.textContent || el.innerText || '').trim());
}

/**
 * بررسی وجود عنصر
 */
export function hasElement(html, selector) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.querySelector(selector) !== null;
}

/**
 * حذف عناصر خاص از HTML
 */
export function removeElements(html, selector) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    temp.querySelectorAll(selector).forEach(el => el.remove());
    return temp.innerHTML;
}

/**
 * کلون کردن DOM
 */
export function cloneDOM(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.cloneNode(true);
}

// Export همه توابع
export default {
    extractText,
    extractTextWithoutHeadings,
    extractTextFromHeadings,
    extractParagraphs,
    getFirstParagraph,
    parseHTML,
    hasKeywordInSection,
    checkBlueKeywordInHTML,
    extractLinks,
    extractImages,
    countImagesWithAlt,
    countImagesWithoutAlt,
    cleanPastedHTML,
    escapeHtml,
    isEmptyHTML,
    countElements,
    getFirstElementContent,
    getAllElementsContent,
    hasElement,
    removeElements,
    cloneDOM
};
