// Головна функція старту плагіна
function startPlugin() {
    hideSubscribeButton();

    // --- 1. Реєстрація перекладів ---
    Lampa.Lang.add({
        persons_plugin_title: pluginTranslations.persons_title,
        persons_plugin_subscriibbe: pluginTranslations.subscriibbe,
        persons_plugin_unsubscriibbe: pluginTranslations.unsubscriibbe,
        persons_plugin_not_found: pluginTranslations.persons_not_found,
    });

    // --- 2. Ініціалізація сховища ---
    initStorage();
    migrateOldData();

    // --- 3. Реєстрація API джерела ---
    var personsService = new PersonsService();
    Lampa.Api.sources[PLUGIN_NAME] = personsService;

    // --- 4. Створення та додавання пункту меню ---
    var menuItem = $(
        '<li class="menu__item selector" data-action="' + PLUGIN_NAME + '">' +
        '<div class="menu__ico">' + ICON_SVG + '</div>' +
        '<div class="menu__text">' + Lampa.Lang.translate('persons_plugin_title') + '</div>' +
        '</li>'
    );

    menuItem.on("hover:enter", function () {
        Lampa.Activity.push({
            component: "category_full",
            source: PLUGIN_NAME,
            title: Lampa.Lang.translate('persons_plugin_title'),
            page: 1,
            url: PLUGIN_NAME + '__main'
        });
    });

    $(".menu .menu__list").eq(0).append(menuItem);

    // --- 5. Додаткові функції для кнопки підписки ---
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

    // --- 6. Слухач активностей ---
    Lampa.Listener.follow('activity', function (e) {
        if (e.type === 'start' && e.component === 'actor' && e.object?.id) {
            currentPersonId = parseInt(e.object.id, 10);
            waitForContainer(addsubscriibbeButton);
        } else if (e.type === 'resume' && e.component === 'category_full' && e.object?.source === PLUGIN_NAME) {
            setTimeout(() => Lampa.Activity.reload(), 100);
        }
    });

    setTimeout(checkCurrentActivity, 1500);
    addButtonStyles();
}

// --- Функція сервісу для персони ---
function PersonsService() {
    var self = this;

    this.list = function (params, onComplete) {
        var savedPersons = getPersonsData();
        var results = [];

        savedPersons.ids.forEach(function(personId) {
            var card = savedPersons.cards[personId];
            if (card) {
                results.push({
                    id: parseInt(personId, 10),
                    name: card.name,
                    profile_path: card.profile_path,
                    gender: card.gender || 0,
                    source: 'tmdb'
                });
            }
        });

        // Повертаємо об’єкт у потрібному форматі
        onComplete({
            results: results,
            page: 1,
            total_pages: 1,
            total_results: results.length
        });
    };
}
