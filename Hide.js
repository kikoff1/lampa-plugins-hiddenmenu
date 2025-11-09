(function() {    
    'use strict';    
    
    function startPlugin() {    
        window.plugin_menu_editor_ready = true    
    
        // 🗣️ Додаємо переклади
        Lampa.Lang.add({    
            menu_editor_title: { ru: 'Редактирование меню', uk: 'Редагування меню', en: 'Menu Editor' },    
            menu_editor_left: { ru: 'Левое меню', uk: 'Ліве меню', en: 'Left Menu' },    
            menu_editor_top: { ru: 'Верхнее меню', uk: 'Верхнє меню', en: 'Top Menu' },    
            menu_editor_settings: { ru: 'Меню настроек', uk: 'Меню налаштувань', en: 'Settings Menu' },    
            menu_editor_hide_nav: { ru: 'Скрыть панель навигации', uk: 'Приховати панель навігації', en: 'Hide Navigation Bar' }    
        })    

        // 🎨 Стилі для зменшених іконок
        Lampa.Template.add('menu_editor_styles', `
            <style>
                .menu-edit-list__icon {
                    width: 22px !important;
                    height: 22px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    flex-shrink: 0 !important;
                }
                .menu-edit-list__icon svg,
                .menu-edit-list__icon img {
                    max-width: 16px !important;
                    max-height: 16px !important;
                    width: auto !important;
                    height: auto !important;
                }
                .menu-edit-list__item {
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    padding: 8px 10px !important;
                }
                .menu-edit-list__title {
                    flex: 1 !important;
                    font-size: 1em !important;
                }
            </style>
        `);
        $('body').append(Lampa.Template.get('menu_editor_styles', {}, true));

        // ⚙️ Редагування лівого меню
        function editLeftMenu() {  
            let list = $('<div class="menu-edit-list"></div>')  
            let menu = $('.menu')  
  
            menu.find('.menu__item').each(function(){  
                let item_orig = $(this)  
                let item_clone = $(this).clone()  
                let item_sort = $(`<div class="menu-edit-list__item">  
                    <div class="menu-edit-list__icon"></div>  
                    <div class="menu-edit-list__title">${item_clone.find('.menu__text').text()}</div>  
                    <div class="menu-edit-list__move move-up selector">
                        <svg width="22" height="14" viewBox="0 0 22 14" fill="none"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
                    </div>  
                    <div class="menu-edit-list__move move-down selector">
                        <svg width="22" height="14" viewBox="0 0 22 14" fill="none"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
                    </div>  
                    <div class="menu-edit-list__toggle toggle selector">
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                            <rect x="1.9" y="1.8" width="21.8" height="21.8" rx="3.5" stroke="currentColor" stroke-width="3"/>
                            <path d="M7.4 12.96L10.82 16.33L18.13 9.03" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>
                        </svg>
                    </div>  
                </div>`)  
  
                let icon = item_clone.find('.menu__ico').html()
                if(icon) item_sort.find('.menu-edit-list__icon').html(icon)
  
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

        // 🧩 Редагування верхнього меню
        function editTopMenu() {
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
                let allClasses = item_clone.attr('class').split(' ')
                let mainClass = allClasses.find(c => c.startsWith('open--') || c.startsWith('notice--') || c.startsWith('full--')) || ''
                let displayName = headMenuNames[mainClass] || mainClass

                let item_sort = $(`<div class="menu-edit-list__item">
                    <div class="menu-edit-list__icon"></div>
                    <div class="menu-edit-list__title">${displayName}</div>
                    <div class="menu-edit-list__move move-up selector"><svg width="22" height="14" viewBox="0 0 22 14"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></div>
                    <div class="menu-edit-list__move move-down selector"><svg width="22" height="14" viewBox="0 0 22 14"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></div>
                    <div class="menu-edit-list__toggle toggle selector"><svg width="26" height="26" viewBox="0 0 26 26"><rect x="1.9" y="1.8" width="21.8" height="21.8" rx="3.5" stroke="currentColor" stroke-width="3"/><path d="M7.4 12.96L10.82 16.33L18.13 9.03" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/></svg></div>
                </div>`)

                let svg = item_clone.find('svg')
                if(svg.length) item_sort.find('.menu-edit-list__icon').append(svg.clone())

                item_sort.find('.move-up').on('hover:enter', ()=>{let prev=item_sort.prev();if(prev.length){item_sort.insertBefore(prev);item_orig.insertBefore(item_orig.prev())}})
                item_sort.find('.move-down').on('hover:enter', ()=>{let next=item_sort.next();if(next.length){item_sort.insertAfter(next);item_orig.insertAfter(item_orig.next())}})
                item_sort.find('.toggle').on('hover:enter', ()=>{item_orig.toggleClass('hide');item_sort.find('.dot').attr('opacity', item_orig.hasClass('hide')?0:1)}).find('.dot').attr('opacity', item_orig.hasClass('hide')?0:1)

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

        // 🛠️ Збереження
        function saveLeftMenu(){ let sort=[],hide=[];$('.menu .menu__item').each(function(){let name=$(this).find('.menu__text').text().trim();sort.push(name);if($(this).hasClass('hidden'))hide.push(name)});Lampa.Storage.set('menu_sort',sort);Lampa.Storage.set('menu_hide',hide);}
        function saveTopMenu(){ let sort=[],hide=[];$('.head__action').each(function(){let name=$(this).attr('class').replace('head__action','').trim();sort.push(name);if($(this).hasClass('hide'))hide.push(name)});Lampa.Storage.set('head_menu_sort',sort);Lampa.Storage.set('head_menu_hide',hide);}

        // ⚡ Додаємо опцію в налаштування
        function addSettings(){
            Lampa.SettingsApi.addComponent({
                component:'menu_editor',
                icon:`<svg width="30" height="29" viewBox="0 0 30 29"><path d="M18.3 5.28L2.6 20.97a.6.6 0 00-.16.29l-1.74 6.98c-.02.1-.02.21 0 .32.02.11.07.2.14.28a.58.58 0 00.44.18l7-1.74a.6.6 0 00.29-.16L24.4 11.4l-6.1-6.12zM28.3 3.14l-1.75-1.75a2.64 2.64 0 00-3.74 0L20.05 3.53l6.12 6.12 2.13-2.14a2.65 2.65 0 000-3.74z" fill="currentColor"/></svg>`,
                name:Lampa.Lang.translate('menu_editor_title')
            })

            Lampa.SettingsApi.addParam({
                component:'menu_editor',
                param:{name:'edit_left_menu',type:'button'},
                field:{name:Lampa.Lang.translate('menu_editor_left')},
                onChange:editLeftMenu
            })

            Lampa.SettingsApi.addParam({
                component:'menu_editor',
                param:{name:'edit_top_menu',type:'button'},
                field:{name:Lampa.Lang.translate('menu_editor_top')},
                onChange:editTopMenu
            })

            // Приховування панелі навігації
            Lampa.SettingsApi.addParam({
                component:'menu_editor',
                param:{name:'hide_navigation_bar',type:'trigger',default:false},
                field:{name:Lampa.Lang.translate('menu_editor_hide_nav'),description:'Приховує нижню панель навігації'},
                onChange:function(){
                    if(Lampa.Storage.field('hide_navigation_bar')==true){
                        Lampa.Template.add('hide_nav_bar','<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>');
                        $('body').append(Lampa.Template.get('hide_nav_bar',{},true));
                    } else $('#hide_nav_bar').remove();
                }
            })

            if(Lampa.Storage.field('hide_navigation_bar')==true){
                Lampa.Template.add('hide_nav_bar','<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>');
                $('body').append(Lampa.Template.get('hide_nav_bar',{},true));
            }
        }

        if(window.appready) addSettings()
        else Lampa.Listener.follow('app', e => { if(e.type=='ready') addSettings() })
    }

    if(!window.plugin_menu_editor_ready) startPlugin()
})();
