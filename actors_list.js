(function () {
    function Actors() {
        let scroll = new Lampa.Scroll({
            mask: true,
            axis: 'x', // або 'y', залежно від того, яку прокрутку ви хочете
            overflow: 'auto'
        });
        let html = scroll.render();
        let body = document.createElement('div');
        let items = [];
        let active = 0;
        let last;

        body.classList.add('category-full');
        scroll.append(body);

        this.create = function () {
            this.activity.loader(true);
            let network = new Lampa.Reguest();
            let url = Lampa.Utils.protocol() + 'api.themoviedb.org/3/person/popular?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.field('tmdb_lang');

            network.silent(url, (json) => {
                this.activity.loader(false);

                json.results.forEach((person) => {
                    let card = new Lampa.Card({
                        id: person.id,
                        name: person.name,
                        title: person.name,
                        original_title: person.name,
                        profile_path: person.profile_path,
                        gender: person.gender
                    }, {
                        card_category: true,
                        object: { source: 'tmdb' }
                    });

                    card.onEnter = () => {
                        Lampa.Activity.push({
                            title: person.name,
                            component: 'actor',
                            id: person.id,
                            url: '',
                            source: 'tmdb'
                        });
                    };

                    card.create();
                    body.appendChild(card.render(true));
                    items.push(card);
                });

                setTimeout(() => {
                    Lampa.Layer.visible(scroll.render(true));
                    scroll.update(); // Оновлюємо прокрутку після додавання елементів
                }, 100);

                this.activity.toggle();
            }, (error) => {
                this.activity.loader(false);
                this.activity.toggle();
            });
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                link: this,
                toggle: () => {
                    Lampa.Controller.collectionSet(scroll.render(true));
                    Lampa.Controller.collectionFocus(false, scroll.render(true));
                },
                left: () => {
                    Lampa.Controller.toggle('menu');
                },
                up: () => {
                    if (Lampa.Navigator.canmove('up')) Lampa.Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: () => {
                    Lampa.Navigator.move('down');
                },
                back: () => {
                    Lampa.Activity.backward();
                }
            });

            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            scroll.destroy();
            html.remove();
        };
    }

    function startPlugin() {
        $('<style>')
            .text(`
                .category-full .card--category {
                    width: 10.8em !important;
                }
                .category-full .card--category .card__title {
                    display: block !important;
                    margin-top: 0.5em;
                    font-size: 1.1em;
                    margin-bottom: 1em;
                    max-height: 3.6em;
                    overflow: hidden;
                    -webkit-line-clamp: 3;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                }
                .category-full {
                    isolation: isolate;
                }
            `)
            .appendTo('head');

        Lampa.Component.add('actors_list', Actors);

        Lampa.Lang.add({
            title_actors: {
                uk: 'Актори',
                ru: 'Актеры',
                en: 'Actors'
            }
        });

        function addMenuButton() {
            let button = $(`
                <li class="menu__item selector">
                    <div class="menu__ico">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                    </div>
                    <div class="menu__text">${Lampa.Lang.translate('title_actors')}</div>
                </li>
            `);

            button.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('title_actors'),
                    component: 'actors_list'
                });
            });

            $('.menu__list').append(button);
        }

        addMenuButton();
    }

    startPlugin();
})();