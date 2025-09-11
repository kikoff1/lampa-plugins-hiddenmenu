!function() {
    "use strict";
    
    // Конфигурация плагина
    var PLUGIN_NAME = "persons_plugin";
    var PERSONS_KEY = "saved_persons";
    var PAGE_SIZE = 20;
    var DEFAULT_PERSON_IDS = [];
    var currentPersonId = null;
    var my_logging = true; // Включить/выключить логирование
    
    // Переводы для плагина
    var pluginTranslations = {
        persons_title: {
            ru: "Персоны",
            en: "Persons",
            uk: "Персони",
            be: "Асобы",
            pt: "Pessoas",
            zh: "人物",
            he: "אנשים",
            cs: "Osobnosti",
            bg: "Личности"
        },
        subscribe: {
            ru: "Подписаться",
            en: "Subscribe",
            uk: "Підписатися",
            be: "Падпісацца",
            pt: "Inscrever",
            zh: "订阅",
            he: "הירשם",
            cs: "Přihlásit se",
            bg: "Абонирай се"
        },
        unsubscribe: {
            ru: "Отписаться",
            en: "Unsubscribe",
            uk: "Відписатися",
            be: "Адпісацца",
            pt: "Cancelar inscrição",
            zh: "退订",
            he: "בטל מנוי",
            cs: "Odhlásit se",
            bg: "Отписване"
        },
        persons_not_found: {
            ru: "Персоны не найдены",
            en: "No persons found",
            uk: "Особи не знайдені",
            be: "Асобы не знойдзены",
            pt: "Nenhuma pessoa encontrada",
            zh: "未找到人物",
            he: "לא נמצאו אנשים",
            cs: "Nebyly nalezeny žádné osoby",
            bg: "Не са намерени хора"
        }
    };
    
    // Иконка для меню
    var ICON_SVG = '<svg height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/></svg>';
    
    // Логирование с проверкой флага
    function log() {
        if (my_logging && console && console.log) {
            try {
                console.log.apply(console, arguments);
            } catch (e) {}
        }
    }
    
    function error() {
        if (my_logging && console && console.error) {
            try {
                console.error.apply(console, arguments);
            } catch (e) {}
        }
    }
    
    // Функции работы с хранилищем
    function getCurrentLanguage() {
        var lang = localStorage.getItem('language');
        return lang || 'en';
    }
    
    function initStorage() {
        var current = Lampa.Storage.get(PERSONS_KEY);
        if (!current || current.length === 0) {
            Lampa.Storage.set(PERSONS_KEY, DEFAULT_PERSON_IDS);
        }
    }
    
    function getPersonIds() {
        return Lampa.Storage.get(PERSONS_KEY, []);
    }
    
    function togglePersonSubscription(personId) {
        var personIds = getPersonIds();
        var index = personIds.indexOf(personId);
        
        if (index === -1) {
            personIds.push(personId);
        } else {
            personIds.splice(index, 1);
        }
        
        Lampa.Storage.set(PERSONS_KEY, personIds);
        return index === -1;
    }
    
    function isPersonSubscribed(personId) {
        var personIds = getPersonIds();
        return personIds.includes(personId);
    }
    
    function addButtonToContainer(bottomBlock) {
        log("[PERSON-PLUGIN] Container found, adding button");
        
        // Удаление существующей кнопки плагина
        var existingButton = bottomBlock.querySelector('.button--subscribe-plugin');
        if (existingButton && existingButton.parentNode) {
            existingButton.parentNode.removeChild(existingButton);
        }
        
        var isSubscribed = isPersonSubscribed(currentPersonId);
        var buttonText = isSubscribed ? 
            Lampa.Lang.translate('persons_plugin_unsubscribe') : 
            Lampa.Lang.translate('persons_plugin_subscribe');
        
        // Создание кнопки плагина
        var button = document.createElement('div');
        button.className = 'full-start__button selector button--subscribe-plugin';
        button.classList.add(isSubscribed ? 'button--unsubscribe' : 'button--subscribe');
        button.setAttribute('data-focusable', 'true');
        
        button.innerHTML = 
            '<svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"></path>' +
                '<path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5" fill="transparent"></path>' +
            '</svg>' +
            '<span>' + buttonText + '</span>';
        
        // Обработчик нажатия
        button.addEventListener('hover:enter', function() {
            var wasAdded = togglePersonSubscription(currentPersonId);
            var newText = wasAdded ? 
                Lampa.Lang.translate('persons_plugin_unsubscribe') : 
                Lampa.Lang.translate('persons_plugin_subscribe');
            
            button.classList.remove('button--subscribe', 'button--unsubscribe');
            button.classList.add(wasAdded ? 'button--unsubscribe' : 'button--subscribe');
            
            var span = button.querySelector('span');
            if (span) span.textContent = newText;
            updatePersonsList();
        });
        
        // Вставка кнопки
        var buttonsContainer = bottomBlock.querySelector('.full-start__buttons');
        if (buttonsContainer) {
            buttonsContainer.append(button);
        } else {
            bottomBlock.append(button);
        }
        
        log("[PERSON-PLUGIN] Button added successfully");
        return button;
    }
    
    function addSubscribeButton() {
        if (!currentPersonId) {
            error("[PERSON-PLUGIN] Cannot add button: currentPersonId is null");
            return;
        }
        
        // Пытаемся найти контейнер
        var bottomBlock = document.querySelector('.person-start__bottom');
        
        if (bottomBlock) {
            addButtonToContainer(bottomBlock);
        } else {
            log("[PERSON-PLUGIN] Waiting for container to appear...");
            
            // Используем setTimeout для проверки появления элемента
            var attempts = 0;
            var interval = setInterval(function() {
                bottomBlock = document.querySelector('.person-start__bottom');
                attempts++;
                if (bottomBlock) {
                    addButtonToContainer(bottomBlock);
                    clearInterval(interval);
                }
                if (attempts > 50) { // после ~5 секунд отменяем попытки
                    clearInterval(interval);
                    error("[PERSON-PLUGIN] Container not found after multiple attempts");
                }
            }, 100);
        }
    }
    
    function updatePersonsList() {
        // Обновление списка персон, если это необходимо
        // Пока заглушка
        log("[PERSON-PLUGIN] Persons list updated");
    }
    
    // Добавление стилей для кнопок плагина
    function addButtonStyles() {
        if (document.getElementById('subscribe-button-styles')) return;
        
        var css = [
            '.full-start__button.selector.button--subscribe-plugin.button--subscribe {',
            '    color: #4CAF50;',
            '}',
            '.full-start__button.selector.button--subscribe-plugin.button--unsubscribe {',
            '    color: #F44336;',
            '}'
        ].join('\n');
        
        var style = document.createElement('style');
        style.id = 'subscribe-button-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }
    
    // Добавление стилей для скрытия старой кнопки "подписаться" без влияния на новую кнопку
    function addHideOldButtonStyles() {
        if (document.getElementById('hide-old-subscribe-style')) return;
        
        var css = `
            /* Скрываем старые кнопки "подписаться", которые не имеют класс .button--subscribe-plugin */
            button.button--subscribe:not(.button--subscribe-plugin),
            .full-start__button.button--subscribe:not(.button--subscribe-plugin) {
                display: none !important;
            }
        `;
        
        var style = document.createElement('style');
        style.id = 'hide-old-subscribe-style';
        style.textContent = css;
        document.head.appendChild(style);
    }
    
    function startPlugin() {
        initStorage();
        
        // Добавляем нужные стили
        addButtonStyles();
        addHideOldButtonStyles();
        
        // Предполагается, что currentPersonId где-то устанавливается, например:
        // currentPersonId = Lampa.Player ? Lampa.Player.personId : null;
        // Для демонстрации просто поставим заглушку:
        currentPersonId = 123; // Пример ID, заменить на реальный
        
        addSubscribeButton();
        
        log("[PERSON-PLUGIN] Plugin started");
    }
    
    // Запускаем плагин после загрузки страницы
    document.addEventListener('DOMContentLoaded', function() {
        startPlugin();
    });
    
}();
