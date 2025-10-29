(function () {  


//v1
  
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
  
                    card.create()  
  
                    card.onEnter = () => {  
                        Lampa.Activity.push({  
                            title: person.name,  
                            component: 'actor',  
                            id: person.id,  
                            url: '',  
                            source: 'tmdb'  
                        })  
                    }  
  
                    card.onFocus = (target) => {  
                        last = target  
                        active = items.indexOf(card)  
                    }  
  
                    body.appendChild(card.render(true))  
                    items.push(card)  
                })  
  
                scroll.append(body)  
                this.activity.toggle()  
  
                setTimeout(() => {  
                    Lampa.Layer.visible(scroll.render(true))  
                }, 100)  
            }, (error) => {  
                this.activity.loader(false)  
                this.activity.toggle()  
                console.error('Actors plugin error:', error)  
            })  
        }  
  
        this.start = function () {  
            Lampa.Controller.add('content', {  
                toggle: () => {  
                    Lampa.Controller.collectionSet(scroll.render())  
                    Lampa.Controller.collectionFocus(last, scroll.render())  
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
            if (body.parentNode) body.parentNode.removeChild(body)  
        }  
    }  
  
    function startPlugin() {  
        // Додаємо CSS стилі для компактних карток та виправлення прозорості  
        $('<style>')  
            .text(`  
                .category-full .card--category {  
                    width: 10.8em !important;  
                    isolation: isolate;  
                    position: relative;  
                    z-index: 1;  
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
            version: '1.0.8',  
            name: 'Actors',  
            description: 'Популярні актори з TMDB',  
            component: 'actors_list'  
        }  
  
        Lampa.Manifest.plugins = manifest  
  
        Lampa.Component.add('actors_list', Actors)  
  
        Lampa.Lang.add({  
            title_actors: {  
                uk: 'Актори',  
                ru: 'Актёры',  
                en: 'Actors'  
            }  
        })  
  
        function addMenuButton() {  
            const ico = `<svg width="38" height="31" viewBox="0 0 38 31" fill="none" xmlns="http://www.w3.org/2000/svg">  
                <circle cx="19" cy="12" r="6" stroke="currentColor" stroke-width="2"/>  
                <path d="M5 26c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="currentColor" stroke-width="2"/>  
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