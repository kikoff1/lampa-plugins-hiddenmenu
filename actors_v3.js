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
                    const card = Lampa.Template.get('full_person', {  
                        name: person.name,  
                        role: person.known_for_department || 'Actor'  
                    })  
  
                    // Додаємо клас для сіткового відображення  
                    card.addClass('card--category')  
                      
                    // Додаємо inline стилі для відступів  
                    card.attr('style', 'margin-right: 0 !important; padding-right: 0.5em !important; padding-left: 0.5em !important;')  
  
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
            }, (error) => {  
                this.activity.loader(false)  
                body.append('<div class="empty">Помилка завантаження</div>')  
            })  
        }  
  
        this.start = function () {  
            Lampa.Controller.add('content', {  
                toggle: () => {  
                    Lampa.Controller.collectionSet(scroll.render())  
                    Lampa.Controller.collectionFocus(false, scroll.render())  
                },  
                left: () => {  
                    if (Navigator.canmove('left')) Navigator.move('left')  
                    else Lampa.Controller.toggle('menu')  
                },  
                right: () => {  
                    Navigator.move('right')  
                },  
                up: () => {  
                    if (Navigator.canmove('up')) Navigator.move('up')  
                    else Lampa.Controller.toggle('head')  
                },  
                down: () => {  
                    Navigator.move('down')  
                },  
                back: () => {  
                    Lampa.Activity.backward()  
                }  
            })  
  
            Lampa.Controller.toggle('content')  
        }  
  
        this.pause = function () {}  
  
        this.stop = function () {}  
  
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
            version: '1.0.8',  
            name: 'Actors',  
            description: 'Популярні актори з TMDB',  
            component: 'actors_list'  
        }  
  
        // Реєстрація компонента  
        Lampa.Component.add('actors_list', Actors)  
  
        // Переклади  
        Lampa.Lang.add({  
            title_actors: {  
                uk: 'Актори',  
                ru: 'Актёры',  
                en: 'Actors'  
            }  
        })  
  
        // Додаємо CSS для приховування ролі та виправлення відступів  
        $('<style>')  
            .text(`  
                .category-full {  
                    display: flex !important;  
                    flex-wrap: wrap !important;  
                }  
                  
                /* Приховуємо роль актора */  
                .category-full .full-person__role {  
                    display: none !important;  
                }  
                  
                /* Виправляємо відступи для сіткового відображення */  
                .category-full .full-person.card--category {  
                    margin-right: 0 !important;  
                    padding-right: 0.5em !important;  
                    padding-left: 0.5em !important;  
                    padding-bottom: 1em !important;  
                }  
            `)  
            .appendTo('head')  
  
        // Реєстрація плагіна  
        Lampa.Manifest.plugins = manifest  
  
        function addMenuButton() {  
            const button = $(`<li class="menu__item selector" data-action="actors">  
                <div class="menu__ico">  
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">  
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