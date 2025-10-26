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
                this.initStorageListener();  
            },  
  
            loadSettings: function() {  
                this.settings.showActors = Lampa.Storage.get('show_actors', true);  
            },  
  
            createSettings: function() {  
                // Додаємо компонент налаштувань з іконкою  
                Lampa.SettingsApi.addComponent({  
                    component: 'online_cinemas',  
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="512" height="512" viewBox="0 0 20 20">  
                        <path fill="currentColor" fill-rule="evenodd" d="M10 10c-2.216 0-4.019-1.794-4.019-4S7.783 2 10 2s4.019 1.794 4.019 4-1.802 4-4.019 4zm3.776.673a5.978 5.978 0 0 0 2.182-5.603C15.561 2.447 13.37.348 10.722.042 7.07-.381 3.972 2.449 3.972 6c0 1.89.88 3.574 2.252 4.673C2.852 11.934.39 14.895.004 18.891A1.012 1.012 0 0 0 1.009 20a.99.99 0 0 0 .993-.891C2.404 14.646 5.837 12 10 12s7.596 2.646 7.999 7.109a.99.99 0 0 0 .993.891 1.012 1.012 0 0 0 1.005-1.109c-.386-3.996-2.848-6.957-6.221-8.218z"/>  
                    </svg>`,  
                    name: 'Популярні актори'  
                });  
  
                // Додаємо параметр перемикача  
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
                    onChange: this.toggleActorsButton.bind(this)  
                });  
            },  
  
            initStorageListener: function() {  
                Lampa.Storage.listener.follow('change', (e) => {  
                    if (e.name === 'show_actors') {  
                        this.settings.showActors = e.value;  
                        this.toggleActorsButton();  
                    }  
                });  
            },  
  
            toggleActorsButton: function() {  
                const button = $('.menu__item[data-action="actors"]');  
                if (this.settings.showActors) {  
                    button.removeClass('hidden');  
                } else {  
                    button.addClass('hidden');  
                }  
            },  
  
            addActorsButton: function() {  
                const ico = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="512" height="512" viewBox="0 0 20 20">  
                    <path fill="currentColor" fill-rule="evenodd" d="M10 10c-2.216 0-4.019-1.794-4.019-4S7.783 2 10 2s4.019 1.794 4.019 4-1.802 4-4.019 4zm3.776.673a5.978 5.978 0 0 0 2.182-5.603C15.561 2.447 13.37.348 10.722.042 7.07-.381 3.972 2.449 3.972 6c0 1.89.88 3.574 2.252 4.673C2.852 11.934.39 14.895.004 18.891A1.012 1.012 0 0 0 1.009 20a.99.99 0 0 0 .993-.891C2.404 14.646 5.837 12 10 12s7.596 2.646 7.999 7.109a.99.99 0 0 0 .993.891 1.012 1.012 0 0 0 1.005-1.109c-.386-3.996-2.848-6.957-6.221-8.218z"/>  
                </svg>`;  
  
                const button = $(`<li class="menu__item selector" data-action="actors">  
                    <div class="menu__ico">${ico}</div>  
                    <div class="menu__text">Актори</div>  
                </li>`);  
  
                button.on('hover:enter', this.showActors.bind(this));  
                $('.menu .menu__list').eq(0).append(button);  
                this.toggleActorsButton();  
            },  
  
            showActors: function() {  
                Lampa.Activity.push({  
                    url: 'person/popular',  
                    title: 'Актори',  
                    component: 'actors_list',  
                    source: 'tmdb',  
                    page: 1  
                });  
            }  
        };  
  
        // Власний компонент для відображення акторів  
        function ActorsListComponent(object) {  
            let network = new Lampa.Reguest();  
            let scroll = new Lampa.Scroll({  
                mask: true,  
                over: true,  
                step: 250  
            });  
              
            let items = [];  
            let html;  
            let body;  
            let active = 0;  
            let last;  
  
            this.create = function() {  
                html = $('<div></div>');  
                body = $('<div class="category-full"></div>');  
                  
                html.append(body);  
                scroll.render().addClass('layer--wheight').data('mheight', body);  
                html.append(scroll.render());  
  
                this.loadActors();  
            };  
  
            this.loadActors = function() {  
                network.silent('https://api.themoviedb.org/3/person/popular?api_key=4ef0d7355d9ffb5151e987764708ce96&language=uk-UA&page=' + (object.page || 1), (data) => {  
                    if (data.results && data.results.length) {  
                        this.append(data);  
                          
                        if (data.page < data.total_pages) {  
                            this.more(data);  
                        }  
                    } else {  
                        html.append(Lampa.Template.get('list_empty'));  
                    }  
                }, () => {  
                    html.append(Lampa.Template.get('error', {title: 'Помилка завантаження'}));  
                });  
            };  
  
            this.append = function(data) {  
                data.results.forEach((person) => {  
                    let card = Lampa.Template.get('card', {  
                        title: person.name,  
                        release_year: ''  
                    });  
  
                    card.addClass('card--category');  
  
                    card.find('.card__img').attr('src', person.profile_path ?   
                        'https://image.tmdb.org/t/p/w300' + person.profile_path :   
                        './img/actor.svg'  
                    );  
  
                    card.on('hover:focus', () => {  
                        last = card[0];  
                        active = items.indexOf(card);  
                        scroll.update(card, true);  
                    });  
  
                    // Явно встановлюємо відкриття компонента actor  
                    card.on('hover:enter', () => {  
                        Lampa.Activity.push({  
                            url: '',  
                            title: person.name,  
                            component: 'actor',  
                            id: person.id,  
                            source: 'tmdb'  
                        });  
                    });  
  
                    body.append(card);  
                    items.push(card);  
                });  
            };  
  
            this.more = function(data) {  
                let more = $('<div class="category-full__more selector"><span>Показати більше</span></div>');  
                  
                more.on('hover:focus', () => {  
                    last = more[0];  
                    scroll.update(more, true);  
                });  
  
                more.on('hover:enter', () => {  
                    more.remove();  
                    object.page++;  
                    this.loadActors();  
                });  
  
                body.append(more);  
                items.push(more);  
            };  
  
            this.background = function() {  
                Lampa.Background.immediately('');  
            };  
  
            this.start = function() {  
                Lampa.Controller.add('content', {  
                    toggle: () => {  
                        Lampa.Controller.collectionSet(scroll.render(), body);  
                        Lampa.Controller.collectionFocus(last || false, scroll.render());  
                    },  
                    left: () => {  
                        if (Navigator.canmove('left')) Navigator.move('left');  
                        else Lampa.Controller.toggle('menu');  
                    },  
                    down: this.down,  
                    up: this.up,  
                    back: this.back  
                });  
  
                Lampa.Controller.toggle('content');  
            };  
  
            this.down = function() {  
                Navigator.move('down');  
            };  
  
            this.up = function() {  
                Navigator.move('up');  
            };  
  
            this.back = function() {  
                Lampa.Activity.backward();  
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
            };  
        }  
  
        // Реєструємо компонент  
        Lampa.Component.add('actors_list', ActorsListComponent);  
  
        function add() {  
            OnlineCinemas.init();  
            OnlineCinemas.addActorsButton();  
        }  
  
        if (window.appready) add();  
        else {  
            Lampa.Listener.follow('app', function (e) {  
                if (e.type == 'ready') add();  
            });  
        }  
    }  
  
    if (!window.plugin_online_cinemas_ready) startPlugin();  
})();