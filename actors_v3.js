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
                    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/></svg>'  
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
                          
                        if (value) {  
                            self.addActorsButton();  
                        } else {  
                            self.removeActorsButton();  
                        }  
                    }  
                });  
            },  
  
            initStorageListener: function() {  
                var self = this;  
                Lampa.Storage.listener.follow('change', function(event) {  
                    if (event.name === 'show_actors') {  
                        self.settings.showActors = event.value;  
                          
                        if (event.value) {  
                            self.addActorsButton();  
                        } else {  
                            self.removeActorsButton();  
                        }  
                    }  
                });  
            },  
  
            addActorsButton: function() {  
                if (!this.settings.showActors) return;  
                  
                var button = document.querySelector('.menu__item--actors');  
                if (button) return;  
  
                var menuList = document.querySelector('.menu .menu__list');  
                if (!menuList) return;  
  
                var historyItem = document.querySelector('.menu__item--history');  
                  
                button = document.createElement('div');  
                button.className = 'menu__item selector menu__item--actors';  
                button.innerHTML = '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/></svg></div><div class="menu__text">Актори</div>';  
  
                button.addEventListener('hover:enter', this.showActors.bind(this));  
  
                if (historyItem) {  
                    menuList.insertBefore(button, historyItem);  
                } else {  
                    menuList.appendChild(button);  
                }  
            },  
  
            removeActorsButton: function() {  
                var button = document.querySelector('.menu__item--actors');  
                if (button) button.remove();  
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
            var scroll;  
            var items = [];  
            var html = document.createElement('div');  
            var body = document.createElement('div');  
            var active = 0;  
            var last;  
  
            this.create = function() {  
                scroll = new Lampa.Scroll({  
                    mask: true,  
                    over: true,  
                    step: 250  
                });  
                  
                body.classList.add('category-full');  
                  
                document.body.classList.add('category-full');  
                  
                this.activity.loader(true);  
                  
                Lampa.Api.list(object, this.build.bind(this));  
            };  
  
            this.build = function(data) {  
                if (data.results && data.results.length) {  
                    data.results.forEach(function(element) {  
                        var card = new Lampa.Card(element, {  
                            card_category: true  
                        });  
                          
                        card.create();  
                          
                        card.onFocus = function(target, card_data) {  
                            last = target;  
                            active = items.indexOf(card);  
                            scroll.update(card.render(true));  
                            Lampa.Background.change(Lampa.Utils.cardImgBackground(card_data));  
                        };  
                          
                        card.onEnter = function(target, card_data) {  
                            last = target;  
                              
                            Lampa.Activity.push({  
                                url: '',  
                                component: 'actor',  
                                id: card_data.id,  
                                source: 'tmdb'  
                            });  
                        };  
                          
                        body.appendChild(card.render(true));  
                        items.push(card);  
                    });  
                      
                    scroll.append(body);  
                    html.appendChild(scroll.render(true));  
                      
                    this.activity.loader(false);  
                    this.activity.toggle();  
                } else {  
                    this.empty();  
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
                if (!scroll) {  
                    console.error('Scroll is not initialized');  
                    return;  
                }  
                  
                if (Lampa.Controller.enabled().name === 'content') {  
                    Lampa.Controller.collectionSet(scroll.render(true));  
                    Lampa.Controller.collectionFocus(last, scroll.render(true));  
                } else {  
                    Lampa.Controller.toggle('content');  
                }  
            };  
  
            this.pause = function() {};  
  
            this.stop = function() {};  
  
            this.render = function() {  
                return html;  
            };  
  
            this.destroy = function() {  
                network.clear();  
                if (scroll) scroll.destroy();  
                if (html) html.remove();  
                document.body.classList.remove('category-full');  
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