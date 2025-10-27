(function () {  
    'use strict';  
  
    function startPlugin() {  
        if (window.plugin_online_cinemas_ready) return;  
        window.plugin_online_cinemas_ready = true;  
  
        var OnlineCinemas = {  
            settings: {  
                showActors: true  
            },  
  
            init: function() {  
                this.loadSettings();  
                this.createSettings();  
                this.addActorsButton();  
                this.initStorageListener();  
            },  
  
            loadSettings: function() {  
                this.settings.showActors = Lampa.Storage.get('show_actors', true);  
            },  
  
            createSettings: function() {  
                Lampa.SettingsApi.addComponent({  
                    component: 'online_cinemas',  
                    name: 'Популярні актори',  
                    icon: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="12" r="5" stroke="currentColor" stroke-width="2"/><path d="M8 28c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'  
                });  
  
                Lampa.SettingsApi.addParam({  
                    component: 'online_cinemas',  
                    param: {  
                        name: 'show_actors',  
                        type: 'trigger',  
                        default: true  
                    },  
                    field: {  
                        name: 'Показувати пункт меню "Актори"'  
                    },  
                    onChange: this.toggleActorsButton.bind(this)  
                });  
            },  
  
            initStorageListener: function() {  
                Lampa.Storage.listener.follow('change', (event) => {  
                    if (event.name === 'show_actors') {  
                        this.settings.showActors = event.value;  
                        this.toggleActorsButton();  
                    }  
                });  
            },  
  
            addActorsButton: function() {  
                if (!this.settings.showActors) return;  
  
                let button = $(`<li class="menu__item selector">  
                    <div class="menu__ico">  
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">  
                            <circle cx="18" cy="12" r="5" stroke="currentColor" stroke-width="2"/>  
                            <path d="M8 28c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>  
                        </svg>  
                    </div>  
                    <div class="menu__text">Актори</div>  
                </li>`);  
  
                button.on('hover:enter', () => {  
                    Lampa.Activity.push({  
                        url: 'person/popular',  
                        title: 'Популярні актори',  
                        component: 'actors_list',  
                        source: 'tmdb',  
                        page: 1  
                    });  
                });  
  
                let historyItem = $('.menu .menu__list').eq(0).find('[data-action="history"]').parent();  
                if (historyItem.length) {  
                    button.insertBefore(historyItem);  
                } else {  
                    $('.menu .menu__list').eq(0).append(button);  
                }  
            },  
  
            toggleActorsButton: function() {  
                $('.menu .menu__item').filter(function() {  
                    return $(this).find('.menu__text').text() === 'Актори';  
                }).remove();  
  
                if (this.settings.showActors) {  
                    this.addActorsButton();  
                }  
            }  
        };  
  
        function ActorsListComponent(object) {  
            let html, scroll, items = [], network = new Lampa.Reguest();  
            let active = 0;  
  
            this.create = function() {  
                html = document.createElement('div');  
                html.className = 'category-full';  
  
                scroll = new Lampa.Scroll({  
                    mask: true,  
                    over: true  
                });  
  
                scroll.render().addClass('category-full');  
                  
                html.appendChild(scroll.render()[0]);  
  
                this.activity.loader(true);  
  
                this.loadActors();  
            };  
  
            this.loadActors = function() {  
                Lampa.Api.list({  
                    url: 'person/popular',  
                    page: object.page || 1,  
                    source: 'tmdb'  
                }, (data) => {  
                    this.append(data);  
                    this.activity.loader(false);  
                    this.activity.toggle();  
                }, () => {  
                    this.empty();  
                });  
            };  
  
            this.append = function(data) {  
                if (!data.results || !data.results.length) {  
                    this.empty();  
                    return;  
                }  
  
                data.results.forEach((element) => {  
                    let card = new Lampa.Card(element, {  
                        card_category: true  
                    });  
  
                    card.onEnter = () => {  
                        Lampa.Activity.push({  
                            url: '',  
                            component: 'actor',  
                            id: element.id,  
                            source: object.source || 'tmdb'  
                        });  
                    };  
  
                    card.create();  
                    items.push(card);  
                    scroll.append(card.render());  
                });  
  
                Lampa.Controller.collectionSet(scroll.render());  
                Lampa.Controller.collectionFocus(items[0] ? items[0].render() : false, scroll.render());  
            };  
  
            this.empty = function() {  
                let empty = new Lampa.Empty();  
                scroll.append(empty.render());  
                this.activity.loader(false);  
                this.activity.toggle();  
            };  
  
            this.start = function() {  
                Lampa.Controller.add('content', {  
                    toggle: () => {  
                        Lampa.Controller.collectionSet(scroll.render());  
                        Lampa.Controller.collectionFocus(items[0] ? items[0].render() : false, scroll.render());  
                    },  
                    left: () => {  
                        if (Lampa.Navigator.canmove('left')) Lampa.Navigator.move('left');  
                        else Lampa.Controller.toggle('menu');  
                    },  
                    right: () => {  
                        Lampa.Navigator.move('right');  
                    },  
                    up: () => {  
                        if (Lampa.Navigator.canmove('up')) Lampa.Navigator.move('up');  
                        else Lampa.Controller.toggle('head');  
                    },  
                    down: () => {  
                        Lampa.Navigator.move('down');  
                    },  
                    back: () => {  
                        Lampa.Activity.backward();  
                    }  
                });  
  
                Lampa.Controller.toggle('content');  
            };  
  
            this.pause = function() {};  
  
            this.stop = function() {};  
  
            this.render = function() {  
                return html;  
            };  
  
            this.destroy = function() {  
                network.clear();  
                scroll.destroy();  
                if (html) html.remove();  
            };  
        }  
  
        Lampa.Component.add('actors_list', ActorsListComponent);  
  
        function add() {  
            OnlineCinemas.init();  
        }  
  
        if (window.appready) add();  
        else {  
            Lampa.Listener.follow('app', function(e) {  
                if (e.type == 'ready') add();  
            });  
        }  
    }  
  
    if (!window.plugin_online_cinemas_ready) startPlugin();  
})();