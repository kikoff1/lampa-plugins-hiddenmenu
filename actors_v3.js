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
                        if (value) {  
                            self.addActorsButton();  
                        } else {  
                            self.removeActorsButton();  
                        }  
                    }  
                });  
            },  
  
            addActorsButton: function() {  
                if (!this.settings.showActors) return;  
  
                var button = document.createElement('div');  
                button.className = 'menu__item selector';  
                button.id = 'actors_menu_button';  
                  
                var icon = document.createElement('div');  
                icon.className = 'menu__ico';  
                icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/></svg>';  
                  
                var text = document.createElement('div');  
                text.className = 'menu__text';  
                text.textContent = 'Актори';  
                  
                button.appendChild(icon);  
                button.appendChild(text);  
  
                button.addEventListener('click', function() {  
                    Lampa.Activity.push({  
                        url: 'person/popular',  
                        title: 'Популярні актори',  
                        component: 'actors_list',  
                        source: 'tmdb',  
                        page: 1  
                    });  
                });  
  
                var menu = document.querySelector('.menu .menu__list');  
                if (menu && !document.getElementById('actors_menu_button')) {  
                    menu.appendChild(button);  
                }  
            },  
  
            removeActorsButton: function() {  
                var button = document.getElementById('actors_menu_button');  
                if (button) button.remove();  
            },  
  
            initStorageListener: function() {  
                var self = this;  
                Lampa.Storage.listener.follow('change', function(e) {  
                    if (e.name == 'show_actors') {  
                        self.settings.showActors = e.value;  
                        if (e.value) {  
                            self.addActorsButton();  
                        } else {  
                            self.removeActorsButton();  
                        }  
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
            var total_pages = 0;  
  
            this.create = function() {  
                html = document.createElement('div');  
                html.className = 'category-full';  
                  
                body = document.createElement('div');  
                body.className = 'category-full__body';  
                  
                html.appendChild(body);  
                body.appendChild(scroll.render(true));  
                  
                document.body.classList.add('category-full');  
                  
                this.activity.loader(true);  
                this.loading();  
            };  
  
            this.loading = function() {  
                Lampa.TMDB.get('person/popular', {page: page}, this.build.bind(this), this.empty.bind(this));  
            };  
  
            this.build = function(data) {  
                total_pages = data.total_pages;  
                  
                data.results.forEach(function(element) {  
                    var card = Lampa.InteractionCategory(element, {  
                        card_category: true,  
                        object: object  
                    });  
                      
                    card.onEnter = function() {  
                        Lampa.Activity.push({  
                            id: element.id,  
                            url: '',  
                            component: 'actor',  
                            source: object.source  
                        });  
                    };  
                      
                    items.push(card);  
                });  
                  
                this.append();  
            };  
  
            this.append = function() {  
                items.forEach(function(card) {  
                    scroll.append(card.render(true));  
                });  
                  
                Lampa.Controller.enable('content');  
            };  
  
            this.empty = function() {  
                var empty = new Lampa.Empty();  
                scroll.append(empty.render());  
                this.start();  
            };  
  
            this.start = function() {  
                if (Lampa.Controller.enabled().name === 'content') {  
                    Lampa.Controller.collectionSet(scroll.render(true));  
                    Lampa.Controller.collectionFocus(false, scroll.render(true));  
                }  
                  
                this.activity.loader(false);  
                this.activity.toggle();  
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
                document.body.classList.remove('category-full');  
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