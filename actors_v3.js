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
                        card_small: true,  
                        card_category: true,  
                        object: { source: 'tmdb' }  
                    })  
  
                    card.create()  
  
                    card.onFocus = (target, card_data) => {  
                        last = target  
                        active = items.indexOf(card)  
                        scroll.update(card.render(true))  
                    }  
  
                    card.onEnter = (target, card_data) => {  
                        last = target  
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
                this.activity.toggle()  
            }, (error) => {  
                this.activity.loader(false)  
                let empty = new Lampa.Empty()  
                body.appendChild(empty.render(true))  
                scroll.append(body)  
                this.activity.toggle()  
            })  
        }  
  
        this.start = function () {  
            Lampa.Controller.add('content', {  
                toggle: () => {  
                    Lampa.Controller.collectionSet(scroll.render())  
                    Lampa.Controller.collectionFocus(false, scroll.render())  
                },  
                up: () => Lampa.Controller.toggle('head'),  
                down: () => {},  
                back: () => Lampa.Activity.backward()  
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
        // Додаємо CSS для відображення імен акторів  
        $('<style>')  
            .text(`  
                .category-full {  
                    display: flex !important;  
                    flex-wrap: wrap !important;  
                }  
                  
                /* Фіксована ширина як у Релізах */  
                .category-full .card--small.card--category {  
                    width: 10.8em !important;  
                }  
                  
                /* Показуємо імена акторів */  
                .category-full .card--small.card--category .card__title {  
                    display: block !important;  
                    margin-top: 0.5em;  
                    font-size: 1.1em;  
                    max-height: 3.6em;  
                    overflow: hidden;  
                    line-height: 1.2;  
                    -webkit-line-clamp: 3;  
                    line-clamp: 3;  
                    -webkit-box-orient: vertical;  
                }  
                  
                .category-full .card--small.card--category .card__view {  
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
            const ico = '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="12" r="6" stroke="currentColor" stroke-width="2"/><path d="M6 30c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" stroke-width="2"/></svg>'  
            const button = $(`<li class="menu__item selector" data-action="actors">  
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