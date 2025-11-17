/**
 * Index فایل برای تمام ماژول‌های UI
 */

// Import کلاس‌ها
import UIController from './ui-controller.js';
import ScoreDisplay from './score-display.js';
import TabsManager from './tabs-manager.js';
import ModalManager from './modal-manager.js';
import KeywordsInput from './keywords-input.js';
import ChecksRenderer from './checks-renderer.js';

// Export کلاس‌ها
export { UIController };
export { ScoreDisplay };
export { TabsManager };
export { ModalManager };
export { KeywordsInput };
export { ChecksRenderer };

// Default export
export default {
    UIController,
    ScoreDisplay,
    TabsManager,
    ModalManager,
    KeywordsInput,
    ChecksRenderer,
};