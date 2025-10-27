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
                var self = this;  
                  
                Lampa.SettingsApi.addComponent({  
                    component: 'online_cinemas',  
                    name: 'Популярні актори',  
                    icon: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="12" r="5" stroke="white" stroke-width="2" fill="none"/><path d="M8 28c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="white" stroke-width="2" fill="none"/></svg>'  
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
                    onChange: function(value) {  
                        self.settings.showActors = value;  
                        self.toggleActorsButton();  
                    }  
                });  
            },  
  
            addActorsButton: function() {  
                if (!this.settings.showActors) return;  
  
                var button = $(`<li class="menu__item selector">  
                    <div class="menu__ico">  
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">  
                            <circle cx="18" cy="12" r="5" stroke="currentColor" stroke-width="2" fill="none"/>  
                            <path d="M8 28c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" stroke-width="2" fill="none"/>  
                        </svg>  
                    </div>  
                    <div class="menu__text">Актори</div>  
                </li>`);  
  
                button.on('hover:enter', function() {  
                    Lampa.Activity.push({  
                        url: 'person/popular',  
                        title: 'Популярні актори',  
                        component: 'actors_list',  
                        source: 'tmdb',  
                        page: 1  
                    });  
                });  
  
                $('.menu .menu__list').eq(0).append(button);  
            },  
  
            toggleActorsButton: function() {  
                $('.menu__item:contains("Актори")').parent().remove();  
                if (this.settings.showActors) {  
                    this.addActorsButton();  
                }  
            },  
  
            initStorageListener: function() {  
                var self = this;  
                Lampa.Storage.listener.follow('change', function(event) {  
                    if (event.name === 'show_actors') {  
                        self.settings.showActors = event.value;  
                        self.toggleActorsButton();  
                    }  
                });  
            }  
        };  
  
        function ActorsListComponent(object) {  
            var network = new Lampa.Reguest();  
            var scroll = new Lampa.Scroll({  
                mask: true,  
                over: true,  
                step: 250  
            });  
              
            var items = [];  
            var html;  
            var body;  
            var active = 0;  
            var page = 1;  
            var total_pages = 1;  
  
            this.create = function() {  
                html = document.createElement('div');  
                html.classList.add('category-full');  
                  
                body = document.createElement('div');  
                body.classList.add('category-full__body');  
                  
                scroll.append(body);  
                html.appendChild(scroll.render());  
                  
                this.loadActors();  
            };  
  
            this.loadActors = function() {  
                var self = this;  
                  
                network.silent(Lampa.TMDB.api('person/popular?page=' + page + '&language=uk'), function(data) {  
                    if (data.results && data.results.length > 0) {  
                        total_pages = data.total_pages;  
                          
                        data.results.forEach(function(actor) {  
                            self.append(actor);  
                        });  
                          
                        Lampa.Controller.enable('content');  
                    }  
                }, function() {  
                    Lampa.Noty.show('Помилка завантаження акторів');  
                });  
            };  
  
            this.append = function(actor) {  
                var card = new Lampa.Card(actor, {  
                    card_category: true  
                });  
                  
                card.create();  
                  
                card.onEnter = function(target, card_data) {  
                    Lampa.Activity.push({  
                        url: '',  
                        component: 'actor',  
                        id: card_data.id,  
                        source: 'tmdb'  
                    });  
                };  
                  
                card.onFocus = function(target, card_data) {  
                    active = items.indexOf(card);  
                    Lampa.Background.change(Lampa.Utils.cardImgBackground(card_data));  
                };  
                  
                body.appendChild(card.render());  
                items.push(card);  
            };  
  
            this.toggle = function() {  
                var self = this;  
                  
                Lampa.Controller.add('content', {  
                    toggle: function() {  
                        Lampa.Controller.collectionSet(html);  
                        Lampa.Controller.collectionFocus(false, html);  
                    },  
                    left: function() {  
                        if (Lampa.Navigator.canmove('left')) Lampa.Navigator.move('left');  
                        else Lampa.Controller.toggle('menu');  
                    },  
                    right: function() {  
                        Lampa.Navigator.move('right');  
                    },  
                    up: function() {  
                        if (Lampa.Navigator.canmove('up')) Lampa.Navigator.move('up');  
                        else Lampa.Controller.toggle('head');  
                    },  
                    down: function() {  
                        if (Lampa.Navigator.canmove('down')) Lampa.Navigator.move('down');  
                    },  
                    back: function() {  
                        Lampa.Activity.backward();  
                    }  
                });  
  
                Lampa.Controller.toggle('content');  
            };  
  
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