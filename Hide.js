(function() {  
    'use strict';  
  
    function startPlugin() {  
        let manifest = {  
            type: 'other',  
            version: '1.0.3',  
            name: 'Розширений редактор меню',  
            description: 'Редагування всіх пунктів меню з можливістю сортування та приховування',  
        }  
          
        Lampa.Manifest.plugins = manifest  
  
        let items_map = []  
        let head_items_map = []  
        let settings_items_map = []  
        let timer  
        let active_controller = 'menu'  
  
        function init() {  
            items_map = []  
              
            $('.menu .menu__list').each(function() {  
                $(this).find('.menu__item').each(function() {  
                    items_map.push($(this))  
                })  
            })  
  
            observe()  
        }  
  
        function initHead() {  
            head_items_map = []  
              
            $('.head .head__actions .selector').each(function() {  
                if(!$(this).hasClass('open--search') && !$(this).hasClass('open--premium')) {  
                    head_items_map.push($(this))  
                }  
            })  
        }  
  
        function initSettings() {  
            settings_items_map = []  
              
            $('.settings .settings-param.selector').each(function() {  
                settings_items_map.push($(this))  
            })  
        }  
  
        function start(type = 'menu') {  
            active_controller = Lampa.Controller.enabled().name  
              
            let list = $('<div class="menu-edit-list"></div>')  
            let current_items = type === 'head' ? head_items_map : type === 'settings' ? settings_items_map : items_map  
            let title = type === 'head' ? 'Редагування верхнього меню' : type === 'settings' ? 'Редагування меню налаштувань' : 'Редагування меню'  
  
            current_items.forEach(function(item_orig) {  
                let item_clone = item_orig.clone()  
                let item_title = ''  
                  
                if(type === 'head') {  
                    item_title = item_clone.attr('title') || item_clone.find('svg').parent().attr('title') || 'Пункт меню'  
                } else if(type === 'settings') {  
                    item_title = item_clone.find('.settings-param__name').text() || 'Налаштування'  
                } else {  
                    item_title = item_clone.find('.menu__text').text()  
                }  
  
                let item_sort = $(`<div class="menu-edit-list__item">  
                    <div class="menu-edit-list__icon"></div>  
                    <div class="menu-edit-list__title">${item_title}</div>  
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
  
                if(type === 'menu') {  
                    item_sort.find('.menu-edit-list__icon').append(item_clone.find('.menu__ico').html())  
                } else if(type === 'head') {  
                    item_sort.find('.menu-edit-list__icon').append(item_clone.find('svg').clone())  
                }  
  
                item_sort.find('.move-up').on('hover:enter', () => {  
                    let prev = item_sort.prev()  
                    if (prev.length) {  
                        item_sort.insertBefore(prev)  
                        let idx = current_items.indexOf(item_orig)  
                        if (idx > 0) {  
                            current_items.splice(idx, 1)  
                            current_items.splice(idx - 1, 0, item_orig)  
                        }  
                    }  
                })  
  
                item_sort.find('.move-down').on('hover:enter', () => {  
                    let next = item_sort.next()  
                    if (next.length) {  
                        item_sort.insertAfter(next)  
                        let idx = current_items.indexOf(item_orig)  
                        if (idx < current_items.length - 1) {  
                            current_items.splice(idx, 1)  
                            current_items.splice(idx + 1, 0, item_orig)  
                        }  
                    }  
                })  
  
                item_sort.find('.toggle').on('hover:enter', () => {  
                    item_orig.toggleClass('hidden')  
                    item_sort.find('.dot').attr('opacity', item_orig.hasClass('hidden') ? 0 : 1)  
                }).find('.dot').attr('opacity', item_orig.hasClass('hidden') ? 0 : 1)  
  
                list.append(item_sort)  
            })  
  
            Lampa.Modal.open({  
                title: title,  
                html: list,  
                size: 'small',  
                scroll_to_center: true,  
                onBack: () => {  
                    Lampa.Modal.close()  
                    save(type)  
                    Lampa.Controller.toggle(active_controller)  
                }  
            })  
        }  
  
        function order() {  
            let items = Lampa.Storage.get('menu_sort_extended', '[]')  
              
            if (items.length) {  
                $('.menu .menu__list').each(function() {  
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
              
            $('.menu .menu__item').removeClass('hidden')  
  
            if (items.length) {  
                items.forEach((item) => {  
                    $('.menu .menu__item').filter(function() {  
                        return $(this).find('.menu__text').text().trim() === item  
                    }).addClass('hidden')  
                })  
            }  
              
            $('.menu .menu__list').each(function() {  
                let visibleItems = $(this).find('.menu__item:not(.hidden)')  
                  
                if (visibleItems.length === 0) {  
                    $(this).find('.menu__item').first().removeClass('hidden')  
                }  
            })  
        }  
  
        function save(type = 'menu') {  
            let sort = []  
            let hide_items = []  
            let current_items = type === 'head' ? head_items_map : type === 'settings' ? settings_items_map : items_map  
            let storage_prefix = type === 'head' ? 'head' : type === 'settings' ? 'settings' : 'menu'  
  
            current_items.forEach(function(item) {  
                let name = ''  
                if(type === 'menu') {  
                    name = item.find('.menu__text').text().trim()  
                } else if(type === 'head') {  
                    name = item.attr('title') || item.find('svg').parent().attr('title') || 'item_' + current_items.indexOf(item)  
                } else if(type === 'settings') {  
                    name = item.find('.settings-param__name').text().trim()  
                }  
                  
                sort.push(name)  
                if (item.hasClass('hidden')) {  
                    hide_items.push(name)  
                }  
            })  
  
            Lampa.Storage.set(storage_prefix + '_sort_extended', sort)  
            Lampa.Storage.set(storage_prefix + '_hide_extended', hide_items)  
              
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
  
                items_map.forEach(function(item) {  
                    anon.push(item.find('.menu__text').text().trim())  
                })  
  
                anon.forEach((item) => {  
                    if (memory.indexOf(item) == -1) memory.push(item)  
                })  
  
                Lampa.Storage.set('menu_sort_extended', memory)  
  
                update()  
            }, 500)  
        }  
  
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
                    name: 'Редагувати ліве меню',  
                    description: 'Налаштуйте порядок та видимість пунктів лівого меню'  
                },  
                onRender: (item) => {  
                    item.on('hover:enter', () => {  
                        start('menu')  
                    })  
                }  
            })  
  
            Lampa.SettingsApi.addParam({  
                component: 'menu_editor',  
                param: {  
                    name: 'edit_head_button',  
                    type: 'button',  
                    default: true  
                },  
                field: {  
                    name: 'Редагувати верхнє меню',  
                    description: 'Налаштуйте порядок та видимість пунктів верхнього меню'  
                },  
                onRender: (item) => {  
                    item.on('hover:enter', () => {  
                        initHead()  
                        start('head')  
                    })  
                }  
            })  
  
            Lampa.SettingsApi.addParam({  
                component: 'menu_editor',  
                param: {  
                    name: 'edit_settings_button',  
                    type: 'button',  
                    default: true  
                },  
                field: {  
                    name: 'Редагувати меню налаштувань',  
                    description: 'Налаштуйте порядок та видимість пунктів меню налаштувань'  
                },  
                onRender: (item) => {  
                    item.on('hover:enter', () => {  
                        initSettings()  
                        start('settings')  
                    })  
                }  
            })  
        }  
  
        Lampa.Listener.follow('app', function(e) {  
            if (e.type == 'ready') {  
                init()  
                addSettingsItem()  
                $('.menu__item[data-action="edit"]').remove()  
                update()  
            }  
        })  
  
        Lampa.Listener.follow('menu', function(e) {  
            if (e.type == 'end') {  
                init()  
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