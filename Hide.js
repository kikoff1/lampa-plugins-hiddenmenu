(function() {  
    'use strict';  
      
    // Додаємо стилі  
    $('<style>\  
        .hidden { display: none !important; }\  
        .menu-edit-section-title {\  
            font-size: 1.6em !important;\  
            font-weight: 600 !important;\  
            margin: 2em 0 1em 0 !important;\  
            padding-bottom: 0.5em !important;\  
            border-bottom: 2px solid rgba(255,255,255,0.1) !important;\  
            color: #fff !important;\  
        }\  
        .menu-edit-list__item {\  
            display: flex !important;\  
            align-items: center !important;\  
            padding: 1em !important;\  
            margin-bottom: 0.5em !important;\  
            background: rgba(255,255,255,0.05) !important;\  
            border-radius: 0.5em !important;\  
        }\  
        .menu-edit-list__icon {\  
            width: 2em !important;\  
            height: 2em !important;\  
            margin-right: 1em !important;\  
            display: flex !important;\  
            align-items: center !important;\  
            justify-content: center !important;\  
        }\  
        .menu-edit-list__icon svg {\  
            width: 100% !important;\  
            height: 100% !important;\  
        }\  
        .menu-edit-list__title {\  
            flex-grow: 1 !important;\  
            font-size: 1.2em !important;\  
        }\  
        .menu-edit-list__move {\  
            width: 2.5em !important;\  
            height: 2.5em !important;\  
            margin-left: 0.5em !important;\  
            display: flex !important;\  
            align-items: center !important;\  
            justify-content: center !important;\  
            background: rgba(255,255,255,0.1) !important;\  
            border-radius: 0.3em !important;\  
            cursor: pointer !important;\  
        }\  
        .menu-edit-list__move:hover {\  
            background: rgba(255,255,255,0.2) !important;\  
        }\  
        .menu-edit-list__toggle {\  
            width: 2.5em !important;\  
            height: 2.5em !important;\  
            margin-left: 0.5em !important;\  
            display: flex !important;\  
            align-items: center !important;\  
            justify-content: center !important;\  
            cursor: pointer !important;\  
        }\  
        .menu-edit-list__toggle .dot {\  
            transition: opacity 0.3s !important;\  
        }\  
    </style>').appendTo('head');  
  
    function startPlugin() {  
        // Додаємо переклади  
        Lampa.Lang.add({  
            left_menu_title: {  
                ru: 'Левое меню',  
                en: 'Left Menu',  
                uk: 'Ліве меню',  
                zh: '左侧菜单'  
            },  
            head_menu_title: {  
                ru: 'Верхнее меню',  
                en: 'Top Menu',  
                uk: 'Верхнє меню',  
                zh: '顶部菜单'  
            },  
            no_name: {  
                ru: 'Без названия',  
                en: 'Unnamed',  
                uk: 'Без назви',  
                zh: '未命名'  
            }  
        });  
  
        let menu = $('.menu__list:eq(0)');  
        let headMenu = $('.head__actions');  
        let timer;  
  
        // Функції для роботи з меню  
        function order() {  
            let items = Lampa.Storage.get('menu_sort', []);  
              
            if (items.length) {  
                items.forEach(function(item) {  
                    let el = $('.menu__item:contains("' + item + '")');  
                    if (el.length) el.appendTo(el.parent());  
                });  
            }  
              
            let headItems = Lampa.Storage.get('head_sort', []);  
              
            if (headItems.length) {  
                headItems.forEach(function(item) {  
                    let el = $('.head__action[title="' + item + '"]', headMenu);  
                    if (el.length) el.appendTo(headMenu);  
                });  
            }  
        }  
  
        function hide() {  
            let items = Lampa.Storage.get('menu_hide', []);  
              
            $('.menu__item').removeClass('hidden');  
              
            if (items.length) {  
                items.forEach(function(item) {  
                    let el = $('.menu__item:contains("' + item + '")');  
                    if (el.length) el.addClass('hidden');  
                });  
            }  
              
            let headItems = Lampa.Storage.get('head_hide', []);  
              
            $('.head__action', headMenu).removeClass('hidden');  
              
            if (headItems.length) {  
                headItems.forEach(function(item) {  
                    let el = $('.head__action[title="' + item + '"]', headMenu);  
                    if (el.length) el.addClass('hidden');  
                });  
            }  
        }  
  
        function save() {  
            let sort = [];  
            let hideItems = [];  
              
            $('.menu__item').each(function() {  
                let name = $(this).find('.menu__text').text().trim();  
                sort.push(name);  
                  
                if ($(this).hasClass('hidden')) {  
                    hideItems.push(name);  
                }  
            });  
              
            Lampa.Storage.set('menu_sort', sort);  
            Lampa.Storage.set('menu_hide', hideItems);  
              
            let headSort = [];  
            let headHide = [];  
              
            $('.head__action', headMenu).each(function() {  
                let name = $(this).attr('title') || '';  
                  
                if (name) {  
                    headSort.push(name);  
                      
                    if ($(this).hasClass('hidden')) {  
                        headHide.push(name);  
                    }  
                }  
            });  
              
            Lampa.Storage.set('head_sort', headSort);  
            Lampa.Storage.set('head_hide', headHide);  
        }  
  
        function update() {  
            order();  
            hide();  
        }  
  
        function observe() {  
            clearTimeout(timer);  
              
            timer = setTimeout(function() {  
                let memory = Lampa.Storage.get('menu_sort', []);  
                let anon = [];  
                  
                $('.menu__item').each(function() {  
                    anon.push($(this).find('.menu__text').text().trim());  
                });  
                  
                anon.forEach(function(item) {  
                    if (memory.indexOf(item) === -1) memory.push(item);  
                });  
                  
                Lampa.Storage.set('menu_sort', memory);  
                  
                let headMemory = Lampa.Storage.get('head_sort', []);  
                let headAnon = [];  
                  
                $('.head__action', headMenu).each(function() {  
                    let title = $(this).attr('title');  
                    if (title) headAnon.push(title);  
                });  
                  
                headAnon.forEach(function(item) {  
                    if (headMemory.indexOf(item) === -1) headMemory.push(item);  
                });  
                  
                Lampa.Storage.set('head_sort', headMemory);  
                  
                update();  
            }, 500);  
        }  
  
        function createEditItem(item_clone, item_orig, isHead) {  
            isHead = isHead || false;  
              
            let title = isHead ?   
                (item_clone.attr('title') || Lampa.Lang.translate('no_name')) :   
                item_clone.find('.menu__text').text();  
              
            let icon = isHead ?   
                item_clone.find('svg, img').clone() :   
                item_clone.find('.menu__ico').html();  
              
            let item_sort = $('<div class="menu-edit-list__item selector">\  
                <div class="menu-edit-list__icon"></div>\  
                <div class="menu-edit-list__title">' + title + '</div>\  
                <div class="menu-edit-list__move move-up selector">\  
                    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">\  
                        <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>\  
                    </svg>\  
                </div>\  
                <div class="menu-edit-list__move move-down selector">\  
                    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">\  
                        <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>\  
                    </svg>\  
                </div>\  
                <div class="menu-edit-list__toggle toggle selector">\  
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">\  
                        <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>\  
                        <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>\  
                    </svg>\  
                </div>\  
            </div>');  
              
            if (icon) item_sort.find('.menu-edit-list__icon').append(icon);  
              
            item_sort.find('.move-up').on('hover:enter', function() {  
                let prev = item_sort.prev();  
                  
                if (prev.length && !prev.hasClass('menu-edit-section-title')) {  
                    item_sort.insertBefore(prev);  
                    item_orig.insertBefore(item_orig.prev());  
                }  
            });  
              
            item_sort.find('.move-down').on('hover:enter', function() {  
                let next = item_sort.next();  
                  
                if (next.length && !next.hasClass('menu-edit-section-title')) {  
                    item_sort.insertAfter(next);  
                    item_orig.insertAfter(item_orig.next());  
                }  
            });  
              
            item_sort.find('.toggle').on('hover:enter', function() {  
                item_orig.toggleClass('hidden');  
                item_sort.find('.dot').attr('opacity', item_orig.hasClass('hidden') ? 0 : 1);  
            }).find('.dot').attr('opacity', item_orig.hasClass('hidden') ? 0 : 1);  
              
            return item_sort;  
        }  
  
        function start() {  
            let list = $('<div class="menu-edit-list"></div>');  
              
            // Додаємо заголовок для лівого меню  
            list.append('<div class="menu-edit-section-title">' + Lampa.Lang.translate('left_menu_title') + '</div>');  
              
            // Обробляємо всі пункти лівого меню  
            $('.menu__item').each(function() {  
                let item_orig = $(this);  
                let item_clone = $(this).clone();  
                let item_sort = createEditItem(item_clone, item_orig);  
                  
                list.append(item_sort);  
            });  
              
            // Додаємо заголовок для верхнього меню  
            list.append('<div class="menu-edit-section-title">' + Lampa.Lang.translate('head_menu_title') + '</div>');  
              
            // Обробляємо пункти верхнього меню  
            $('.head__action', headMenu).each(function() {  
                if ($(this).hasClass('processing')) return;  
                  
                let item_orig = $(this);  
                let item_clone = $(this).clone();  
                let item_sort = createEditItem(item_clone, item_orig, true);  
                  
                list.append(item_sort);  
            });  
  
            Lampa.Modal.open({  
                title: Lampa.Lang.translate('extensions_edit'),  
                html: list,  
                size: 'small',  
                scroll_to_center: true,  
                onBack: function() {  
                    Lampa.Modal.close();  
                    save();  
                    Lampa.Controller.toggle('menu');  
                }  
            });  
        }  
  
        // Додаємо пункт в налаштування  
        Lampa.SettingsApi.addParam({  
            component: 'interface',  
            param: {  
                type: 'button'  
            },  
            field: {  
                name: Lampa.Lang.translate('extensions_edit'),  
                description: Lampa.Lang.translate('extensions_edit')  
            },  
            onChange: function() {  
                start();  
            }  
        });  
  
        // Видаляємо стандартний пункт "Редагувати" з меню  
        $('.menu__item[data-action="edit"]').remove();  
  
        // Ініціалізація  
        observe();  
        update();  
  
        // Спостереження за змінами DOM  
        if (typeof MutationObserver !== 'undefined') {  
            let observer = new MutationObserver(function() {  
                observe();  
            });  
              
            observer.observe(document.body, {  
                childList: true,  
                subtree: true  
            });  
        }  
    }  
  
    // Запуск плагіна  
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