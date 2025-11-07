(function() {
    'use strict';
    
    // Добавляем стиль для скрытия элементов и оформления
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
    .menu-hide-hidden { color: #ff4e45 !important; }\
    .menu-hide-shown { color: #4CAF50 !important; }\
    .menu-move-btn { \
        font-size: 20px !important; \
        margin: 0 6px !important; \
        color: #999 !important; \
        cursor: pointer !important; \
        transition: color 0.2s ease !important; \
    }\
    .menu-move-btn:hover { color: #fff !important; }\
    .credits-text { \
        text-align: center; \
        color: #b0b0b0 !important; \
        font-size: 14px !important; \
        padding: 15px 20px 5px !important; \
        margin-top: 5px !important; \
        line-height: 1.5; \
    }\
</style>').appendTo('head');

    // Мультиязыковая поддержка
    Lampa.Lang.add({
        menu_items_hide: { ru:'Скрытие элементов интерфейса', en:'Hide interface', uk:'Приховання інтерфейсу' },
        plugin_description: { ru:'Плагин для сокрытия элементов интерфейса', en:'Plugin for hiding interface elements', uk:'Плагін для приховання елементів інтерфейсу' },
        left_menu_title: { ru:'Левое меню', en:'Left menu', uk:'Ліве меню' },
        hidden: { ru:'Скрыто', en:'Hidden', uk:'Приховано' },
        shown: { ru:'Отображено', en:'Shown', uk:'Відображається' },
        credits_text: { ru:'Создано при поддержке Lampac & BWA<br>Благодарность Oleksandr и Max NuttShell', en:'Created with Lampac & BWA community<br>Thanks to Oleksandr and Max NuttShell', uk:'Створено за підтримки Lampac & BWA<br>Подяка Oleksandr та Max NuttShell' },
        reset_all_hidden: { ru:'Показать все', en:'Show all', uk:'Показати все' }
    });

    const eyeIcon = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    const resetIcon = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>';

    function startPlugin() {
        const manifest = {
            type: 'other',
            version: '0.8.0',
            name: Lampa.Lang.translate('menu_items_hide'),
            description: Lampa.Lang.translate('plugin_description'),
            component: 'menu_filter'
        };
        Lampa.Manifest.plugins.push(manifest);

        // ===============================
        // Функции сортировки меню
        // ===============================
        function applyMenuOrder() {
            const sortOrder = Lampa.Storage.get('menu_sort', []);
            const menu = $('.menu__list');
            if (!sortOrder.length) return;

            const items = menu.children('.menu__item').get();
            items.sort((a, b) => {
                const textA = $(a).find('.menu__text').text().trim();
                const textB = $(b).find('.menu__text').text().trim();
                return sortOrder.indexOf(textA) - sortOrder.indexOf(textB);
            });
            $.each(items, (i, itm) => menu.append(itm));
        }

        function saveMenuOrder() {
            const order = [];
            $('.menu__item').each(function() {
                const t = $(this).find('.menu__text').text().trim();
                if (t) order.push(t);
            });
            Lampa.Storage.set('menu_sort', order);
        }

        function moveMenuItem(text, direction) {
            const menu = $('.menu__list');
            const items = menu.children('.menu__item');
            const current = items.filter(function() {
                return $(this).find('.menu__text').text().trim() === text;
            });

            if (!current.length) return;

            if (direction === 'up') current.prev().before(current);
            else current.next().after(current);

            saveMenuOrder();
        }

        // ===============================
        // Функции видимости меню
        // ===============================
        function updateMenuVisibility() {
            const hiddenItems = Lampa.Storage.get('menu_hide', []);
            $('.menu__item').each(function() {
                const $item = $(this);
                const text = $item.find('.menu__text').text().trim();
                if (hiddenItems.includes(text)) $item.addClass('hidden');
                else $item.removeClass('hidden');
            });
            applyMenuOrder();
        }

        function resetAllHiddenItems() {
            Lampa.Storage.set('menu_hide', []);
            updateMenuVisibility();
            $('.menu-hide-item .settings-param__value')
                .text(Lampa.Lang.translate('shown'))
                .removeClass('menu-hide-hidden')
                .addClass('menu-hide-shown');
        }

        // ===============================
        // Панель налаштувань
        // ===============================
        Lampa.SettingsApi.addComponent({
            component: 'menu_filter',
            name: Lampa.Lang.translate('menu_items_hide'),
            description: Lampa.Lang.translate('plugin_description'),
            icon: eyeIcon
        });

        let leftSettingsCreated = false;
        let resetButtonAdded = false;

        function createMenuSettings() {
            if (!resetButtonAdded) {
                Lampa.SettingsApi.addParam({
                    component: 'menu_filter',
                    param: { type: 'space' },
                    field: {},
                    onRender: item => {
                        item.append(`<div class="credits-text">${Lampa.Lang.translate('credits_text')}</div>`);
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: 'menu_filter',
                    param: { type: 'button' },
                    field: { name: resetIcon, description: Lampa.Lang.translate('reset_all_hidden') },
                    onChange: resetAllHiddenItems
                });

                resetButtonAdded = true;
            }

            if (leftSettingsCreated) return;
            // Заголовок секції
            Lampa.SettingsApi.addParam({
                component: 'menu_filter',
                param: { type: 'title', name: Lampa.Lang.translate('left_menu_title') },
                field: {}
            });

            // Проходимо по пунктам лівого меню
            $('.menu__item').each(function() {
                const $item = $(this);
                const text = $item.find('.menu__text').text().trim();
                if (!text) return;

                const hiddenItems = Lampa.Storage.get('menu_hide', []);
                const isHidden = hiddenItems.includes(text);

                Lampa.SettingsApi.addParam({
                    component: 'menu_filter',
                    param: { name: text },
                    field: { name: text },
                    onRender: el => {
                        const $value = $('<div class="settings-param__value"></div>')
                            .text(isHidden ? Lampa.Lang.translate('hidden') : Lampa.Lang.translate('shown'))
                            .addClass(isHidden ? 'menu-hide-hidden' : 'menu-hide-shown selector');

                        // кнопки переміщення ↑ ↓
                        const $moveUp = $('<div class="menu-move-btn selector" data-dir="up">↑</div>');
                        const $moveDown = $('<div class="menu-move-btn selector" data-dir="down">↓</div>');

                        $value.after($moveUp).after($moveDown);

                        // Обробники ↑ ↓
                        $moveUp.on('hover:enter', e => {
                            e.stopPropagation();
                            moveMenuItem(text, 'up');
                        });
                        $moveDown.on('hover:enter', e => {
                            e.stopPropagation();
                            moveMenuItem(text, 'down');
                        });

                        // Обробник приховування / показу
                        $value.on('hover:enter', () => {
                            let hidden = Lampa.Storage.get('menu_hide', []);
                            if (isHidden) {
                                hidden = hidden.filter(i => i !== text);
                                $item.removeClass('hidden');
                                $value
                                    .text(Lampa.Lang.translate('shown'))
                                    .removeClass('menu-hide-hidden')
                                    .addClass('menu-hide-shown');
                            } else {
                                hidden.push(text);
                                $item.addClass('hidden');
                                $value
                                    .text(Lampa.Lang.translate('hidden'))
                                    .removeClass('menu-hide-shown')
                                    .addClass('menu-hide-hidden');
                            }
                            Lampa.Storage.set('menu_hide', hidden);
                        });

                        el.append($value);
                    }
                });
            });

            leftSettingsCreated = true;
        }

        // ===============================
        // Відслідковування змін у меню
        // ===============================
        function observeMenuChanges() {
            const observer = new MutationObserver(() => {
                updateMenuVisibility();
                applyMenuOrder();
            });
            const menu = document.querySelector('.menu__list');
            if (menu) observer.observe(menu, { childList: true, subtree: false });
        }

        // ===============================
        // Ініціалізація плагіну
        // ===============================
        function initPlugin() {
            createMenuSettings();
            updateMenuVisibility();
            applyMenuOrder();
            observeMenuChanges();
        }

        // Запускаємо після готовності Lampa
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') initPlugin();
        });
    }

    if (window.Lampa) startPlugin();
    else {
        document.addEventListener('lampa-start', startPlugin);
    }
})();
