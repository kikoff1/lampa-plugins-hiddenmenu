// Lampa Favorite Actors Plugin
// Версія: 3.0
// Автор: Plugin for Lampa

lampa_plugin_favorite_actors = {
    name: 'favorite_actors',
    version: '3.0',
    description: 'Додає функціонал підписки на акторів',
    
    // Список улюблених акторів
    favorites: [],
    
    // Ініціалізація плагіна
    init: function() {
        console.log('Ініціалізація плагіна Favorite Actors');
        
        // Завантажуємо збережені дані
        this.loadFavorites();
        
        // Додаємо пункт меню
        this.addMenuButton();
        
        // Модифікуємо картки акторів
        this.modifyActorCards();
        
        // Слідкуємо за змінами DOM
        this.startObserver();
    },
    
    // Завантаження даних
    loadFavorites: function() {
        try {
            const saved = lampa_utils.storage.get('favorite_actors_list');
            if (saved) this.favorites = JSON.parse(saved);
        } catch (e) {
            console.error('Помилка завантаження улюблених акторів:', e);
            this.favorites = [];
        }
    },
    
    // Збереження даних
    saveFavorites: function() {
        try {
            lampa_utils.storage.set('favorite_actors_list', JSON.stringify(this.favorites));
        } catch (e) {
            console.error('Помилка збереження улюблених акторів:', e);
        }
    },
    
    // Перевірка чи актор в улюблених
    isFavorite: function(actorId) {
        return this.favorites.some(actor => actor.id == actorId);
    },
    
    // Додавання актора
    addFavorite: function(actorData) {
        if (!this.isFavorite(actorData.id)) {
            this.favorites.push({
                id: actorData.id,
                name: actorData.name,
                image: actorData.image,
                url: actorData.url
            });
            this.saveFavorites();
            return true;
        }
        return false;
    },
    
    // Видалення актора
    removeFavorite: function(actorId) {
        const index = this.favorites.findIndex(actor => actor.id == actorId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.saveFavorites();
            return true;
        }
        return false;
    },
    
    // Додаємо пункт в меню
    addMenuButton: function() {
        // Чекаємо поки меню буде доступне
        const checkMenu = setInterval(() => {
            if (window.lampa_menus && lampa_menus.main) {
                clearInterval(checkMenu);
                
                // Додаємо наш пункт меню
                lampa_menus.main.add({
                    name: 'favorite_actors',
                    title: 'Улюблені актори',
                    icon: '❤️',
                    component: {
                        template: () => this.createFavoritesPage()
                    }
                });
                
                console.log('Пункт меню додано');
            }
        }, 1000);
    },
    
    // Створюємо сторінку з улюбленими акторами
    createFavoritesPage: function() {
        if (this.favorites.length === 0) {
            return `
                <div class="fullscreen-page">
                    <div class="fullscreen-page--head">
                        <div class="fullscreen-page--title">Улюблені актори</div>
                    </div>
                    <div class="fullscreen-page--content">
                        <div style="text-align: center; padding: 50px 20px;">
                            <div style="font-size: 48px; margin-bottom: 20px;">❤️</div>
                            <div style="font-size: 18px; color: #888;">У вас ще немає улюблених акторів</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="fullscreen-page">
                <div class="fullscreen-page--head">
                    <div class="fullscreen-page--title">Улюблені актори (${this.favorites.length})</div>
                </div>
                <div class="fullscreen-page--content">
                    <div class="person-view" style="padding: 20px;">
                        ${this.favorites.map(actor => `
                            <div class="person--card" data-id="${actor.id}" style="margin: 10px;">
                                <div class="person--poster">
                                    <div class="person--image">
                                        <img src="${actor.image}" alt="${actor.name}" 
                                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9IiMzMzMiPjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjODg4Ij7QndC10YI8L3RleHQ+PC9zdmc+'">
                                    </div>
                                    <div class="person--actions">
                                        <div class="selector">
                                            <div class="selector--button selector--remove-favorite" 
                                                 onclick="lampa_plugin_favorite_actors.removeFromFavorites('${actor.id}')"
                                                 style="background: rgba(255,0,0,0.2);">
                                                <div class="selector--icon">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="red">
                                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                                    </svg>
                                                </div>
                                                <div class="selector--title">Видалити</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="person--name">${actor.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },
    
    // Видалення зі сторінки улюблених
    removeFromFavorites: function(actorId) {
        if (this.removeFavorite(actorId)) {
            lampa_notify.show('Актора видалено з улюблених');
            // Оновлюємо сторінку
            setTimeout(() => {
                if (window.lampa_component && lampa_component.update) {
                    lampa_component.update();
                }
            }, 500);
        }
    },
    
    // Модифікація карток акторів
    modifyActorCards: function() {
        // Ця функція буде викликатися через Observer
    },
    
    // Спостерігач за змінами DOM
    startObserver: function() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        this.processActorCard(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Також перевіряємо вже існуючі картки
        setTimeout(() => {
            document.querySelectorAll('.person--selector').forEach(card => {
                this.processActorCard(card);
            });
        }, 2000);
    },
    
    // Обробка картки актора
    processActorCard: function(element) {
        // Шукаємо контейнер з кнопками
        const selector = element.querySelector ? element.querySelector('.selector') : null;
        if (!selector) return;
        
        // Перевіряємо чи вже додана наша кнопка
        if (selector.querySelector('.selector--favorite-custom')) return;
        
        // Знаходимо інформацію про актора
        const personCard = element.closest('.person');
        if (!personCard) return;
        
        const actorName = personCard.querySelector('.person--name')?.textContent || 'Актор';
        const actorImage = personCard.querySelector('.person--poster img')?.src || '';
        const actorUrl = window.location.href;
        const actorId = actorUrl.split('/').pop() || Date.now().toString();
        
        const actorData = {
            id: actorId,
            name: actorName,
            image: actorImage,
            url: actorUrl
        };
        
        // Приховуємо стандартну кнопку
        const defaultFavorite = selector.querySelector('.selector--favorite');
        if (defaultFavorite) {
            defaultFavorite.style.display = 'none';
        }
        
        // Додаємо нашу кнопку
        this.addCustomButton(selector, actorData);
    },
    
    // Додавання кастомної кнопки
    addCustomButton: function(container, actorData) {
        const isFav = this.isFavorite(actorData.id);
        
        const button = document.createElement('div');
        button.className = 'selector--button selector--favorite-custom';
        button.innerHTML = `
            <div class="selector--icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="${isFav ? 'red' : 'currentColor'}">
                    <path d="${isFav ? 
                        'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' : 
                        'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z'
                    }"/>
                </svg>
            </div>
            <div class="selector--title">${isFav ? 'Відписатися' : 'Підписатися'}</div>
        `;
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            this.toggleFavorite(actorData, button);
        });
        
        container.appendChild(button);
    },
    
    // Перемикач улюблених
    toggleFavorite: function(actorData, buttonElement) {
        if (this.isFavorite(actorData.id)) {
            this.removeFavorite(actorData.id);
            this.updateButton(buttonElement, false);
            lampa_notify.show('Актора видалено з улюблених');
        } else {
            this.addFavorite(actorData);
            this.updateButton(buttonElement, true);
            lampa_notify.show('Актора додано до улюблених');
        }
    },
    
    // Оновлення вигляду кнопки
    updateButton: function(button, isFavorite) {
        const icon = button.querySelector('svg');
        const title = button.querySelector('.selector--title');
        
        if (icon && title) {
            icon.style.fill = isFavorite ? 'red' : 'currentColor';
            title.textContent = isFavorite ? 'Відписатися' : 'Підписатися';
            
            // Оновлюємо шлях в SVG
            const path = icon.querySelector('path');
            if (path) {
                path.setAttribute('d', isFavorite ? 
                    'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' :
                    'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z'
                );
            }
        }
    }
};

// Автоматична ініціалізація при завантаженні Lampa
if (window.lampa) {
    lampa_plugin_favorite_actors.init();
} else {
    document.addEventListener('lampa-loaded', function() {
        lampa_plugin_favorite_actors.init();
    });
}