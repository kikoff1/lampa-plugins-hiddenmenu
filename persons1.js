(function () {
    "use strict";

    // ==== Приховати стандартну кнопку "Subscribe" ====
    function hideSubscribeButton() {
        if (document.getElementById('hide-subscribe-style')) return;
        const css = `.button--subscribe { display: none !important; }`;
        const style = document.createElement('style');
        style.id = 'hide-subscribe-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==== Константи ====
    const PLUGIN_NAME = "persons_plugin";
    const PERSONS_KEY = "saved_persons";
    const DEFAULT_PERSONS_DATA = { cards: {}, ids: [] };
    let currentPersonId = null;
    let personsCache = null;
    let my_logging = true;

    const CSS_CLASSES = {
        BUTTON: 'button--persons-plugin',
        SUBSCRIBED: 'unsubscriibbe',
        UNSUBSCRIBED: 'subscriibbe'
    };

    const ICON_SVG = `<svg height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/></svg>`;

    // ==== Локалізація ====
    Lampa.Lang.add({
        persons_plugin_subscribe: {
            ru: "Подписаться", en: "Subscribe", uk: "Підписатися", be: "Падпісацца",
            pt: "Subscrever", zh: "订阅", he: "הירשם", cs: "Odebírat", bg: "Абонирай се"
        },
        persons_plugin_unsubscribe: {
            ru: "Отписаться", en: "Unsubscribe", uk: "Відписатися", be: "Адпісацца",
            pt: "Cancelar subscrição", zh: "取消订阅", he: "בטל הרשמה", cs: "Zrušit odběr", bg: "Отпиши се"
        },
        persons_plugin_title: {
            ru: "Персоны", en: "Persons", uk: "Персони", be: "Асобы",
            pt: "Pessoas", zh: "人物", he: "אנשים", cs: "Osoby", bg: "Хора"
        },
        persons_not_found: {
            ru: "Персоны не найдены", en: "No persons found", uk: "Особи не знайдені", be: "Асобы не знойдзены",
            pt: "Nenhuma pessoa encontrada", zh: "未找到人物", he: "לא נמצאו אנשים", cs: "Nebyly nalezeny žádné osoby", bg: "Не са намерени хора"
        }
    });

    // ==== Логування ====
    function log() { if (my_logging) console.log('[PersonsPlugin]', ...arguments); }
    function error() { if (my_logging) console.error('[PersonsPlugin]', ...arguments); }

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
        const currentLang = getCurrentLanguage();
        const cacheKey = `${PERSONS_KEY}_${currentLang}`;
        if (!personsCache || personsCache.language !== currentLang) {
            personsCache = Lampa.Storage.get(cacheKey, DEFAULT_PERSONS_DATA);
            personsCache.language = currentLang;
        }
        return personsCache;
    }

    function savePersonCard(personId, personData) {
        log('Saving person card:', personId, personData.name);
        const savedPersons = getPersonsData();
        savedPersons.cards[personId] = personData;
        if (!savedPersons.ids.includes(personId)) savedPersons.ids.push(personId);
        Lampa.Storage.set(PERSONS_KEY, savedPersons);
    }

    function removePersonCard(personId) {
        log('Removing person card:', personId);
        const savedPersons = getPersonsData();
        delete savedPersons.cards[personId];
        const index = savedPersons.ids.indexOf(personId);
        if (index !== -1) savedPersons.ids.splice(index, 1);
        Lampa.Storage.set(PERSONS_KEY, savedPersons);
    }

    function isPersonSubscribed(personId) {
        return getPersonsData().ids.includes(personId);
    }

    function updateButtonUI(button, subscribed) {
        if (!button) return;
        const newText = subscribed ?
            Lampa.Lang.translate('persons_plugin_unsubscribe') :
            Lampa.Lang.translate('persons_plugin_subscribe');
        button.classList.remove(CSS_CLASSES.SUBSCRIBED, CSS_CLASSES.UNSUBSCRIBED);
        button.classList.add(subscribed ? CSS_CLASSES.SUBSCRIBED : CSS_CLASSES.UNSUBSCRIBED);
        const span = button.querySelector('span');
        if (span) span.textContent = newText;
    }

    function togglePersonSubscription(personId, button) {
        const subscribed = isPersonSubscribed(personId);
        const currentLang = getCurrentLanguage();
        const url = Lampa.TMDB.api(`person/${personId}?api_key=${Lampa.TMDB.key()}&language=${currentLang}`);

        new Lampa.Reguest().silent(url, (response) => {
            try {
                const json = typeof response === 'string' ? JSON.parse(response) : response;
                if (!json || !json.id) return;
                if (subscribed) removePersonCard(personId);
                else savePersonCard(personId, json);
                updateButtonUI(button, !subscribed);
            } catch (e) {
                error('Error saving person data:', e);
            }
        }, (err) => {
            error('Failed to load person data:', err);
            updateButtonUI(button, subscribed);
        });
    }

    function addButtonStyles() {
        if (document.getElementById('persons-plugin-styles')) return;
        const css = `
            .${CSS_CLASSES.BUTTON}.${CSS_CLASSES.UNSUBSCRIBED} { color: #4CAF50; }
            .${CSS_CLASSES.BUTTON}.${CSS_CLASSES.SUBSCRIBED} { color: #F44336; }`;
        const style = document.createElement('style');
        style.id = 'persons-plugin-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function addButtonToContainer(container) {
        if (!container || !currentPersonId) return;
        const existing = container.querySelector(`.${CSS_CLASSES.BUTTON}`);
        if (existing) existing.remove();

        const subscribed = isPersonSubscribed(currentPersonId);
        const button = document.createElement('div');
        button.className = `full-start__button selector ${CSS_CLASSES.BUTTON} ${subscribed ? CSS_CLASSES.SUBSCRIBED : CSS_CLASSES.UNSUBSCRIBED}`;
        button.setAttribute('data-focusable', 'true');
        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');
        button.innerHTML = `<span>${subscribed ? Lampa.Lang.translate('persons_plugin_unsubscribe') : Lampa.Lang.translate('persons_plugin_subscribe')}</span>`;
        button.addEventListener('hover:enter', () => togglePersonSubscription(currentPersonId, button));

        const defaultBtn = container.querySelector('.full-start__button.button--subscribe');
        if (defaultBtn) defaultBtn.style.display = 'none';
        container.appendChild(button);
    }