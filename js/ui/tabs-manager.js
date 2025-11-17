/**
 * مدیریت تب‌های SEO، خوانایی، پیشنهادات
 */

export class TabsManager {
    constructor() {
        this.elements = {
            tabs: [],
            tabContents: []
        };
        this.activeTab = 'seo';
    }
    
    /**
     * مقداردهی اولیه
     */
    init() {
        this.cacheElements();
        this.attachEventListeners();
    }
    
    /**
     * کش کردن المان‌ها
     */
    cacheElements() {
        this.elements.tabs = document.querySelectorAll('.seo-tab');
        this.elements.tabContents = document.querySelectorAll('.seo-tab-content');
    }
    
    /**
     * اتصال event listener ها
     */
    attachEventListeners() {
        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }
    
    /**
     * تغییر تب
     */
    switchTab(tabName) {
        // غیرفعال کردن همه تب‌ها
        this.elements.tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        this.elements.tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // فعال کردن تب مورد نظر
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // نقشه تب‌ها به محتوا
        const tabContentMap = {
            'seo': 'seoTab',
            'readability': 'readabilityTab',
            'suggestions': 'suggestionsTab'
        };
        
        const contentId = tabContentMap[tabName];
        const activeContent = document.getElementById(contentId);
        if (activeContent) {
            activeContent.classList.add('active');
        }
        
        this.activeTab = tabName;
    }
    
    /**
     * دریافت تب فعال
     */
    getActiveTab() {
        return this.activeTab;
    }
    
    /**
     * به‌روزرسانی badge تب
     */
    updateBadge(tabName, count) {
        const badgeMap = {
            'seo': 'seoBadge',
            'readability': 'readabilityBadge'
        };
        
        const badgeId = badgeMap[tabName];
        if (!badgeId) return;
        
        const badge = document.getElementById(badgeId);
        if (!badge) return;
        
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

export default TabsManager;
