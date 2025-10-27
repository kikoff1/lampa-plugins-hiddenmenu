(function () {  
    'use strict';  
  

//v33
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
                    onChange: this.updateActorsButton.bind(this)  
                });  
            },  
  
            addActorsButton: function() {  
                if (!this.settings.showActors) return;  
  
                let button = document.createElement('li');  
                button.className = 'menu__item selector';  
                button.innerHTML = `  
                    <div class="menu__ico">  
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">  
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>  
                        </svg>  
                    </div>  
                    <div class="menu__text">Актори</div>  
                `;  
  
                button.addEventListener('click', this.showActors.bind(this));  
  
                let menuList = document.querySelector('.menu .menu__list');  
                if (menuList) {  
                    menuList.appendChild(button);  
                }  
            },  
  
            updateActorsButton: function(value) {  
                this.settings.showActors = value;  
                let button = document.querySelector('.menu__item:has(.menu__text:contains("Актори"))');  
                if (button) button.remove();  
                if (value) this.addActorsButton();  
            },  
  
            initStorageListener: function() {  
                Lampa.Storage.listener.follow('change', (event) => {  
                    if (event.name === 'show_actors') {  
                        this.settings.showActors = event.value;  
                        this.updateActorsButton(event.value);  
                    }  
                });  
            },  
  
            showActors: function() {  
                Lampa.Activity.push({  
                    url: 'person/popular',  
                    title: 'Популярні актори',  
                    component: 'category_full',  
                    source: 'tmdb',  
                    page: 1  
                });  
            }  
        };  
  
        // Компонент для відображення акторів  
        function ActorsListComponent(object) {  
            let network = new Lampa.Reguest();  
            let scroll = new Lampa.Scroll({mask: true, over: true, step: 250});  
            let items = [];  
            let html = document.createElement('div');  
            let body = document.createElement('div');  
            let active = 0;  
  
            this.create = function() {  
                this.activity.loader(true);  
  
                // Додаємо клас category-full для правильного відображення сітки  
                body.classList.add('category-full');  
                document.body.classList.add('category-full');  
  
                Lampa.Api.list(object, this.build.bind(this), this.empty.bind(this));  
            };  
  
            this.build = function(data) {  
                if (data.results && data.results.length) {  
                    scroll.minus();  
  
                    // Налаштування скролу  
                    scroll.onEnd = () => {  
                        // Завантаження наступної сторінки  
                        if (object.page < data.total_pages) {  
                            object.page++;  
                            Lampa.Api.list(object, (newData) => {  
                                this.append(newData);  
                            });  
                        }  
                    };  
  
                    scroll.onWheel = (step) => {  
                        if (step > 0) Lampa.Controller.move('down');  
                        else Lampa.Controller.move('up');  
                    };  
  
                    this.append(data);  
  
                    scroll.append(body);  
                    html.appendChild(scroll.render(true));  
  
                    this.activity.loader(false);  
                    this.activity.toggle();  
                } else {  
                    this.empty();  
                }  
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
                            title: element.name,  
                            component: 'actor',  
                            id: element.id,  
                            source: 'tmdb'  
                        });  
                    };  
  
                    card.onFocus = (target) => {  
                        active = items.indexOf(card);  
                        scroll.update(card.render(true));  
                        Lampa.Background.change(Lampa.Utils.cardImgBackground(element));  
                    };  
  
                    body.appendChild(card.render(true));  
                    items.push(card);  
  
                    Lampa.Controller.collectionAppend(card.render(true));  
                });  
  
                Lampa.Controller.collectionSet(html);  
                Lampa.Controller.collectionFocus(false, html);  
            };  
  
            this.empty = function() {  
                let empty = new Lampa.Empty();  
                html.appendChild(empty.render(true));  
                this.start = empty.start;  
                this.activity.loader(false);  
                this.activity.toggle();  
            };  
  
            this.start = function() {  
                Lampa.Controller.add('content', {  
                    toggle: () => {  
                        Lampa.Controller.collectionSet(html);  
                        Lampa.Controller.collectionFocus(false, html);  
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
                network.clear();  
                scroll.destroy();  
                if (html) html.remove();  
                document.body.classList.remove('category-full');  
                items = null;  
            };  
        }  
  
        // Реєструємо компонент  
        Lampa.Component.add('actors_list', ActorsListComponent);  
  
        // Патчимо Activity.push для перехоплення відкриття акторів  
        let originalPush = Lampa.Activity.push;  
        Lampa.Activity.push = function(params) {  
            if (params.url === 'person/popular' && params.component === 'category_full') {  
                params.component = 'actors_list';  
            }  
            return originalPush.call(this, params);  
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