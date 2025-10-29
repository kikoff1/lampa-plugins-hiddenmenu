(function () {  
  
    function Actors() {  
        let scroll = new Lampa.Scroll({ mask: true })  
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
  
                scroll.body().classList.add('category-full')  
  
                json.results.forEach((person) => {  
                    let cardData = {  
                        id: person.id,  
                        name: person.name,  
                        title: person.name,  
                        original_title: person.name,  
                        profile_path: person.profile_path,  
                        gender: person.gender  
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
                        scroll.update($(target), false)  
                    }  
  
                    scroll.body().appendChild(card.render(true))  
                    items.push(card)  
                })  
  
                setTimeout(() => {  
                    Lampa.Layer.visible(scroll.render(true))  
                }, 100)  
  
                this.activity.toggle()  
            }, (error) => {  
                this.activity.loader(false)  
                this.activity.toggle()  
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
                    if (Lampa.Navigator.canmove('up')) Lampa.Navigator.move('up')  
                    else Lampa.Controller.toggle('head')  
                },  
                down: () => {  
                    Lampa.Navigator.move('down')  
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
            return scroll.render(true)  
        }  
  
        this.destroy = function () {  
            scroll.destroy()  
        }  
    }  
  
    function startPlugin() {  
        $('<style>')  
            .text(`  
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
                    text-overflow: ellipsis;  
                    display: -webkit-box;  
                    -webkit-line-clamp: 3;  
                    -webkit-box-orient: vertical;  
                }  
                  
                .category-full {  
                    isolation: isolate;  
                }  
            `)  
            .appendTo('head')  
  
        Lampa.Component.add('actors_list', Actors)  
  
        function addMenuButton() {  
            let button = $(`<li class="menu__item selector">  
                <div class="menu__ico">  
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">  
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>  
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