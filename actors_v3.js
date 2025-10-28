(function() {
    'use strict';

    // === Налаштування ===
    const API_KEY = 'ВАШ_TMDB_API_KEY'; // ← встав сюди свій API ключ
    const TMDB_URL = 'https://api.themoviedb.org/3/person/popular?language=uk-UA&page=1&api_key=' + API_KEY;

    // === Ініціалізація ===
    Lampa.Plugin.create({
        title: 'Актори',
        id: 'actors_plugin',
        description: 'Додає розділ "Актори" з популярними акторами TMDB',
        version: '1.0.0',
        author: 'ChatGPT',
        onStart: function() {
            // Додаємо пункт у головне меню
            Lampa.Menu.add({
                title: 'Актори',
                icon: 'user-friends', // можна змінити іконку
                action: showActors
            });
        }
    });

    // === Основна функція для показу акторів ===
    function showActors() {
        let page = 1;
        let scroll = new Lampa.Controller.scroll('content');
        let component = new Lampa.Component('actors');
        let items = [];

        component.create = function() {
            let html = $('<div class="layer--width"><div class="content__title"><span>Популярні актори</span></div><div class="content__list"></div></div>');
            component.render().append(html);
            loadActors();
            Lampa.Controller.enable('content');
        };

        component.start = function() {
            Lampa.Activity.active().activity.render(component.render());
            component.create();
        };

        // Завантажуємо акторів
        function loadActors() {
            Lampa.Api.request({
                url: TMDB_URL.replace('page=1', 'page=' + page),
                success: function(result) {
                    if (result && result.results) {
                        let cards = result.results.map(actor => {
                            let img = actor.profile_path 
                                ? 'https://image.tmdb.org/t/p/w300' + actor.profile_path 
                                : './img/noposter.png';

                            return {
                                title: actor.name,
                                poster: img,
                                info: [{title: 'Відомий за: ' + (actor.known_for_department || '—')}],
                                id: actor.id,
                                source: 'tmdb',
                                url: 'https://www.themoviedb.org/person/' + actor.id
                            };
                        });

                        let list = Lampa.Template.get('items_line', {title: 'Популярні актори', items: cards});
                        component.render().find('.content__list').append(list);
                        Lampa.Controller.collectionSet(cards, component.render().find('.content__list [data-name="card"]'));
                    }
                },
                error: function() {
                    Lampa.Noty.show('Помилка завантаження акторів');
                }
            });
        }

        Lampa.Activity.push({
            title: 'Актори',
            component: component,
            background: '',
            id: 'actors_activity'
        });
    }

})();
