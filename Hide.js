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
  
    // Функція для редагування лівого меню (використовує існуючий Editor)  
    function editLeftMenu() {  
        Lampa.Editor.start()  
    }  
  
    // Функція для редагування верхнього меню  
    function editTopMenu() {  
        let list = $('<div class="menu-edit-list"></div>')  
        let head = $('.head')  
  
        head.find('.head__action').each(function(){  
            let item_orig = $(this)  
            let item_clone = $(this).clone()  
            let item_sort = $(`<div class="menu-edit-list__item">  
                <div class="menu-edit-list__icon"></div>  
                <div class="menu-edit-list__title">${item_clone.attr('class').replace('head__action', '').trim()}</div>  
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
  
            item_sort.find('.menu-edit-list__icon').append(item_clone.find('svg').clone())  
  
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
                Lampa.Controller.toggle('settings')  
            }  
        })  
    }  
  
    // Функція для редагування меню налаштувань  
    function editSettingsMenu() {  
        let list = $('<div class="menu-edit-list"></div>')  
        let settings = $('.settings-list')  
  
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
  
            item_sort.find('.menu-edit-list__icon').append(item_clone.find('.settings-folder__icon svg').clone())  
  
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
            title: Lampa.Lang.translate('menu_editor_settings'),  
            html: list,  
            size: 'small',  
            scroll_to_center: true,  
            onBack: ()=>{  
                saveSettingsMenu()  
                Lampa.Modal.close()  
                Lampa.Controller.toggle('settings')  
            }  
        })  
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
  
    // Додаємо розділ в налаштування  
    function addSettings() {  
        Lampa.SettingsApi.addParam({  
            component: 'interface',  
            param: {  
                type: 'title'  
            },  
            field: {  
                name: Lampa.Lang.translate('menu_editor_title'),  
            }  
        })  
  
        Lampa.SettingsApi.addParam({  
            component: 'interface',  
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
            component: 'interface',  
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
            component: 'interface',  
            param: {  
                name: 'edit_settings_menu',  
                type: 'button',  
            },  
            field: {  
                name: Lampa.Lang.translate('menu_editor_settings'),  
            },  
            onChange: editSettingsMenu  
        })  
  
        // Опція для приховування панелі навігації на Android  
        if(Lampa.Platform.is('android')) {  
            Lampa.SettingsApi.addParam({  
                component: 'interface',  
                param: {  
                    name: 'hide_navigation_bar',  
                    type: 'trigger',  
                    default: false  
                },  
                field: {  
                    name: Lampa.Lang.translate('menu_editor_hide_nav'),  
                },  
                onChange: (value) => {  
                    if(value) {  
                        $('.navigation-bar').addClass('hide')  
                    } else {  
                        $('.navigation-bar').removeClass('hide')  
                    }  
                    Lampa.Storage.set('hide_navigation_bar', value)  
                }  
            })  
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
