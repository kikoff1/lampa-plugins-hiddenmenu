(function () {  
  
//v1


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
                    // Створюємо вертикальну структуру картки  
                    const card = $(`  
                        <div class="card selector card--category card--actor">  
                            <div class="card__view">  
                                <div class="card__img">  
                                    <img class="card__img-object" />  
                                </div>  
                            </div>  
                            <div class="card__title">${person.name}</div>  
                        </div>  
                    `)  
  
                    // Додаємо картку до body ПЕРЕД прив'язкою події visible  
                    body.append(card)  
  
                    // Додаємо подію visible для lazy loading  
                    card.on('visible', () => {  
                        const img = card.find('img')[0]  
  
                        img.onerror = function() {  
                            img.src = './img/actor.svg'  
                        }  
  
                        img.onload = function() {  
                            card.addClass('card--loaded')  
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
                    Lampa.Activity.backward()  // Виправлено: використовуємо Activity.backward()  
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
        // Додаємо власні стилі для виправлення відступів та формату карток  
        $('<style>')  
            .text(`  
                .category-full {  
                    display: flex !important;  
                    flex-wrap: wrap !important;  
                }  
                .card--actor {  
                    padding-bottom: 1em !important;  
                }  
                .card--actor .card__img {  
                    position: relative;  
                    padding-bottom: 150% !important;  
                    background-color: rgba(255,255,255,0.1);  
                }  
                .card--actor .card__img-object {  
                    width: 100%;  
                    height: 100%;  
                    object-fit: cover;  
                    opacity: 0;  
                    transition: opacity 0.3s;  
                }  
                .card--actor.card--loaded .card__img-object {  
                    opacity: 1;  
                }  
                .card--actor .card__title {  
                    margin-top: 0.8em;  
                    font-size: 1.2em;  
                    text-align: center;  
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
            version: '1.1.0',  
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