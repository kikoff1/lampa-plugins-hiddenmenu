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
                    scroll.append(body)    
                    this.activity.toggle()    
                    return    
                }    
    
                json.results.forEach((person) => {    
                    let cardData = {    
                        id: person.id,    
                        name: person.name,    
                        title: person.name,    
                        original_name: person.name,    
                        poster_path: person.profile_path,    
                        profile_path: person.profile_path,    
                        gender: person.gender || 2    
                    }    
    
                    let card = new Lampa.Card(cardData, {    
                        card_category: true,    
                        object: { source: 'tmdb' }    
                    })    
    
                    card.create()    
    
                    card.onFocus = (target, card_data) => {    
                        last = target    
                        active = items.indexOf(card)    
                        scroll.update(card.render(true))    
                        Lampa.Background.change(Lampa.Utils.cardImgBackground(card_data))    
                    }    
    
                    card.onEnter = (target, card_data) => {    
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
    
                scroll.append(body)    
                  
                // Налаштування прокрутки  
                scroll.minus()  
                  
                scroll.onWheel = (step) => {  
                    if (!Lampa.Controller.own(this)) this.start()  
                      
                    if (step > 0) Lampa.Navigator.move('down')  
                    else Lampa.Navigator.move('up')  
                }  
                  
                scroll.onScroll = () => {  
                    this.limit()  
                }  
                  
                this.limit()  
    
                this.activity.toggle()    
            }, (error) => {    
                this.activity.loader(false)    
                let empty = new Lampa.Empty()    
                body.appendChild(empty.render(true))    
                scroll.append(body)    
                this.activity.toggle()    
            })    
        }    
          
        this.limit = function() {  
            let limit_view = 12  
            let collection = items.slice(Math.max(0, active - limit_view), active + limit_view)  
              
            items.forEach(item => {  
                if (collection.indexOf(item) == -1) {  
                    item.render(true).classList.remove('layer--render')  
                } else {  
                    item.render(true).classList.add('layer--render')  
                }  
            })  
              
            Lampa.Navigator.setCollection(items.slice(Math.max(0, active - 36), active + 36).map(c => c.render(true)))  
            Lampa.Navigator.focused(last)  
              
            Lampa.Layer.visible(scroll.render(true))  
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
                    if (Lampa.Navigator.canmove('up')) Lampa.Navigator.move('up')    
                    else Lampa.Controller.toggle('head')    
                },    
                down: () => {    
                    if (Lampa.Navigator.canmove('down')) Lampa.Navigator.move('down')    
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
            items.forEach(card => card.destroy())    
            items = []    
        }    
    }    
    
    function startPlugin() {    
        // Додаємо CSS стилі для компактних карток    
        $('<style>')    
            .text(`    
                .category-full .card--category {    
                    width: 10.8em !important;    
                }    
                    
                .category-full .card--category .card__title {    
                    margin-bottom: 1em;    
                    font-size: 1.1em;    
                    text-align: center;    
                    overflow: hidden;    
                    text-overflow: ellipsis;    
                    display: -webkit-box;    
                    -webkit-line-clamp: 3;    
                    line-clamp: 3;    
                    -webkit-box-orient: vertical;    
                }    
                    
                .category-full .card--category .card__view {    
                    margin-bottom: 0.5em;    
                }    
            `)    
            .appendTo('head')    
    
        const manifest = {    
            type: 'content',    
            version: '1.0.10',    
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
            const ico = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">    
                <circle cx="18" cy="12" r="6" stroke="currentColor" stroke-width="2"/>    
                <path d="M6 30c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" stroke-width="2"/>    
            </svg>`    
                
            const button = $(`<li class="menu__item selector">    
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