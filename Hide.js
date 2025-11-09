(function() {    
    'use strict';    
    
    function startPlugin() {    
        window.plugin_menu_editor_ready = true    
    
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
        })    
    
        // Функція для редагування лівого меню (всі пункти)  
        function editLeftMenu() {  
            let list = $('<div class="menu-edit-list"></div>')  
            let menu = $('.menu')  
  
            // Обробляємо ВСІ пункти меню з обох секцій  
            menu.find('.menu__item').each(function(){  
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
  
                item_sort.find('.move-up').on('hover:enter', ()=>{  
                    let prev = item_sort.prev()  
                    if(prev.length){  
                        item_sort.insertBefore(prev)  
                        item_orig.insertBefore(item_orig.prev())  
                    }  
                })  
  
                item_sort.find('.move-down').on('hover:enter', ()=>{  
                    let next = item_sort.next()  
                    if(next.length){  
                        item_sort.insertAfter(next)  
                        item_orig.insertAfter(item_orig.next())  
                    }  
                })  
  
                item_sort.find('.toggle').on('hover:enter', ()=>{  
                    item_orig.toggleClass('hidden')  
                    item_sort.find('.dot').attr('opacity', item_orig.hasClass('hidden') ? 0 : 1)  
                }).find('.dot').attr('opacity', item_orig.hasClass('hidden') ? 0 : 1)  
  
                list.append(item_sort)  
            })  
  
            Lampa.Modal.open({  
                title: Lampa.Lang.translate('menu_editor_left'),  
                html: list,  
                size: 'small',  
                scroll_to_center: true,  
                onBack: ()=>{  
                    saveLeftMenu()  
                    Lampa.Modal.close()  
                    Lampa.Controller.toggle('settings_component')  
                }  
            })  
        }  
    
        // Функція для редагування верхнього меню    
        function editTopMenu() {  
            // Мапа для перекладу класів - створюємо всередині функції  
            const headMenuNames = {  
                'open--search': 'Пошук',  
                'open--broadcast': 'Трансляції',  
                'notice--icon': 'Сповіщення',  
                'open--settings': 'Налаштування',  
                'open--profile': 'Профіль',  
                'full--screen': 'Повний екран'  
            }  
              
            let list = $('<div class="menu-edit-list"></div>')    
            let head = $('.head')    
    
            head.find('.head__action').each(function(){    
                let item_orig = $(this)    
                let item_clone = $(this).clone()    
                    
                // Розбиваємо класи на масив і шукаємо потрібний  
                let allClasses = item_clone.attr('class').split(' ')  
                let mainClass = allClasses.find(c =>   
                    c.startsWith('open--') ||   
                    c.startsWith('notice--') ||   
                    c.startsWith('full--')  
                ) || ''  
                  
                // Визначаємо назву з мапи  
                let displayName = headMenuNames[mainClass] || mainClass  
                    
                let item_sort = $(`<div class="menu-edit-list__item">  
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
                </div>`)  
  
                let svg = item_clone.find('svg').first()  
                if(svg.length) {  
                    item_sort.find('.menu-edit-list__icon').append(svg.clone())  
                }  
  
                item_sort.find('.move-up').on('hover:enter', ()=>{  
                    let prev = item_sort.prev()  
                    if(prev.length){  
                        item_sort.insertBefore(prev)  
                        item_orig.insertBefore(item_orig.prev())  
                    }  
                })  
  
                item_sort.find('.move-down').on('hover:enter', ()=>{  
                    let next = item_sort.next()  
                    if(next.length){  
                        item_sort.insertAfter(next)  
                        item_orig.insertAfter(item_orig.next())  
                    }  
                })  
  
                item_sort.find('.toggle').on('hover:enter', ()=>{  
                    item_orig.toggleClass('hide')  
                    item_sort.find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0 : 1)  
                }).find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0 : 1)  
  
                list.append(item_sort)  
            })  
  
            Lampa.Modal.open({  
                title: Lampa.Lang.translate('menu_editor_top'),  
                html: list,  
                size: 'small',  
                scroll_to_center: true,  
                onBack: ()=>{  
                    saveTopMenu()  
                    Lampa.Modal.close()  
                    Lampa.Controller.toggle('settings_component')  
                }  
            })  
        }  
    
        // Функція для редагування меню налаштувань    
        function editSettingsMenu() {  
            // Спочатку відкриваємо налаштування  
            Lampa.Controller.toggle('settings')  
              
            // Чекаємо, поки меню налаштувань завантажиться  
            setTimeout(()=>{  
                let settings = $('.settings')  
                  
                if(!settings.length || !settings.find('.settings-folder').length){  
                    Lampa.Noty.show('Меню налаштувань ще не завантажене')  
                    return  
                }  
                  
                let list = $('<div class="menu-edit-list"></div>')  
                  
                settings.find('.settings-folder').each(function(){  
                    let item_orig = $(this)  
                    let item_clone = $(this).clone()  
                    let item_sort = $(`<div class="menu-edit-list__item">  
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
                    </div>`)  
  
                    let svg = item_clone.find('.settings-folder__icon svg')  
                    if(svg.length) {  
                        item_sort.find('.menu-edit-list__icon').append(svg.clone())  
                    }  
  
                    item_sort.find('.move-up').on('hover:enter', ()=>{  
                        let prev = item_sort.prev()  
                        if(prev.length){  
                            item_sort.insertBefore(prev)  
                            item_orig.insertBefore(item_orig.prev())  
                        }  
                    })  
  
                    item_sort.find('.move-down').on('hover:enter', ()=>{  
                        let next = item_sort.next()  
                        if(next.length){  
                            item_sort.insertAfter(next)  
                            item_orig.insertAfter(item_orig.next())  
                        }  
                    })  
  
                    item_sort.find('.toggle').on('hover:enter', ()=>{  
                        item_orig.toggleClass('hide')  
                        item_sort.find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0 : 1)  
                    }).find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0: 1)    
    
                    list.append(item_sort)    
                })    
    
                Lampa.Modal.open({    
                    title: Lampa.Lang.translate('menu_editor_settings'),    
                    html: list,    
                    size: 'small',    
                    scroll_to_center: true,    
                    onBack: ()=>{    
                        saveSettingsMenu()    
                        Lampa.Modal.close()    
                        Lampa.Controller.toggle('settings_component')    
                    }    
                })    
            }, 300) // Збільшено час очікування до 300мс  
        }  
  
        // Збереження налаштувань лівого меню  
        function saveLeftMenu() {  
            let sort = []  
            let hide = []  
  
            $('.menu .menu__item').each(function(){  
                let name = $(this).find('.menu__text').text().trim()  
                sort.push(name)  
                if($(this).hasClass('hidden')){  
                    hide.push(name)  
                }  
            })  
  
            Lampa.Storage.set('menu_sort', sort)  
            Lampa.Storage.set('menu_hide', hide)  
        }  
    
        // Збереження налаштувань верхнього меню    
        function saveTopMenu() {    
            let sort = []    
            let hide = []    
    
            $('.head__action').each(function(){    
                let name = $(this).attr('class').replace('head__action', '').trim()    
                sort.push(name)    
                if($(this).hasClass('hide')){    
                    hide.push(name)    
                }    
            })    
    
            Lampa.Storage.set('head_menu_sort', sort)    
            Lampa.Storage.set('head_menu_hide', hide)    
        }    
    
        // Збереження налаштувань меню налаштувань    
        function saveSettingsMenu() {    
            let sort = []    
            let hide = []    
    
            $('.settings-folder').each(function(){    
                let name = $(this).find('.settings-folder__name').text().trim()    
                sort.push(name)    
                if($(this).hasClass('hide')){    
                    hide.push(name)    
                }    
            })    
    
            Lampa.Storage.set('settings_menu_sort', sort)    
            Lampa.Storage.set('settings_menu_hide', hide)    
        }    
    
        // Додаємо окремий розділ в налаштування    
        function addSettings() {    
            // Створюємо окремий компонент для редагування меню    
            Lampa.SettingsApi.addComponent({    
                component: 'menu_editor',    
                icon: `<svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">    
                    <path d="M18.2989 5.27973L2.60834 20.9715C2.52933 21.0507 2.47302 21.1496 2.44528 21.258L0.706081 28.2386C0.680502 28.3422 0.682069 28.4507 0.710632 28.5535C0.739195 28.6563 0.793788 28.75 0.869138 28.8255C0.984875 28.9409 1.14158 29.0057 1.30498 29.0059C1.35539 29.0058 1.4056 28.9996 1.45449 28.9873L8.43509 27.2479C8.54364 27.2206 8.64271 27.1643 8.72172 27.0851L24.4137 11.3944L18.2989 5.27973ZM28.3009 3.14018L26.5543 1.39363C25.3869 0.226285 23.3524 0.227443 22.1863 1.39363L20.0469 3.53318L26.1614 9.64766L28.3009 7.50816C28.884 6.9253 29.2052 6.14945 29.2052 5.32432C29.2052 4.49919 28.884 3.72333 28.3009 3.14018Z" fill="currentColor"/>    
                </svg>`,    
                name: Lampa.Lang.translate('menu_editor_title')    
            })    
    
            // Додаємо кнопки в новий розділ    
            Lampa.SettingsApi.addParam({    
                component: 'menu_editor',    
                param: {    
                    name: 'edit_left_menu',    
                    type: 'button',    
                },    
                field: {    
                    name: Lampa.Lang.translate('menu_editor_left'),    
                },    
                onChange: editLeftMenu    
            })    
    
            Lampa.SettingsApi.addParam({    
                component: 'menu_editor',    
                param: {    
                    name: 'edit_top_menu',    
                    type: 'button',    
                },    
                field: {    
                    name: Lampa.Lang.translate('menu_editor_top'),    
                },    
                onChange: editTopMenu    
            })    
    
            Lampa.SettingsApi.addParam({    
                component: 'menu_editor',    
                param: {    
                    name: 'edit_settings_menu',    
                    type: 'button',    
                },    
                field: {    
                    name: Lampa.Lang.translate('menu_editor_settings'),    
                },    
                onChange: editSettingsMenu    
            })
                        // Додаємо опцію приховування панелі навігації    
            Lampa.SettingsApi.addParam({    
                component: 'menu_editor',    
                param: {    
                    name: 'hide_navigation_bar',    
                    type: 'trigger',    
                    default: false    
                },    
                field: {    
                    name: Lampa.Lang.translate('menu_editor_hide_nav'),    
                    description: 'Приховує нижню панель навігації'    
                },    
                onChange: function(value) {    
                    if (Lampa.Storage.field('hide_navigation_bar') == true) {    
                        Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>');    
                        $('body').append(Lampa.Template.get('hide_nav_bar', {}, true));    
                    }    
                    if (Lampa.Storage.field('hide_navigation_bar') == false) {    
                        $('#hide_nav_bar').remove();    
                    }    
                }    
            })    
    
            // Застосовуємо приховування панелі при запуску    
            if (Lampa.Storage.field('hide_navigation_bar') == true) {    
                Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>');    
                $('body').append(Lampa.Template.get('hide_nav_bar', {}, true));    
            }    
        }    
    
        if(window.appready) addSettings()    
        else {    
            Lampa.Listener.follow('app', function (e) {    
                if (e.type == 'ready') addSettings()    
            })    
        }    
    }    
    
    if(!window.plugin_menu_editor_ready) startPlugin()    
})();
