(function () {  
  
    function Actors() {  
        let scroll = new Lampa.Scroll({ mask: true })  
        let body = $('<div class="category-full">')  
        let empty = $('<div class="empty">Завантаження...</div>')  
        body.append(empty)  
        scroll.body().append(body)  
  
        this.create = function () {  
            this.activity.loader(true)  
  
            let network = new Lampa.Reguest()  
            let url = Lampa.Utils.protocol() + 'api.themoviedb.org/3/person/popular?api_key=' +  
                Lampa.TMDB.key() + '&language=' + Lampa.Storage.field('tmdb_lang')  
  
            network.silent(url, (json) => {  
                this.activity.loader(false)  
                body.empty()  
  
                if (!json.results || !json.results.length) {  
                    body.append('<div class="empty">Немає акторів 😢</div>')  
                    return  
                }  
  
                json.results.forEach((person) => {  
                    // Використовуємо стандартний шаблон full_person  
                    const card = Lampa.Template.get('full_person', {  
                        name: person.name,  
                        role: ''  
                    })  
  
                    // Додаємо клас для сіткового відображення  
                    card.addClass('card--category')  
                      
                    // Виправляємо відступи через inline стилі  
                    card.attr('style', 'margin-right: 0 !important; padding: 0.5em !important;')  
  
                    // Додаємо подію visible для lazy loading  
                    card.on('visible', () => {  
                        const img = card.find('img')[0]  
  
                        img.onerror = function() {  
                            img.src = './img/actor.svg'  
                        }  
  
                        img.onload = function() {  
                            card.addClass('full-person--loaded')  
                        }  
  
                        img.src = person.profile_path  
                            ? Lampa.Api.img(person.profile_path, 'w276_and_h350_face')  
                            : './img/actor.svg'  
                    })  
  
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
  
                // Після додавання всіх карток викликаємо Layer.visible  
                Lampa.Layer.visible(scroll.render(true))  
  
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
                back: () => {  
                    Lampa.Activity.backward()  
                }  
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
        // Додаємо CSS для виправлення відступів  
        $('<style>')  
            .text(`  
                .category-full {  
                    display: flex !important;  
                    flex-wrap: wrap !important;  
                }  
                .category-full .full-person.card--category {  
                    margin-right: 0 !important;  
                    padding: 0.5em !important;  
                }  
                .full-person.card--category .full-person__body {  
                    display: flex;  
                    flex-direction: column;  
                }  
                .full-person.card--category .full-person__img {  
                    width: 100%;  
                    margin-bottom: 0.5em;  
                }  
                .full-person.card--category .full-person__name {  
                    text-align: center;  
                    font-size: 1.2em;  
                }  
            `)  
            .appendTo('head')  
  
        Lampa.Lang.add({  
            title_actors: {  
                uk: 'Актори',  
                ru: 'Актёры',  
                en: 'Actors'  
            }  
        })  
  
        const manifest = {  
            type: 'content',  
            version: '1.1.3',  
            name: 'Actors',  
            description: 'Популярні актори з TMDB',  
            component: 'actors_list'  
        }  
  
        Lampa.Manifest.plugins = manifest  
        Lampa.Component.add('actors_list', Actors)  
  
        function addMenuButton() {  
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
  
        if (window.appready) addMenuButton()  
        else {  
            Lampa.Listener.follow('app', function (e) {  
                if (e.type == 'ready') addMenuButton()  
            })  
        }  
    }  
  
    if (!window.plugin_actors_ready) {  
        window.plugin_actors_ready = true  
        startPlugin()  
    }  
  
})()