/**
 * مدیریت TinyMCE Editor
 */

import { debounce } from '../utils/helpers.js';

export class TinyMCEManager {
    constructor() {
        this.instance = null;
        this.onContentChangeCallback = null;
    }
    
    /**
     * مقداردهی اولیه
     */
    async init(onContentChange) {
        this.onContentChangeCallback = onContentChange;
        
        // مدیریت خطاهای TinyMCE
        this.handleTinyMCEErrors();
        
        return new Promise((resolve, reject) => {
            tinymce.init({
                selector: '#editor',
                language: 'fa',
                directionality: 'rtl',
                height: 700,
                branding: false,
                license_key: 'gpl',
                
                // Plugins
                plugins: [
                    'autolink', 'autosave', 'code', 'codesample', 'directionality',
                    'fullscreen', 'help', 'image', 'link', 'lists', 'media',
                    'nonbreaking', 'pagebreak', 'preview', 'quickbars', 'searchreplace',
                    'table', 'visualblocks', 'visualchars', 'wordcount'
                ],
                
                // Menubar
                menubar: 'file edit view insert format tools table help',
                
                // Toolbar
                toolbar_mode: 'sliding',
                toolbar: 
                    'fontfamily blocks fontsizeinput | ' +
                    'bold italic underline | ' +
                    'forecolor backcolor formatpainter | ' +
                    'lineheight alignleft aligncenter alignright alignjustify | ' +
                    'bullist numlist | outdent indent | ltr rtl | ' +
                    'link image media | table | searchreplace | preview code fullscreen',
                
                // Font Family
                font_family_formats:
                    'Vazir=Vazir, Tahoma, Arial, sans-serif;' +
                    'Tahoma=Tahoma, Arial, sans-serif;' +
                    'Arial=Arial, sans-serif;' +
                    'Times New Roman=Times New Roman, serif;' +
                    'Courier New=Courier New, monospace;' +
                    'Georgia=Georgia, serif;' +
                    'Verdana=Verdana, sans-serif',
                
                content_style: `
                    @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css');
                    body { 
                        direction: rtl !important; 
                        text-align: right !important; 
                        font-family: 'Vazir', Tahoma, Arial, sans-serif; 
                        line-height: 1.6;
                        font-size: 16px;
                    }
                    p { 
                        font-size: 16px; 
                        margin-bottom: 1em;
                    }
                    table { 
                        border-collapse: collapse; 
                        width: 100%; 
                    } 
                    table, th, td { 
                        border: 1px solid #ccc; 
                        padding: 4px; 
                    } 
                    img { 
                        max-width: 100%; 
                        height: auto; 
                        display: block; 
                    } 
                    [dir="ltr"] { 
                        direction: ltr; 
                    }
                `,
                
                // Quickbars
                quickbars_insert_toolbar: '',
                quickbars_selection_toolbar: 'bold italic underline link h1 h2 h3 blockquote',
                
                paste_as_text: false,
                paste_data_images: true,
                paste_merge_formats: true,
                paste_webkit_styles: 'all',
                paste_auto_cleanup_on_paste: true,
                paste_remove_styles_if_webkit: false,
                paste_block_drop: false,
                automatic_uploads: false,
                
                setup: (editor) => {
                    editor.on('init', () => {
                        this.instance = editor;
                        window.editorInstance = editor;
                        
                        console.log('✅ TinyMCE آماده شد');
                        
                        if (this.onContentChangeCallback) {
                            this.onContentChangeCallback();
                        }
                        
                        resolve(editor);
                    });
                    
                    editor.on('input change undo redo', () => {
                        if (this.onContentChangeCallback) {
                            this.onContentChangeCallback();
                        }
                    });
                    
                    editor.on('keyup', debounce(() => {
                        if (this.onContentChangeCallback) {
                            this.onContentChangeCallback();
                        }
                    }, 500));
                },
                
                // Paste Postprocess
                paste_postprocess: (plugin, args) => {
                    this.handlePastePostprocess(args.node);
                },
                
                // Image Upload Handler
                images_upload_handler: (blobInfo) => {
                    return Promise.resolve("data:" + blobInfo.blob().type + ";base64," + blobInfo.base64());
                }
            });
            
            setTimeout(() => {
                if (!this.instance) {
                    reject(new Error('TinyMCE initialization timeout'));
                }
            }, 10000);
        });
    }
    
    /**
     * پردازش محتوای paste شده
     */
handlePastePostprocess(node) {
    // 1. حذف wrapperهای اضافی (span/div) فقط برای تصاویر
    node.querySelectorAll("span, div").forEach((wrapper) => {
        const img = wrapper.querySelector('img');
        if (img && wrapper.children.length === 1) {
            const parent = wrapper.parentElement;
            parent.replaceChild(img, wrapper);
        }
    });
    
    // 2. پردازش و alignment تصاویر
    node.querySelectorAll("img").forEach((img) => {
        const parent = img.parentElement;
        if (!parent) return;

        // تشخیص alignment از parent (بدون حساسیت به فاصله)
        const rawStyle = parent.getAttribute("style") || "";
        const styleForMatch = rawStyle.replace(/\s/g, '').toLowerCase();
        
        let align = null;
        if (styleForMatch.includes("text-align:center")) align = "center";
        else if (styleForMatch.includes("text-align:right")) align = "right";
        else if (styleForMatch.includes("text-align:left")) align = "left";
        else if (styleForMatch.includes("text-align:justify")) align = "center";

        // پاک کردن استایل‌های مزاحم از parent (نگه داشتن dir)
        const dir = parent.getAttribute("dir");
        parent.removeAttribute("style");
        if (dir) parent.setAttribute("dir", dir);
        
        // پاک کردن استایل‌های قبلی تصویر
        img.removeAttribute("style");
        img.removeAttribute("class");
        
        // استایل‌های پایه
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        
        // اعمال alignment
        if (align === "center") {
            img.style.display = "block";
            img.style.marginLeft = "auto";
            img.style.marginRight = "auto";
        } else if (align === "right") {
            img.style.cssFloat = "right";
            img.style.margin = "0 15px 15px 0";
        } else if (align === "left") {
            img.style.cssFloat = "left";
            img.style.margin = "0 0 15px 15px";
        } else {
            img.style.display = "block";
        }
        
        // اضافه کردن clearfix بعد از float
        if (align === "left" || align === "right") {
            const clearDiv = document.createElement('div');
            clearDiv.style.clear = 'both';
            const next = parent.nextSibling;
            if (next) {
                parent.parentNode.insertBefore(clearDiv, next);
            } else {
                parent.parentNode.appendChild(clearDiv);
            }
        }
    });
    
    // 3. حذف divهای خالی
    node.querySelectorAll("div").forEach((div) => {
        if (!div.textContent.trim() && !div.querySelector('img, table, iframe')) {
            div.remove();
        }
    });
}
handleTinyMCEErrors() {
        window.addEventListener('error', (e) => {
            if (e.message && e.message.includes('tinymce')) {
                console.warn('⚠️ خطای TinyMCE:', e.message);
                e.preventDefault();
            }
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            if (e.reason && e.reason.message && e.reason.message.includes('tinymce')) {
                console.warn('⚠️ خطای شبکه TinyMCE:', e.reason.message);
                e.preventDefault();
            }
        });
    }
    
    getInstance() {
        return this.instance;
    }
    
    getContent() {
        return this.instance ? this.instance.getContent() : '';
    }
    
    setContent(content) {
        if (this.instance) {
            this.instance.setContent(content);
        }
    }
    
    getBody() {
        return this.instance ? this.instance.getBody() : null;
    }
    
    clear() {
        if (this.instance) {
            this.instance.setContent('');
        }
    }
    
    isReady() {
        return this.instance !== null;
    }
}

export default TinyMCEManager;
