(function () {
    'use strict';

    const plugin = {
        id: 'menu_editor',
        name: 'Редактор меню',
        description: 'Редагування лівого, верхнього та налаштувального меню Lampa',
        version: '2.3.1',
        author: 'community + fix by ChatGPT',
        lang: {
            en: {
                menu_editor_title: 'Menu Editor',
                menu_editor_left: 'Edit left menu',
                menu_editor_top: 'Edit top menu',
                menu_editor_settings: 'Edit settings menu',
                menu_editor_hide_nav: 'Hide navigation bar'
            },
            uk: {
                menu_editor_title: 'Редактор меню',
                menu_editor_left: 'Редагувати ліве меню',
                menu_editor_top: 'Редагувати верхнє меню',
                menu_editor_settings: 'Редагувати меню налаштувань',
                menu_editor_hide_nav: 'Приховати панель навігації'
            },
            ru: {
                menu_editor_title: 'Редактор меню',
                menu_editor_left: 'Редактировать левое меню',
                menu_editor_top: 'Редактировать верхнее меню',
                menu_editor_settings: 'Редактировать меню настроек',
                menu_editor_hide_nav: 'Скрыть панель навигации'
            },
            zh: {
                menu_editor_title: '菜单编辑器',
                menu_editor_left: '编辑左侧菜单',
                menu_editor_top: '编辑顶部菜单',
                menu_editor_settings: '编辑设置菜单',
                menu_editor_hide_nav: '隐藏导航栏'
            }
        }
    };

    // --- ЗБЕРЕЖЕННЯ І ЗАВАНТАЖЕННЯ ---

    function saveMenu(type, data) {
        Lampa.Storage.set(type + '_menu_sort', data.sort);
        Lampa.Storage.set(type + '_menu_hide', data.hide);
    }

    function loadMenu(type) {
        return {
            sort: Lampa.Storage.get(type + '_menu_sort', []),
            hide: Lampa.Storage.get(type + '_menu_hide', [])
        };
    }

    function saveSettingsMenu() {
        let folders = [];
        $('.settings-folder').each(function () {
            let name = $(this).find('.settings-folder__name').text();
            let hide = $(this).hasClass('hide');
            folders.push({ name, hide });
        });
        Lampa.Storage.set('settings_menu_state', folders);
    }

    function applySettingsMenu() {
        let saved = Lampa.Storage.get('settings_menu_state', []);
        if (saved.length) {
            $('.settings-folder').each(function () {
                let name = $(this).find('.settings-folder__name').text();
                let found = saved.find(f => f.name === name);
                if (found && found.hide) $(this).addClass('hide');
            });
        }
    }

    // --- ПОБУДОВА РЕДАКТОРА МЕНЮ ---

    function buildMenuEditor(type, elements, title) {
        let list = $('<div class="menu-edit-list"></div>');

        elements.each(function () {
            let item = $(this);
            let item_clone = item.clone();
            let name = item_clone.text().trim();

            let item_sort = $(`
                <div class="menu-edit-list__item">
                    <div class="menu-edit-list__icon"></div>
                    <div class="menu-edit-list__title">${name}</div>
                    <div class="menu-edit-list__move move-up selector">
                        <svg width="22" height="14" viewBox="0 0 22 14">
                            <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="menu-edit-list__move move-down selector">
                        <svg width="22" height="14" viewBox="0 0 22 14">
                            <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="menu-edit-list__toggle toggle selector">
                        <svg width="26" height="26" viewBox="0 0 26 26">
                            <rect x="1.9" y="1.8" width="21.8" height="21.8" rx="3.5" stroke="currentColor" stroke-width="3"/>
                            <path d="M7.4 12.9L10.8 16.3L18.1 9" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>
                        </svg>
                    </div>
                </div>`);

            let icon = item_clone.find('svg, img').first();
            if (icon.length) item_sort.find('.menu-edit-list__icon').append(icon.clone());

            item_sort.find('.move-up').on('hover:enter', () => {
                let prev = item_sort.prev();
                if (prev.length) {
                    item_sort.insertBefore(prev);
                    item.insertBefore(item.prev());
                }
            });

            item_sort.find('.move-down').on('hover:enter', () => {
                let next = item_sort.next();
                if (next.length) {
                    item_sort.insertAfter(next);
                    item.insertAfter(item.next());
                }
            });

            item_sort.find('.toggle').on('hover:enter', () => {
                item.toggleClass('hide');
                item_sort.find('.dot').attr('opacity', item.hasClass('hide') ? 0 : 1);
            }).find('.dot').attr('opacity', item.hasClass('hide') ? 0 : 1);

            list.append(item_sort);
        });

        Lampa.Modal.open({
            title: Lampa.Lang.translate(title),
            html: list,
            size: 'small',
            onBack: () => {
                let data = { sort: [], hide: [] };
                list.find('.menu-edit-list__item').each(function () {
                    let name = $(this).find('.menu-edit-list__title').text().trim();
                    data.sort.push(name);
                    if ($(this).find('.dot').attr('opacity') === "0") data.hide.push(name);
                });
                saveMenu(type, data);
                Lampa.Modal.close();
                Lampa.Controller.toggle('menu');
            }
        });
    }

    // --- РЕДАГУВАННЯ КОНКРЕТНИХ МЕНЮ ---

    function editLeftMenu() {
        let menu = $('.menu__list > .menu__item');
        buildMenuEditor('menu', menu, 'menu_editor_left');
    }

    function editTopMenu() {
        let menu = $('.head__menu > *');
        buildMenuEditor('head', menu, 'menu_editor_top');
    }

    function editSettingsMenu() {
        Lampa.Settings.listener.follow('open', (e) => {
            if (e.name === 'main') {
                let tries = 0;
                let maxTries = 30;
                let interval = setInterval(() => {
                    let settingsFolders = $('.settings-folder');

                    if (settingsFolders.length > 0) {
                        clearInterval(interval);
                        buildSettingsMenuEditor(settingsFolders);
                    }

                    if (++tries >= maxTries) clearInterval(interval);
                }, 100);
            }
        });
    }

    function buildSettingsMenuEditor(settingsFolders) {
        let list = $('<div class="menu-edit-list"></div>');

        settingsFolders.each(function () {
            let item_orig = $(this);
            let item_clone = $(this).clone();

            let item_sort = $(`
                <div class="menu-edit-list__item">
                    <div class="menu-edit-list__icon"></div>
                    <div class="menu-edit-list__title">${item_clone.find('.settings-folder__name').text()}</div>
                    <div class="menu-edit-list__move move-up selector">
                        <svg width="22" height="14" viewBox="0 0 22 14">
                            <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="menu-edit-list__move move-down selector">
                        <svg width="22" height="14" viewBox="0 0 22 14">
                            <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="menu-edit-list__toggle toggle selector">
                        <svg width="26" height="26" viewBox="0 0 26 26">
                            <rect x="1.9" y="1.8" width="21.8" height="21.8" rx="3.5" stroke="currentColor" stroke-width="3"/>
                            <path d="M7.4 12.9L10.8 16.3L18.1 9" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>
                        </svg>
                    </div>
                </div>`);

            let icon = item_clone.find('.settings-folder__icon svg, .settings-folder__icon img');
            if (icon.length) item_sort.find('.menu-edit-list__icon').append(icon.clone());

            item_sort.find('.move-up').on('hover:enter', () => {
                let prev = item_sort.prev();
                if (prev.length) {
                    item_sort.insertBefore(prev);
                    item_orig.insertBefore(item_orig.prev());
                }
            });

            item_sort.find('.move-down').on('hover:enter', () => {
                let next = item_sort.next();
                if (next.length) {
                    item_sort.insertAfter(next);
                    item_orig.insertAfter(item_orig.next());
                }
            });

            item_sort.find('.toggle').on('hover:enter', () => {
                item_orig.toggleClass('hide');
                item_sort.find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0 : 1);
            }).find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0 : 1);

            list.append(item_sort);
        });

        Lampa.Modal.open({
            title: Lampa.Lang.translate('menu_editor_settings'),
            html: list,
            size: 'small',
            scroll_to_center: true,
            onBack: () => {
                saveSettingsMenu();
                Lampa.Modal.close();
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    // --- ПАНЕЛЬ НАВІГАЦІЇ ---

    function hideNavigationBar(enabled) {
        if (enabled) $('body').addClass('hide-navigation-bar');
        else $('body').removeClass('hide-navigation-bar');
        Lampa.Storage.set('hide_navigation_bar', enabled);
    }

    // --- ІНІЦІАЛІЗАЦІЯ ---

    function init() {
        // реєстрація у налаштуваннях
        Lampa.SettingsApi.addComponent({
            component: plugin.id,
            name: Lampa.Lang.translate('menu_editor_title'),
            type: 'button',
            onSelect: () => {
                let modal = $('<div class="menu-editor-modal"></div>');
                modal.append(`<div class="menu-editor-btn selector" data-type="left">${Lampa.Lang.translate('menu_editor_left')}</div>`);
                modal.append(`<div class="menu-editor-btn selector" data-type="top">${Lampa.Lang.translate('menu_editor_top')}</div>`);
                modal.append(`<div class="menu-editor-btn selector" data-type="settings">${Lampa.Lang.translate('menu_editor_settings')}</div>`);
                modal.append(`<div class="menu-editor-btn selector" data-type="hide_nav">${Lampa.Lang.translate('menu_editor_hide_nav')}</div>`);

                Lampa.Modal.open({
                    title: Lampa.Lang.translate('menu_editor_title'),
                    html: modal,
                    onBack: () => Lampa.Modal.close()
                });

                modal.find('[data-type="left"]').on('hover:enter', editLeftMenu);
                modal.find('[data-type="top"]').on('hover:enter', editTopMenu);
                modal.find('[data-type="settings"]').on('hover:enter', () => {
                    editSettingsMenu();
                    Lampa.Modal.close();
                    Lampa.Settings.open();
                });
                modal.find('[data-type="hide_nav"]').on('hover:enter', () => {
                    let enabled = !$('body').hasClass('hide-navigation-bar');
                    hideNavigationBar(enabled);
                });
            }
        });

        if (Lampa.Storage.get('hide_navigation_bar', false)) hideNavigationBar(true);

        console.log('%c[Menu Editor] Plugin loaded successfully', 'color: #00ff99');
    }

    Lampa.Listener.follow('app', (e) => {
        if (e.type === 'ready') init();
    });

    Lampa.Lang.add(plugin.lang);
    Lampa.Plugins.add(plugin);
})();
