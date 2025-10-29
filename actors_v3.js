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
  
                json.results.forEach((person) => {  
                    let cardData = {  
                        id: person.id,  
                        name: person.name,  
                        title: person.name,  
                        original_title: person.name,  
                        profile_path: person.profile_path,  
                        poster_path: person.profile_path,  
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
            })  
        }  
  
        this.start = function () {  
            Lampa.Controller.add('actors_list', {  
                link: this,  
                toggle: () => {  
                    Lampa.Controller.collectionSet(scroll.render(true))  
                    if (items.length && items[active]) {  
                        Lampa.Controller.collectionFocus(items[active].render(true), scroll.render(true))  
                    }  
                },  
                back: () => {  
                    Lampa.Activity.backward()  
                }  
            })  
  
            Lampa.Controller.toggle('actors_list')  
        }  
  
        this.pause = function () {}  
  
        this.stop = function () {}  
  
        this.render = function () {  
            return scroll.render()  
        }  
  
        this.destroy = function () {  
            scroll.destroy()  
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
            let button = $(`<li class="menu__item selector" data-action="undefined">  
                <div class="menu__ico">  
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 48 48" width="512" height="512">  
                        <path d="M24,4A20,20,0,1,0,44,24,20,20,0,0,0,24,4Zm0,6a6,6,0,1,1-6,6A6,6,0,0,1,24,10ZM24,38a14,14,0,0,1-12-6.7c.1-4,8-6.3,12-6.3s11.9,2.3,12,6.3A14,14,0,0,1,24,38Z"/>  
                    </svg>  
                </div>  
                <div class="menu__text">Актори</div>  
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