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
  
                if (json.results && json.results.length) {  
                    json.results.forEach((person) => {  
                        let card = new Lampa.Card(person, {  
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
                            scroll.update(card.render(true))  
                        }  
  
                        body.appendChild(card.render(true))  
                        items.push(card)  
                    })  
  
                    scroll.append(body)  
  
                    setTimeout(() => {  
                        Lampa.Layer.visible(scroll.render(true))  
                    }, 100)  
                } else {  
                    let empty = new Lampa.Empty()  
                    scroll.append(empty.render(true))  
                }  
  
                this.activity.toggle()  
            }, (error) => {  
                this.activity.loader(false)  
                  
                let empty = new Lampa.Empty()  
                scroll.append(empty.render(true))  
                  
                this.activity.toggle()  
            })  
  
            return this.render()  
        }  
  
        this.start = function () {  
            Controller.add('content', {  
                link: this,  
                toggle: () => {  
                    Controller.collectionSet(scroll.render(true))  
                    Controller.collectionFocus(last, scroll.render(true))  
                },  
                left: () => {  
                    if (Navigator.canmove('left')) Navigator.move('left')  
                    else Controller.toggle('menu')  
                },  
                right: () => {  
                    Navigator.move('right')  
                },  
                up: () => {  
                    if (Navigator.canmove('up')) Navigator.move('up')  
                },  
                down: () => {  
                    if (Navigator.canmove('down')) Navigator.move('down')  
                },  
                back: () => {  
                    Lampa.Activity.backward()  
                }  
            })  
  
            Controller.toggle('content')  
        }  
  
        this.pause = function () {}  
  
        this.stop = function () {}  
  
        this.render = function () {  
            return scroll.render(true)  
        }  
  
        this.destroy = function () {  
            scroll.clear()  
            items = []  
        }  
    }  
  
    function startPlugin() {  
        // Додаємо CSS стилі для компактних карток  
        $('<style>')  
            .text(`  
                .category-full {  
                    display: flex;  
                    flex-wrap: wrap;  
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
                    text-overflow: ellipsis;  
                    display: -webkit-box;  
                    -webkit-line-clamp: 3;  
                    -webkit-box-orient: vertical;  
                }  
            `)  
            .appendTo('head')  
  
        Lampa.Component.add('actors_list', Actors)  
  
        function addMenuButton() {  
            let button = $(`<li class="menu__item selector">  
                <div class="menu__ico">  
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 48 48" width="512" height="512">  
                        <path d="M24,23.5A11.5,11.5,0,1,0,12.5,12,11.51,11.51,0,0,0,24,23.5Zm0-20A8.5,8.5,0,1,1,15.5,12,8.51,8.51,0,0,1,24,3.5Z"/>  
                        <path d="M38.32,36.68a1.5,1.5,0,0,0-2.12,0L24,48.88,11.8,36.68a1.5,1.5,0,0,0-2.12,2.12L23.44,52.56a.79.79,0,0,0,1.12,0L38.32,38.8A1.5,1.5,0,0,0,38.32,36.68Z"/>  
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