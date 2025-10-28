(function () {

    function Actors() {
        let scroll = new Lampa.Scroll({ mask: true })
        let body = $('<div class="actors-list">')
        let empty = $('<div class="empty">Завантаження...</div>')
        body.append(empty)
        scroll.body().append(body)

        this.create = function () {
            this.activity.loader(true)

            TMDB.get('person/popular', {}, (json) => {
                this.activity.loader(false)
                body.empty()

                if (!json.results || !json.results.length) {
                    body.append('<div class="empty">Немає акторів 😢</div>')
                    return
                }

                json.results.forEach((person) => {
                    const card = Lampa.Template.get('full_person', {
                        name: person.name,
                        role: person.known_for_department || 'Actor'
                    })

                    const img = card.find('img')[0]
                    img.src = person.profile_path
                        ? Lampa.Api.img(person.profile_path, 'w276_and_h350_face')
                        : './img/actor.svg'

                    card.on('hover:enter', () => {
                        Lampa.Activity.push({
                            title: person.name,
                            component: 'actor',
                            id: person.id,
                            url: '',
                            source: 'tmdb'
                        })
                    })

                    body.append(card)
                })

                Lampa.Controller.enable('content')
            }, () => {
                this.activity.loader(false)
                body.append('<div class="empty">Помилка при завантаженні 😔</div>')
            })
        }

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: () => {
                    Lampa.Controller.collectionSet(scroll.render())
                    Lampa.Controller.collectionFocus(false, scroll.render())
                },
                up: () => Lampa.Controller.back(),
                down: () => { },
                back: () => Lampa.Controller.back()
            })

            this.create()
            Lampa.Controller.toggle('content')
        }

        this.render = function () {
            return scroll.render()
        }

        this.destroy = function () {
            scroll.destroy()
            body.remove()
        }
    }

    function startPlugin() {
        const manifest = {
            type: 'content',
            version: '1.0.0',
            name: 'Actors',
            description: 'Популярні актори з TMDB',
            component: 'actors_list'
        }

        // Реєстрація компонента
        Lampa.Component.add('actors_list', Actors)

        // Додавання пункту в меню
        Lampa.Menu.add({
            title: Lampa.Lang.translate('title_actors'),
            name: 'actors',
            component: 'actors_list'
        })

        // Переклади
        Lampa.Lang.add({
            title_actors: {
                uk: 'Актори',
                ru: 'Актёры',
                en: 'Actors'
            }
        })

        // Реєстрація плагіна
        Lampa.Manifest.plugins = manifest
    }

    startPlugin()

})()
