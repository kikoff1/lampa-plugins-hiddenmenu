(function () {
    "use strict";

    // ==== ПРИХОВАННЯ СТАНДАРТНОЇ КНОПКИ "SUBSCRIBE" ====
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

    // ==== КОНСТАНТИ ====
    const PLUGIN_NAME = "persons_plugin";
    const PERSONS_KEY = "saved_persons";
    const DEFAULT_PERSONS_DATA = { cards: {}, ids: [] };
    let currentPersonId = null;
    let personsCache = null;
    const my_logging = true;

    // ==== ПЕРЕКЛАДИ ====
    const pluginTranslations = {
        persons_title: {
            ru: "Персоны", en: "Persons", uk: "Персони", be: "Асобы",
            pt: "Pessoas", zh: "人物", he: "אנשים", cs: "Osobnosti", bg: "Личности"
        },
        subscriibbe: {
            ru: "Подписаться", en: "Subscriibbe", uk: "Підписатися", be: "Падпісацца",
            pt: "Inscrever", zh: "订阅", he: "הירשם", cs: "Přihlásit se", bg: "Абонирай се"
        },
        unsubscriibbe: {
            ru: "Отписаться", en: "Unsubscriibbe", uk: "Відписатися", be: "Адпісацца",
            pt: "Cancelar inscrição", zh: "退订", he: "בטל מנוי", cs: "Odhlásit se", bg: "Отписване"
        },
        persons_not_found: {
            ru: "Персоны не найдены", en: "No persons found", uk: "Особи не знайдені", be: "Асобы не знойдзены",
            pt: "Nenhuma pessoa encontrada", zh: "未找到人物", he: "לא נמצאו אנשים", cs: "Nebyly nalezeny žádné osoby", bg: "Не са намерени хора"
        }
    };

    const ICON_SVG = `
        <svg height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/>
        </svg>
    `;

    // ==== ЛОГИ ====
    function log(...args) {
        if (my_logging) console.log('[PersonsPlugin]', ...args);
    }
    function error(...args) {
        if (my_logging) console.error('[PersonsPlugin]', ...args);
    }

    // ==== ДАНІ ====
    function getCurrentLanguage() {
        return localStorage.getItem('language') || 'en';
    }

    function initStorage() {
        const current = Lampa.Storage.get(PERSONS_KEY);
        if (!current || !current.cards) {
            Lampa.Storage.set(PERSONS_KEY, DEFAULT_PERSONS_DATA);
        }
    }

    function getPersonsData() {
        if (!personsCache) personsCache = Lampa.Storage.get(PERSONS_KEY, DEFAULT_PERSONS_DATA);
        return personsCache;
    }

    function savePersonsData(data) {
        personsCache = data;
        Lampa.Storage.set(PERSONS_KEY, data);
    }

    function savePersonCard(personId, personData) {
        const savedPersons = getPersonsData();
        savedPersons.cards[personId] = personData;

        if (!savedPersons.ids.includes(personId)) {
            savedPersons.ids.push(personId);
        }

        savePersonsData(savedPersons);
    }

    function removePersonCard(personId) {
        const savedPersons = getPersonsData();
        delete savedPersons.cards[personId];
        savedPersons.ids = savedPersons.ids.filter(id => id !== personId);

        savePersonsData(savedPersons);
    }

    function isPersonSubscriibbed(personId) {
        return getPersonsData().ids.includes(personId);
    }

    function togglePersonSubscription(personId, button) {
        const savedPersons = getPersonsData();
        const index = savedPersons.ids.indexOf(personId);

        if (index === -1) {
            const currentLang = getCurrentLanguage();
            const url = Lampa.TMDB.api(`person/${personId}?api_key=${Lampa.TMDB.key()}&language=${currentLang}`);

            new Lampa.Reguest().silent(url, (response) => {
                try {
                    const json = typeof response === 'string' ? JSON.parse(response) : response;
                    if (json && json.id) {
                        savePersonCard(personId, json);
                        updatePersonsList();
                        updateButtonUI(button, true);
                    } else {
                        error('Invalid person data', json);
                    }
                } catch (e) {
                    error('Error saving person data:', e);
                }
            });

            return true;
        } else {
            removePersonCard(personId);
            updatePersonsList();
            updateButtonUI(button, false);
            return false;
        }
    }

    // ==== КНОПКИ ====
    function updateButtonUI(button, subscribed) {
        const newText = subscribed
            ? Lampa.Lang.translate('persons_plugin_unsubscriibbe')
            : Lampa.Lang.translate('persons_plugin_subscriibbe');

        button.classList.remove('subscriibbe', 'unsubscriibbe');
        button.classList.add(subscribed ? 'unsubscriibbe' : 'subscriibbe');
        button.setAttribute('aria-label', newText);

        const span = button.querySelector('span');
        if (span) span.textContent = newText;
    }

    function createSubscriibbeButton() {
        const issubscriibbed = isPersonSubscriibbed(currentPersonId);
        const buttonText = issubscriibbed
            ? Lampa.Lang.translate('persons_plugin_unsubscriibbe')
            : Lampa.Lang.translate('persons_plugin_subscriibbe');

        const button = document.createElement('div');
        button.className = 'full-start__button selector button--persons-plugin';
        button.classList.add(issubscriibbed ? 'unsubscriibbe' : 'subscriibbe');
        button.setAttribute('data-focusable', 'true');
        button.setAttribute('aria-label', buttonText);

        button.innerHTML = `
            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"></path>
                <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5" fill="transparent"></path>
            </svg>
            <span>${buttonText}</span>
        `;

        button.addEventListener('hover:enter', () => togglePersonSubscription(currentPersonId, button));

        return button;
    }

    function addSubscriibbeButton(container) {
        const existing = container.querySelector('.button--persons-plugin');
        if (existing) existing.remove();
        container.append(createSubscriibbeButton());
    }

    function waitForContainer(callback) {
        const observer = new MutationObserver(() => {
            const container = document.querySelector('.person-start__bottom');
            if (container) {
                observer.disconnect();
                callback(container);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // ==== СПИСОК ПЕРСОН ====
    function updatePersonsList() {
        const activity = Lampa.Activity.active();
        if (activity && activity.component === 'category_full' && activity.source === PLUGIN_NAME) {
            Lampa.Activity.reload();
        }
    }

    function PersonsService() {
        this.list = function (params, onComplete) {
            const savedPersons = getPersonsData();
            const results = [];

            savedPersons.ids.forEach(personId => {
                const card = savedPersons.cards[personId];
                if (card) {
                    const modifiedCard = { ...card };
                    modifiedCard.click = () => {
                        Lampa.Activity.push({
                            component: 'actor',
                            id: parseInt(personId, 10),
                            title: card.name || 'Actor',
                            source: 'tmdb'
                        });
                    };
                    modifiedCard.component = 'actor';
                    modifiedCard.source = 'tmdb';
                    modifiedCard.type = 'person';

                    results.push(modifiedCard);
                }
            });

            onComplete({
                results,
                page: 1,
                total_pages: 1,
                total_results: results.length
            });
        };
    }

    // ==== СТИЛІ ====
    function addButtonStyles() {
        if (document.getElementById('persons-plugin-styles')) return;

        const css = `
            .button--persons-plugin.subscriibbe { color: #4CAF50; }
            .button--persons-plugin.unsubscriibbe { color: #F44336; }
        `;

        const style = document.createElement('style');
        style.id = 'persons-plugin-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==== ЗАПУСК ====
    function startPlugin() {
        hideSubscribeButton();

        Lampa.Lang.add({
            persons_plugin_title: pluginTranslations.persons_title,
            persons_plugin_subscriibbe: pluginTranslations.subscriibbe,
            persons_plugin_unsubscriibbe: pluginTranslations.unsubscriibbe,
            persons_plugin_not_found: pluginTranslations.persons_not_found,
        });

        initStorage();
        Lampa.Api.sources[PLUGIN_NAME] = new PersonsService();

        // Меню
        const menuItem = $(`
            <li class="menu__item selector" data-action="${PLUGIN_NAME}">
                <div class="menu__ico">${ICON_SVG}</div>
                <div class="menu__text">${Lampa.Lang.translate('persons_plugin_title')}</div>
            </li>
        `);

        menuItem.on("hover:enter", () => {
            Lampa.Activity.push({
                component: "category_full",
                source: PLUGIN_NAME,
                title: Lampa.Lang.translate('persons_plugin_title'),
                page: 1,
                url: PLUGIN_NAME + '__main'
            });
        });

        $(".menu .menu__list").eq(0).append(menuItem);

        // Відслідковуємо активність
        Lampa.Listener.follow('activity', (e) => {
            if (e.type === 'start' && e.component === 'actor' && e.object?.id) {
                currentPersonId = parseInt(e.object.id, 10);
                waitForContainer(addSubscriibbeButton);
            } else if (e.type === 'resume' && e.component === 'category_full' && e.object?.source === PLUGIN_NAME) {
                setTimeout(() => Lampa.Activity.reload(), 100);
            }
        });

        addButtonStyles();
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') startPlugin();
        });
    }

})();