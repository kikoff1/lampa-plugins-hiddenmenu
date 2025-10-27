(function () {  
    'use strict';  
  

//v1


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
                    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="white" stroke-width="2"/><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>'  
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
                        self.updateActorsButton();  
                    }  
                });  
            },  
  
            initStorageListener: function() {  
                var self = this;  
                Lampa.Storage.listener.follow('change', function(event) {  
                    if (event.name === 'show_actors') {  
                        self.settings.showActors = event.value;  
                        self.updateActorsButton();  
                    }  
                });  
            },  
  
            addActorsButton: function() {  
                var self = this;  
                  
                if (!this.settings.showActors) return;  
  
                var button = document.createElement('li');  
                button.className = 'menu__item selector';  
                button.innerHTML = '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div><div class="menu__text">Актори</div>';  
  
                button.addEventListener('hover:enter', function() {  
                    Lampa.Activity.push({  
                        url: 'person/popular',  
                        title: 'Популярні актори',  
                        component: 'actors_list',  
                        source: 'tmdb',  
                        page: 1  
                    });  
                });  
  
                var menuList = document.querySelector('.menu .menu__list');  
                if (menuList) {  
                    menuList.appendChild(button);  
                }  
            },  
  
            updateActorsButton: function() {  
                var button = document.querySelector('.menu__item:has(.menu__text:contains("Актори"))');  
                if (button) button.remove();  
                  
                if (this.settings.showActors) {  
                    this.addActorsButton();  
                }  
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
            var total_pages = 0;  
            var waitload = false;  
  
            this.create = function() {  
                html = document.createElement('div');  
                html.className = 'category-items';  
  
                body = document.createElement('div');  
                body.className = 'category-items__body';  
                  
                // Додаємо inline стилі для flexbox сітки  
                body.style.display = 'flex';  
                body.style.flexWrap = 'wrap';  
                body.style.padding = '0 1em';  
  
                scroll.append(body);  
                html.appendChild(scroll.render(true));  
  
                this.activity.loader(true);  
  
                Lampa.Api.list({  
                    url: object.url,  
                    page: object.page,  
                    source: object.source  
                }, this.append.bind(this), this.empty.bind(this));  
  
                return html;  
            };  
  
            this.append = function(data) {  
                this.activity.loader(false);  
                this.activity.toggle();  
  
                total_pages = data.total_pages;  
  
                data.results.forEach(element => {  
                    let card = new Lampa.Card(element, {  
                        card_category: true,  
                        object: object  
                    });  
  
                    card.create();  
  
                    card.onFocus = (target, card_data) => {  
                        active = items.indexOf(card);  
                        scroll.update(card.render(true));  
                        Lampa.Background.change(Lampa.Utils.cardImgBackground(card_data));  
                    };  
  
                    card.onEnter = (target, card_data) => {  
                        Lampa.Activity.push({  
                            url: '',  
                            component: 'actor',  
                            id: element.id,  
                            source: object.source || 'tmdb'  
                        });  
                    };  
  
                    body.appendChild(card.render(true));  
                    items.push(card);  
                });  
  
                Lampa.Controller.collectionSet(html);  
                Lampa.Controller.collectionFocus(items.length ? items[0].render(true) : false, html);  
            };  
  
            this.empty = function() {  
                this.activity.loader(false);  
                this.activity.toggle();  
  
                var empty = new Lampa.Empty();  
                html.appendChild(empty.render());  
  
                Lampa.Controller.collectionSet(html);  
            };  
  
            this.start = function() {  
                Lampa.Controller.add('content', {  
                    toggle: () => {  
                        Lampa.Controller.collectionSet(this.render());  
                        Lampa.Controller.collectionFocus(false, this.render());  
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
                        if (Lampa.Navigator.canmove('down')) Lampa.Navigator.move('down');  
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