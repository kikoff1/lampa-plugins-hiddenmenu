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
                    component: 'online_cinemas_settings',  
                    name: 'Популярні актори',  
                    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/></svg>'  
                });  
  
                Lampa.SettingsApi.addParam({  
                    component: 'online_cinemas_settings',  
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
                if (!this.settings.showActors) return;  
  
                var button = $('<li class="menu__item selector"><div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/></svg></div><div class="menu__text">Актори</div></li>');  
  
                button.on('hover:enter', function() {  
                    Lampa.Activity.push({  
                        url: 'person/popular',  
                        title: 'Популярні актори',  
                        component: 'actors_list',  
                        source: 'tmdb',  
                        page: 1  
                    });  
                });  
  
                var historyItem = $('.menu .menu__list').eq(0).find('[data-action="history"]');  
                if (historyItem.length) {  
                    button.insertBefore(historyItem);  
                } else {  
                    $('.menu .menu__list').eq(0).append(button);  
                }  
            },  
  
            updateActorsButton: function() {  
                $('.menu .menu__list').eq(0).find('.menu__item').filter(function() {  
                    return $(this).find('.menu__text').text() === 'Актори';  
                }).remove();  
  
                this.addActorsButton();  
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
  
            this.create = function() {  
                var _this = this;  
  
                html = document.createElement('div');  
                html.className = 'category-full';  
  
                body = document.createElement('div');  
                body.className = 'category-full__body';  
  
                html.appendChild(scroll.render(true));  
  
                document.body.classList.add('category-full');  
  
                this.activity.loader(true);  
  
                Lampa.Api.list({  
                    url: 'person/popular',  
                    page: object.page,  
                    source: 'tmdb'  
                }, this.append.bind(this), this.empty.bind(this));  
  
                return html;  
            };  
  
            this.append = function(data) {  
                var _this = this;  
  
                this.activity.loader(false);  
  
                if (data.results && data.results.length) {  
                    data.results.forEach(function(element) {  
                        var card = Lampa.InteractionCategory(element, {  
                            card_category: true,  
                            object: object  
                        });  
  
                        card.create();  
  
                        card.onEnter = function() {  
                            Lampa.Activity.push({  
                                id: element.id,  
                                component: 'actor',  
                                source: object.source || 'tmdb'  
                            });  
                        };  
  
                        var cardElement = card.render(true);  
                        scroll.append(cardElement);  
                        items.push(card);  
                    });  
  
                    Lampa.Controller.collectionSet(html);  
                    Lampa.Controller.collectionFocus(items.length ? items[0].render(true) : false, html);  
                }  
  
                this.activity.toggle();  
            };  
  
            this.empty = function() {  
                this.activity.loader(false);  
  
                var empty = new Lampa.Empty();  
                scroll.append(empty.render(true));  
  
                this.start = empty.start;  
                this.activity.toggle();  
            };  
  
            this.start = function() {  
                Lampa.Controller.add('content', {  
                    toggle: function() {  
                        Lampa.Controller.collectionSet(html);  
                        Lampa.Controller.collectionFocus(items.length ? items[0].render(true) : false, html);  
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