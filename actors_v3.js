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
                    icon: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="12" r="5" stroke="white" stroke-width="2" fill="none"/><path d="M8 28c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/></svg>'    
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
                var button = $('.menu .menu__list .menu__item--actors');    
                if (this.settings.showActors) {    
                    button.show();    
                } else {    
                    button.hide();    
                }    
            },    
    
            addActorsButton: function() {    
                var self = this;    
                var ico = '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="12" r="5" stroke="white" stroke-width="2" fill="none"/><path d="M8 28c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';    
                    
                var button = $(`<li class="menu__item selector menu__item--actors">    
                    <div class="menu__ico">${ico}</div>    
                    <div class="menu__text">Актори</div>    
                </li>`);    
    
                button.on('hover:enter', this.showActors.bind(this));    
                $('.menu .menu__list').eq(0).append(button);    
                this.toggleActorsButton();    
            },    
    
            showActors: function() {    
                Lampa.Activity.push({    
                    url: "person/popular",    
                    title: "Популярні актори",    
                    component: "actors_list",    
                    source: "tmdb",    
                    page: 1    
                });    
            }    
        };    
    
        // Створюємо власний компонент для відображення акторів    
        function ActorsListComponent(object) {    
            var network = new Lampa.Reguest();    
            var scroll = new Lampa.Scroll({    
                mask: true,    
                over: true,    
                step: 250,  
                end_ratio: 2  
            });    
            var items = [];    
            var html = document.createElement('div');    
            var body = document.createElement('div');    
            var active = 0;    
            var total_pages = 0;    
            var page = 1;    
            var waitload = false;  
            var last;  
    
            this.create = function() {    
                var self = this;    
                    
                this.activity.loader(true);    
    
                // Завантажуємо дані    
                this.loadActors(page);    
    
                return this.render();    
            };    
    
            this.loadActors = function(pageNum) {    
                var self = this;    
                    
                Lampa.Api.list({    
                    url: 'person/popular',    
                    page: pageNum,    
                    source: 'tmdb'    
                }, function(data) {    
                    total_pages = data.total_pages;    
                    self.build(data, pageNum === 1);    
                    waitload = false;    
                }, function() {    
                    self.empty();    
                });    
            };  
              
            this.build = function(data, first) {  
                var self = this;  
                  
                if (first) {  
                    body.classList.add('category-full');  
                      
                    scroll.minus();  
                    scroll.onEnd = this.next.bind(this);  
                    scroll.onScroll = this.limit.bind(this);  
                    scroll.onWheel = function(step) {  
                        if (!Lampa.Controller.own(self)) self.start();  
                        if (step > 0) Lampa.Navigator.move('down');  
                        else Lampa.Navigator.move('up');  
                    };  
                }  
                  
                this.append(data, !first);  
                  
                if (first) {  
                    scroll.append(body);  
                    html.appendChild(scroll.render(true));  
                    this.limit();  
                    this.activity.loader(false);  
                    this.activity.toggle();  
                }  
            };  
    
            this.append = function(data, append) {    
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
                        scroll.update(card.render(true), true);    
                        Lampa.Background.change(Lampa.Utils.cardImgBackground(card_data));    
                    };    
                        
                    card.onEnter = function(target, card_data) {    
                        Lampa.Activity.push({    
                            url: '',    
                            title: card_data.name,    
                            component: 'actor',    
                            id: card_data.id,    
                            source: 'tmdb'    
                        });    
                    };    
                        
                    body.appendChild(card.render(true));    
                    items.push(card);  
                      
                    if (append) Lampa.Controller.collectionAppend(card.render(true));  
                });    
            };  
              
            this.limit = function() {  
                var limit_view = 12;  
                var limit_collection = 36;  
                  
                var collection = items.slice(Math.max(0, active - limit_view), active + limit_view);  
                  
                items.forEach(function(item) {  
                    if (collection.indexOf(item) == -1) {  
                        item.render(true).classList.remove('layer--render');  
                    } else {  
                        item.render(true).classList.add('layer--render');  
                    }  
                });  
                  
                Lampa.Navigator.setCollection(items.slice(Math.max(0, active - limit_collection), active + limit_collection).map(function(c) {  
                    return c.render(true);  
                }));  
                Lampa.Navigator.focused(last);  
                  
                Lampa.Layer.visible(scroll.render(true));  
            };  
    
            this.next = function() {    
                if (waitload) return;    
                if (page < total_pages) {    
                    waitload = true;    
                    page++;    
                    this.loadActors(page);    
                }    
            };    
    
            this.empty = function() {    
                var empty = new Lampa.Empty();    
                html.appendChild(empty.render(true));    
                this.start = empty.start;    
                this.activity.loader(false);    
                this.activity.toggle();    
            };    
    
            this.start = function() {    
                Lampa.Controller.add('content', {    
                    toggle: function() {    
                        Lampa.Controller.collectionSet(body);    
                        Lampa.Controller.collectionFocus(last || (items[active] ? items[active].render(true) : false), body);    
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
    
        // Реєструємо компонент    
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