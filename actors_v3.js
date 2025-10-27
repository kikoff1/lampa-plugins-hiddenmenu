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
                    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'  
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
                    onChange: this.toggleActorsButton.bind(this)  
                });  
            },  
  
            addActorsButton: function() {  
                if (!this.settings.showActors) return;  
  
                let button = document.createElement('li');  
                button.className = 'menu__item selector';  
                button.innerHTML = `  
                    <div class="menu__ico">  
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">  
                            <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>  
                            <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>  
                        </svg>  
                    </div>  
                    <div class="menu__text">Актори</div>  
                `;  
  
                button.addEventListener('hover:enter', () => {  
                    Lampa.Activity.push({  
                        url: 'person/popular',  
                        title: 'Популярні актори',  
                        component: 'actors_list',  
                        source: 'tmdb',  
                        page: 1  
                    });  
                });  
  
                let menuList = document.querySelector('.menu .menu__list');  
                if (menuList) {  
                    menuList.appendChild(button);  
                }  
            },  
  
            toggleActorsButton: function() {  
                this.settings.showActors = Lampa.Storage.get('show_actors', true);  
                let button = document.querySelector('.menu__item:has(.menu__text:contains("Актори"))');  
                if (button) button.remove();  
                if (this.settings.showActors) this.addActorsButton();  
            },  
  
            initStorageListener: function() {  
                Lampa.Storage.listener.follow('change', (e) => {  
                    if (e.name === 'show_actors') {  
                        this.toggleActorsButton();  
                    }  
                });  
            }  
        };  
  
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
            let total_pages = 0;  
  
            this.create = function() {  
                // Створюємо контейнер з класом category-full  
                html = document.createElement('div');  
                html.classList.add('category-full');  
                  
                // Додаємо клас до body  
                document.body.classList.add('category-full');  
                  
                // Отримуємо нативний DOM елемент з scroll  
                let scrollElement = scroll.render(true);  
                  
                // Додаємо scroll до html  
                html.appendChild(scrollElement);  
                  
                // Завантажуємо дані  
                this.activity.loader(true);  
                  
                Lampa.Api.list({  
                    url: 'person/popular',  
                    source: 'tmdb',  
                    page: object.page  
                }, this.build.bind(this), this.empty.bind(this));  
            };  
  
            this.build = function(data) {  
                total_pages = data.total_pages;  
                  
                this.append(data);  
                  
                this.activity.loader(false);  
                this.activity.toggle();  
            };  
  
            this.append = function(data) {  
                data.results.forEach(element => {  
                    let card = new Lampa.Card(element, {  
                        card_category: true,  
                        object: object  
                    });  
                      
                    card.create();  
                      
                    card.onEnter = () => {  
                        Lampa.Activity.push({  
                            url: '',  
                            component: 'actor',  
                            id: element.id,  
                            source: object.source || 'tmdb'  
                        });  
                    };  
                      
                    card.onFocus = (target) => {  
                        active = items.indexOf(card);  
                        scroll.update(card.render(true));  
                    };  
                      
                    // Додаємо нативний DOM елемент  
                    scroll.append(card.render(true));  
                    items.push(card);  
                });  
                  
                Lampa.Controller.collectionSet(scroll.render(true));  
                Lampa.Controller.collectionFocus(false, scroll.render(true));  
            };  
  
            this.empty = function() {  
                let empty = new Lampa.Empty();  
                scroll.append(empty.render(true));  
                this.activity.loader(false);  
                this.activity.toggle();  
            };  
  
            this.start = function() {  
                Lampa.Controller.add('content', {  
                    toggle: () => {  
                        Lampa.Controller.collectionSet(scroll.render(true));  
                        Lampa.Controller.collectionFocus(false, scroll.render(true));  
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
                        Lampa.Navigator.move('down');  
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
                document.body.classList.remove('category-full');  
            };  
        }  
  
        Lampa.Component.add('actors_list', ActorsListComponent);  
  
        function add() {  
            OnlineCinemas.init();  
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