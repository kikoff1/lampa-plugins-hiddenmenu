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
                    this.start = empty.start  
                    this.activity.toggle()  
                    return  
                }  
  
                json.results.forEach((person) => {  
                    let cardData = {  
                        id: person.id,  
                        title: person.name,  
                        name: person.name,  
                        profile_path: person.profile_path,  
                        gender: person.gender,  
                        original_name: person.original_name  
                    }  
  
                    let card = new Lampa.Card(cardData, {  
                        card_category: true,  
                        object: { source: 'tmdb' }  
                    })  
  
                    card.create()  
  
                    card.onFocus = (target) => {  
                        last = target  
                        active = items.indexOf(card)  
                        scroll.update(card.render(true))  
                    }  
  
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
  
                scroll.append(body)  
  
                setTimeout(() => {  
                    Lampa.Layer.visible(scroll.render(true))  
                }, 100)  
  
                this.activity.toggle()  
            }, (error) => {  
                this.activity.loader(false)  
                this.activity.toggle()  
                console.error('Actors plugin error:', error)  
            })  
        }  
  
        this.start = function () {  
            Lampa.Controller.add('content', {  
                link: this,  
                toggle: () => {  
                    Lampa.Controller.collectionSet(scroll.render(true))  
                    Lampa.Controller.collectionFocus(last || false, scroll.render(true))  
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
        this.destroy = function () {  
            scroll.destroy()  
            body.remove()  
        }  
  
        this.render = function () {  
            return scroll.render()  
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
                    line-height: 1.2;  
                    -webkit-line-clamp: 3;  
                    display: -webkit-box;  
                    -webkit-box-orient: vertical;  
                    text-overflow: ellipsis;  
                }  
                  
                .category-full {  
                    isolation: isolate;  
                }  
            `)  
            .appendTo('head')  
  
        Lampa.Component.add('actors_list', Actors)  
  
        Lampa.Lang.add({  
            title_actors: {  
                uk: 'Актори',  
                ru: 'Актёры',  
                en: 'Actors'  
            }  
        })  
  
        function addMenuButton() {  
            let button = $(`<li class="menu__item selector" data-action="actors">  
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