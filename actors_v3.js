(function () {  
  
    function Actors() {  
        let scroll = new Lampa.Scroll({ mask: true })  
        let body = $('<div class="category-full">')  
        let items = []  
        let active = 0  
        let last  
  
        this.create = function () {  
            this.activity.loader(true)  
  
            let network = new Lampa.Reguest()  
            let url = Lampa.Utils.protocol() + 'api.themoviedb.org/3/person/popular?api_key=' +  
                Lampa.TMDB.key() + '&language=' + Lampa.Storage.field('tmdb_lang')  
  
            network.silent(url, (json) => {  
                this.activity.loader(false)  
  
                if (!json.results || !json.results.length) {  
                    body.append('<div class="empty">Немає акторів 😢</div>')  
                    scroll.append(body)  
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
                      
                    card.onTouch = (target, card_data) => {  
                        last = target  
                        active = items.indexOf(card)  
                    }  
  
                    // Власна логіка для відкриття сторінки актора  
                    card.onEnter = (target, card_data) => {  
                        last = target  
                          
                        Lampa.Activity.push({  
                            url: '',  
                            title: person.name,  
                            component: 'actor',  
                            id: person.id,  
                            source: 'tmdb'  
                        })  
                    }  
  
                    body.append(card.render(true))  
                    items.push(card)  
                })  
  
                scroll.append(body)  
                this.activity.loader(false)  
                this.activity.toggle()  
                  
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
            }, (error) => {  
                this.activity.loader(false)  
                body.append('<div class="empty">Помилка завантаження</div>')  
                scroll.append(body)  
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
  
        Lampa.Component.add('actors_list', Actors)  
  
        Lampa.Lang.add({  
            title_actors: {  
                uk: 'Актори',  
                ru: 'Актёры',  
                en: 'Actors'  
            }  
        })  
  
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