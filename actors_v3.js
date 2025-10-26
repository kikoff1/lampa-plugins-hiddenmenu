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
                    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>'  
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
                        Lampa.Storage.set('show_actors', value);  
                        self.toggleActorsButton();  
                    }  
                });  
            },  
  
            initStorageListener: function() {  
                var self = this;  
                Lampa.Storage.listener.follow('change', function(event) {  
                    if (event.name === 'show_actors') {  
                        self.settings.showActors = event.value;  
                        self.toggleActorsButton();  
                    }  
                });  
            },  
  
            toggleActorsButton: function() {  
                var button = $('.menu__item.actors-button');  
                if (this.settings.showActors) {  
                    button.removeClass('hidden');  
                } else {  
                    button.addClass('hidden');  
                }  
            },  
  
            addActorsButton: function() {  
                var self = this;  
                var button = $('<li class="menu__item selector actors-button"><div class="menu__item-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg></div><div class="menu__item-text">Актори</div></li>');  
                  
                button.on('hover:enter', this.showActors.bind(this));  
                $('.menu .menu__list').eq(0).append(button);  
                this.toggleActorsButton();  
            },  
  
            showActors: function() {  
                Lampa.Activity.push({  
                    url: 'person/popular',  
                    title: 'Популярні актори',  
                    component: 'actors_list',  
                    source: 'tmdb',  
                    page: 1  
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
            var html = document.createElement('div');  
            var body = document.createElement('div');  
            var active = 0;  
            var last;  
  
            this.create = function() {  
                var self = this;  
                  
                html.classList.add('category-full');  
                body.classList.add('category-full');  
                  
                this.activity.loader(true);  
  
                scroll.minus();  
                  
                scroll.onWheel = function(step) {  
                    if (step > 0) Lampa.Controller.enabled().controller.down();  
                    else Lampa.Controller.enabled().controller.up();  
                };  
  
                scroll.onScroll = function() {  
                    Lampa.Layer.visible(scroll.render(true));  
                };  
  
                scroll.onEnd = function() {  
                    self.next();  
                };  
  
                Lampa.Api.list(object, this.build.bind(this));  
            };  
  
            this.next = function() {  
                var self = this;  
                  
                if (object.page < 500) {  
                    object.page++;  
                      
                    Lampa.Api.list(object, function(result) {  
                        self.append(result);  
                    });  
                }  
            };  
  
            this.append = function(data) {  
                var self = this;  
                  
                data.results.forEach(function(element) {  
                    var card = new Lampa.Card(element, {  
                        card_category: true,  
                        object: object  
                    });  
                      
                    card.create();  
                      
                    card.onFocus = function(target, card_data) {  
                        last = target;  
                        active = items.indexOf(card);  
                        scroll.update(card.render(true));  
                        Lampa.Background.change(Lampa.Utils.cardImgBackground(card_data));  
                    };  
                      
                    card.onEnter = function(target, card_data) {  
                        Lampa.Activity.push({  
                            url: '',  
                            title: card_data.name,  
                            component: 'actor',  
                            id: card_data.id,  
                            source: object.source || 'tmdb'  
                        });  
                    };  
                      
                    body.appendChild(card.render(true));  
                    items.push(card);  
                });  
                  
                Lampa.Controller.collectionSet(body);  
                if (last) Lampa.Controller.collectionFocus(last, body);  
            };  
  
            this.build = function(data) {  
                scroll.append(body);  
                html.appendChild(scroll.render(true));  
                  
                this.append(data);  
                  
                this.activity.loader(false);  
                this.activity.toggle();  
            };  
  
            this.start = function() {  
                Lampa.Controller.add('content', {  
                    toggle: function() {  
                        Lampa.Controller.collectionSet(body);  
                        Lampa.Controller.collectionFocus(last, body);  
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
  
            this.pause = function() {};  
            this.stop = function() {};  
            this.render = function() {  
                return html;  
            };  
            this.destroy = function() {  
                network.clear();  
                scroll.destroy();  
                html.remove();  
                body.remove();  
                items = null;  
                network = null;  
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