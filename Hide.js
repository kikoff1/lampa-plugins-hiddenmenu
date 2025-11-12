(function () {
    'use strict';

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
                if (found) {
                    if (found.hide) $(this).addClass('hide');
                }
            });
        }
    }

    function editLeftMenu() {
        let menu = $('.menu__list > .menu__item');
        buildMenuEditor('menu', menu, 'menu_editor_left');
    }

    function editTopMenu() {
        let menu = $('.head__menu > *');
        buildMenuEditor('head', menu, 'menu_editor_top');
    }

    function buildMenuEditor(type, elements, title) {
        let list = $('<div class="menu-edit-list"></div>');
        let menuState = loadMenu(type);

        elements.each(function () {
            let item = $(this);
            let item_clone = item.clone();
            let name = item_clone.text().trim();

            let item_sort = $(`
                <div class="menu-edit-list__item">
                    <div class="menu-edit-list__icon"></div>
                    <div class="menu-edit-list__title">${name}</div>
                    <div class="menu-edit-list__move move-up selector">
                        <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="menu-edit-list__move move-down selector">
                        <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="menu-edit-list__toggle toggle selector">
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>
                            <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>
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
                        <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="menu-edit-list__move move-down selector">
                        <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="menu-edit-list__toggle toggle selector">
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>
                            <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>
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

    function hideNavigationBar(enabled) {
        if (enabled) $('body').addClass('hide-navigation-bar');
        else $('body').removeClass('hide-navigation-bar');
        Lampa.Storage.set('hide_navigation_bar', enabled);
    }

    function init() {
        Lampa.SettingsApi.addComponent({
            component: 'menu_editor',
            name: Lampa.Lang.translate('menu_editor_title') || 'Редактор меню',
            type: 'button',
            onSelect: () => {
                let modal = $('<div class="menu-editor-modal"></div>');
                modal.append('<div class="menu-editor-btn selector" data-type="left">Редагувати ліве меню</div>');
                modal.append('<div class="menu-editor-btn selector" data-type="top">Редагувати верхнє меню</div>');
                modal.append('<div class="menu-editor-btn selector" data-type="settings">Редагувати меню налаштувань</div>');
                modal.append('<div class="menu-editor-btn selector" data-type="hide_nav">Приховати панель навігації</div>');

                Lampa.Modal.open({
                    title: 'Редактор меню',
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
    }

    Lampa.Listener.follow('app', (e) => {
        if (e.type === 'ready') init();
    });
})();
