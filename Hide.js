(function() {  
    'use strict';  
  
    function startPlugin() {  
        let manifest = {  
            type: 'other',  
            version: '1.0.0',  
            name: 'Розширений редактор меню',  
            description: 'Редагування всіх пунктів меню з можливістю сортування та приховування',  
        }  
          
        Lampa.Manifest.plugins = manifest  
  
        let menu  
        let timer  
  
        function init(html) {  
            // Об'єднуємо всі пункти меню з обох секцій  
            menu = $('<ul class="menu__list"></ul>')  
              
            html.find('.menu__list').each(function() {  
                $(this).find('.menu__item').each(function() {  
                    menu.append($(this).clone(true))  
                })  
            })  
  
            observe()  
        }  
  
        function start() {  
            let list = $('<div class="menu-edit-list"></div>')  
  
            menu.find('.menu__item').each(function() {  
                let item_orig = $(this)  
                let item_clone = $(this).clone()  
                let item_sort = $(`<div class="menu-edit-list__item">  
                    <div class="menu-edit-list__icon"></div>  
                    <div class="menu-edit-list__title">${item_clone.find('.menu__text').text()}</div>  
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
                </div>`)  
  
                item_sort.find('.menu-edit-list__icon').append(item_clone.find('.menu__ico').html())  
  
                item_sort.find('.move-up').on('hover:enter', () => {  
                    let prev = item_sort.prev()  
  
                    if (prev.length) {  
                        item_sort.insertBefore(prev)  
                        item_orig.insertBefore(item_orig.prev())  
                    }  
                })  
  
                item_sort.find('.move-down').on('hover:enter', () => {  
                    let next = item_sort.next()  
  
                    if (next.length) {  
                        item_sort.insertAfter(next)  
                        item_orig.insertAfter(item_orig.next())  
                    }  
                })  
  
                item_sort.find('.toggle').on('hover:enter', () => {  
                    item_orig.toggleClass('hidden')  
                    item_sort.find('.dot').attr('opacity', item_orig.hasClass('hidden') ? 0 : 1)  
                }).find('.dot').attr('opacity', item_orig.hasClass('hidden') ? 0 : 1)  
  
                list.append(item_sort)  
            })  
  
            Lampa.Modal.open({  
                title: 'Редагування меню',  
                html: list,  
                size: 'small',  
                scroll_to_center: true,  
                onBack: () => {  
                    Lampa.Modal.close()  
                    save()  
                    Lampa.Controller.toggle('menu')  
                }  
            })  
        }  
  
        function order() {  
            let items = Lampa.Storage.get('menu_sort_extended', '[]')  
              
            if (items.length) {  
                $('.menu__list').each(function() {  
                    let list = $(this)  
                    items.forEach((item) => {  
                        let el = $('.menu__item', list).filter(function() {  
                            return $(this).find('.menu__text').text().trim() === item  
                        })  
                        if (el.length) el.appendTo(list)  
                    })  
                })  
            }  
        }  
  
        function hide() {  
            let items = Lampa.Storage.get('menu_hide_extended', '[]')  
              
            $('.menu__item').removeClass('hidden')  
  
            if (items.length) {  
                items.forEach((item) => {  
                    $('.menu__item').filter(function() {  
                        return $(this).find('.menu__text').text().trim() === item  
                    }).addClass('hidden')  
                })  
            }  
        }  
  
        function save() {  
            let sort = []  
            let hide_items = []  
  
            menu.find('.menu__item').each(function() {  
                let name = $(this).find('.menu__text').text().trim()  
                  
                sort.push(name)  
  
                if ($(this).hasClass('hidden')) {  
                    hide_items.push(name)  
                }  
            })  
  
            Lampa.Storage.set('menu_sort_extended', sort)  
            Lampa.Storage.set('menu_hide_extended', hide_items)  
              
            update()  
        }  
  
        function update() {  
            order()  
            hide()  
        }  
  
        function observe() {  
            clearTimeout(timer)  
              
            timer = setTimeout(() => {  
                let memory = Lampa.Storage.get('menu_sort_extended', '[]')  
                let anon = []  
  
                menu.find('.menu__item').each(function() {  
                    anon.push($(this).find('.menu__text').text().trim())  
                })  
  
                anon.forEach((item) => {  
                    if (memory.indexOf(item) == -1) memory.push(item)  
                })  
  
                Lampa.Storage.set('menu_sort_extended', memory)  
  
                update()  
            }, 500)  
        }  
  
        // Додаємо пункт в налаштування  
        function addSettingsItem() {  
            Lampa.SettingsApi.addComponent({  
                component: 'menu_editor',  
                name: 'Редагування меню',  
                icon: `<svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">  
                    <path d="M18.2989 5.27973L2.60834 20.9715C2.52933 21.0507 2.47302 21.1496 2.44528 21.258L0.706081 28.2386C0.680502 28.3422 0.682069 28.4507 0.710632 28.5535C0.739195 28.6563 0.793788 28.75 0.869138 28.8255C0.984875 28.9409 1.14158 29.0057 1.30498 29.0059C1.35539 29.0058 1.4056 28.9996 1.45449 28.9873L8.43509 27.2479C8.54364 27.2206 8.64271 27.1643 8.72172 27.0851L24.4137 11.3944L18.2989 5.27973ZM28.3009 3.14018L26.5543 1.39363C25.3869 0.226285 23.3524 0.227443 22.1863 1.39363L20.0469 3.53318L26.1614 9.64766L28.3009 7.50816C28.884 6.9253 29.2052 6.14945 29.2052 5.32432C29.2052 4.49919 28.884 3.72333 28.3009 3.14018Z" fill="currentColor"/>  
                </svg>`  
            })  
  
            Lampa.SettingsApi.addParam({  
                component: 'menu_editor',  
                param: {  
                    name: 'edit_menu_button',  
                    type: 'button',  
                    default: true  
                },  
                field: {  
                    name: 'Редагувати меню',  
                    description: 'Налаштуйте порядок та видимість пунктів меню'  
                },  
                onRender: (item) => {  
                    item.on('hover:enter', () => {  
                        start()  
                    })  
                }  
            })  
        }  
  
        // Ініціалізація після завантаження додатку  
        Lampa.Listener.follow('app', function(e) {  
            if (e.type == 'ready') {  
                // Ініціалізуємо редактор з усіма пунктами меню  
                let html = $('.menu')  
                init(html)  
                  
                // Додаємо пункт в налаштування  
                addSettingsItem()  
                  
                // Видаляємо старий пункт "Редагувати" з меню  
                $('.menu__item[data-action="edit"]').remove()  
                  
                // Застосовуємо збережені налаштування  
                update()  
            }  
        })  
  
        Lampa.Listener.follow('menu', function(e) {  
            if (e.type == 'end') {  
                // Оновлюємо меню після його ініціалізації  
                let html = $('.menu')  
                init(html)  
                update()  
            }  
        })  
    }  
  
    if (window.Lampa) {  
        startPlugin()  
    } else {  
        window.addEventListener('load', startPlugin)  
    }  
})();