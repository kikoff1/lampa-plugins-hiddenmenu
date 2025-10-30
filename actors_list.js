(function () {

    function Actors() {
        let scroll = new Lampa.Scroll({ mask: true })
        let html = scroll.render()
        let body = document.createElement('div')
        let items = []

        body.classList.add('category-full', 'scroll--body')
        scroll.append(body)

        this.create = function () {
            this.activity.loader(true)

            // ✅ Універсальна підтримка різних версій Lampa
            let network = Lampa.Request ? new Lampa.Request() : new Lampa.Reguest()

            let url = Lampa.Utils.protocol() + 'api.themoviedb.org/3/person/popular?api_key=' +
                Lampa.TMDB.key() + '&language=' + Lampa.Storage.field('tmdb_lang')

            network.silent(url, (json) => {
                this.activity.loader(false)

                if (!json.results || !json.results.length) {
                    this.activity.empty('Немає даних')
                    return
                }

                json.results.forEach((person) => {
                    // ✅ створюємо картку через шаблон
                    let card = Lampa.Template.get('card', {
                        title: person.name,
                        poster: person.profile_path
                            ? 'https://image.tmdb.org/t/p/w500' + person.profile_path
                            : '',
                        info: '',
                        rating: '',
                        release: '',
                        adult: '',
                        quality: '',
                        icon: '',
                        favorite: false
                    })

                    let $card = $(card)

                    // Відкриваємо сторінку актора
                    $card.on('hover:enter', () => {
                        Lampa.Activity.push({
                            title: person.name,
                            component: 'actor',
                            id: person.id,
                            url: '',
                            source: 'tmdb'
                        })
                    })

                    body.appendChild($card[0])
                    items.push($card[0])
                })

                // ✅ Безпечне оновлення скролу
                setTimeout(() => {
                    Lampa.Layer.visible(scroll.render(true))
                    if (body.querySelectorAll('.card').length) {
                        requestAnimationFrame(() => scroll.update(true))
                    }
                }, 300)

                this.activity.toggle()
            }, (error) => {
                this.activity.loader(false)
                this.activity.empty('Помилка завантаження')
                this.activity.toggle()
            })
        }

        this.start = function () {
            Lampa.Controller.add('content', {
                link: this,
                toggle: () => {
                    Lampa.Controller.collectionSet(body)
                    Lampa.Controller.collectionFocus(false, body)
                },
                left: () => {
                    Lampa.Controller.toggle('menu')
                },
                up: () => {
                    if (Lampa.Navigator.canmove('up')) Lampa.Navigator.move('up')
                    else Lampa.Controller.toggle('head')
                },
                down: () => {
                    Lampa.Navigator.move('down')
                },
                back: () => {
                    Lampa.Activity.backward()
                }
            })

            Lampa.Controller.toggle('content')
        }

        this.pause = function () { }
        this.stop = function () { }

        this.render = function () {
            return html
        }

        this.destroy = function () {
            scroll.destroy()
            html.remove()
        }
    }

    function startPlugin() {
        $('<style>')
            .text(`
                .category-full {
                    isolation: isolate;
                    padding: 2em;
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .category-full .card {
                    width: 10.8em !important;
                    margin: 0.6em;
                }

                .category-full .card__title {
                    margin-top: 0.5em;
                    font-size: 1.1em;
                    max-height: 3.6em;
                    overflow: hidden;
                    -webkit-line-clamp: 3;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    text-align: center;
                }
            `)
            .appendTo('head')

        // Реєстрація компонента
        Lampa.Component.add('actors_list', Actors)

        // Переклади
        Lampa.Lang.add({
            title_actors: {
                uk: 'Актори',
                ru: 'Актеры',
                en: 'Actors'
            }
        })

        // Кнопка в головному меню
        function addMenuButton() {
            let button = $(`
                <li class="menu__item selector">
                    <div class="menu__ico">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 
                            1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 
                            1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                    </div>
                    <div class="menu__text">${Lampa.Lang.translate('title_actors')}</div>
                </li>`)

            button.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('title_actors'),
                    component: 'actors_list',
                    page: 1
                })
            })

            $('.menu .menu__list').eq(0).append(button)
        }

        if (window.appready) addMenuButton()
        else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') addMenuButton()
            })
        }
    }

    if (!window.plugin_actors_ready) {
        window.plugin_actors_ready = true
        startPlugin()
    }

})()
