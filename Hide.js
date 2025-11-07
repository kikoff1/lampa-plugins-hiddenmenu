(function() {
    'use strict';

    // === Додаємо стилі ===
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
    .section-title .settings-param__name { \
        font-size: 20px !important; \
        font-weight: 600 !important; \
        margin: 25px 0 15px 0 !important; \
        padding-bottom: 8px !important; \
        border-bottom: 2px solid rgba(255,255,255,0.1) !important; \
        color: #fff !important; \
    }\
    .menu-hide-move { \
        width: 30px !important; \
        height: 30px !important; \
        display: flex !important; \
        align-items: center !important; \
        justify-content: center !important; \
        margin-left: 8px !important; \
        cursor: pointer !important; \
    }\
    .menu-hide-move svg { \
        width: 20px !important; \
        height: 14px !important; \
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
</style>').appendTo('head');

    // === SVG іконки ===
    var eyeIcon = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    var resetIcon = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>';
    var moveUpIcon = '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';
    var moveDownIcon = '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';

    // === Основна функція плагіна ===
    function startPlugin() {
        var manifest = {
            type: 'other',
            version: '0.8.0',
            name: 'Приховання інтерфейсу',
            description: 'Плагін для приховання та сортування пунктів меню',
            component: 'menu_filter',
        };
        Lampa.Manifest.plugins.push(manifest);

        // === Основні функції ===
        function updateMenuVisibility() {
            var hiddenItems = Lampa.Storage.get('menu_hide', []);
            $('.menu__item').each(function() {
                var text = $(this).find('.menu__text').text().trim();
                if (hiddenItems.indexOf(text) !== -1) $(this).addClass('hidden');
                else $(this).removeClass('hidden');
            });
            updateMenuOrder();
        }

        function updateAllVisibility() {
            updateMenuVisibility();
        }

        // === Функції для сортування ===
        function saveMenuOrder() {
            var sort = [];
            $('.menu__item').each(function() {
                var name = $(this).find('.menu__text').text().trim();
                if (name) sort.push(name);
            });
            Lampa.Storage.set('menu_sort', sort);
        }

        function applyMenuOrder() {
            var items = Lampa.Storage.get('menu_sort', []);
            if (!items.length) return;
            var $menu = $('.menu__list').first();
            items.forEach(function(name) {
                var $el = $menu.find('.menu__item').filter(function() {
                    return $(this).find('.menu__text').text().trim() === name;
                });
                if ($el.length) $el.appendTo($menu);
            });
        }

        function updateMenuOrder() {
            applyMenuOrder();
        }

        // === Створення налаштувань ===
        function createMenuSettings() {
            var menuHiddenItems = Lampa.Storage.get('menu_hide', []);
            $('.menu__item').each(function() {
                var $item = $(this);
                var text = $item.find('.menu__text').text().trim();
                var icon = $item.find('.menu__ico').html() || '•';

                Lampa.SettingsApi.addParam({
                    component: 'menu_filter',
                    param: { type: 'button' },
                    field: { name: icon, description: text },
                    onRender: function(item) {
                        item.addClass('menu-hide-item');
                        item.find('.settings-param__descr').remove();

                        var $name = item.find('.settings-param__name');
                        $name.css({
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'
                        });

                        var isHidden = menuHiddenItems.indexOf(text) !== -1;
                        var status = isHidden ? 'Приховано' : 'Відображається';
                        var $value = $('<div class="settings-param__value"/>')
                            .text(status)
                            .addClass(isHidden ? 'menu-hide-hidden' : 'menu-hide-shown')
                            .css({'font-size': '15px', 'padding-right': '10px'});

                        var $text = $('<span/>').text(text).addClass('menu-hide-text')
                            .css({'margin-left': '10px', 'flex-grow': '1'});
                        $name.find('svg, img').after($text);

                        // === Кнопки вгору / вниз ===
                        var $moveUp = $('<div class="menu-hide-move move-up selector">' + moveUpIcon + '</div>');
                        var $moveDown = $('<div class="menu-hide-move move-down selector">' + moveDownIcon + '</div>');
                        $name.append($moveUp).append($moveDown).append($value);

                        // === Обробники пересування ===
                        $moveUp.on('hover:enter', function(e) {
                            e.stopPropagation();
                            var $currentItem = item;
                            var $prevItem = $currentItem.prev('.menu-hide-item');
                            if ($prevItem.length) {
                                $currentItem.insertBefore($prevItem);
                                var $menuItem = $('.menu__item:contains("' + text + '")');
                                var $prevMenuItem = $menuItem.prev('.menu__item');
                                if ($prevMenuItem.length) $menuItem.insertBefore($prevMenuItem);
                                saveMenuOrder();
                            }
                        });

                        $moveDown.on('hover:enter', function(e) {
                            e.stopPropagation();
                            var $currentItem = item;
                            var $nextItem = $currentItem.next('.menu-hide-item');
                            if ($nextItem.length) {
                                $currentItem.insertAfter($nextItem);
                                var $menuItem = $('.menu__item:contains("' + text + '")');
                                var $nextMenuItem = $menuItem.next('.menu__item');
                                if ($nextMenuItem.length) $menuItem.insertAfter($nextMenuItem);
                                saveMenuOrder();
                            }
                        });

                        // === Тогл сховування ===
                        function toggleItem() {
                            var hiddenItems = Lampa.Storage.get('menu_hide', []);
                            var index = hiddenItems.indexOf(text);
                            if (index !== -1) hiddenItems.splice(index, 1);
                            else hiddenItems.push(text);
                            Lampa.Storage.set('menu_hide', hiddenItems);
                            updateMenuVisibility();
                            var isNowHidden = hiddenItems.indexOf(text) !== -1;
                            $value.text(isNowHidden ? 'Приховано' : 'Відображається')
                                  .toggleClass('menu-hide-hidden', isNowHidden)
                                  .toggleClass('menu-hide-shown', !isNowHidden);
                        }

                        item.off('hover:enter').on('hover:enter', function(e) {
                            if ($(e.target).closest('.menu-hide-move').length) return;
                            toggleItem();
                        });
                    }
                });
            });
        }

        // === Головна ініціалізація ===
        function initPlugin() {
            var waitForMenu = setInterval(function() {
                if ($('.menu__list').length) {
                    clearInterval(waitForMenu);
                    applyMenuOrder();
                    updateMenuVisibility();
                    createMenuSettings();
                }
            }, 500);
        }

        if (window.appready) initPlugin();
        else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') initPlugin();
            });
        }
    }

    // === Запуск плагіна ===
    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') startPlugin();
        });
    }

})();
