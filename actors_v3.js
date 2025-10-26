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
                        OnlineCinemas.settings.showActors = value;  
                        OnlineCinemas.toggleActorsButton();  
                    }  
                });  
            },  
  
            initStorageListener: function() {  
                Lampa.Storage.listener.follow('change', function(event) {  
                    if (event.name === 'show_actors') {  
                        OnlineCinemas.settings.showActors = event.value;  
                        OnlineCinemas.toggleActorsButton();  
                    }  
                });  
            },  
  
            toggleActorsButton: function() {  
                var button = $('.menu .menu__list li[data-action="actors"]');  
                if (this.settings.showActors) {  
                    button.show();  
                } else {  
                    button.hide();  
                }  
            },  
  
            addActorsButton: function() {  
                var self = this;  
                var ico = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>';  
                  
                var button = $(`<li class="menu__item selector" data-action="actors">  
                    <div class="menu__ico">${ico}</div>  
                    <div class="menu__text">Актори</div>  
                </li>`);  
  
                button.on('hover:enter', function() {  
                    self.showActors();  
                });  
  
                $('.menu .menu__list').eq(0).append(button);  
                this.toggleActorsButton();  
            },  
  
            showActors: function() {  
                // Створюємо власний компонент для акторів  
                function ActorsListComponent(object) {  
                    var scroll = new Lampa.Scroll({  
                        mask: true,  
                        over: true,  
                        step: 400  
                    });  
                      
                    var body = document.createElement('div');  
                    body.classList.add('category-full');  
                      
                    var html = document.createElement('div');  
                    html.classList.add('layer--wheight');  
                      
                    var items = [];  
                    var active = 0;  
                    var total_pages = 1;  
                    var waitload = false;  
                    var last;  
  
                    this.create = function() {  
                        this.activity.loader(true);  
                          
                        scroll.minus();  
                          
                        // Завантажуємо перші дані  
                        Lampa.Api.list(object, this.build.bind(this), this.empty.bind(this));  
                          
                        return this.render();  
                    };  
  
                    this.append = function(data, append) {  
                        data.results.forEach(function(element) {  
                            // Додаємо gender для правильної обробки  
                            if (element.profile_path && typeof element.gender === 'undefined') {  
                                element.gender = 1;  
                            }  
                              
                            var params = {  
                                object: object,  
                                card_category: true  
                            };  
  
                            var card = new Lampa.Card(element, params);  
                            card.create();  
                              
                            card.onFocus = function(target, card_data) {  
                                last = target;  
                                active = items.indexOf(card);  
                                scroll.update(card.render(true));  
                                Lampa.Background.change(Lampa.Utils.cardImgBackground(card_data));  
                            };  
                              
                            card.onEnter = function(target, card_data) {  
                                last = target;  
                                  
                                // Завжди відкриваємо компонент actor для акторів  
                                if (card_data.profile_path || card_data.gender) {  
                                    Lampa.Activity.push({  
                                        url: '',  
                                        title: card_data.name,  
                                        component: 'actor',  
                                        id: card_data.id,  
                                        source: object.source  
                                    });  
                                }  
                            };  
  
                            body.appendChild(card.render(true));  
                            items.push(card);  
                              
                            if (append) Lampa.Controller.collectionAppend(card.render(true));  
                        });  
                    };  
  
                    this.next = function() {  
                        if (waitload) return;  
  
                        if (object.page < total_pages) {  
                            waitload = true;  
                            object.page++;  
  
                            Lampa.Api.list(object, function(result) {  
                                this.append(result, true);  
                                waitload = false;  
                                this.limit();  
                            }.bind(this), function() {  
                                waitload = false;  
                            });  
                        }  
                    };  
  
                    this.limit = function() {  
                        var limit_view = 12;  
                        var collection = items.slice(Math.max(0, active - limit_view), active + limit_view);  
  
                        items.forEach(function(item) {  
                            if (collection.indexOf(item) == -1) {  
                                item.render(true).classList.remove('layer--render');  
                            } else {  
                                item.render(true).classList.add('layer--render');  
                            }  
                        });  
  
                        Lampa.Controller.collectionSet(html);  
                        Lampa.Controller.collectionFocus(last, html);  
                          
                        Lampa.Layer.visible(scroll.render(true));  
                    };  
  
                    this.build = function(data) {  
                        if (data.results.length) {  
                            total_pages = data.total_pages;  
  
                            scroll.onEnd = this.next.bind(this);  
                            scroll.onScroll = this.limit.bind(this);  
                            scroll.onWheel = function(step) {  
                                if (!Lampa.Controller.own(this)) this.start();  
                                  
                                if (step > 0) Lampa.Controller.move('down');  
                                else Lampa.Controller.move('up');  
                            }.bind(this);  
  
                            this.append(data);  
                              
                            scroll.append(body);  
                            html.appendChild(scroll.render(true));  
                              
                            this.limit();  
                              
                            this.activity.loader(false);  
                            this.activity.toggle();  
                        } else {  
                            this.empty();  
                        }  
                    };  
  
                    this.empty = function() {  
                        var empty = new Lampa.Empty();  
                        html.appendChild(empty.render());  
                        this.start = empty.start;  
                        this.activity.loader(false);  
                        this.activity.toggle();  
                    };  
  
                    this.start = function() {  
                        Lampa.Controller.add('content', {  
                            toggle: function() {  
                                Lampa.Controller.collectionSet(html);  
                                Lampa.Controller.collectionFocus(last, html);  
                            },  
                            left: function() {  
                                if (Lampa.Navigator.canmove('left')) Lampa.Navigator.move('left');  
                                else Lampa.Controller.toggle('menu');  
                            },  
                            up: function() {  
                                if (Lampa.Navigator.canmove('up')) Lampa.Navigator.move('up');  
                                else Lampa.Controller.toggle('head');  
                            },  
                            down: function() {  
                                if (Lampa.Navigator.canmove('down')) Lampa.Navigator.move('down');  
                            },  
                            right: function() {  
                                if (Lampa.Navigator.canmove('right')) Lampa.Navigator.move('right');  
                            },  
                            back: this.back.bind(this)  
                        });  
  
                        Lampa.Controller.toggle('content');  
                    };  
  
                    this.pause = function() {};  
                    this.stop = function() {};  
                    this.render = function() {  
                        return html;  
                    };  
                    this.destroy = function() {  
                        scroll.destroy();  
                        html.remove();  
                        items = [];  
                    };  
                }  
  
                // Реєструємо компонент  
                Lampa.Component.add('actors_list', ActorsListComponent);  
  
                // Відкриваємо список акторів  
                Lampa.Activity.push({  
                    url: 'person/popular',  
                    title: 'Актори',  
                    component: 'actors_list',  
                    source: 'tmdb',  
                    page: 1  
                });  
            }  
        };  
  
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