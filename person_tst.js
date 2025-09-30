(function() {
    "use strict";

    // ==== ПРИХОВАННЯ СТАНДАРТНОЇ КНОПКИ "ПІДПИСАТИСЯ" ====
    function hideSubscribeButton() {
        if (document.getElementById('hide-subscribe-style')) return;

        const css = `
            .button--subscribe {
                display: none !important;
            }
        `;

        const style = document.createElement('style');
        style.id = 'hide-subscribe-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==== ОСНОВНА ЛОГІКА ПЛАГІНА ====
    var PLUGIN_NAME = "persons_plugin";
    var PERSONS_KEY = "saved_persons";
    var currentPersonId = null;
    var my_logging = true;

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
        subscriibbe: {
            ru: "Подписаться",
            en: "subscriibbe",
            uk: "Підписатися",
            be: "Падпісацца",
            pt: "Inscrever",
            zh: "订阅",
            he: "הירשם",
            cs: "Přihlásit se",
            bg: "Абонирай се"
        },
        unsubscriibbe: {
            ru: "Отписаться",
            en: "Unsubscriibbe",
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

    var ICON_SVG = '<svg height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/></svg>';

    function log() {
        if (my_logging && console && console.log) {
            try {
                console.log.apply(console, arguments);
            } catch (e) {}
        }
    }

    function getCurrentLanguage() {
        return localStorage.getItem('language') || 'en';
    }

    function initStorage() {
        var current = Lampa.Storage.get(PERSONS_KEY);
        if (!current) {
            Lampa.Storage.set(PERSONS_KEY, []);
        }
    }

    function getSavedPersons() {
        var persons = Lampa.Storage.get(PERSONS_KEY);
        return Array.isArray(persons) ? persons : [];
    }

    function togglePersonSubscription(personId, personName, personPhoto) {
        var persons = getSavedPersons();
        var index = persons.findIndex(function(p) {
            return p.id == personId;
        });

        if (index === -1) {
            persons.push({
                id: personId,
                name: personName,
                photo: personPhoto,
                timestamp: new Date().getTime()
            });
            Lampa.Noty.show('Додано до персон', 'success');
        } else {
            persons.splice(index, 1);
            Lampa.Noty.show('Видалено з персон', 'info');
        }

        Lampa.Storage.set(PERSONS_KEY, persons);
        return index === -1;
    }

    function isPersonsubscriibbed(personId) {
        var persons = getSavedPersons();
        return persons.some(function(p) {
            return p.id == personId;
        });
    }

    function addButtonToContainer(bottomBlock) {
        var existingButton = bottomBlock.querySelector('.button--subscriibbe-plugin');
        if (existingButton && existingButton.parentNode) {
            existingButton.parentNode.removeChild(existingButton);
        }

        var issubscriibbed = isPersonsubscriibbed(currentPersonId);
        var buttonText = issubscriibbed ? 
            Lampa.Lang.translate('persons_plugin_unsubscriibbe') : 
            Lampa.Lang.translate('persons_plugin_subscriibbe');

        var button = document.createElement('div');
        button.className = 'full-start__button selector button--subscriibbe-plugin';
        button.classList.add(issubscriibbed ? 'button--unsubscriibbe' : 'button--subscriibbe');
        button.setAttribute('data-focusable', 'true');

        button.innerHTML =
            '<svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"></path>' +
            '<path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5" fill="transparent"></path>' +
            '</svg>' +
            '<span>' + buttonText + '</span>';

        button.addEventListener('hover:enter', function () {
            var personName = document.querySelector('.person-start__title')?.textContent || 'Actor';
            var personPhoto = document.querySelector('.person-start__poster img')?.src || '';
            
            var wasAdded = togglePersonSubscription(currentPersonId, personName, personPhoto);
            var newText = wasAdded ?
                Lampa.Lang.translate('persons_plugin_unsubscriibbe') :
                Lampa.Lang.translate('persons_plugin_subscriibbe');

            button.classList.remove('button--subscriibbe', 'button--unsubscriibbe');
            button.classList.add(wasAdded ? 'button--unsubscriibbe' : 'button--subscriibbe');

            var span = button.querySelector('span');
            if (span) span.textContent = newText;
        });

        var buttonsContainer = bottomBlock.querySelector('.full-start__buttons');
        if (buttonsContainer) buttonsContainer.append(button);
        else bottomBlock.append(button);
    }

    function addsubscriibbeButton() {
        if (!currentPersonId) return;

        var bottomBlock = document.querySelector('.person-start__bottom');
        if (bottomBlock) addButtonToContainer(bottomBlock);
        else {
            let attempts = 0;
            const maxAttempts = 10;

            function tryAgain() {
                attempts++;
                var container = document.querySelector('.person-start__bottom');
                if (container) addButtonToContainer(container);
                else if (attempts < maxAttempts) setTimeout(tryAgain, 300);
            }

            setTimeout(tryAgain, 300);
        }
    }

    function addButtonStyles() {
        if (document.getElementById('subscriibbe-button-styles')) return;
        var css = `
            .full-start__button.selector.button--subscriibbe-plugin.button--subscriibbe {
                color: #4CAF50;
            }
            .full-start__button.selector.button--subscriibbe-plugin.button--unsubscriibbe {
                color: #F44336;
            }
            .persons-custom-page {
                padding: 20px;
            }
            .persons-custom-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            .person-custom-card {
                border-radius: 10px;
                overflow: hidden;
                background: rgba(255,255,255,0.05);
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .person-custom-card:focus {
                transform: scale(1.05);
                background: rgba(255,255,255,0.1);
                outline: none;
            }
            .person-custom-card__poster {
                width: 100%;
                height: 300px;
                position: relative;
                overflow: hidden;
            }
            .person-custom-card__poster img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .person-custom-card__info {
                padding: 15px;
            }
            .person-custom-card__name {
                font-size: 16px;
                font-weight: bold;
                margin: 0 0 5px 0;
                color: white;
            }
            .person-custom-card__department {
                font-size: 14px;
                color: #aaa;
            }
            .persons-custom-empty {
                text-align: center;
                padding: 50px 20px;
                color: #aaa;
                font-size: 18px;
            }
            .persons-custom-loading {
                text-align: center;
                padding: 50px 20px;
                color: #aaa;
                font-size: 18px;
            }`;
        var style = document.createElement('style');
        style.id = 'subscriibbe-button-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // Власна реалізація сторінки з акторами
    function createPersonsPage() {
        var page = Lampa.Activity.active();
        page.html('');
        page.title(Lampa.Lang.translate('persons_plugin_title'));

        var container = document.createElement('div');
        container.className = 'persons-custom-page';
        
        var loading = document.createElement('div');
        loading.className = 'persons-custom-loading';
        loading.textContent = 'Завантаження...';
        container.appendChild(loading);
        
        page.html(container);

        // Завантажуємо дані акторів
        loadPersonsData(function(persons) {
            container.removeChild(loading);
            
            if (persons.length === 0) {
                var empty = document.createElement('div');
                empty.className = 'persons-custom-empty';
                empty.textContent = Lampa.Lang.translate('persons_plugin_not_found');
                container.appendChild(empty);
                return;
            }
            
            var grid = document.createElement('div');
            grid.className = 'persons-custom-grid';
            
            persons.forEach(function(person) {
                var card = createPersonCard(person);
                grid.appendChild(card);
            });
            
            container.appendChild(grid);
            
            // Налаштовуємо фокус для керування
            setupFocusManagement(grid);
        });
    }

    function loadPersonsData(callback) {
        var savedPersons = getSavedPersons();
        
        if (savedPersons.length === 0) {
            callback([]);
            return;
        }
        
        var currentLang = getCurrentLanguage();
        var loaded = 0;
        var personsData = [];
        
        savedPersons.forEach(function(savedPerson) {
            var url = Lampa.TMDB.api('person/' + savedPerson.id + '?api_key=' + Lampa.TMDB.key() + '&language=' + currentLang);
            
            new Lampa.Reguest().silent(url, function(response) {
                try {
                    var json = typeof response === 'string' ? JSON.parse(response) : response;
                    if (json && json.id) {
                        personsData.push({
                            id: json.id,
                            name: json.name || savedPerson.name,
                            profile_path: json.profile_path,
                            known_for_department: json.known_for_department,
                            photo: savedPerson.photo
                        });
                    }
                } catch (e) {
                    // Використовуємо збережені дані
                    personsData.push({
                        id: savedPerson.id,
                        name: savedPerson.name,
                        profile_path: null,
                        known_for_department: 'Actor',
                        photo: savedPerson.photo
                    });
                }
                
                loaded++;
                if (loaded >= savedPersons.length) {
                    callback(personsData);
                }
            }, function(error) {
                // Використовуємо збережені дані
                personsData.push({
                    id: savedPerson.id,
                    name: savedPerson.name,
                    profile_path: null,
                    known_for_department: 'Actor',
                    photo: savedPerson.photo
                });
                
                loaded++;
                if (loaded >= savedPersons.length) {
                    callback(personsData);
                }
            });
        });
    }

    function createPersonCard(person) {
        var card = document.createElement('div');
        card.className = 'person-custom-card selector';
        card.setAttribute('data-focusable', 'true');
        card.setAttribute('tabindex', '0');
        card.setAttribute('data-person-id', person.id);
        card.setAttribute('data-person-name', person.name);
        
        var poster = document.createElement('div');
        poster.className = 'person-custom-card__poster';
        
        var img = document.createElement('img');
        img.src = getPersonImage(person.photo || person.profile_path);
        img.alt = person.name;
        img.onerror = function() { this.src = '/img/person_empty.png'; };
        
        poster.appendChild(img);
        
        var info = document.createElement('div');
        info.className = 'person-custom-card__info';
        
        var name = document.createElement('div');
        name.className = 'person-custom-card__name';
        name.textContent = person.name;
        
        var department = document.createElement('div');
        department.className = 'person-custom-card__department';
        department.textContent = person.known_for_department || 'Actor';
        
        info.appendChild(name);
        info.appendChild(department);
        
        card.appendChild(poster);
        card.appendChild(info);
        
        // Обробник кліку
        card.addEventListener('hover:enter', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openActorPage(person.id, person.name);
        });
        
        return card;
    }

    function getPersonImage(profilePath) {
        if (!profilePath) return '/img/person_empty.png';
        if (profilePath.includes('http')) return profilePath;
        if (profilePath.includes('/img/')) return profilePath;
        return Lampa.TMDB.image('w500' + profilePath);
    }

    function openActorPage(personId, personName) {
        log('Opening actor page:', personId, personName);
        
        // Використовуємо стандартний спосіб відкриття сторінки актора
        Lampa.Activity.push({
            component: 'actor',
            id: personId,
            name: personName,
            source: 'tmdb'
        });
    }

    function setupFocusManagement(container) {
        var cards = container.querySelectorAll('.person-custom-card');
        var currentFocus = 0;
        
        if (cards.length > 0) {
            cards[0].focus();
        }
        
        // Обробка клавіш навігації
        document.addEventListener('keydown', function(e) {
            if (!container.parentNode) return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    e.preventDefault();
                    navigateGrid(e.key, cards, currentFocus);
                    break;
                case 'Enter':
                    var focused = document.activeElement;
                    if (focused && focused.classList.contains('person-custom-card')) {
                        var personId = focused.getAttribute('data-person-id');
                        var personName = focused.getAttribute('data-person-name');
                        if (personId) {
                            openActorPage(personId, personName);
                        }
                    }
                    break;
            }
        });
    }

    function navigateGrid(direction, cards, currentFocus) {
        // Проста навігація по сітці
        var newFocus = currentFocus;
        
        switch(direction) {
            case 'ArrowRight': newFocus++; break;
            case 'ArrowLeft': newFocus--; break;
            case 'ArrowDown': newFocus += 4; break; // Припускаємо 4 колонки
            case 'ArrowUp': newFocus -= 4; break;
        }
        
        if (newFocus < 0) newFocus = 0;
        if (newFocus >= cards.length) newFocus = cards.length - 1;
        
        cards[newFocus].focus();
        currentFocus = newFocus;
    }

    function startPlugin() {
        hideSubscribeButton();

        Lampa.Lang.add({
            persons_plugin_title: pluginTranslations.persons_title,
            persons_plugin_subscriibbe: pluginTranslations.subscriibbe,
            persons_plugin_unsubscriibbe: pluginTranslations.unsubscriibbe,
            persons_plugin_not_found: pluginTranslations.persons_not_found,
        });

        initStorage();

        var menuItem = $(
            '<li class="menu__item selector" data-action="' + PLUGIN_NAME + '">' +
            '<div class="menu__ico">' + ICON_SVG + '</div>' +
            '<div class="menu__text">' + Lampa.Lang.translate('persons_plugin_title') + '</div>' +
            '</li>'
        );

        menuItem.on("hover:enter", function () {
            // Використовуємо власну реалізацію замість стандартних компонентів
            Lampa.Activity.push({
                component: 'main',
                url: PLUGIN_NAME + '_custom',
                on: createPersonsPage
            });
        });

        $(".menu .menu__list").eq(0).append(menuItem);

        function waitForContainer(callback) {
            let attempts = 0;
            const max = 15;

            function check() {
                attempts++;
                if (document.querySelector('.person-start__bottom')) callback();
                else if (attempts < max) setTimeout(check, 200);
            }

            setTimeout(check, 200);
        }

        function checkCurrentActivity() {
            var activity = Lampa.Activity.active();
            if (activity && activity.component === 'actor') {
                currentPersonId = parseInt(activity.id || activity.params?.id || location.pathname.match(/\/actor\/(\d+)/)?.[1], 10);
                if (currentPersonId) {
                    waitForContainer(addsubscriibbeButton);
                }
            }
        }

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start' && e.component === 'actor' && e.object?.id) {
                currentPersonId = parseInt(e.object.id, 10);
                waitForContainer(addsubscriibbeButton);
            }
        });

        addButtonStyles();
        setTimeout(checkCurrentActivity, 1500);
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();