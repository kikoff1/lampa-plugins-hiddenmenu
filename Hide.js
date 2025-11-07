(function() {  
    'use strict';  
      
    // Константи для зберігання  
    const STORAGE_KEYS = {  
        MENU: 'menu_hide',  
        HEAD: 'head_hidden_items',  
        SETTINGS: 'settings_hidden_items'  
    };  
      
    // Селектори DOM-елементів  
    const SELECTORS = {  
        MENU_ITEM: '.menu__item',  
        HEAD_ACTION: '.head__action',  
        SETTINGS_FOLDER: '.settings-folder',  
        MENU_LIST: '.menu__list',  
        HEAD_ACTIONS: '.head__actions',  
        SETTINGS_BODY: '.settings__body'  
    };  
      
    // SVG іконки  
    const ICONS = {  
        EYE: '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',  
        RESET: '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>'  
    };  
      
    // Додаємо стилі через систему шаблонів Lampa (як у plugins/collections/collections.js:47-55)  
    Lampa.Template.add('menu_hide_styles', `  
        <style>  
        .hidden { display: none !important; }  
        .menu-hide-item .settings-param {  
            padding: 16px 40px !important;  
            min-height: 54px !important;  
            display: flex !important;  
            align-items: center !important;  
            border-radius: 12px !important;  
            margin-bottom: 12px !important;  
            background: rgba(255,255,255,0.05) !important;  
            transition: all 0.2s ease !important;  
        }  
        .menu-hide-item .settings-param:hover {  
            background: rgba(255,255,255,0.1) !important;  
            transform: translateY(-2px) !important;  
        }  
        .menu-hide-icon {  
            width: 30px !important;  
            height: 30px !important;  
            min-width: 30px !important;  
            min-height: 30px !important;  
            display: flex !important;  
            align-items: center !important;  
            justify-content: center !important;  
            margin-right: 16px !important;  
            margin-left: 10px !important;  
        }  
        .menu-hide-text {  
            font-size: 18px !important;  
            flex-grow: 1 !important;  
            font-weight: 500 !important;  
            letter-spacing: 0.3px !important;  
        }  
        .menu-hide-hidden { color: #ff4e45 !important; }  
        .menu-hide-shown { color: #4CAF50 !important; }  
        .section-title .settings-param__name {  
            font-size: 20px !important;  
            font-weight: 600 !important;  
            margin: 25px 0 15px 0 !important;  
            padding-bottom: 8px !important;  
            border-bottom: 2px solid rgba(255,255,255,0.1) !important;  
            color: #fff !important;  
        }  
        .section-divider .settings-param {  
            height: 1px !important;  
            min-height: 1px !important;  
            padding: 0 !important;  
            background: rgba(255,255,255,0.1) !important;  
            margin: 25px 0 !important;  
        }  
        .settings-param.disable-hide {  
            opacity: 0.6 !important;  
            pointer-events: none !important;  
        }  
        .credits-text {  
            text-align: center;  
            color: #b0b0b0 !important;  
            font-size: 14px !important;  
            padding: 15px 20px 5px !important;  
            margin-top: 5px !important;  
            line-height: 1.5;  
        }  
        </style>  
    `);  
      
    $('body').append(Lampa.Template.get('menu_hide_styles', {}, true));  
      
    // Мультиязыкова підтримка  
    Lampa.Lang.add({  
        menu_items_hide: {  
            ru: 'Скрытие элементов интерфейса',  
            en: 'Hide interface',  
            uk: 'Приховання інтерфейсу',  
            zh: '隐藏界面'  
        },  
        head_items_hide: {  
            ru: 'Скрытие верхних элементов',  
            en: 'Hide head items',  
            uk: 'Приховати верхнє меню',  
            zh: '隐藏顶部菜单'  
        },  
        settings_items_hide: {  
            ru: 'Скрытие правых элементов',  
            en: 'Hide settings menu',  
            uk: 'Приховати праве меню',  
            zh: '隐藏设置菜单'  
        },  
        left_menu_title: {  
            ru: 'Левое меню',  
            en: 'Left menu',  
            uk: 'Ліве меню',  
            zh: '左侧菜单'  
        },  
        head_title: {  
            ru: 'Верхнее меню',  
            en: 'Head menu',  
            uk: 'Верхнє меню',  
            zh: '顶部菜单'  
        },  
        settings_title: {  
            ru: 'Настройки',  
            en: 'Settings menu',  
            uk: 'Праве меню',  
            zh: '设置菜单'  
        },  
        plugin_description: {  
            ru: 'Плагин для сокрытия элементов интерфейса',  
            en: 'Plugin for hiding interface elements',  
            uk: 'Плагін для приховання елементів інтерфейсу',  
            zh: '用于隐藏界面元素的插件'  
        },  
        hidden: {  
            ru: 'Скрыто',  
            en: 'Hidden',  
            uk: 'Приховано',  
            zh: '已隐藏'  
        },  
        shown: {  
            ru: 'Отображено',  
            en: 'Shown',  
            uk: 'Відображається',  
            zh: '显示中'  
        },  
        no_name: {  
            ru: 'Элемент без названия',  
            en: 'Unnamed element',  
            uk: 'Елемент без назви',  
            zh: '未命名元素'  
        },  
        head_action_search: {  
            ru: 'Поиск',  
            en: 'Search',  
            uk: 'Пошук',  
            zh: '搜索'  
        },  
        head_action_settings: {  
            ru: 'Настройки',  
            en: 'Settings',  
            uk: 'Налаштування',  
            zh: '设置'  
        },  
        head_action_feed: {  
            ru: 'Лента',  
            en: 'Feed',  
            uk: 'Стрічка',  
            zh: '动态'  
        },  
        head_action_notice: {  
            ru: 'Уведомления',  
            en: 'Notifications',  
            uk: 'Сповіщення',  
            zh: '通知'  
        },  
        head_action_profile: {  
            ru: 'Профиль',  
            en: 'Profile',  
            uk: 'Профіль',  
            zh: '个人资料'  
        },  
        head_action_fullscreen: {  
            ru: 'Полный экран',  
            en: 'Fullscreen',  
            uk: 'Повноекранний режим',  
            zh: '全屏'  
        },  
        credits_text: {  
            ru: 'Создано при поддержке сообщества Lampac & BWA<br>Отдельная благодарность Oleksandr и Max NuttShell за помощь в разработке плагина',  
            en: 'Created with support from Lampac & BWA community<br>Special thanks to Oleksandr and Max NuttShell for plugin development assistance',  
            uk: 'Створено за підтримки спільноти Lampac & BWA<br>Окрема подяка Oleksandr та Max NuttShell за допомогу у розробці плагіна',  
            zh: '在 Lampac & BWA 社区支持下创建<br>特别感谢 Oleksandr 和 Max NuttShell 对插件开发的帮助'  
        },  
        reset_all_hidden: {  
            ru: 'Показать все',  
            en: 'Show all',  
            uk: 'Показати все',  
            zh: '显示全部'  
        }  
       // Універсальна функція оновлення видимості елементів  
    function updateVisibility(selector, storageKey, idExtractor) {  
        const hiddenItems = Lampa.Storage.get(storageKey, []);  
        const $items = $(selector);  
          
        $items.each(function() {  
            const $item = $(this);  
            const id = idExtractor($item);  
              
            if (id && hiddenItems.includes(id)) {  
                $item.addClass('hidden');  
            } else {  
                $item.removeClass('hidden');  
            }  
        });  
    }  
      
    // Екстрактори ID для різних типів елементів  
    const idExtractors = {  
        menu: ($item) => {  
            const textElement = $item.find('.menu__text');  
            return textElement.length ? textElement.text().trim() : null;  
        },  
        head: ($item) => {  
            if ($item.hasClass('processing')) return null;  
              
            const classes = $item.attr('class').split(' ');  
            const idParts = classes.filter(cls =>   
                cls.indexOf('open--') === 0 || cls === 'full-screen'  
            );  
            return idParts.length ? idParts.join('_') : null;  
        },  
        settings: ($item) => {  
            const component = $item.data('component');  
            return component === 'menu_filter' ? null : component;  
        }  
    };  
      
    // Оновлення всіх елементів  
    function updateAllVisibility() {  
        updateVisibility(SELECTORS.MENU_ITEM, STORAGE_KEYS.MENU, idExtractors.menu);  
        updateVisibility(SELECTORS.HEAD_ACTION, STORAGE_KEYS.HEAD, idExtractors.head);  
        updateVisibility(SELECTORS.SETTINGS_FOLDER, STORAGE_KEYS.SETTINGS, idExtractors.settings);  
    }  
      
    // Скидання всіх прихованих елементів  
    function resetAllHiddenItems() {  
        Object.values(STORAGE_KEYS).forEach(key => {  
            Lampa.Storage.set(key, []);  
        });  
          
        updateAllVisibility();  
          
        $('.menu-hide-item .settings-param__value').each(function() {  
            $(this)  
                .text(Lampa.Lang.translate('shown'))  
                .removeClass('menu-hide-hidden')  
                .addClass('menu-hide-shown');  
        });  
    }  
      
    // Створення елемента налаштувань  
    function createSettingItem(config) {  
        const { icon, text, storageKey, id, isDisabled } = config;  
          
        Lampa.SettingsApi.addParam({  
            component: 'menu_filter',  
            param: { type: 'button' },  
            field: { name: icon, description: text },  
            onRender: function(item) {  
                item.addClass('menu-hide-item');  
                item.find('.settings-param__descr').remove();  
                  
                const $param = item.find('.settings-param');  
                $param.css({  
                    padding: '0 15px',  
                    display: 'flex',  
                    alignItems: 'center',  
                    justifyContent: 'space-between'  
                });  
                  
                if (isDisabled) {  
                    $param.addClass('disable-hide');  
                }  
                  
                const $name = item.find('.settings-param__name');  
                $name.css({  
                    padding: '0',  
                    margin: '0',  
                    fontSize: '16px',  
                    display: 'flex',  
                    alignItems: 'center',  
                    justifyContent: 'space-between',  
                    width: '100%'  
                });  
                  
                $name.find('svg, img').css({  
                    width: '30px',  
                    height: '30px',  
                    minWidth: '30px',  
                    minHeight: '30px'  
                }).addClass('menu-hide-icon');  
                  
                const hiddenItems = Lampa.Storage.get(storageKey, []);  
                const isHidden = hiddenItems.includes(id);  
                const status = Lampa.Lang.translate(isHidden ? 'hidden' : 'shown');  
                  
                const $value = $('<div/>', {  
                    class: 'settings-param__value ' + (isHidden ? 'menu-hide-hidden' : 'menu-hide-shown'),  
                    text: status,  
                    css: {  
                        fontSize: '15px',  
                        paddingRight: '10px'  
                    }  
                });  
                  
                const $textSpan = $('<span/>', {  
                    class: 'menu-hide-text',  
                    text: text,  
                    css: {  
                        marginLeft: '10px',  
                        flexGrow: '1'  
                    }  
                });  
                  
                $name.find('svg, img').after($textSpan);  
                $name.append($value);  
                  
                // Обробник переключення  
                item.off('hover:enter').on('hover:enter', function() {  
                    if (isDisabled) return;  
                      
                    const hiddenItems = Lampa.Storage.get(storageKey, []);  
                    const index = hiddenItems.indexOf(id);  
                      
                    if (index !== -1) {  
                        hiddenItems.splice(index, 1);  
                    } else {  
                        hiddenItems.push(id);  
                    }  
                      
                    Lampa.Storage.set(storageKey, hiddenItems);  
                    updateAllVisibility();  
                      
                    const newStatus = Lampa.Lang.translate(  
                        hiddenItems.includes(id) ? 'hidden' : 'shown'  
                    );  
                      
                    $value.text(newStatus)  
                        .toggleClass('menu-hide-hidden', hiddenItems.includes(id))  
                        .toggleClass('menu-hide-shown', !hiddenItems.includes(id));  
                });  
            }  
        });  
    }  
      
    // Додавання розділювача  
    function addDivider() {  
        Lampa.SettingsApi.addParam({  
            component: 'menu_filter',  
            param: { type: 'space' },  
            field: {},  
            onRender: function(item) {  
                item.addClass('section-divider');  
            }  
        });  
    }  
      
    // Додавання заголовка секції  
    function addSectionTitle(titleKey) {  
        Lampa.SettingsApi.addParam({  
            component: 'menu_filter',  
            param: { type: 'title' },  
            field: { name: Lampa.Lang.translate(titleKey) },  
            onRender: function(item) {  
                item.addClass('section-title');  
            }  
        });  
    }  
      
    // Отримання назви елемента верхнього меню  
    function getHeadActionTitle(id) {  
        const titleMap = {  
            'open--search': 'head_action_search',  
            'open--settings': 'head_action_settings',  
            'open--feed': 'head_action_feed',  
            'open--notice': 'head_action_notice',  
            'open--profile': 'head_action_profile',  
            'full-screen': 'head_action_fullscreen'  
        };  
          
        for (const [key, value] of Object.entries(titleMap)) {  
            if (id.includes(key)) return Lampa.Lang.translate(value);  
        }  
          
        return Lampa.Lang.translate('no_name');  
    }
    // Ініціалізація плагіна  
    function startPlugin() {  
        const manifest = {  
            type: 'other',  
            version: '0.8.0',  
            name: Lampa.Lang.translate('menu_items_hide'),  
            description: Lampa.Lang.translate('plugin_description'),  
            component: 'menu_filter'  
        };  
          
        Lampa.Manifest.plugins.push(manifest);  
          
        // Додаємо компонент налаштувань  
        Lampa.SettingsApi.addComponent({  
            component: 'menu_filter',  
            name: Lampa.Lang.translate('menu_items_hide'),  
            description: Lampa.Lang.translate('plugin_description'),  
            icon: ICONS.EYE  
        });  
          
        // Кнопка в інтерфейсі  
        Lampa.SettingsApi.addParam({  
            component: 'interface',  
            param: { type: 'button' },  
            field: {  
                name: Lampa.Lang.translate('menu_items_hide'),  
                description: Lampa.Lang.translate('plugin_description')  
            },  
            onChange: function() {  
                Lampa.Settings.create('menu_filter', {  
                    onBack: () => Lampa.Settings.create('interface')  
                });  
            }  
        });  
          
        // Створення налаштувань меню  
        let settingsCreated = false;  
          
        function createMenuSettings() {  
            if (settingsCreated) return;  
            settingsCreated = true;  
              
            // Подяка  
            Lampa.SettingsApi.addParam({  
                component: 'menu_filter',  
                param: { type: 'space' },  
                field: {},  
                onRender: (item) => {  
                    item.append($('<div class="credits-text">' + Lampa.Lang.translate('credits_text') + '</div>'));  
                }  
            });  
              
            // Кнопка скидання  
            createSettingItem({  
                icon: ICONS.RESET,  
                text: Lampa.Lang.translate('reset_all_hidden'),  
                storageKey: '',  
                id: 'reset',  
                isDisabled: false  
            });  
              
            // Ліве меню  
            addSectionTitle('left_menu_title');  
              
            $(SELECTORS.MENU_ITEM).each(function() {  
                const $item = $(this);  
                const text = idExtractors.menu($item);  
                if (!text) return;  
                  
                const icon = $item.find('.menu__ico').html() || '•';  
                createSettingItem({  
                    icon: icon,  
                    text: text,  
                    storageKey: STORAGE_KEYS.MENU,  
                    id: text,  
                    isDisabled: false  
                });  
            });  
              
            addDivider();  
              
            // Верхнє меню  
            addSectionTitle('head_title');  
              
            const headProcessed = {};  
            $(SELECTORS.HEAD_ACTION).each(function() {  
                const $item = $(this);  
                const id = idExtractors.head($item);  
                if (!id || headProcessed[id]) return;  
                headProcessed[id] = true;  
                  
                const icon = $item.html();  
                const title = getHeadActionTitle(id);  
                  
                createSettingItem({  
                    icon: icon,  
                    text: title,  
                    storageKey: STORAGE_KEYS.HEAD,  
                    id: id,  
                    isDisabled: id.includes('open--settings')  
                });  
            });  
              
            addDivider();  
              
            // Праве меню (Налаштування)  
            addSectionTitle('settings_title');  
              
            const settingsProcessed = {};  
              
            function processSettings() {  
                const $folders = $(SELECTORS.SETTINGS_FOLDER);  
                if ($folders.length === 0) {  
                    setTimeout(processSettings, 300);  
                    return;  
                }  
                  
                $folders.each(function() {  
                    const $item = $(this);  
                    const component = idExtractors.settings($item);  
                    if (!component || settingsProcessed[component]) return;  
                    settingsProcessed[component] = true;  
                      
                    const name = $item.find('.settings-folder__name').text().trim() || Lampa.Lang.translate('no_name');  
                    const icon = $item.find('.settings-folder__icon').html() || '•';  
                      
                    createSettingItem({  
                        icon: icon,  
                        text: name,  
                        storageKey: STORAGE_KEYS.SETTINGS,  
                        id: component,  
                        isDisabled: component === 'menu_filter'  
                    });  
                });  
            }  
              
            processSettings();  
        }  
          
        // Обробка змін  
        function handleChanges() {  
            updateAllVisibility();  
              
            Lampa.Storage.listener.follow('change', (e) => {  
                if (Object.values(STORAGE_KEYS).includes(e.name)) {  
                    updateAllVisibility();  
                }  
            });  
              
            // Debounced MutationObserver  
            let debounceTimer;  
            const observer = new MutationObserver(() => {  
                clearTimeout(debounceTimer);  
                debounceTimer = setTimeout(() => {  
                    if ($(SELECTORS.MENU_LIST + ',' + SELECTORS.HEAD_ACTIONS + ',' + SELECTORS.SETTINGS_BODY).length) {  
                        createMenuSettings();  
                        updateAllVisibility();  
                    }  
                }, 300);  
            });  
              
            observer.observe(document.body, {  
                childList: true,  
                subtree: true  
            });  
        }  
          
        // Ініціалізація  
        function init() {  
            const checkInterval = setInterval(() => {  
                if ($(SELECTORS.MENU_LIST + ',' + SELECTORS.HEAD_ACTIONS + ',' + SELECTORS.SETTINGS_BODY).length) {  
                    clearInterval(checkInterval);  
                    createMenuSettings();  
                    handleChanges();  
                }  
            }, 500);  
        }  
          
        if (window.appready) {  
            init();  
        } else {  
            Lampa.Listener.follow('app', (e) => {  
                if (e.type === 'ready') init();  
            });  
        }  
    }  
      
    // Запуск плагіна  
    if (window.appready) {  
        startPlugin();  
    } else {  
        Lampa.Listener.follow('app', (e) => {  
            if (e.type === 'ready') startPlugin();  
        });  
    }  
})();