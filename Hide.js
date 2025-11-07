(function() {  
    'use strict';  
      
    // Додаємо стилі  
    $('<style>\  
        .hidden { display: none !important; }\  
        .menu-hide-item .settings-param { \  
            padding: 16px 40px !important; \  
            min-height: 54px !important; \  
            display: flex !important; \  
            align-items: center !important; \  
            border-radius: 12px !important; \  
            margin-bottom: 12px !important; \  
            background: rgba(255,255,255,0.05) !important; \  
            transition: all 0.2s ease !important; \  
        }\  
        .menu-hide-item .settings-param:hover { \  
            background: rgba(255,255,255,0.1) !important; \  
            transform: translateY(-2px) !important; \  
        }\  
        .menu-hide-icon { \  
            width: 30px !important; \  
            height: 30px !important; \  
            min-width: 30px !important; \  
            min-height: 30px !important; \  
            display: flex !important; \  
            align-items: center !important; \  
            justify-content: center !important; \  
            margin-right: 16px !important; \  
            margin-left: 10px !important; \  
        }\  
        .menu-hide-text { \  
            font-size: 18px !important; \  
            flex-grow: 1 !important; \  
            font-weight: 500 !important; \  
            letter-spacing: 0.3px !important; \  
        }\  
        .menu-hide-hidden { \  
            color: #ff4e45 !important; \  
        }\  
        .menu-hide-shown { \  
            color: #4CAF50 !important; \  
        }\  
        .section-title .settings-param__name { \  
            font-size: 20px !important; \  
            font-weight: 600 !important; \  
            margin: 25px 0 15px 0 !important; \  
            padding-bottom: 8px !important; \  
            border-bottom: 2px solid rgba(255,255,255,0.1) !important; \  
            color: #fff !important; \  
        }\  
        .section-divider .settings-param { \  
            height: 1px !important; \  
            min-height: 1px !important; \  
            padding: 0 !important; \  
            background: rgba(255,255,255,0.1) !important; \  
            margin: 25px 0 !important; \  
        }\  
        .settings-param.disable-hide { \  
            opacity: 0.6 !important; \  
            pointer-events: none !important; \  
        }\  
        .credits-text { \  
            text-align: center; \  
            color: #b0b0b0 !important; \  
            font-size: 14px !important; \  
            padding: 15px 20px 5px !important; \  
            margin-top: 5px !important; \  
            line-height: 1.5; \  
        }\  
        .menu-move-buttons { \  
            display: flex !important; \  
            gap: 8px !important; \  
            margin-right: 8px !important; \  
        }\  
        .menu-move-btn { \  
            width: 32px !important; \  
            height: 32px !important; \  
            display: flex !important; \  
            align-items: center !important; \  
            justify-content: center !important; \  
            background: rgba(255,255,255,0.1) !important; \  
            border-radius: 6px !important; \  
            cursor: pointer !important; \  
            transition: all 0.2s ease !important; \  
        }\  
        .menu-move-btn:hover { \  
            background: rgba(255,255,255,0.2) !important; \  
        }\  
        .menu-move-btn svg { \  
            width: 16px !important; \  
            height: 16px !important; \  
        }\  
    </style>').appendTo('head');  
  
    // Мультимовна підтримка  
    Lampa.Lang.add({  
        menu_items_hide: {  
            ru: 'Скрытие элементов интерфейса',  
            en: 'Hide interface',  
            uk: 'Приховання інтерфейсу',  
            zh: '隐藏界面'  
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
    });  
  
    // Іконки  
    var eyeIcon = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';  
    var resetIcon = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>';  
    var upArrowIcon = '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';  
    var downArrowIcon = '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';  
  
    function startPlugin() {  
        var manifest = {  
            type: 'other',  
            version: '1.0.0',  
            name: Lampa.Lang.translate('menu_items_hide'),  
            description: Lampa.Lang.translate('plugin_description'),  
            component: 'menu_filter',  
        };  
        Lampa.Manifest.plugins.push(manifest);  
  
        var menu = $('.menu__list:eq(0)');  
        var observeTimer;  
  
        // Функції для роботи з лівим меню (на основі стандартного редактора)  
        function orderLeftMenu() {  
            var items = Lampa.Storage.get('menu_sort', []);  
              
            if (items.length) {  
                items.forEach(function(item) {  
                    var el = $('.menu__item', menu).filter(function() {  
                        return $(this).find('.menu__text').text().trim() === item;  
                    });  
                      
                    if (el.length) el.appendTo(menu);  
                });  
            }  
        }  
  
        function hideLeftMenu() {  
            var items = Lampa.Storage.get('menu_hide', []);  
              
            $('.menu__item', menu).removeClass('hidden');  
  
            if (items.length) {  
                items.forEach(function(item) {  
                    var el = $('.menu__item', menu).filter(function() {  
                        return $(this).find('.menu__text').text().trim() === item;  
                    });  
                      
                    if (el.length) el.addClass('hidden');  
                });  
            }  
        }  
  
        function saveLeftMenu() {  
            var sort = [];  
            var hide = [];  
  
            $('.menu__item', menu).each(function() {  
                var name = $(this).find('.menu__text').text().trim();  
                  
                sort.push(name);  
  
                if ($(this).hasClass('hidden')) {  
                    hide.push(name);  
                }  
            });  
  
            Lampa.Storage.set('menu_sort', sort);  
            Lampa.Storage.set('menu_hide', hide);  
        }  
  
        function updateLeftMenu() {  
            orderLeftMenu();  
            hideLeftMenu();  
        }  
  
        function observeLeftMenu() {  
            clearTimeout(observeTimer);  
              
            observeTimer = setTimeout(function() {  
                var memory = Lampa.Storage.get('menu_sort', []);  
                var anon = [];  
  
                $('.menu__item', menu).each(function() {  
                    anon.push($(this).find('.menu__text').text().trim());  
                });  
  
                anon.forEach(function(item) {  
                    if (memory.indexOf(item) === -1) memory.push(item);  
                });  
  
                Lampa.Storage.set('menu_sort', memory);  
  
                updateLeftMenu();  
            }, 500);  
        }  
  
        // Функції для верхнього меню  
        function updateHeadVisibility() {  
            var hiddenItems = Lampa.Storage.get('head_hide', []);  
              
            $('.head__action').each(function() {  
                var $item = $(this);  
                if ($item.hasClass('processing')) return;  
                  
                var classes = $item.attr('class').split(' ');  
                var idParts = [];  
                for (var i = 0; i < classes.length; i++) {  
                    if (classes[i].indexOf('open--') === 0 || classes[i] === 'full-screen') {  
                        idParts.push(classes[i]);  
                    }  
                }  
                var id = idParts.join('_');  
                  
                if (!id) return;  
                  
                if (hiddenItems.indexOf(id) !== -1) {  
                    $item.addClass('hidden');  
                } else {  
                    $item.removeClass('hidden');  
                }  
            });  
        }  
  
        // Функції для правого меню  
        function updateSettingsVisibility() {  
            var hiddenItems = Lampa.Storage.get('settings_hide', []);  
              
            $('.settings-folder').each(function() {  
                var $item = $(this);  
                var component = $item.data('component');  
                if (!component) return;  
                  
                if (component === 'menu_filter') return;  
                  
                if (hiddenItems.indexOf(component) !== -1) {  
                    $item.addClass('hidden');  
                } else {  
                    $item.removeClass('hidden');  
                }  
            });  
        }  
  
        function updateAllVisibility() {  
            updateLeftMenu();  
            updateHeadVisibility();  
            updateSettingsVisibility();  
        }  
  
        function resetAllHiddenItems() {  
            Lampa.Storage.set('menu_sort', []);  
            Lampa.Storage.set('menu_hide', []);  
            Lampa.Storage.set('head_hide', []);  
            Lampa.Storage.set('settings_hide', []);  
              
            updateAllVisibility();  
              
            $('.menu-hide-item').each(function() {  
                var $item = $(this);  
                var $value = $item.find('.settings-param__value');  
                if ($value.length) {  
                    $value.text(Lampa.Lang.translate('shown'));  
                    $value.removeClass('menu-hide-hidden').addClass('menu-hide-shown');  
                }  
            });  
        }  
  
         // Додаємо компонент налаштувань  
        Lampa.SettingsApi.addComponent({  
            component: 'menu_filter',  
            name: Lampa.Lang.translate('menu_items_hide'),  
            description: Lampa.Lang.translate('plugin_description'),  
            icon: eyeIcon  
        });  
  
        // Головне вікно налаштувань  
        Lampa.SettingsApi.addParam({  
            component: 'interface',  
            param: {  
                type: 'button'  
            },  
            field: {  
                name: Lampa.Lang.translate('menu_items_hide'),  
                description: Lampa.Lang.translate('plugin_description')  
            },  
            onChange: function() {  
                Lampa.Settings.create('menu_filter', {  
                    onBack: function() {  
                        Lampa.Settings.create('interface');  
                    }  
                });  
            }  
        });  
  
        var leftSettingsCreated = false;  
        var headSettingsCreated = false;  
        var settingsSettingsCreated = false;  
        var resetButtonAdded = false;  
  
        function createMenuSettings() {  
            if (!resetButtonAdded) {  
                // Додаємо подяку  
                Lampa.SettingsApi.addParam({  
                    component: 'menu_filter',  
                    param: {  
                        type: 'space'  
                    },  
                    field: {},  
                    onRender: function(item) {  
                        var credits = $('<div class="credits-text">' + Lampa.Lang.translate('credits_text') + '</div>');  
                        item.append(credits);  
                    }  
                });  
  
                // Кнопка "Показати все"  
                Lampa.SettingsApi.addParam({  
                    component: 'menu_filter',  
                    param: {  
                        type: 'button'  
                    },  
                    field: {  
                        name: resetIcon,  
                        description: Lampa.Lang.translate('reset_all_hidden')  
                    },  
                    onChange: function() {  
                        resetAllHiddenItems();  
                    },  
                    onRender: function(item) {  
                        item.addClass('menu-hide-item');  
                        item.find('.settings-param__descr').remove();  
                          
                        var $name = item.find('.settings-param__name');  
                        $name.css({  
                            'display': 'flex',  
                            'align-items': 'center',  
                            'width': '100%'  
                        });  
                          
                        var $text = $('<span class="menu-hide-text">' + Lampa.Lang.translate('reset_all_hidden') + '</span>');  
                        $name.find('svg').after($text);  
                    }  
                });  
                  
                resetButtonAdded = true;  
            }  
  
            // Ліве меню з кнопками переміщення  
            if (!leftSettingsCreated) {  
                Lampa.SettingsApi.addParam({  
                    component: 'menu_filter',  
                    param: {  
                        type: 'title'  
                    },  
                    field: {  
                        name: Lampa.Lang.translate('left_menu_title'),  
                    },  
                    onRender: function(item) {  
                        item.addClass('section-title');  
                    }  
                });  
  
                var menuItems = [];  
                $('.menu__item', menu).each(function() {  
                    var $item = $(this);  
                    var textElement = $item.find('.menu__text');  
                    if (textElement.length === 0) return;  
                      
                    var text = textElement.text().trim();  
                    var iconElement = $item.find('.menu__ico');  
                    var icon = iconElement.length ? iconElement.html() : '•';  
                      
                    menuItems.push({text: text, icon: icon, element: $item});  
                });  
  
                menuItems.forEach(function(itemData, index) {  
                    var text = itemData.text;  
                    var icon = itemData.icon;  
                      
                    Lampa.SettingsApi.addParam({  
                        component: 'menu_filter',  
                        param: {  
                            type: 'button'  
                        },  
                        field: {  
                            name: icon,  
                            description: text  
                        },  
                        onRender: function(item) {  
                            item.addClass('menu-hide-item');  
                            item.find('.settings-param__descr').remove();  
                              
                            var $name = item.find('.settings-param__name');  
                            $name.css({  
                                'display': 'flex',  
                                'align-items': 'center',  
                                'width': '100%'  
                            });  
                              
                            var hiddenItems = Lampa.Storage.get('menu_hide', []);  
                            var isHidden = hiddenItems.indexOf(text) !== -1;  
                              
                            // Кнопки переміщення  
                            var $moveButtons = $('<div class="menu-move-buttons"></div>');  
                            var $moveUp = $('<div class="menu-move-btn selector">' + upArrowIcon + '</div>');  
                            var $moveDown = $('<div class="menu-move-btn selector">' + downArrowIcon + '</div>');  
                              
                            $moveUp.on('hover:enter', function() {  
                                var currentItem = $('.menu__item', menu).filter(function() {  
                                    return $(this).find('.menu__text').text().trim() === text;  
                                });  
                                var prev = currentItem.prev('.menu__item');  
                                  
                                if (prev.length) {  
                                    currentItem.insertBefore(prev);  
                                    saveLeftMenu();  
                                }  
                            });  
                              
                            $moveDown.on('hover:enter', function() {  
                                var currentItem = $('.menu__item', menu).filter(function() {  
                                    return $(this).find('.menu__text').text().trim() === text;  
                                });  
                                var next = currentItem.next('.menu__item');  
                                  
                                if (next.length) {  
                                    currentItem.insertAfter(next);  
                                    saveLeftMenu();  
                                }  
                            });  
                              
                            $moveButtons.append($moveUp).append($moveDown);  
                              
                            // Статус видимості  
                            var status = isHidden ? Lampa.Lang.translate('hidden') : Lampa.Lang.translate('shown');  
                            var $value = $('<div class="settings-param__value"/>')  
                                .text(status)  
                                .addClass(isHidden ? 'menu-hide-hidden' : 'menu-hide-shown');  
                              
                            var $text = $('<span class="menu-hide-text">' + text + '</span>');  
                            $name.find('svg, img').after($text);  
                            $name.append($moveButtons);  
                            $name.append($value);  
                              
                            // Перемикач видимості  
                            item.off('hover:enter').on('hover:enter', function(e) {  
                                if ($(e.target).closest('.menu-move-btn').length) return;  
                                  
                                var currentItem = $('.menu__item', menu).filter(function() {  
                                    return $(this).find('.menu__text').text().trim() === text;  
                                });  
                                  
                                currentItem.toggleClass('hidden');  
                                saveLeftMenu();  
                                  
                                var hiddenItems = Lampa.Storage.get('menu_hide', []);  
                                var newStatus = hiddenItems.indexOf(text) !== -1 ?   
                                    Lampa.Lang.translate('hidden') :   
                                    Lampa.Lang.translate('shown');  
                                  
                                var isNowHidden = hiddenItems.indexOf(text) !== -1;  
                                $value.text(newStatus)  
                                    .toggleClass('menu-hide-hidden', isNowHidden)  
                                    .toggleClass('menu-hide-shown', !isNowHidden);  
                            });  
                        }  
                    });  
                });  
                  
                leftSettingsCreated = true;  
            }  
  
            // Розділювач  
            Lampa.SettingsApi.addParam({  
                component: 'menu_filter',  
                param: {  
                    type: 'space'  
                },  
                field: {},  
                onRender: function(item) {  
                    item.addClass('section-divider');  
                }  
            });  
  
            // Верхнє меню  
            if (!headSettingsCreated) {  
                Lampa.SettingsApi.addParam({  
                    component: 'menu_filter',  
                    param: {  
                        type: 'title'  
                    },  
                    field: {  
                        name: Lampa.Lang.translate('head_title'),  
                    },  
                    onRender: function(item) {  
                        item.addClass('section-title');  
                    }  
                });  
  
                var headHiddenItems = Lampa.Storage.get('head_hide', []);  
                var headAddedItems = {};  
                  
                $('.head__action').each(function() {  
                    var $item = $(this);  
                    if ($item.hasClass('processing')) return;  
                      
                    var classes = $item.attr('class').split(' ');  
                    var idParts = [];  
                    for (var i = 0; i < classes.length; i++) {  
                        if (classes[i].indexOf('open--') === 0 || classes[i] === 'full-screen') {  
                            idParts.push(classes[i]);  
                        }  
                    }  
                    var id = idParts.join('_');  
                      
                    if (!id || headAddedItems[id]) return;  
                    headAddedItems[id] = true;  
                      
                    var icon = $item.find('svg').length ? $item.html() : '•';  
                      
                    var titleKey = 'no_name';  
                    if (id.includes('open--search')) titleKey = 'head_action_search';  
                    else if (id.includes('open--settings')) titleKey = 'head_action_settings';  
                    else if (id.includes('open--feed')) titleKey = 'head_action_feed';  
                    else if (id.includes('open--notice')) titleKey = 'head_action_notice';  
                    else if (id.includes('open--profile')) titleKey = 'head_action_profile';  
                    else if (id.includes('full-screen')) titleKey = 'head_action_fullscreen';  
                      
                    var title = Lampa.Lang.translate(titleKey);  
                      
                    Lampa.SettingsApi.addParam({  
                        component: 'menu_filter',  
                        param: {  
                            type: 'button'  
                        },  
                        field: {  
                            name: icon,  
                            description: title  
                        },  
                        onRender: function(item) {  
                            item.addClass('menu-hide-item');  
                            item.find('.settings-param__descr').remove();  
                              
                            if (id.includes('open--settings')) {  
                                item.find('.settings-param').addClass('disable-hide');  
                            }  
                              
                            var $name = item.find('.settings-param__name');  
                            var isHidden = headHiddenItems.indexOf(id) !== -1;  
                            var status = isHidden ? Lampa.Lang.translate('hidden') : Lampa.Lang.translate('shown');  
                              
                            var $value = $('<div class="settings-param__value"/>')  
                                .text(status)  
                                .addClass(isHidden ? 'menu-hide-hidden' : 'menu-hide-shown');  
                              
                            var $text = $('<span class="menu-hide-text">' + title + '</span>');  
                            $name.find('svg, img').after($text);  
                            $name.append($value);  
                              
                            item.off('hover:enter').on('hover:enter', function() {  
                                if (id.includes('open--settings')) return;  
                                  
                                var hiddenItems = Lampa.Storage.get('head_hide', []);  
                                var index = hiddenItems.indexOf(id);  
                                  
                                if (index !== -1) {  
                                    hiddenItems.splice(index, 1);  
                                } else {  
                                    hiddenItems.push(id);  
                                }  
                                  
                                Lampa.Storage.set('head_hide', hiddenItems);  
                                updateHeadVisibility();  
                                  
                                var newStatus = hiddenItems.indexOf(id) !== -1 ?   
                                    Lampa.Lang.translate('hidden') :   
                                    Lampa.Lang.translate('shown');  
                                  
                                var isNowHidden = hiddenItems.indexOf(id) !== -1;  
                                $value.text(newStatus)  
                                    .toggleClass('menu-hide-hidden', isNowHidden)  
                                    .toggleClass('menu-hide-shown', !isNowHidden);  
                            });  
                        }  
                    });  
                });  
                  
                headSettingsCreated = true;  
            }  
  
            // Розділювач  
            Lampa.SettingsApi.addParam({  
                component: 'menu_filter',  
                param: {  
                    type: 'space'  
                },  
                field: {},  
                onRender: function(item) {  
                    item.addClass('section-divider');  
                }  
            });  
  
            // Праве меню  
            if (!settingsSettingsCreated) {  
                Lampa.SettingsApi.addParam({  
                    component: 'menu_filter',  
                    param: {  
                        type: 'title'  
                    },  
                    field: {  
                        name: Lampa.Lang.translate('settings_title'),  
                    },  
                    onRender: function(item) {  
                        item.addClass('section-title');  
                    }  
                });  
  
                var settingsHiddenItems = Lampa.Storage.get('settings_hide', []);  
                var settingsAddedItems = {};  
                  
                function processSettingsMenu() {  
                    var folders = $('.settings-folder');  
                    if (folders.length === 0) {  
                        setTimeout(processSettingsMenu, 300);  
                        return;  
                    }  
                      
                    folders.each(function() {  
                        var $item = $(this);  
                        var component = $item.data('component');  
                        if (!component || settingsAddedItems[component]) return;  
                        settingsAddedItems[component] = true;  
                          
                        var nameElement = $item.find('.settings-folder__name');  
                        var name = nameElement.length ? nameElement.text().trim() : Lampa.Lang.translate('no_name');  
                        var iconElement = $item.find('.settings-folder__icon');  
                        var icon = iconElement.length ? iconElement.html() : '•';  
                          
                        Lampa.SettingsApi.addParam({  
                            component: 'menu_filter',  
                            param: {  
                                type: 'button'  
                            },  
                            field: {  
                                name: icon,  
                                description: name  
                            },  
                            onRender: function(item) {  
                                item.addClass('menu-hide-item');  
                                item.find('.settings-param__descr').remove();  
                                  
                                if (component === 'menu_filter') {  
                                    item.find('.settings-param').addClass('disable-hide');  
                  
  }  
                                  
                                var $name = item.find('.settings-param__name');  
                                $name.css({  
                                    'display': 'flex',  
                                    'align-items': 'center',  
                                    'width': '100%'  
                                });  
                                  
                                var isHidden = settingsHiddenItems.indexOf(component) !== -1;  
                                var status = isHidden ? Lampa.Lang.translate('hidden') : Lampa.Lang.translate('shown');  
                                  
                                var $value = $('<div class="settings-param__value"/>')  
                                    .text(status)  
                                    .addClass(isHidden ? 'menu-hide-hidden' : 'menu-hide-shown');  
                                  
                                var $text = $('<span class="menu-hide-text">' + name + '</span>');  
                                $name.find('svg, img').after($text);  
                                $name.append($value);  
                                  
                                item.off('hover:enter').on('hover:enter', function() {  
                                    if (component === 'menu_filter') return;  
                                      
                                    var hiddenItems = Lampa.Storage.get('settings_hide', []);  
                                    var index = hiddenItems.indexOf(component);  
                                      
                                    if (index !== -1) {  
                                        hiddenItems.splice(index, 1);  
                                    } else {  
                                        hiddenItems.push(component);  
                                    }  
                                      
                                    Lampa.Storage.set('settings_hide', hiddenItems);  
                                    updateSettingsVisibility();  
                                      
                                    var newStatus = hiddenItems.indexOf(component) !== -1 ?   
                                        Lampa.Lang.translate('hidden') :   
                                        Lampa.Lang.translate('shown');  
                                      
                                    var isNowHidden = hiddenItems.indexOf(component) !== -1;  
                                    $value.text(newStatus)  
                                        .toggleClass('menu-hide-hidden', isNowHidden)  
                                        .toggleClass('menu-hide-shown', !isNowHidden);  
                                });  
                            }  
                        });  
                    });  
                }  
                  
                processSettingsMenu();  
                settingsSettingsCreated = true;  
            }  
        }  
  
        // Обробник змін меню  
        function handleMenuChanges() {  
            updateAllVisibility();  
              
            Lampa.Storage.listener.follow('change', function(e) {  
                if (e.name === 'menu_sort' || e.name === 'menu_hide' ||   
                    e.name === 'head_hide' || e.name === 'settings_hide') {  
                    updateAllVisibility();  
                }  
            });  
              
            var observer = new MutationObserver(function(mutations) {  
                observeLeftMenu();  
            });  
              
            observer.observe(document.body, {  
                childList: true,  
                subtree: true  
            });  
        }  
  
        // Ініціалізація плагіна  
        function initPlugin() {  
            var waitForMenu = setInterval(function() {  
                if ($('.menu__list, .head__actions, .settings__body').length) {  
                    clearInterval(waitForMenu);  
                    createMenuSettings();  
                    handleMenuChanges();  
                    updateAllVisibility();  
                }  
            }, 500);  
        }  
  
        if (window.appready) {  
            initPlugin();  
        } else {  
            Lampa.Listener.follow('app', function(e) {  
                if (e.type === 'ready') {  
                    initPlugin();  
                }  
            });  
        }  
    }  
  
    if (window.appready) {  
        startPlugin();  
    } else {  
        Lampa.Listener.follow('app', function(e) {  
            if (e.type === 'ready') {  
                startPlugin();  
            }  
        });  
    }  
})();
  