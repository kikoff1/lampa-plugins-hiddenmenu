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
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 20 20" style="enable-background:new 0 0 512 512" xml:space="preserve"><g><clipPath id="a"><path d="M0 0h20v20H0z" fill="currentColor" opacity="1"></path></clipPath><g clip-path="url(#a)"><path fill="currentColor" fill-rule="evenodd" d="M10 10c-2.216 0-4.019-1.794-4.019-4S7.783 2 10 2s4.019 1.794 4.019 4-1.802 4-4.019 4zm3.776.673a5.978 5.978 0 0 0 2.182-5.603C15.561 2.447 13.37.348 10.722.042 7.07-.381 3.972 2.449 3.972 6c0 1.89.88 3.574 2.252 4.673C2.852 11.934.39 14.895.004 18.891A1.012 1.012 0 0 0 1.009 20a.99.99 0 0 0 .993-.891C2.404 14.646 5.837 12 10 12s7.596 2.646 7.999 7.109a.99.99 0 0 0 .993.891 1.012 1.012 0 0 0 1.004-1.109c-.385-3.996-2.847-6.957-6.22-8.218z"></path></g></g></svg>'  
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
                Lampa.Storage.listener.follow('change', function(e) {  
                    if (e.name === 'show_actors') {  
                        self.settings.showActors = e.value;  
                        self.toggleActorsButton();  
                    }  
                });  
            },  
  
            toggleActorsButton: function() {  
                var button = $('.menu__item[data-action="actors"]');  
                if (this.settings.showActors) {  
                    button.removeClass('hidden');  
                } else {  
                    button.addClass('hidden');  
                }  
            },  
  
            addActorsButton: function() {  
                var self = this;  
                  
                // Створюємо кнопку з правильною структурою  
                var button = $('<li class="menu__item selector" data-action="actors">' +  
                    '<div class="menu__ico">' +  
                        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 20 20" style="enable-background:new 0 0 512 512" xml:space="preserve"><g><clipPath id="a"><path d="M0 0h20v20H0z" fill="currentColor" opacity="1"></path></clipPath><g clip-path="url(#a)"><path fill="currentColor" fill-rule="evenodd" d="M10 10c-2.216 0-4.019-1.794-4.019-4S7.783 2 10 2s4.019 1.794 4.019 4-1.802 4-4.019 4zm3.776.673a5.978 5.978 0 0 0 2.182-5.603C15.561 2.447 13.37.348 10.722.042 7.07-.381 3.972 2.449 3.972 6c0 1.89.88 3.574 2.252 4.673C2.852 11.934.39 14.895.004 18.891A1.012 1.012 0 0 0 1.009 20a.99.99 0 0 0 .993-.891C2.404 14.646 5.837 12 10 12s7.596 2.646 7.999 7.109a.99.99 0 0 0 .993.891 1.012 1.012 0 0 0 1.004-1.109c-.385-3.996-2.847-6.957-6.22-8.218z"></path></g></g></svg>' +  
                    '</div>' +  
                    '<div class="menu__text">Актори</div>' +  
                '</li>');  
  
                button.on('hover:enter', function() {  
                    Lampa.Activity.push({  
                        url: 'person/popular',  
                        title: 'Популярні актори',  
                        component: 'actors_list',  
                        source: 'tmdb',  
                        page: 1  
                    });  
                });  
  
                // Додаємо кнопку ПЕРЕД останнім елементом (history)  
                var list = $('.menu .menu__list').eq(0);  
                var historyItem = list.find('[data-action="history"]').parent();  
                  
                if (historyItem.length) {  
                    button.insertBefore(historyItem);  
                } else {  
                    list.append(button);  
                }  
  
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
  
        // Власний компонент для відображення акторів  
        function ActorsListComponent(object) {  
            var network = new Lampa.Reguest();  
            var scroll = new Lampa.Scroll({  
                mask: true,  
                over: true,  
                step: 250  
            });  
            var items = [];  
            var html = $('<div></div>');  
            var body = $('<div class="category-full"></div>');  
            var info;  
            var last;  
            var page = 1;  
            var total_pages = 1;  
  
            this.create = function() {  
                var _this = this;  
                  
                info = $('<div class="info layer--width" style="padding:1.5em"><div class="info__title">Популярні актори</div><div class="info__title-small">TMDB</div></div>');  
                  
                html.append(info);  
                html.append(body);  
                  
                scroll.render().addClass('layer--wheight').data('mheight', info);  
                body.append(scroll.render());  
  
                this.activity.loader(true);  
                this.loading();  
            };  
  
            this.loading = function() {  
                var _this = this;  
                  
                network.silent('https://api.themoviedb.org/3/person/popular?api_key=4ef0d7355d9ffb5151e987764708ce96&language=uk-UK&page=' + page, function(json) {  
                    _this.activity.loader(false);  
                      
                    if (json.results && json.results.length) {  
                        total_pages = json.total_pages;  
                        _this.append(json.results);  
                          
                        if (page == 1) {  
                            _this.activity.toggle();  
                        }  
                    } else {  
                        _this.empty();  
                    }  
                }, function() {  
                    _this.activity.loader(false);  
                    _this.empty();  
                });  
            };  
  
            this.append = function(data) {  
                var _this = this;  
                  
                data.forEach(function(element) {  
                    var card = new Lampa.Card(element, {  
                        card_category: true,  
                        object: object  
                    });  
                      
                    card.create();  
                      
                    // Явно встановлюємо обробник для відкриття актора  
                    card.onEnter = function() {  
                        Lampa.Activity.push({  
                            url: '',  
                            title: element.name,  
                            component: 'actor',  
                            id: element.id,  
                            source: 'tmdb'  
                        });  
                    };  
                      
                    items.push(card);  
                    body.append(card.render());  
                });  
                  
                Lampa.Controller.collectionSet(scroll.render());  
                Lampa.Controller.collectionFocus(last || false, scroll.render());  
            };  
  
            this.next = function() {  
                if (page < total_pages) {  
                    page++;  
                    this.loading();  
                }  
            };  
  
            this.empty = function() {  
                var empty = new Lampa.Empty();  
                scroll.append(empty.render());  
                this.start = empty.start;  
                this.activity.toggle();  
            };  
  
            this.start = function() {  
                Lampa.Controller.add('content', {  
                    toggle: function() {  
                        Lampa.Controller.collectionSet(scroll.render());  
                        Lampa.Controller.collectionFocus(last || false, scroll.render());  
                    },  
                    left: function() {  
                        if (Navigator.canmove('left')) Navigator.move('left');  
                        else Lampa.Controller.toggle('menu');  
                    },  
                    right: function() {  
                        Navigator.move('right');  
                    },  
                    up: function() {  
                        if (Navigator.canmove('up')) Navigator.move('up');  
                        else Lampa.Controller.toggle('head');  
                    },  
                    down: function() {  
                        if (Navigator.canmove('down')) Navigator.move('down');  
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