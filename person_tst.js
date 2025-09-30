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
    var PAGE_SIZE = 20;
    var DEFAULT_PERSON_IDS = [];
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

    function error() {
        if (my_logging && console && console.error) {
            try {
                console.error.apply(console, arguments);
            } catch (e) {}
        }
    }

    function getCurrentLanguage() {
        return localStorage.getItem('language') || 'en';
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

        if (index === -1) personIds.push(personId);
        else personIds.splice(index, 1);

        Lampa.Storage.set(PERSONS_KEY, personIds);
        return index === -1;
    }

    function isPersonsubscriibbed(personId) {
        return getPersonIds().includes(personId);
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
            var wasAdded = togglePersonSubscription(currentPersonId);
            var newText = wasAdded ?
                Lampa.Lang.translate('persons_plugin_unsubscriibbe') :
                Lampa.Lang.translate('persons_plugin_subscriibbe');

            button.classList.remove('button--subscriibbe', 'button--unsubscriibbe');
            button.classList.add(wasAdded ? 'button--unsubscriibbe' : 'button--subscriibbe');

            var span = button.querySelector('span');
            if (span) span.textContent = newText;
            updatePersonsList();
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

    function updatePersonsList() {
        var activity = Lampa.Activity.active();
        if (activity && activity.component === 'category_full' && activity.source === PLUGIN_NAME) {
            Lampa.Activity.reload();
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
            }`;
        var style = document.createElement('style');
        style.id = 'subscriibbe-button-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // Функція для створення власної сторінки актора
    function createCustomPersonPage(personId, personName) {
        log('Creating custom person page for:', personId, personName);
        
        // Створюємо власну активність для сторінки актора
        Lampa.Activity.push({
            component: 'person_custom',
            id: personId,
            name: personName,
            source: 'tmdb',
            url: 'person_custom_' + personId
        });
    }

    // Компонент для власної сторінки актора
    function setupCustomPersonComponent() {
        Lampa.Component.add('person_custom', {
            template: `
            <div class="person-custom">
                <div class="person-custom__header">
                    <div class="person-custom__back selector" data-focusable="true" data-action="back">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="person-custom__title">{{name}}</div>
                </div>
                <div class="person-custom__content">
                    <div class="person-custom__loading" v-if="loading">Завантаження...</div>
                    <div class="person-custom__error" v-if="error">Помилка завантаження</div>
                    <div class="person-custom__info" v-if="personInfo && !loading">
                        <div class="person-custom__poster">
                            <img :src="getImageUrl(personInfo.profile_path)" :alt="personInfo.name" onerror="this.src='/img/person_empty.png'">
                        </div>
                        <div class="person-custom__details">
                            <h1 class="person-custom__name">{{personInfo.name}}</h1>
                            <div class="person-custom__department" v-if="personInfo.known_for_department">
                                {{personInfo.known_for_department}}
                            </div>
                            <div class="person-custom__biography" v-if="personInfo.biography">
                                <h3>Біографія</h3>
                                <p>{{personInfo.biography}}</p>
                            </div>
                            <div class="person-custom__movies" v-if="movies.length > 0">
                                <h3>Відомі роботи</h3>
                                <div class="person-custom__movies-list">
                                    <div class="person-custom__movie" v-for="movie in movies" :key="movie.id">
                                        <div class="person-custom__movie-poster">
                                            <img :src="getImageUrl(movie.poster_path, 'w185')" :alt="movie.title" onerror="this.src='/img/poster_empty.png'">
                                        </div>
                                        <div class="person-custom__movie-info">
                                            <div class="person-custom__movie-title">{{movie.title || movie.name}}</div>
                                            <div class="person-custom__movie-character" v-if="movie.character">
                                                як {{movie.character}}
                                            </div>
                                            <div class="person-custom__movie-job" v-if="movie.job">
                                                {{movie.job}}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `,
            data: function() {
                return {
                    loading: true,
                    error: false,
                    personInfo: null,
                    movies: []
                };
            },
            methods: {
                getImageUrl: function(path, size) {
                    if (!path) return '/img/person_empty.png';
                    size = size || 'w500';
                    return Lampa.TMDB.image(size + path);
                },
                loadPersonData: function() {
                    var self = this;
                    var personId = this.$activity.object.id;
                    var currentLang = getCurrentLanguage();
                    
                    self.loading = true;
                    self.error = false;
                    
                    // Завантажуємо основну інформацію про актора
                    var personUrl = Lampa.TMDB.api('person/' + personId + '?api_key=' + Lampa.TMDB.key() + '&language=' + currentLang);
                    var moviesUrl = Lampa.TMDB.api('person/' + personId + '/combined_credits?api_key=' + Lampa.TMDB.key() + '&language=' + currentLang);
                    
                    Promise.all([
                        new Promise(function(resolve, reject) {
                            new Lampa.Reguest().silent(personUrl, resolve, reject);
                        }),
                        new Promise(function(resolve, reject) {
                            new Lampa.Reguest().silent(moviesUrl, resolve, reject);
                        })
                    ]).then(function(responses) {
                        try {
                            var personData = typeof responses[0] === 'string' ? JSON.parse(responses[0]) : responses[0];
                            var moviesData = typeof responses[1] === 'string' ? JSON.parse(responses[1]) : responses[1];
                            
                            self.personInfo = personData;
                            
                            // Беремо топ 10 найпопулярніших робіт
                            var allWorks = (moviesData.cast || []).concat(moviesData.crew || []);
                            allWorks.sort(function(a, b) {
                                return (b.popularity || 0) - (a.popularity || 0);
                            });
                            self.movies = allWorks.slice(0, 10);
                            
                        } catch (e) {
                            self.error = true;
                            log('Error parsing person data:', e);
                        }
                        self.loading = false;
                    }).catch(function(error) {
                        self.error = true;
                        self.loading = false;
                        log('Error loading person data:', error);
                    });
                }
            },
            on: {
                create: function() {
                    this.loadPersonData();
                },
                back: function() {
                    Lampa.Activity.back();
                }
            }
        });
    }

    function PersonsService() {
        var self = this;
        var cache = {};

        this.list = function (params, onComplete) {
            var page = parseInt(params.page, 10) || 1;
            var startIndex = (page - 1) * PAGE_SIZE;
            var endIndex = startIndex + PAGE_SIZE;
            var personIds = getPersonIds();
            var pageIds = personIds.slice(startIndex, endIndex);

            if (pageIds.length === 0) {
                onComplete({
                    results: [],
                    page: page,
                    total_pages: Math.ceil(personIds.length / PAGE_SIZE),
                    total_results: personIds.length
                });
                return;
            }

            var loaded = 0;
            var results = [];
            var currentLang = getCurrentLanguage();

            for (var i = 0; i < pageIds.length; i++) {
                (function (i) {
                    var personId = pageIds[i];
                    if (cache[personId]) {
                        results.push(cache[personId]);
                        checkComplete();
                        return;
                    }

                    var url = Lampa.TMDB.api(`person/${personId}?api_key=${Lampa.TMDB.key()}&language=${currentLang}`);
                    new Lampa.Reguest().silent(url, function (response) {
                        try {
                            var json = typeof response === 'string' ? JSON.parse(response) : response;
                            if (json && json.id) {
                                var personCard = {
                                    id: json.id,
                                    title: json.name,
                                    name: json.name,
                                    poster_path: json.profile_path,
                                    type: "person",
                                    source: "tmdb",
                                    media_type: "person",
                                    profile_path: json.profile_path,
                                    known_for_department: json.known_for_department
                                };
                                cache[personId] = personCard;
                                results.push(personCard);
                            }
                        } catch (e) { 
                            log('Error loading person:', e);
                        }
                        checkComplete();
                    }, function () {
                        checkComplete();
                    });
                })(i);
            }

            function checkComplete() {
                loaded++;
                if (loaded >= pageIds.length) {
                    onComplete({
                        results: results.filter(Boolean),
                        page: page,
                        total_pages: Math.ceil(personIds.length / PAGE_SIZE),
                        total_results: personIds.length
                    });
                }
            }
        };
    }

    // Обробник кліків для карток акторів
    function setupCardClickHandler() {
        // Додаємо обробник для всіх карток у нашому плагіні
        $(document).on('hover:enter', '.category-full .card', function(e) {
            var card = $(this);
            var personId = card.attr('data-id');
            
            // Перевіряємо чи це наша категорія
            var activity = Lampa.Activity.active();
            if (activity && activity.source === PLUGIN_NAME && personId) {
                e.preventDefault();
                e.stopPropagation();
                
                var personName = card.attr('data-name') || card.find('.card__title').text() || 'Actor';
                
                log('Opening custom person page:', personId, personName);
                
                // Відкриваємо власну сторінку актора
                createCustomPersonPage(personId, personName);
                
                return false;
            }
        });
    }

    function startPlugin() {
        hideSubscribeButton();

        // Реєструємо переклади
        Lampa.Lang.add({
            persons_plugin_title: pluginTranslations.persons_title,
            persons_plugin_subscriibbe: pluginTranslations.subscriibbe,
            persons_plugin_unsubscriibbe: pluginTranslations.unsubscriibbe,
            persons_plugin_not_found: pluginTranslations.persons_not_found,
        });

        // Реєструємо власний компонент для сторінки актора
        setupCustomPersonComponent();

        initStorage();

        var personsService = new PersonsService();
        Lampa.Api.sources[PLUGIN_NAME] = personsService;

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
            } else if (e.type === 'resume' && e.component === 'category_full' && e.object?.source === PLUGIN_NAME) {
                setTimeout(() => Lampa.Activity.reload(), 100);
            }
        });

        // Додаємо обробник кліків для карток акторів
        setupCardClickHandler();
        
        setTimeout(checkCurrentActivity, 1500);
        addButtonStyles();
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();