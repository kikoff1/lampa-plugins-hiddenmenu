(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'ButtonManager';  
    let observer = null;  
      
    // Функція додавання стилів з підтримкою CSS змінних для налаштувань  
    function addStyles() {  
        if (!document.getElementById('button-manager-style')) {  
            const style = document.createElement('style');  
            style.id = 'button-manager-style';  
            style.textContent = `  
                .full-start__button {  
                    position: relative !important;  
                    transition: transform 0.2s ease !important;  
                }  
                .full-start__button:active {  
                    transform: scale(0.98) !important;  
                }  
                  
                .full-start__button.view--online svg path {     
                    fill: var(--button-online-color, #2196f3) !important;     
                }  
                .full-start__button.view--torrent svg path {     
                    fill: var(--button-torrent-color, lime) !important;     
                }  
                .full-start__button.view--trailer svg path {     
                    fill: var(--button-trailer-color, #f44336) !important;     
                }  
                .full-start__button.button--play svg path {     
                    fill: var(--button-play-color, #2196f3) !important;     
                }  
                  
                .full-start__button svg {  
                    width: var(--button-icon-size, 1.5em) !important;  
                    height: var(--button-icon-size, 1.5em) !important;  
                }  
                  
                .full-start__button.loading::before {  
                    content: '';  
                    position: absolute;  
                    top: 0; left: 0; right: 0;  
                    height: 2px;  
                    background: rgba(255,255,255,0.5);  
                    animation: loading 1s linear infinite;  
                }  
                  
                @keyframes loading {  
                    from { transform: translateX(-100%); }  
                    to   { transform: translateX(100%); }  
                }  
                  
                @media (max-width: 767px) {  
                    .full-start__button {  
                        min-height: 44px !important;  
                        padding: 10px !important;  
                    }  
                }  
                  
                .button-split .full-start__button {  
                    margin: 0.2em !important;  
                }  
            `;  
            document.head.appendChild(style);  
        }  
    }  
      
    // Основна функція обробки кнопок  
    function processButtons(event) {  
        try {  
            const render = event.object.activity.render();  
              
            let mainContainer = render.find('.full-start-new__buttons');  
            if (!mainContainer.length) {  
                mainContainer = render.find('.full-start__buttons');  
            }  
            if (!mainContainer.length) {  
                mainContainer = render.find('.buttons--container');  
            }  
              
            const hiddenContainer = render.find('.buttons--container');  
              
            if (!mainContainer.length) {  
                console.warn(`${PLUGIN_NAME}: Не знайдено контейнер кнопок`);  
                return;  
            }  
              
            // Застосовуємо налаштування приховування  
            applyButtonVisibility(mainContainer);  
              
            // Переміщуємо кнопки з прихованого контейнера  
            const torrentBtn = hiddenContainer.find('.view--torrent');  
            const trailerBtn = hiddenContainer.find('.view--trailer');  
              
            if (torrentBtn.length > 0) {  
                torrentBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(torrentBtn);  
            }  
              
            if (trailerBtn.length > 0) {  
                trailerBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(trailerBtn);  
            }  
              
            setTimeout(() => {  
                removeSourcesButton(mainContainer);  
            }, 200);  
              
            reorderButtons(mainContainer);  
              
            setTimeout(() => {  
                updateButtons();  
            }, 300);  
              
            if (Lampa.Controller) {  
                setTimeout(() => {  
                    Lampa.Controller.collectionSet(mainContainer.parent());  
                }, 400);  
            }  
              
        } catch (error) {  
            console.error(`${PLUGIN_NAME}: Помилка обробки кнопок`, error);  
        }  
    }  
      
    // Застосування видимості кнопок згідно з налаштуваннями  
    function applyButtonVisibility(container) {  
        const hiddenButtons = Lampa.Storage.get('button_manager_hidden', []);  
        const splitButtons = Lampa.Storage.get('button_manager_split', false);  
          
        // Застосовуємо розділення кнопок  
        if (splitButtons) {  
            container.addClass('button-split');  
        } else {  
            container.removeClass('button-split');  
        }  
          
        // Приховуємо кнопки згідно з налаштуваннями  
        container.find('.full-start__button').each(function() {  
            const button = $(this);  
            const classes = button.attr('class') || '';  
            const text = button.text().toLowerCase().trim();  
              
            let buttonId = '';  
            if (classes.includes('view--online')) buttonId = 'online';  
            else if (classes.includes('view--torrent')) buttonId = 'torrent';  
            else if (classes.includes('view--trailer')) buttonId = 'trailer';  
            else if (classes.includes('button--play')) buttonId = 'play';  
              
            if (buttonId && hiddenButtons.includes(buttonId)) {  
                button.addClass('hide');  
            } else {  
                button.removeClass('hide');  
            }  
        });  
    }  
      
    // Видалення кнопок "джерела"  
    function removeSourcesButton(mainContainer) {  
        const allButtons = mainContainer.find('.full-start__button');  
          
        allButtons.each(function() {  
            const button = $(this);  
            const text = button.text().toLowerCase().trim();  
            const classes = button.attr('class') || '';  
              
            const isImportantButton = classes.includes('view--online') ||   
                                     classes.includes('view--torrent') ||   
                                     classes.includes('view--trailer') ||   
                                     classes.includes('button--book') ||   
                                     classes.includes('button--reaction') ||   
                                     classes.includes('button--subscribe') ||   
                                     classes.includes('button--subs') ||   
                                     text.includes('онлайн') ||   
                                     text.includes('online');  
              
            const isSourcesButton = text.includes('джерела') ||   
                                   text.includes('джерело') ||   
                                   text.includes('sources') ||   
                                   text.includes('source') ||   
                                   text.includes('источники') ||   
                                   text.includes('источник');  
              
            if (!isImportantButton && isSourcesButton) {  
                button.remove();  
            }  
        });  
    }  
      
    // Перевпорядкування кнопок  
    function reorderButtons(container) {  
        container.css('display', 'flex');  
          
        const buttonOrder = Lampa.Storage.get('button_manager_order', ['play', 'online', 'torrent', 'trailer']);  
          
        container.find('.full-start__button').each(function() {  
            const button = $(this);  
            const classes = button.attr('class') || '';  
            const text = button.text().toLowerCase();  
              
            let buttonId = '';  
            if (classes.includes('button--play') || text.includes('дивитись') || text.includes('watch')) {  
                buttonId = 'play';  
            } else if (classes.includes('view--online') || text.includes('онлайн')) {  
                buttonId = 'online';  
            } else if (classes.includes('view--torrent') || text.includes('торрент')) {  
                buttonId = 'torrent';  
            } else if (classes.includes('view--trailer') || text.includes('трейлер')) {  
                buttonId = 'trailer';  
            }  
              
            const order = buttonOrder.indexOf(buttonId);  
            button.css('order', order >= 0 ? order : 999);  
        });  
    }  
      
    // Оновлення стилів кнопок  
    function updateButtons() {  
        const customColors = Lampa.Storage.get('button_manager_colors', {  
            online: '#2196f3',  
            torrent: 'lime',  
            trailer: '#f44336',  
            play: '#2196f3'  
        });  
          
        const iconSize = Lampa.Storage.get('button_manager_icon_size', '1.5em');  
          
        // Оновлюємо CSS змінні  
        document.documentElement.style.setProperty('--button-online-color', customColors.online);  
        document.documentElement.style.setProperty('--button-torrent-color', customColors.torrent);  
        document.documentElement.style.setProperty('--button-trailer-color', customColors.trailer);  
        document.documentElement.style.setProperty('--button-play-color', customColors.play);  
        document.documentElement.style.setProperty('--button-icon-size', iconSize);  
          
        // Оновлюємо SVG якщо потрібно  
        const customSvgs = Lampa.Storage.get('button_manager_svgs', {});  
          
        for (const buttonId in customSvgs) {  
            if (customSvgs[buttonId]) {  
                $(`.full-start__button.view--${buttonId}, .full-start__button.button--${buttonId}`).each(function() {  
                    const button = $(this);  
                    const oldSvg = button.find('svg');  
                      
                    if (oldSvg.length > 0) {  
                        oldSvg.html($(customSvgs[buttonId]).html());  
                    }  
                });  
            }  
        }  
    }  
      
    // Запуск спостерігача за змінами в DOM  
    function startObserver(event) {  
        const render = event.object.activity.render();  
        const mainContainer = render.find('.full-start-new__buttons')[0];  
          
        if (!mainContainer) return;  
          
        observer = new MutationObserver((mutations) => {  
            mutations.forEach((mutation) => {  
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {  
                    setTimeout(() => {  
                        applyButtonVisibility($(mainContainer));  
                        updateButtons();  
                    }, 50);  
                }  
            });  
        });  
          
        observer.observe(mainContainer, {  
            childList: true,  
            subtree: false  
        });  
    }  
      
    // Зупинка спостерігача  
    function stopObserver() {  
        if (observer) {  
            observer.disconnect();  
            observer = null;  
        }  
    }  
      
    // Ініціалізація плагіна  
    function initPlugin() {  
        if (typeof Lampa === 'undefined') {  
            setTimeout(initPlugin, 100);  
            return;  
        }  
          
        // Додаємо стили одразу  
        addStyles();  
          
        // Слухаємо події повного екрану  
        Lampa.Listener.follow('full', function(event) {  
            if (event.type === 'complite') {  
                setTimeout(() => {  
                    processButtons(event);  
                    startObserver(event);  
                }, 500);  
            }  
              
            if (event.type === 'destroy') {  
                stopObserver();  
            }  
        });  
    }  
      
    // Реєстрація плагіна  
    if (window.plugin) {  
        window.plugin('button_manager', {  
            type: 'component',  
            name: 'Button Manager',  
            version: '1.0',  
            author: 'Custom Plugin',  
            description: 'Менеджер кнопок з налаштуваннями стилів та порядку'  
        });  
    }  
      
    // Запуск плагіна  
    if (document.readyState === 'loading') {  
        document.addEventListener('DOMContentLoaded', initPlugin);  
    } else {  
        initPlugin();  
    }  
      
})();
    // Функції налаштувань та інтерфейсу  
    function editButtons() {  
        let list = $('<div class="menu-edit-list"></div>');  
          
        const buttons = [  
            { id: 'play', name: 'Дивитись', class: 'button--play' },  
            { id: 'online', name: 'Онлайн', class: 'view--online' },  
            { id: 'torrent', name: 'Торрент', class: 'view--torrent' },  
            { id: 'trailer', name: 'Трейлер', class: 'view--trailer' }  
        ];  
          
        const hiddenButtons = Lampa.Storage.get('button_manager_hidden', []);  
        const buttonOrder = Lampa.Storage.get('button_manager_order', ['play', 'online', 'torrent', 'trailer']);  
          
        // Сортуємо кнопки згідно з порядком  
        buttons.sort((a, b) => buttonOrder.indexOf(a.id) - buttonOrder.indexOf(b.id));  
          
        buttons.forEach(button => {  
            const isHidden = hiddenButtons.includes(button.id);  
              
            let item_sort = $(`<div class="menu-edit-list__item" data-button-id="${button.id}">  
                <div class="menu-edit-list__icon">  
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">  
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>  
                        <path d="M8 12L16 12" stroke="currentColor" stroke-width="2"/>  
                    </svg>  
                </div>  
                <div class="menu-edit-list__title">${button.name}</div>  
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
              
            // Кнопки переміщення  
            item_sort.find('.move-up').on('hover:enter', () => {  
                let prev = item_sort.prev();  
                if (prev.length) {  
                    item_sort.insertBefore(prev);  
                    updateButtonOrder();  
                }  
            });  
              
            item_sort.find('.move-down').on('hover:enter', () => {  
                let next = item_sort.next();  
                if (next.length) {  
                    item_sort.insertAfter(next);  
                    updateButtonOrder();  
                }  
            });  
              
            // Перемикач видимості  
            item_sort.find('.toggle').on('hover:enter', () => {  
                const buttonId = item_sort.data('button-id');  
                let hidden = Lampa.Storage.get('button_manager_hidden', []);  
                  
                if (hidden.includes(buttonId)) {  
                    hidden = hidden.filter(id => id !== buttonId);  
                } else {  
                    hidden.push(buttonId);  
                }  
                  
                Lampa.Storage.set('button_manager_hidden', hidden);  
                item_sort.find('.dot').attr('opacity', hidden.includes(buttonId) ? 0 : 1);  
                  
                // Застосовуємо зміни  
                $('.full-start__button').each(function() {  
                    applyButtonVisibility($('.full-start-new__buttons, .full-start__buttons'));  
                });  
            }).find('.dot').attr('opacity', isHidden ? 0 : 1);  
              
            list.append(item_sort);  
        });  
          
        function updateButtonOrder() {  
            const newOrder = [];  
            list.find('.menu-edit-list__item').each(function() {  
                newOrder.push($(this).data('button-id'));  
            });  
            Lampa.Storage.set('button_manager_order', newOrder);  
              
            // Застосовуємо новий порядок  
            $('.full-start__button').each(function() {  
                reorderButtons($('.full-start-new__buttons, .full-start__buttons'));  
            });  
        }  
          
        Lampa.Modal.open({  
            title: 'Менеджер кнопок',  
            html: list,  
            size: 'small',  
            scroll_to_center: true,  
            onBack: () => {  
                Lampa.Modal.close();  
                Lampa.Controller.toggle('settings_component');  
            }  
        });  
    }  
      
    function editButtonStyles() {  
        let list = $('<div class="settings-param-list"></div>');  
          
        const colors = Lampa.Storage.get('button_manager_colors', {  
            online: '#2196f3',  
            torrent: 'lime',  
            trailer: '#f44336',  
            play: '#2196f3'  
        });  
          
        const iconSize = Lampa.Storage.get('button_manager_icon_size', '1.5em');  
          
        // Налаштування кольорів  
        Object.keys(colors).forEach(buttonId => {  
            const colorItem = $(`<div class="settings-param selector">  
                <div class="settings-param__name">Колір кнопки "${buttonId}"</div>  
                <div class="settings-param__value">  
                    <input type="color" value="${colors[buttonId]}" style="width: 50px; height: 30px; border: none; background: transparent;">  
                </div>  
            </div>`);  
              
            colorItem.find('input').on('change', function() {  
                colors[buttonId] = $(this).val();  
                Lampa.Storage.set('button_manager_colors', colors);  
                updateButtons();  
            });  
              
            list.append(colorItem);  
        });  
          
        // Налаштування розміру іконок  
        const sizeItem = $(`<div class="settings-param selector">  
            <div class="settings-param__name">Розмір іконок</div>  
            <div class="settings-param__value">  
                <select style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 5px;">  
                    <option value="1em" ${iconSize === '1em' ? 'selected' : ''}>Малий</option>  
                    <option value="1.5em" ${iconSize === '1.5em' ? 'selected' : ''}>Середній</option>  
                    <option value="2em" ${iconSize === '2em' ? 'selected' : ''}>Великий</option>  
                    <option value="2.5em" ${iconSize === '2.5em' ? 'selected' : ''}>Дуже великий</option>  
                </select>  
            </div>  
        </div>`);  
          
        sizeItem.find('select').on('change', function() {  
            const newSize = $(this).val();  
            Lampa.Storage.set('button_manager_icon_size', newSize);  
            updateButtons();  
        });  
          
        list.append(sizeItem);  
          
        // Налаштування розділення кнопок  
        const splitItem = $(`<div class="settings-param selector">  
            <div class="settings-param__name">Розділити кнопки</div>  
            <div class="settings-param__value"></div>  
        </div>`);  
          
        const splitValue = Lampa.Storage.get('button_manager_split', false);  
        splitItem.find('.settings-param__value').text(splitValue ? 'Так' : 'Ні');  
          
        splitItem.on('hover:enter', function() {  
            const newValue = !splitValue;  
            Lampa.Storage.set('button_manager_split', newValue);  
            $(this).find('.settings-param__value').text(newValue ? 'Так' : 'Ні');  
              
            // Застосовуємо зміни  
            $('.full-start-new__buttons, .full-start__buttons').each(function() {  
                applyButtonVisibility($(this));  
            });  
        });  
          
        list.append(splitItem);  
          
        // Кнопка скидання налаштувань  
        const resetItem = $(`<div class="settings-param selector">  
            <div class="settings-param__name">Скинути налаштування</div>  
            <div class="settings-param__value"></div>  
        </div>`);  
          
        resetItem.on('hover:enter', function() {  
            Lampa.Storage.set('button_manager_colors', {  
                online: '#2196f3',  
                torrent: 'lime',  
                trailer: '#f44336',  
                play: '#2196f3'  
            });  
            Lampa.Storage.set('button_manager_icon_size', '1.5em');  
            Lampa.Storage.set('button_manager_split', false);  
            Lampa.Storage.set('button_manager_hidden', []);  
            Lampa.Storage.set('button_manager_order', ['play', 'online', 'torrent', 'trailer']);  
              
            updateButtons();  
              
            // Закриваємо модальне вікно  
            Lampa.Modal.close();  
            Lampa.Controller.toggle('settings_component');  
              
            Lampa.Noty.show('Налаштування скинуто');  
        });  
          
        list.append(resetItem);  
          
        Lampa.Modal.open({  
            title: 'Стилі кнопок',  
            html: list,  
            size: 'small',  
            scroll_to_center: true,  
            onBack: () => {  
                Lampa.Modal.close();  
                Lampa.Controller.toggle('settings_component');  
            }  
        });  
    }  
      
    // Додавання стилів для редактора кнопок  
    function addEditorStyles() {  
        if (!document.getElementById('button-editor-styles')) {  
            const style = document.createElement('style');  
            style.id = 'button-editor-styles';  
            style.textContent = `  
                .menu-edit-list__item {  
                    display: flex !important;  
                    padding: 0.3em !important;  
                    border-radius: 0.3em !important;  
                    align-items: center !important;  
                }  
                  
                .menu-edit-list__item:nth-child(even) {  
                    background: rgba(255, 255, 255, 0.1) !important;  
                }  
                  
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
                  
                .menu-edit-list__icon > svg {  
                    width: 1.4em !important;  
                    height: 1.4em !important;  
                }  
                  
                .menu-edit-list__title {  
                    font-size: 1.3em !important;  
                    font-weight: 300 !important;  
                    line-height: 1.2 !important;  
                    flex-grow: 1 !important;  
                }  
                  
                .menu-edit-list__move,  
                .menu-edit-list__toggle {  
                    width: 2.4em !important;  
                    height: 2.4em !important;  
                    display: flex !important;  
                    align-items: center !important;  
                    justify-content: center !important;  
                }  
                  
                .menu-edit-list__move svg {  
                    width: 1em !important;  
                    height: 1em !important;  
                }  
                  
                .menu-edit-list__toggle svg {  
                    width: 1.2em !important;  
                    height: 1.2em !important;  
                }  
                  
                .menu-edit-list__move.focus,  
                .menu-edit-list__toggle.focus {  
                    background: rgba(255, 255, 255, 1) !important;  
                    border-radius: 0.3em !important;  
                    color: #000 !important;  
                }  
                  
                .settings-param-list {  
                    padding: 1em;  
                }  
                  
                .settings-param {  
                    display: flex;  
                    align-items: center;  
                    padding: 0.8em;  
                    border-radius: 0.3em;  
                    margin-bottom: 0.5em;  
                }  
                  
                .settings-param:nth-child(even) {  
                    background: rgba(255, 255, 255, 0.1);  
                }  
                  
                .settings-param__name {  
                    flex-grow: 1;  
                    font-size: 1.1em;  
                }  
                  
                .settings-param__value {  
                    margin-left: 1em;  
                }  
            `;  
            document.head.appendChild(style);  
        }  
    }
    // Додавання компонента в меню налаштувань  
    function addSettings() {  
        // Додаємо переклади для нашого плагіна  
        Lampa.Lang.add({  
            button_manager_title: {  
                ru: 'Менеджер кнопок',  
                uk: 'Менеджер кнопок',  
                en: 'Button Manager'  
            },  
            button_manager_edit: {  
                ru: 'Редактировать кнопки',  
                uk: 'Редагувати кнопки',  
                en: 'Edit Buttons'  
            },  
            button_manager_styles: {  
                ru: 'Стили кнопок',  
                uk: 'Стилі кнопок',  
                en: 'Button Styles'  
            }  
        });  
          
        // Додаємо компонент в налаштування  
        Lampa.SettingsApi.addComponent({  
            component: 'button_manager',  
            icon: `<svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">  
                <rect x="2" y="2" width="26" height="25" rx="3" stroke="currentColor" stroke-width="2"/>  
                <circle cx="8" cy="8" r="2" fill="currentColor"/>  
                <circle cx="15" cy="8" r="2" fill="currentColor"/>  
                <circle cx="22" cy="8" r="2" fill="currentColor"/>  
                <circle cx="8" cy="14.5" r="2" fill="currentColor"/>  
                <circle cx="15" cy="14.5" r="2" fill="currentColor"/>  
                <circle cx="22" cy="14.5" r="2" fill="currentColor"/>  
                <circle cx="8" cy="21" r="2" fill="currentColor"/>  
                <circle cx="15" cy="21" r="2" fill="currentColor"/>  
                <circle cx="22" cy="21" r="2" fill="currentColor"/>  
            </svg>`,  
            name: Lampa.Lang.translate('button_manager_title')  
        });  
          
        // Додаємо параметр для редагування кнопок  
        Lampa.SettingsApi.addParam({  
            component: 'button_manager',  
            param: {  
                name: 'edit_buttons',  
                type: 'button',  
            },  
            field: {  
                name: Lampa.Lang.translate('button_manager_edit'),  
            },  
            onChange: editButtons  
        });  
          
        // Додаємо параметр для редагування стилів  
        Lampa.SettingsApi.addParam({  
            component: 'button_manager',  
            param: {  
                name: 'edit_styles',  
                type: 'button',  
            },  
            field: {  
                name: Lampa.Lang.translate('button_manager_styles'),  
            },  
            onChange: editButtonStyles  
        });  
    }  
      
    // Ініціалізація плагіна  
    function initializePlugin() {  
        // Перевіряємо, чи готовий Lampa  
        if (typeof Lampa === 'undefined') {  
            setTimeout(initializePlugin, 100);  
            return;  
        }  
          
        // Додаємо стилі для редактора  
        addEditorStyles();  
          
        // Додаємо компонент в налаштування  
        addSettings();  
          
        // Ініціалізуємо основний функціонал  
        initPlugin();  
          
        console.log(`${PLUGIN_NAME}: Плагін успішно ініціалізовано`);  
    }  
      
    // Запуск плагіна  
    function startPlugin() {  
        if (window.plugin_button_manager_ready) return;  
          
        window.plugin_button_manager_ready = true;  
          
        // Реєстрація плагіна в системі  
        if (window.plugin) {  
            window.plugin('button_manager', {  
                type: 'component',  
                name: 'Button Manager',  
                version: '1.0.0',  
                author: 'Custom Plugin',  
                description: 'Менеджер кнопок з налаштуваннями стилів та порядку'  
            });  
        }  
          
        // Запускаємо ініціалізацію  
        if (window.appready) {  
            initializePlugin();  
        } else {  
            Lampa.Listener.follow('app', function (e) {  
                if (e.type === 'ready') {  
                    initializePlugin();  
                }  
            });  
        }  
    }  
      
    // Запускаємо плагін  
    startPlugin();  
      
    // Експортуємо функції для можливості зовнішнього використання  
    window.ButtonManager = {  
        updateButtons: updateButtons,  
        processButtons: processButtons,  
        editButtons: editButtons,  
        editButtonStyles: editButtonStyles  
    };  
      
})();