(function() {
    'use strict';

    function startPlugin() {
        window.plugin_menu_editor_ready = true;

        // Додаємо переклади
        Lampa.Lang.add({
            menu_editor_title: {
                ru: 'Редактирование меню',
                uk: 'Редагування меню',
                en: 'Menu Editor'
            },
            menu_editor_left: {
                ru: 'Левое меню',
                uk: 'Ліве меню',
                en: 'Left Menu'
            },
            menu_editor_top: {
                ru: 'Верхнее меню',
                uk: 'Верхнє меню',
                en: 'Top Menu'
            },
            menu_editor_settings: {
                ru: 'Меню настроек',
                uk: 'Меню налаштувань',
                en: 'Settings Menu'
            },
            menu_editor_hide_nav: {
                ru: 'Скрыть панель навигации',
                uk: 'Приховати панель навігації',
                en: 'Hide Navigation Bar'
            }
        });

        const lang = Lampa.Storage.get('language', 'uk'); // отримуємо поточну мову

        // Створюємо об'єкт перекладів для кожного меню
        const headMenuNames = {
            'open--search': Lampa.Lang.translate('title_search') || 'Пошук',
            'open--brodcast': Lampa.Lang.translate('title_broadcast') || 'Трансляції',
            'notice--icon': Lampa.Lang.translate('title_notice') || 'Сповіщення',
            'open--settings': Lampa.Lang.translate('menu_settings') || 'Налаштування',
            'open--profile': Lampa.Lang.translate('title_profile') || 'Профіль',
            'full--screen': Lampa.Lang.translate('player_full_screen') || 'Повний екран'
        };

        // Функція для редагування верхнього меню
        function editTopMenu() {
            console.log('editTopMenu triggered');
            let list = $('<div class="menu-edit-list"></div>');
            let head = $('.head');

            // Перевіряємо наявність елементів у меню
            if (head.find('.head__action').length === 0) {
                console.log('Немає елементів для редагування в меню.');
                return; // Якщо елементи меню не знайдені, не продовжуємо
            }

            head.find('.head__action').each(function() {
                let item_orig = $(this);
                let item_clone = $(this).clone();

                // Отримуємо класи та визначаємо назву
                let classes = item_clone.attr('class').replace('head__action', '').trim();
                let displayName = headMenuNames[classes] || classes; // використовуємо переклад або сам клас

                let item_sort = $(`
                    <div class="menu-edit-list__item">
                        <div class="menu-edit-list__icon"></div>
                        <div class="menu-edit-list__title">${displayName}</div>
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

                // Копіюємо SVG іконку
                let svg = item_clone.find('svg').first();
                if (svg.length) {
                    item_sort.find('.menu-edit-list__icon').append(svg.clone());
                }

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
                title: Lampa.Lang.translate('menu_editor_top'),
                html: list,
                size: 'small',
                scroll_to_center: true,
                onBack: () => {
                    saveTopMenu();
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('settings_component');
                }
            });
        }

        // Функція для збереження верхнього меню
        function saveTopMenu() {
            let sort = [];
            let hide = [];

            $('.head__action').each(function() {
                let name = $(this).attr('class').replace('head__action', '').trim();
                sort.push(name);
                if ($(this).hasClass('hide')) {
                    hide.push(name);
                }
            });

            Lampa.Storage.set('head_menu_sort', sort);
            Lampa.Storage.set('head_menu_hide', hide);
        }

        // Додаємо компонент до налаштувань
        function addSettings() {
            Lampa.SettingsApi.addComponent({
                component: 'menu_editor',
                icon: `<svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.2989 5.27973L2.60834 20.9715C2.52933 21.0507 2.47302 21.1496 2.44528 21.258L0.706081 28.2386C0.680502 28.3422 0.682069 28.4507 0.710632 28.5535C0.739195 28.6563 0.793788 28.75 0.869138 28.8255C0.984875 28.9409 1.14158 29.0057 1.30498 29.0059C1.35539 29.0058 1.4056 28.9996 1.45449 28.9873L8.43509 27.2479C8.54364 27.2206 8.64271 27.1643 8.72172 27.0851L24.4137 11.3944L18.2989 5.27973ZM28.3009 3.14018L26.5543 1.39363C25.3869 0.226285 23.7032 0.258007 22.7483 1.42983L21.0318 3.07463L3.0725 20.033C2.92458 20.1744 2.86745 20.3509 2.91374 20.5256L3.22879 22.3321C3.28217 22.4977 3.374 22.6448 3.48742 22.7406C3.60083 22.8364 3.73502 22.8762 3.86863 22.8589C3.99994 22.8435 4.12248 22.7631 4.19634 22.6372L20.8193 6.68788C20.9882 6.55912 21.1985 6.50029 21.4131 6.50029C21.6278 6.50029 21.8385 6.55912 22.0073 6.68788L28.3009 3.14018Z" fill="currentColor"/>
                </svg>`,
                name: Lampa.Lang.translate('menu_editor_title')
            });

            Lampa.SettingsApi.addParam({
                component: 'menu_editor',
                param: {
                    name: 'edit_left_menu',
                    type: 'button',
                },
                field: {
                    name: Lampa.Lang.translate('menu_editor_left'),
                },
                onChange: editTopMenu
            });
        }

        if (window.appready) addSettings();
        else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type == 'ready') addSettings();
            });
        }
    }

    if (!window.plugin_menu_editor_ready) startPlugin();
})();
