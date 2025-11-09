// Функція для редагування верхнього меню  
function editTopMenu() {  
    // Мапа для перекладу класів верхнього меню в нормальні назви  
    // Використовуємо прямі переклади замість Lampa.Lang.translate()  
    const headMenuNames = {  
        'open--search': 'Пошук',  
        'open--brodcast': 'Трансляції',   
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
          
        // Отримуємо класи та очищаємо від зайвих слів  
        let classes = item_clone.attr('class')  
            .replace('head__action', '')  
            .replace('selector', '')  
            .replace('active', '')  
            .trim()  
            .split(' ')  
            .filter(c => c.length > 0)[0] || ''  
          
        // Визначаємо назву з мапи або використовуємо клас як fallback  
        let displayName = headMenuNames[classes] || classes  
          
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
  
        // Копіюємо SVG іконку  
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
