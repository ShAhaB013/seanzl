/**
 * مدیریت مودال اطلاعات
 */

export class ModalManager {
    constructor() {
        this.elements = {
            modal: null,
            title: null,
            body: null,
            closeBtn: null
        };
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
        this.elements.modal = document.getElementById('infoModal');
        this.elements.title = document.getElementById('infoTitle');
        this.elements.body = document.getElementById('infoBody');
        this.elements.closeBtn = document.getElementById('closeModalBtn');
    }
    
    /**
     * اتصال event listener ها
     */
    attachEventListeners() {
        // دکمه بستن
        this.elements.closeBtn.addEventListener('click', () => {
            this.close();
        });
        
        // کلیک روی پس‌زمینه
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target.id === 'infoModal') {
                this.close();
            }
        });
        
        // کلید Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }
    
    /**
     * نمایش مودال
     */
    show(title, body) {
        this.elements.title.innerHTML = title;
        this.elements.body.innerHTML = body;
        this.elements.modal.classList.add('active');
    }
    
    /**
     * بستن مودال
     */
    close() {
        this.elements.modal.classList.remove('active');
    }
}

export default ModalManager;
