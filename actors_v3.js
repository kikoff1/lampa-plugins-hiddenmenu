(function () {  
  
    function Actors() {  
        let scroll = new Lampa.Scroll({ mask: true })  
        let body = document.createElement('div')  
        let items = []  
        let active = 0  
        let last  
  
        body.classList.add('category-full')  
  
        this.create = function () {  
            this.activity.loader(true)  
  
            let network = new Lampa.Reguest()  
            let url = Lampa.Utils.protocol() + 'api.themoviedb.org/3/person/popular?api_key=' +  
                Lampa.TMDB.key() + '&language=' + Lampa.Storage.field('tmdb_lang')  
  
            network.silent(url, (json) => {  
                this.activity.loader(false)  
  
                if (!json.results || !json.results.length) {  
                    let empty = new Lampa.Empty()  
                    body.appendChild(empty.render(true))  
                    return  
                }  
  
                json.results.forEach((person) => {  
                    let cardData = {  
                        id: person.id,  
                        name: person.name,  
                        title: person.name,  
                        poster_path: person.profile_path,  
                        profile_path: person.profile_path,  
                        gender: person.gender || 2  
                    }  
  
                    let card = new Lampa.Card(cardData, {  
                        card_category: true,  
                        object: { source: 'tmdb' }  
                    })  
  
                    card.onEnter = () => {  
                        Lampa.Activity.push({  
                            title: person.name,  
                            component: 'actor',  
                            id: person.id,  
                            url: '',  
                            source: 'tmdb'  
                        })  
                    }  
  
                    body.appendChild(card.render(true))  
                    items.push(card)  
                })  
  
                setTimeout(() => {  
                    Lampa.Layer.visible(scroll.render(true))  
                }, 100)  
  
                this.activity.toggle()  
            }, (error) => {  
                this.activity.loader(false)  
                let empty = new Lampa.Empty()  
                body.appendChild(empty.render(true))  
            })  
        }  
  
        this.start = function () {  
            Lampa.Controller.add('content', {  
                toggle: () => {  
                    Lampa.Controller.collectionSet(scroll.render(true))  
                    Lampa.Controller.collectionFocus(last, scroll.render(true))  
                },  
                left: () => {  
                    if (Lampa.Navigator.canmove('left')) Lampa.Navigator.move('left')  
                    else Lampa.Controller.toggle('menu')  
                },  
                right: () => {  
                    Lampa.Navigator.move('right')  
                },  
                up: () => {  
                    if (active > 0) {  
                        active--  
                        scroll.update(items[active].render(true))  
                    } else if (Lampa.Navigator.canmove('up')) {  
                        Lampa.Navigator.move('up')  
                    }  
                },  
                down: () => {  
                    if (active < items.length - 1) {  
                        active++  
                        scroll.update(items[active].render(true))  
                    } else if (Lampa.Navigator.canmove('down')) {  
                        Lampa.Navigator.move('down')  
                    }  
                },  
                back: () => {  
                    Lampa.Activity.backward()  
                }  
            })  
  
            Lampa.Controller.toggle('content')  
        }  
  
        scroll.onWheel = (step) => {  
            if (step > 0) {  
                if (active < items.length - 1) {  
                    active++  
                    scroll.update(items[active].render(true))  
                }  
            } else {  
                if (active > 0) {  
                    active--  
                    scroll.update(items[active].render(true))  
                }  
            }  
        }  
  
        scroll.append(body)  
  
        this.render = function () {  
            return scroll.render(true)  
        }  
  
        this.destroy = function () {  
            scroll.destroy()  
            body.remove()  
        }  
    }  
  
    function startPlugin() {  
        // Додаємо CSS стилі для компактних карток  
        $('<style>')  
            .text(`  
                .category-full {  
                    display: flex !important;  
                    flex-wrap: wrap !important;  
                    isolation: isolate;  
                }  
                  
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
                    line-height: 1.2;  
                    text-overflow: ".";  
                    display: -webkit-box;  
                    -webkit-line-clamp: 3;  
                    -webkit-box-orient: vertical;  
                }  
                  
                .category-full .card--category .card__view {  
                    margin-bottom: 0.5em;  
                }  
            `)  
            .appendTo('head')  
  
        const manifest = {  
            type: 'content',  
            version: '1.0.8',  
            name: 'Actors',  
            description: 'Популярні актори з TMDB',  
            component: 'actors_list'  
        }  
  
        Lampa.Component.add('actors_list', Actors)  
  
        Lampa.Lang.add({  
            title_actors: {  
                uk: 'Актори',  
                ru: 'Актёры',  
                en: 'Actors'  
            }  
        })  
  
        Lampa.Manifest.plugins = manifest  
  
        function addMenuButton() {  
            let ico = `<svg height="260" viewBox="0 0 244 260" fill="none" xmlns="http://www.w3.org/2000/svg">  
                <path d="M122 0C54.6538 0 0 54.6538 0 122C0 189.346 54.6538 244 122 244C189.346 244 244 189.346 244 122C244 54.6538 189.346 0 122 0ZM122 183.385C93.8462 183.385 60.6154 183.385 60.6154 122C60.6154 60.6154 93.8462 60.6154 122 60.6154C150.154 60.6154 183.385 60.6154 183.385 122C183.385 183.385 150.154 183.385 122 183.385Z" fill="white"/>  
            </svg>`  
  
            let button = $(`<li class="menu__item selector">  
                <div class="menu__ico">${ico}</div>  
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