(function() {
    "use strict";

    // ==== ПРИХОВАННЯ СТАНДАРТНОЇ КНОПКИ "ПІДПИСАТИСЯ" ====
    function hideSubscribeButton() {
        if (document.getElementById('hide-subscribe-style')) return;

        const css = `.button--subscribe { display: none !important; }`;
        const style = document.createElement('style');
        style.id = 'hide-subscribe-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==== ОСНОВНА ЛОГІКА ====
    const PLUGIN_NAME = "persons_plugin";
    const PERSONS_KEY = "saved_persons";
    const DEFAULT_PERSONS_DATA = { cards: {}, ids: [] };
    let currentPersonId = null;

    const pluginTranslations = {
        persons_title: {
            ru: "Персоны", en: "Persons", uk: "Персони", be: "Асобы", pt: "Pessoas", zh: "人物", he: "אנשים", cs: "Osobnosti", bg: "Личности"
        },
        subscriibbe: {
            ru: "Подписаться", en: "Subscribe", uk: "Підписатися", be: "Падпісацца", pt: "Inscrever", zh: "订阅", he: "הירשם", cs: "Přihlásit se", bg: "Абонирай се"
        },
        unsubscriibbe: {
            ru: "Отписаться", en: "Unsubscribe", uk: "Відписатися", be: "Адпісацца", pt: "Cancelar inscrição", zh: "退订", he: "בטל מנוי", cs: "Odhlásit se", bg: "Отписване"
        },
        persons_not_found: {
            ru: "Персоны не найдены", en: "No persons found", uk: "Особи не знайдені", be: "Асобы не знойдзены", pt: "Nenhuma pessoa encontrada", zh: "未找到人物", he: "לא נמצאו אנשים", cs: "Nebyly nalezeny žádné osoby", bg: "Не са намерени хора"
        }
    };

    const ICON_SVG = '<svg height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/></svg>';

    // ==== СХОВИЩЕ ====
    function initStorage() {
        const current = Lampa.Storage.get(PERSONS_KEY);
        if (!current || !current.cards) {
            Lampa.Storage.set(PERSONS_KEY, DEFAULT_PERSONS_DATA);
        }
    }

    function getPersonsData() {
        return Lampa.Storage.get(PERSONS_KEY, DEFAULT_PERSONS_DATA);
    }

    function savePersonCard(personId, personData) {
        const saved = getPersonsData();
        saved.cards[personId] = personData;
        if (!saved.ids.includes(personId)) saved.ids.push(personId);
        Lampa.Storage.set(PERSONS_KEY, saved);
    }

    function removePersonCard(personId) {
        const saved = getPersonsData();
        delete saved.cards[personId];
        saved.ids = saved.ids.filter(id => id !== personId);
        Lampa.Storage.set(PERSONS_KEY, saved);
    }

    function togglePersonSubscription(personId) {
        const saved = getPersonsData();
        const index = saved.ids.indexOf(personId);

        if (index === -1) {
            const lang = localStorage.getItem('language') || 'en';
            const url = Lampa.TMDB.api(`person/${personId}?api_key=${Lampa.TMDB.key()}&language=${lang}`);
            
            new Lampa.Reguest().silent(url, function (resp) {
                try {
                    const json = typeof resp === 'string' ? JSON.parse(resp) : resp;
                    if (json && json.id) {
                        savePersonCard(personId, json);
                        updatePersonsList();
                    }
                } catch (e) {
                    console.error('Error saving person:', e);
                }
            });
            return true;
        } else {
            removePersonCard(personId);
            updatePersonsList();
            return false;
        }
    }

    function isPersonsubscriibbed(personId) {
        return getPersonsData().ids.includes(personId);
    }

    // ==== КНОПКА ====
    function addButtonToContainer(container) {
        const existing = container.querySelector('.button--subscriibbe-plugin');
        if (existing) existing.remove();

        const issubs = isPersonsubscriibbed(currentPersonId);
        const buttonText = issubs ? Lampa.Lang.translate('persons_plugin_unsubscriibbe') : Lampa.Lang.translate('persons_plugin_subscriibbe');

        const btn = document.createElement('div');
        btn.className = 'full-start__button selector button--subscriibbe-plugin';
        btn.classList.add(issubs ? 'button--unsubscriibbe' : 'button--subscriibbe');
        btn.innerHTML = `<span>${buttonText}</span>`;

        btn.addEventListener('hover:enter', function() {
            const added = togglePersonSubscription(currentPersonId);
            const text = added ? Lampa.Lang.translate('persons_plugin_unsubscriibbe') : Lampa.Lang.translate('persons_plugin_subscriibbe');
            btn.classList.toggle('button--unsubscriibbe', added);
            btn.classList.toggle('button--subscriibbe', !added);
            btn.querySelector('span').textContent = text;
        });

        const buttonsContainer = container.querySelector('.full-start__buttons');
        (buttonsContainer || container).append(btn);
    }

    function addsubscriibbeButton() {
        if (!currentPersonId) return;
        const bottom = document.querySelector('.person-start__bottom');
        if (bottom) addButtonToContainer(bottom);
        else setTimeout(addsubscriibbeButton, 300);
    }

    function updatePersonsList() {
        const act = Lampa.Activity.active();
        if (act && act.component === 'category_full' && act.source === PLUGIN_NAME) {
            Lampa.Activity.reload();
        }
    }

    // ==== PersonsService (спрощений, стабільний) ====
    function PersonsService() {
        this.list = function(params, onComplete) {
            const savedPersons = getPersonsData();
            const results = [];

            savedPersons.ids.forEach(function(personId) {
                const card = savedPersons.cards[personId];
                if (card) {
                    const modified = Object.assign({}, card);
                    modified.gender = card.gender || 2;
                    modified.id = parseInt(personId, 10);
                    modified.source = 'tmdb';

                    // 🧩 ВАЖЛИВО: прибираємо поля, що плутають логіку
                    delete modified.media_type;
                    delete modified.name;
                    modified.title = card.name;

                    results.push(modified);
                }
            });

            onComplete({
                results: results,
                page: 1,
                total_pages: 1,
                total_results: results.length
            });
        };
    }

    // ==== ІНІЦІАЛІЗАЦІЯ ====
    function startPlugin() {
        hideSubscribeButton();
        Lampa.Lang.add({
            persons_plugin_title: pluginTranslations.persons_title,
            persons_plugin_subscriibbe: pluginTranslations.subscriibbe,
            persons_plugin_unsubscriibbe: pluginTranslations.unsubscriibbe,
            persons_plugin_not_found: pluginTranslations.persons_not_found,
        });

        initStorage();

        const personsService = new PersonsService();
        Lampa.Api.sources[PLUGIN_NAME] = personsService;

        const menuItem = $(
            `<li class="menu__item selector" data-action="${PLUGIN_NAME}">
                <div class="menu__ico">${ICON_SVG}</div>
                <div class="menu__text">${Lampa.Lang.translate('persons_plugin_title')}</div>
            </li>`
        );

        menuItem.on("hover:enter", function() {
            Lampa.Activity.push({
                component: "category_full",
                source: PLUGIN_NAME,
                title: Lampa.Lang.translate('persons_plugin_title'),
                page: 1,
                url: PLUGIN_NAME + "__main"
            });
        });

        $(".menu .menu__list").eq(0).append(menuItem);

        function waitForContainer(callback) {
            let tries = 0;
            (function check() {
                if (document.querySelector('.person-start__bottom')) callback();
                else if (++tries < 15) setTimeout(check, 200);
            })();
        }

        function checkCurrentActivity() {
            const activity = Lampa.Activity.active();
            if (activity && activity.component === 'actor') {
                currentPersonId = parseInt(activity.id || activity.params?.id, 10);
                if (currentPersonId) waitForContainer(addsubscriibbeButton);
            }
        }

        Lampa.Listener.follow('activity', function(e) {
            if (e.type === 'start' && e.component === 'actor' && e.object?.id) {
                currentPersonId = parseInt(e.object.id, 10);
                waitForContainer(addsubscriibbeButton);
            } else if (e.type === 'resume' && e.component === 'category_full' && e.object?.source === PLUGIN_NAME) {
                setTimeout(() => Lampa.Activity.reload(), 100);
            }
        });

        setTimeout(checkCurrentActivity, 1500);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', e => e.type === 'ready' && startPlugin());
})();
