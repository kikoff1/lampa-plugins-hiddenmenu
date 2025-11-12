(function() {        
    'use strict';        
        
    function startPlugin() {        
        window.plugin_menu_editor_ready = true    
            
        // v.1.1 Чекаємо на повну ініціалізацію Lampa    
        function initialize() {    
            // Перевірка версії та додавання стилів    
            try {    
                const lampaVersion = Lampa.Manifest ? Lampa.Manifest.app_digital : 0    
                const needsIconFix = lampaVersion < 300    
                    
                if (needsIconFix) {    
                    const iconStyles = `    
                        <style id="menu-editor-icon-fix">    
                            /* Основний контейнер списку */    
                            .menu-edit-list__item {    
                                display: flex !important;    
                                padding: 0.3em !important;    
                                border-radius: 0.3em !important;    
                                align-items: center !important;    
                            }    
                                
                            .menu-edit-list__item:nth-child(even) {    
                                background: rgba(255, 255, 255, 0.1) !important;    
                            }    
                                
                            /* Іконка */    
                            .menu-edit-list__icon {    
                                width: 2.4em !important;    
                                height: 2.4em !important;    
                                margin-right: 1em !important;    
                                flex-shrink: 0 !important;    
                                border-radius: 100% !important;    
                                display: flex !important;    
                                align-items: center !important;    
                                justify-content: center !important;    
                            }    
                                
                            .menu-edit-list__icon svg {    
                                width: 100% !important;    
                                height: 100% !important;    
                            }    
                                
                            /* Назва */    
                            .menu-edit-list__title {    
                                flex-grow: 1 !important;    
                                font-size: 1.3em !important;    
                            }    
                                
                            /* Кнопки переміщення */    
                            .menu-edit-list__move {    
                                width: 2em !important;    
                                height: 2em !important;    
                                margin-left: 0.5em !important;    
                                display: flex !important;    
                                align-items: center !important;    
                                justify-content: center !important;    
                                cursor: pointer !important;    
                            }    
                                
                            /* Перемикач */    
                            .menu-edit-list__toggle {    
                                width: 2em !important;    
                                height: 2em !important;    
                                margin-left: 0.5em !important;    
                                display: flex !important;    
                                align-items: center !important;    
                                justify-content: center !important;    
                                cursor: pointer !important;    
                            }    
                        </style>    
                    `    
                    $('head').append(iconStyles)    
                }    
            } catch(e) {    
                console.log('Menu Editor: Error adding styles', e)    
            }    
                
            // Додавання перекладів    
            Lampa.Lang.add({    
                menu_editor: {    
                    ru: 'Редактор меню',    
                    en: 'Menu Editor',    
                    uk: 'Редактор меню'    
                },    
                menu_editor_left: {    
                    ru: 'Левое меню',    
                    en: 'Left Menu',    
                    uk: 'Ліве меню'    
                },    
                menu_editor_top: {    
                    ru: 'Верхнее меню',    
                    en: 'Top Menu',    
                    uk: 'Верхнє меню'    
                },    
                menu_editor_settings: {    
                    ru: 'Меню настроек',    
                    en: 'Settings Menu',    
                    uk: 'Меню налаштувань'    
                },    
                menu_editor_hide_nav: {    
                    ru: 'Скрыть нижнюю панель навигации',    
                    en: 'Hide bottom navigation bar',    
                    uk: 'Приховати нижню панель навігації'    
                },  
                // Переклади для верхнього меню  
                head_action_search: {  
                    ru: 'Поиск',  
                    en: 'Search',  
                    uk: 'Пошук'  
                },  
                head_action_settings: {  
                    ru: 'Настройки',  
                    en: 'Settings',  
                    uk: 'Налаштування'  
                },  
                head_action_feed: {  
                    ru: 'Лента',  
                    en: 'Feed',  
                    uk: 'Стрічка'  
                },  
                head_action_notice: {  
                    ru: 'Уведомления',  
                    en: 'Notifications',  
                    uk: 'Сповіщення'  
                },  
                head_action_profile: {  
                    ru: 'Профиль',  
                    en: 'Profile',  
                    uk: 'Профіль'  
                },  
                head_action_fullscreen: {  
                    ru: 'Полный экран',  
                    en: 'Fullscreen',  
                    uk: 'Повний екран'  
                },  
                head_action_broadcast: {  
                    ru: 'Трансляции',  
                    en: 'Broadcast',  
                    uk: 'Трансляції'  
                },  
                no_name: {  
                    ru: 'Элемент без названия',  
                    en: 'Unnamed element',  
                    uk: 'Елемент без назви'  
                }  
            })    
                
            // Застосування налаштувань лівого меню    
            function applyLeftMenu() {    
                let sort = Lampa.Storage.get('menu_sort', [])    
                let hide = Lampa.Storage.get('menu_hide', [])    
                    
                if(sort.length) {    
                    sort.forEach((name) => {    
                        let item = $('.menu .menu__item').filter(function() {    
                            return $(this).find('.menu__text').text().trim() === name    
                        })    
                        if(item.length) item.appendTo($('.menu .menu__list:eq(0)'))    
                    })    
                }    
                    
                $('.menu .menu__item').removeClass('hidden')    
                if(hide.length) {    
                    hide.forEach((name) => {    
                        let item = $('.menu .menu__item').filter(function() {    
                            return $(this).find('.menu__text').text().trim() === name    
                        })    
                        if(item.length) item.addClass('hidden')    
                    })    
                }    
            }    
                
            // ВИПРАВЛЕНО: Застосування налаштувань верхнього меню з генерацією ID  
            function applyTopMenu() {    
                let sort = Lampa.Storage.get('head_menu_sort', [])    
                let hide = Lampa.Storage.get('head_menu_hide', [])    
                    
                let actionsContainer = $('.head__actions')    
                if(!actionsContainer.length) return    
                    
                if(sort.length) {    
                    sort.forEach((id) => {    
                        let item = $('.head__action').filter(function() {    
                            let classes = $(this).attr('class').split(' ')    
                            let idParts = []    
                              
                            for (let i = 0; i < classes.length; i++) {    
                                if (classes[i].indexOf('open--') === 0 ||     
                                    classes[i].indexOf('notice--') === 0 ||     
                                    classes[i] === 'full-screen') {    
                                    idParts.push(classes[i])    
                                }    
                            }    
                              
                            return idParts.join('_') === id    
                        })    
                        if(item.length) item.appendTo(actionsContainer)    
                    })    
                }    
                    
                $('.head__action').removeClass('hide')    
                if(hide.length) {    
                    hide.forEach((id) => {    
                        let item = $('.head__action').filter(function() {    
                            let classes = $(this).attr('class').split(' ')    
                            let idParts = []    
                              
                            for (let i = 0; i < classes.length; i++) {    
                                if (classes[i].indexOf('open--') === 0 ||     
                                    classes[i].indexOf('notice--') === 0 ||     
                                    classes[i] === 'full-screen') {    
                                    idParts.push(classes[i])    
                                }    
                            }    
                              
                            return idParts.join('_') === id    
                        })    
                        if(item.length) item.addClass('hide')    
                    })    
                }    
            }    
                
            // Застосування налаштувань меню налаштувань    
            function applySettingsMenu() {    
                let sort = Lampa.Storage.get('settings_menu_sort', [])    
                let hide = Lampa.Storage.get('settings_menu_hide', [])    
                    
                let settingsContainer = $('.settings .scroll__body > div')    
                if(!settingsContainer.length) return    
                    
                if(sort.length) {    
                    sort.forEach((name) => {    
                        let item = $('.settings-folder').filter(function() {    
                            return $(this).find('.settings-folder__name').text().trim() === name    
                        })    
                        if(item.length) item.appendTo(settingsContainer)    
                    })    
                }    
                    
                $('.settings-folder').removeClass('hide')    
                if(hide.length) {    
                    hide.forEach((name) => {    
                        let item = $('.settings-folder').filter(function() {    
                            return $(this).find('.settings-folder__name').text().trim() === name    
                        })    
                        if(item.length) item.addClass('hide')    
                    })    
                }    
            }
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
            
            // ВИПРАВЛЕНО: Функція для редагування верхнього меню з генерацією ID  
            function editTopMenu() {        
                let list = $('<div class="menu-edit-list"></div>')        
                let head = $('.head')        
            
                head.find('.head__action').each(function(){        
                    let item_orig = $(this)      
                    let item_clone = $(this).clone()      
                      
                    // ВИПРАВЛЕНО: Генеруємо ID на основі класів (як у плагіні приховування)  
                    let classes = item_clone.attr('class').split(' ')  
                    let idParts = []  
                      
                    for (let i = 0; i < classes.length; i++) {  
                        if (classes[i].indexOf('open--') === 0 ||   
                            classes[i].indexOf('notice--') === 0 ||   
                            classes[i] === 'full-screen') {  
                            idParts.push(classes[i])  
                        }  
                    }  
                      
                    let id = idParts.join('_')  
                    if (!id) return // Пропускаємо елементи без ID  
                      
                    // ВИПРАВЛЕНО: Визначаємо назву за класом через систему перекладів  
                    let titleKey = ''  
                    if (id.includes('open--search')) {  
                        titleKey = 'head_action_search'  
                    } else if (id.includes('open--settings')) {  
                        titleKey = 'head_action_settings'  
                    } else if (id.includes('open--feed')) {  
                        titleKey = 'head_action_feed'  
                    } else if (id.includes('open--notice')) {  
                        titleKey = 'head_action_notice'  
                    } else if (id.includes('open--profile')) {  
                        titleKey = 'head_action_profile'  
                    } else if (id.includes('full-screen')) {  
                        titleKey = 'head_action_fullscreen'  
                    } else if (id.includes('open--broadcast')) {  
                        titleKey = 'head_action_broadcast'  
                    } else {  
                        titleKey = 'no_name'  
                    }  
                      
                    let title = Lampa.Lang.translate(titleKey)  
                      
                    let item_sort = $(`<div class="menu-edit-list__item">        
                        <div class="menu-edit-list__icon"></div>        
                        <div class="menu-edit-list__title">${title}</div>        
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
            
                    // ВИПРАВЛЕНО: Клонуємо весь HTML іконки  
                    let iconHtml = item_clone.html()  
                    if(iconHtml) {        
                        item_sort.find('.menu-edit-list__icon').html(iconHtml)        
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
              
            // ВИПРАВЛЕНО: Функція для редагування меню налаштувань з setInterval  
            function editSettingsMenu() {  
                // Використовуємо Settings.listener замість activity listener  
                Lampa.Settings.listener.follow('open', (e) => {  
                    if(e.name === 'main') {  
                        // Використовуємо setInterval для очікування завантаження елементів  
                        let checkInterval = setInterval(() => {  
                            let settingsFolders = $('.settings-folder')  
                              
                            // Перевіряємо чи елементи завантажені  
                            if(settingsFolders.length > 0) {  
                                clearInterval(checkInterval)  
                                  
                                let list = $('<div class="menu-edit-list"></div>')  
                                  
                                settingsFolders.each(function(){  
                                    let item_orig = $(this)  
                                    let item_clone = $(this).clone()  
                                      
                                    // Отримуємо назву з елемента  
                                    let folderName = item_clone.find('.settings-folder__name').text().trim()  
                                      
                                    let item_sort = $(`<div class="menu-edit-list__item">  
                                        <div class="menu-edit-list__icon"></div>  
                                        <div class="menu-edit-list__title">${folderName}</div>  
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
                                      
                                    let icon = item_clone.find('.settings-folder__icon svg, .settings-folder__icon img')  
                                    if(icon.length) {  
                                        item_sort.find('.menu-edit-list__icon').append(icon.clone())  
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
                                    title: Lampa.Lang.translate('menu_editor_                                                settings'),  
                                    html: list,  
                                    size: 'small',  
                                    scroll_to_center: true,  
                                    onBack: ()=>{  
                                        saveSettingsMenu()  
                                        Lampa.Modal.close()  
                                        Lampa.Controller.toggle('settings_component')  
                                    }  
                                })  
                            }  
                        }, 100) // Перевіряємо кожні 100мс  
                          
                        // Таймаут на випадок якщо елементи не з'являться  
                        setTimeout(() => {  
                            clearInterval(checkInterval)  
                        }, 3000)  
                    }  
                })  
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
            
            // ВИПРАВЛЕНО: Збереження налаштувань верхнього меню з генерацією ID  
            function saveTopMenu() {        
                let sort = []        
                let hide = []        
            
                $('.head__action').each(function(){  
                    // ВИПРАВЛЕНО: Генеруємо ID на основі класів (як у плагіні приховування)  
                    let classes = $(this).attr('class').split(' ')  
                    let idParts = []  
                      
                    for (let i = 0; i < classes.length; i++) {  
                        if (classes[i].indexOf('open--') === 0 ||   
                            classes[i].indexOf('notice--') === 0 ||   
                            classes[i] === 'full-screen') {  
                            idParts.push(classes[i])  
                        }  
                    }  
                      
                    let id = idParts.join('_')  
                      
                    if(id) {  
                        sort.push(id)  
                        if($(this).hasClass('hide')){  
                            hide.push(id)  
                        }  
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
              
            // Функція для додавання налаштувань в меню  
            function addSettings() {  
                // Додаємо компонент редактора меню  
                Lampa.SettingsApi.addComponent({  
                    component: 'menu_editor',  
                    name: Lampa.Lang.translate('menu_editor_title')  
                })  
                  
                // Додаємо параметр для редагування лівого меню  
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
                  
                // Додаємо параметр для редагування верхнього меню  
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
                  
                // Додаємо параметр для редагування меню налаштувань  
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
                  
                // Додаємо параметр для приховування нижньої панелі навігації  
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
            // Викликаємо addSettings після ініціалізації всіх функцій    
            addSettings()  
              
            // КРИТИЧНО ВАЖЛИВО: Застосовуємо збережені налаштування при запуску  
            setTimeout(() => {  
                applyLeftMenu()  
                // Верхнє меню завантажується пізніше, додаємо окрему затримку  
                setTimeout(applyTopMenu, 300)  
            }, 500)  
              
            // ВИДАЛЕНО старий listener для меню налаштувань через activity  
            // Тепер використовується тільки Settings.listener всередині editSettingsMenu()  
        }    
            
        // Чекаємо на повну ініціалізацію Lampa    
        if(window.appready) initialize()        
        else {        
            Lampa.Listener.follow('app', function (e) {        
                if (e.type == 'ready') initialize()        
            })        
        }        
    }        
        
    if(!window.plugin_menu_editor_ready) startPlugin()        
})();