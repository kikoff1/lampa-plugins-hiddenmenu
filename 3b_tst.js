// Версія плагіну: 0.4 Alpha - Оптимізована
// Розділяє кнопки окремо: Онлайн, Торренти, Трейлери

Lampa.Platform.tv();

(function() {
    'use strict';
    
    const PLUGIN_NAME = 'ButtonOrderPlugin';
    
    function rearrangeButtons() {
        try {
            // Очищаємо параметр пріоритету (як в оригінальному плагіні)
            if (Lampa.Storage.get('full_btn_priority')) {
                Lampa.Storage.set('full_btn_priority', '{}');
            }
            
            // Слухаємо події створення кнопок
            Lampa.Listener.follow('view_button_create', function(event) {
                if (!event || !event.buttons || !event.buttons.length) return;
                
                setTimeout(() => {
                    processAllButtons();
                }, 300);
            });
            
            // Також обробляємо кнопки при завантаженні
            setTimeout(processAllButtons, 1000);
            
        } catch (error) {
            console.warn(`${PLUGIN_NAME}: Помилка`, error);
        }
    }
    
    // Головна функція обробки всіх кнопок
    function processAllButtons() {
        const containers = findButtonContainers();
        
        containers.forEach(container => {
            if (container && container.children.length > 0) {
                flattenButtonContainer(container);
            }
        });
    }
    
    // Знаходимо всі контейнери з кнопками
    function findButtonContainers() {
        const selectors = [
            '.selector--buttons',
            '.view-buttons',
            '.full-buttons',
            '[class*="button"]',
            '.buttons-group',
            '.selector--filters'
        ];
        
        const containers = [];
        selectors.forEach(selector => {
            const found = document.querySelectorAll(selector);
            found.forEach(container => {
                if (container.children.length > 0) {
                    containers.push(container);
                }
            });
        });
        
        return containers;
    }
    
    // Розгортаємо контейнер з кнопками
    function flattenButtonContainer(container) {
        // Знаходимо всі кнопки в контейнері (включаючи вкладені)
        const allButtons = findAllButtons(container);
        
        if (allButtons.length <= 1) return;
        
        // Сортуємо кнопки по категоріях
        const sortedButtons = sortButtonsByCategory(allButtons);
        
        // Очищаємо контейнер
        container.innerHTML = '';
        
        // Додаємо кнопки в правильному порядку
        addButtonsInOrder(container, sortedButtons);
    }
    
    // Знаходимо всі кнопки (рекурсивно)
    function findAllButtons(element) {
        const buttons = [];
        
        function collectButtons(el) {
            // Перевіряємо, чи це кнопка
            if (isButtonElement(el)) {
                buttons.push(el);
                return;
            }
            
            // Якщо це контейнер, перевіряємо дітей
            if (el.children && el.children.length > 0) {
                Array.from(el.children).forEach(child => {
                    collectButtons(child);
                });
            }
        }
        
        collectButtons(element);
        return buttons;
    }
    
    // Перевіряємо, чи елемент є кнопкою
    function isButtonElement(element) {
        if (!element || !element.tagName) return false;
        
        const tag = element.tagName.toLowerCase();
        const role = element.getAttribute('role');
        const className = (element.className || '').toLowerCase();
        const text = (element.textContent || '').toLowerCase();
        
        // Якщо це явно кнопка або має текст джерела
        return tag === 'button' || 
               role === 'button' ||
               className.includes('button') ||
               className.includes('btn') ||
               text.includes('онлайн') ||
               text.includes('торрент') ||
               text.includes('трейлер') ||
               text.includes('дивитись') ||
               text.includes('дивитися') ||
               element.querySelector('.button') !== null;
    }
    
    // Сортуємо кнопки по категоріях
    function sortButtonsByCategory(buttons) {
        const categories = {
            online: [],
            torrent: [],
            trailer: [],
            other: []
        };
        
        buttons.forEach(button => {
            const category = detectButtonCategory(button);
            categories[category].push(button);
        });
        
        return categories;
    }
    
    // Визначаємо категорію кнопки
    function detectButtonCategory(button) {
        if (!button) return 'other';
        
        // Отримуємо весь текст кнопки
        const text = (button.textContent || '').toLowerCase();
        const html = (button.innerHTML || '').toLowerCase();
        const title = (button.title || '').toLowerCase();
        const className = (button.className || '').toLowerCase();
        
        const allText = text + ' ' + html + ' ' + title + ' ' + className;
        
        // Онлайн провайдери
        if (allText.includes('онлайн') || 
            allText.includes('online') ||
            allText.includes('hdrezk') ||
            allText.includes('voidboost') ||
            allText.includes('ashdi') ||
            allText.includes('collaps') ||
            allText.includes('bazon')) {
            return 'online';
        }
        
        // Торренти
        if (allText.includes('торрент') ||
            allText.includes('torrent') ||
            allText.includes('трекер') ||
            allText.includes('rutracker') ||
            allText.includes('rutor') ||
            allText.includes('kinozal')) {
            return 'torrent';
        }
        
        // Трейлери
        if (allText.includes('трейлер') ||
            allText.includes('trailer') ||
            allText.includes('youtube') ||
            allText.includes('відео') ||
            allText.includes('video')) {
            return 'trailer';
        }
        
        return 'other';
    }
    
    // Додаємо кнопки в правильному порядку
    function addButtonsInOrder(container, categories) {
        const order = ['online', 'torrent', 'trailer', 'other'];
        
        order.forEach(category => {
            if (categories[category] && categories[category].length > 0) {
                categories[category].forEach(button => {
                    // Відновлюємо стилі для коректного відображення
                    resetButtonStyles(button);
                    container.appendChild(button);
                });
            }
        });
    }
    
    // Скидаємо стилі кнопки для коректного відображення
    function resetButtonStyles(button) {
        if (!button) return;
        
        // Скидаємо стилі, які можуть ховати кнопку
        button.style.display = '';
        button.style.visibility = 'visible';
        button.style.opacity = '';
        button.style.width = '';
        button.style.height = '';
        button.style.margin = '2px 4px';
        button.style.flex = 'none';
        
        // Видаляємо класи, які можуть групувати кнопки
        const groupClasses = ['dropdown', 'submenu', 'hidden', 'collapsed'];
        groupClasses.forEach(cls => {
            if (button.classList.contains(cls)) {
                button.classList.remove(cls);
            }
        });
        
        // Додаємо клас для окремого відображення
        button.classList.add('single-button');
    }
    
    // Спостерігач для динамічних змін
    function setupMutationObserver() {
        const observer = new MutationObserver(function(mutations) {
            let shouldProcess = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && 
                            (node.classList && 
                             (node.classList.contains('button') || 
                              node.querySelector('.button')))) {
                            shouldProcess = true;
                        }
                    });
                }
            });
            
            if (shouldProcess) {
                setTimeout(processAllButtons, 200);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }
    
    // Ініціалізація плагіна
    function initPlugin() {
        if (typeof Lampa === 'undefined') {
            setTimeout(initPlugin, 100);
            return;
        }
        
        // Запускаємо основну логіку
        rearrangeButtons();
        
        // Запускаємо спостерігач
        setupMutationObserver();
        
        // Додаткова обробка через 3 секунди
        setTimeout(processAllButtons, 3000);
        
        console.log(`${PLUGIN_NAME}: Плагін успішно ініціалізовано`);
    }
    
    // Запускаємо плагін
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlugin);
    } else {
        initPlugin();
    }
    
})();