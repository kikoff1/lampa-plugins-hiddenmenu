(function () {  
    function Actors() {  
        let scroll = new Lampa.Scroll({ mask: true })  
        let body = $('<div class="actors-list">')  
        let empty = $('<div class="empty">Завантаження...</div>')  
        body.append(empty)  
        scroll.body().append(body)  
  
        this.create = function () {  
            this.activity.loader(true)  
  
            Lampa.TMDB.get('person/popular', {}, (json) => {  
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
        // Переклади спочатку  
        Lampa.Lang.add({  
            title_actors: {  
                uk: 'Актори',  
                ru: 'Актёры',  
                en: 'Actors'  
            }  
        })  
  
        const manifest = {  
            type: 'content',  
            version: '1.0.0',  
            name: 'Actors',  
            description: 'Популярні актори з TMDB',  
            component: 'actors_list'  
        }  
  
        // Правильна реєстрація в маніфесті  
        Lampa.Manifest.plugins = manifest  
  
        // Реєстрація компонента  
        Lampa.Component.add('actors_list', Actors)  
  
        // Функція додавання в меню  
        function add() {  
            let button = $(`<li class="menu__item selector">  
                <div class="menu__ico">  
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">  
                        <circle cx="18" cy="12" r="6" stroke="currentColor" stroke-width="2"/>  
                        <path d="M6 30c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" stroke-width="2"/>  
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
  
        // Чекаємо готовності додатку  
        if (window.appready) add()  
        else {  
            Lampa.Listener.follow('app', function (e) {  
                if (e.type == 'ready') add()  
            })  
        }  
    }  
  
    if (!window.plugin_actors_ready) {  
        window.plugin_actors_ready = true  
        startPlugin()  
    }  
})()