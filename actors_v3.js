(function () {    
    
    function Actors() {    
        let scroll = new Lampa.Scroll({ mask: true, over: true, step: 250, end_ratio: 2 })    
        let body = document.createElement('div')    
        let items = []    
        let active = 0    
        let last    
        let total_pages = 0  
        let current_page = 1  
        let waitload = false  
    
        body.classList.add('category-full')    
    
        this.create = function () {    
            this.activity.loader(true)    
            this.loadPage(1)  
        }  
          
        this.loadPage = function(page) {  
            let network = new Lampa.Reguest()    
            let url = Lampa.Utils.protocol() + 'api.themoviedb.org/3/person/popular?api_key=' +    
                Lampa.TMDB.key() + '&language=' + Lampa.Storage.field('tmdb_lang') + '&page=' + page  
    
            network.silent(url, (json) => {    
                this.activity.loader(false)    
                waitload = false  
    
                if (!json.results || !json.results.length) {    
                    if (page === 1) {  
                        let empty = new Lampa.Empty()    
                        body.appendChild(empty.render(true))    
                        scroll.append(body)    
                        this.activity.toggle()  
                    }  
                    return    
                }    
                  
                total_pages = json.total_pages  
                current_page = page  
    
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
                      
                    card.onTouch = (target, card_data) => {    
                        last = target    
                        active = items.indexOf(card)    
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
                      
                    if (page > 1) {  
                        Lampa.Controller.collectionAppend(card.render(true))  
                    }  
                })    
                  
                if (page === 1) {  
                    scroll.append(body)    
                      
                    scroll.minus()  
                      
                    scroll.onWheel = (step) => {  
                        if (!Lampa.Controller.own(this)) this.start()  
                          
                        if (step > 0) Navigator.move('down')  
                        else Navigator.move('up')  
                    }  
                      
                    scroll.onScroll = () => {  
                        this.limit()  
                    }  
                      
                    scroll.onEnd = this.next.bind(this)  
                      
                    this.activity.toggle()  
                }  
                  
                this.limit()  
            }, (error) => {    
                this.activity.loader(false)    
                waitload = false  
                  
                if (page === 1) {  
                    let empty = new Lampa.Empty()    
                    body.appendChild(empty.render(true))    
                    scroll.append(body)    
                    this.activity.toggle()  
                }  
            })    
        }  
          
        this.next = function() {  
            if (waitload) return  
              
            if (current_page < total_pages) {  
                waitload = true  
                this.loadPage(current_page + 1)  
            }  
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
              
            Navigator.setCollection(items.slice(Math.max(0, active - 36), active + 36).map(c => c.render(true)))  
            Navigator.focused(last)  
              
            Lampa.Layer.visible(scroll.render(true))  
        }  
    
        this.start = function () {    
            Lampa.Controller.add('content', {  
                link: this,  
                toggle: () => {    
                    Lampa.Controller.collectionSet(scroll.render(true))    
                    Lampa.Controller.collectionFocus(last || false, scroll.render(true))  
                      
                    this.limit()  
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
                    if (Navigator.canmove('down')) Navigator.move('down')    
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
        $('<style>')    
            .text(`    
                .category-full .card--category {    
                    width: 10.8em !important;    
                }    
                    
                .category-full .card--category .card__title {    
                    margin-bottom: 1.5em;    
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
            version: '1.0.13',    
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