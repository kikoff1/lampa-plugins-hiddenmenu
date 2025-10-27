(function () {  
    'use strict';  
  

///3334


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
                    component: 'actors_list',  
                    name: 'Популярні актори',  
                    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/></svg>'  
                });  
  
                Lampa.SettingsApi.addParam({  
                    component: 'actors_list',  
                    param: {  
                        name: 'show_actors',  
                        type: 'trigger',  
                        default: true  
                    },  
                    field: {  
                        name: 'Показувати популярних акторів'  
                    },  
                    onChange: function(value) {  
                        self.settings.showActors = value;  
                        Lampa.Storage.set('show_actors', value);  
                    }  
                });  
            },  
  
            addActorsButton: function() {  
                if (!this.settings.showActors) return;  
  
                var button = document.createElement('li');  
                button.className = 'menu__item selector';  
                button.innerHTML = '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/></svg></div><div class="menu__text">Актори</div>';  
  
                button.addEventListener('click', function() {  
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
  
            initStorageListener: function() {  
                var self = this;  
                Lampa.Storage.listener.follow('change', function(event) {  
                    if (event.name === 'show_actors') {  
                        self.settings.showActors = event.value;  
                    }  
                });  
            }  
        };  
  
        function ActorsListComponent(object) {  
            var network = new Lampa.Reguest();  
            var scroll = new Lampa.Scroll({  
                mask: true,  
                over: true,  
                step: 400  
            });  
            var items = [];  
            var html = document.createElement('div');  
            var body = document.createElement('div');  
            var active = 0;  
            var page = 1;  
            var total_pages = 0;  
  
            body.classList.add('category-full');  
  
            this.create = function() {  
                var self = this;  
                this.activity.loader(true);  
  
                document.body.classList.add('category-full');  
  
                scroll.minus();  
  
                // Налаштування обробників скролу  
                scroll.onWheel = function(step) {  
                    if (step > 0) {  
                        Lampa.Controller.enabled().controller.down();  
                    } else {  
                        Lampa.Controller.enabled().controller.up();  
                    }  
                };  
  
                scroll.onScroll = function(position) {  
                    Lampa.Layer.visible(scroll.render(true));  
                };  
  
                scroll.onEnd = function() {  
                    self.next();  
                };  
  
                this.loadActors();  
  
                html.appendChild(scroll.render(true));  
  
                return html;  
            };  
  
            this.loadActors = function() {  
                var self = this;  
  
                network.silent(  
                    Lampa.TMDB.api('person/popular?page=' + page + '&language=' + Lampa.Storage.get('language', 'uk')),  
                    function(data) {  
                        if (data.results && data.results.length) {  
                            total_pages = data.total_pages;  
  
                            data.results.forEach(function(actor) {  
                                self.append(actor);  
                            });  
  
                            self.activity.loader(false);  
                            self.activity.toggle();  
                        } else {  
                            self.empty();  
                        }  
                    },  
                    function() {  
                        self.empty();  
                    }  
                );  
            };  
  
            this.append = function(actor) {  
                var card = Lampa.InteractionCategory({  
                    id: actor.id,  
                    title: actor.name,  
                    original_title: actor.original_name,  
                    img: actor.profile_path ? Lampa.Api.img(actor.profile_path, 'w342') : './img/actor.svg',  
                    release_date: ''  
                }, {  
                    card_category: true  
                });  
  
                card.onEnter = function() {  
                    Lampa.Activity.push({  
                        id: actor.id,  
                        url: '',  
                        component: 'actor',  
                        source: 'tmdb',  
                        page: 1  
                    });  
                };  
  
                var cardElement = card.render(true);  
                  
                Lampa.Controller.collectionAppend(cardElement);  
                  
                scroll.append(cardElement);  
                  
                items.push(card);  
            };  
  
            this.next = function() {  
                if (page < total_pages) {  
                    page++;  
                    this.loadActors();  
                }  
            };  
  
            this.empty = function() {  
                var empty = new Lampa.Empty();  
                scroll.append(empty.render(true));  
                this.start = empty.start;  
                this.activity.loader(false);  
                this.activity.toggle();  
            };  
  
            this.start = function() {  
                if (Lampa.Controller.enabled().name !== 'content') {  
                    Lampa.Controller.add('content', {  
                        toggle: function() {  
                            Lampa.Controller.collectionSet(scroll.render(true));  
                            Lampa.Controller.collectionFocus(false, scroll.render(true));  
                        },  
                        left: function() {  
                            if (Navigator.canmove('left')) Navigator.move('left');  
                            else Lampa.Controller.toggle('menu');  
                        },  
                        up: function() {  
                            if (Navigator.canmove('up')) Navigator.move('up');  
                            else Lampa.Controller.toggle('head');  
                        },  
                        down: function() {  
                            Navigator.move('down');  
                        },  
                        right: function() {  
                            Navigator.move('right');  
                        },  
                        back: this.back.bind(this)  
                    });  
                }  
  
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