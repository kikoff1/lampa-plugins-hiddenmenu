// Плагін для підписки на акторів в Lampa
// Назва: FavoriteActors
// Версія: 1.0

(function() {
    'use strict';

    // Зберігаємо список улюблених акторів в localStorage
    const STORAGE_KEY = 'favorite_actors';
    
    let favoriteActors = [];

    // Завантажуємо список улюблених акторів при ініціалізації
    function loadFavoriteActors() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                favoriteActors = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Помилка завантаження улюблених акторів:', e);
            favoriteActors = [];
        }
    }

    // Зберігаємо список улюблених акторів
    function saveFavoriteActors() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteActors));
        } catch (e) {
            console.error('Помилка збереження улюблених акторів:', e);
        }
    }

    // Перевіряємо чи актор є в улюблених
    function isActorFavorite(actorId) {
        return favoriteActors.some(actor => actor.id === actorId);
    }

    // Додаємо актора до улюблених
    function addActorToFavorites(actorInfo) {
        if (!isActorFavorite(actorInfo.id)) {
            favoriteActors.push({
                id: actorInfo.id,
                name: actorInfo.name,
                image: actorInfo.image,
                url: actorInfo.url
            });
            saveFavoriteActors();
            return true;
        }
        return false;
    }

    // Видаляємо актора з улюблених
    function removeActorFromFavorites(actorId) {
        const initialLength = favoriteActors.length;
        favoriteActors = favoriteActors.filter(actor => actor.id !== actorId);
        if (favoriteActors.length !== initialLength) {
            saveFavoriteActors();
            return true;
        }
        return false;
    }

    // Створюємо кнопку підписки/відписки
    function createSubscriptionButton(actorInfo) {
        const isFavorite = isActorFavorite(actorInfo.id);
        
        const button = document.createElement('div');
        button.className = 'selector--button selector--subs';
        button.innerHTML = `
            <div class="selector--icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="${isFavorite ? 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' : 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z'}"/>
                </svg>
            </div>
            <div class="selector--title">${isFavorite ? 'Відписатися' : 'Підписатися'}</div>
        `;

        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (isActorFavorite(actorInfo.id)) {
                removeActorFromFavorites(actorInfo.id);
                button.querySelector('.selector--title').textContent = 'Підписатися';
                // Оновлюємо іконку
                const iconPath = button.querySelector('path');
                iconPath.setAttribute('d', 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z');
                
                Lampa.Notify.show('Актора видалено з улюблених', 3000);
            } else {
                addActorToFavorites(actorInfo);
                button.querySelector('.selector--title').textContent = 'Відписатися';
                // Оновлюємо іконку
                const iconPath = button.querySelector('path');
                iconPath.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
                
                Lampa.Notify.show('Актора додано до улюблених', 3000);
            }
        });

        return button;
    }

    // Модифікуємо картку актора
    function modifyActorCard() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('person--selector')) {
                        // Знаходимо контейнер з кнопками
                        const selectorContainer = node.querySelector('.selector');
                        if (selectorContainer) {
                            // Знаходимо інформацію про актора
                            const actorCard = node.closest('.person');
                            if (actorCard) {
                                const actorName = actorCard.querySelector('.person--name')?.textContent;
                                const actorImage = actorCard.querySelector('.person--poster img')?.src;
                                const actorUrl = window.location.href;
                                
                                // Отримуємо ID актора з URL
                                const actorId = actorUrl.split('/').pop() || Date.now().toString();
                                
                                const actorInfo = {
                                    id: actorId,
                                    name: actorName || 'Невідомий актор',
                                    image: actorImage || '',
                                    url: actorUrl
                                };

                                // Приховуємо стандартну кнопку "У вибране"
                                const favoriteBtn = selectorContainer.querySelector('.selector--favorite');
                                if (favoriteBtn) {
                                    favoriteBtn.style.display = 'none';
                                }

                                // Додаємо нашу кнопку
                                const existingSubsBtn = selectorContainer.querySelector('.selector--subs');
                                if (!existingSubsBtn) {
                                    const subscriptionButton = createSubscriptionButton(actorInfo);
                                    selectorContainer.appendChild(subscriptionButton);
                                }
                            }
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Створюємо сторінку з улюбленими акторами
    function createFavoriteActorsPage() {
        const page = {
            title: 'Улюблені актори',
            component: {
                template: `
                    <div class="fullscreen-page">
                        <div class="fullscreen-page--head">
                            <div class="fullscreen-page--title">Улюблені актори</div>
                        </div>
                        <div class="fullscreen-page--content">
                            <div class="person-view" id="favorite-actors-list">
                                ${favoriteActors.length === 0 ? 
                                    '<div class="person-view--empty">У вас ще немає улюблених акторів</div>' : 
                                    ''}
                            </div>
                        </div>
                    </div>
                `,
                data: function() {
                    return {
                        actors: favoriteActors
                    };
                },
                mounted: function() {
                    this.renderActors();
                },
                methods: {
                    renderActors: function() {
                        const container = document.getElementById('favorite-actors-list');
                        if (!container) return;

                        if (this.actors.length === 0) {
                            container.innerHTML = '<div class="person-view--empty">У вас ще немає улюблених акторів</div>';
                            return;
                        }

                        container.innerHTML = this.actors.map(actor => `
                            <div class="person--card" data-id="${actor.id}">
                                <div class="person--poster">
                                    <div class="person--image">
                                        <img src="${actor.image}" alt="${actor.name}" loading="lazy">
                                    </div>
                                    <div class="person--actions">
                                        <div class="selector">
                                            <div class="selector--button selector--subs-remove" data-id="${actor.id}">
                                                <div class="selector--icon">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M17 13H7v-2h10v2zm4-6h-3V3c0-1.1-.9-2-2-2H8C6.9 1 6 1.9 6 3v4H3c-1.1 0-2 .9-2 2s.9 2 2 2h1v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h1c1.1 0 2-.9 2-2s-.9-2-2-2zM8 3h8v4H8V3zm10 16H6v-8h12v8z"/>
                                                    </svg>
                                                </div>
                                                <div class="selector--title">Видалити</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="person--name">${actor.name}</div>
                            </div>
                        `).join('');

                        // Додаємо обробники подій для кнопок видалення
                        container.querySelectorAll('.selector--subs-remove').forEach(btn => {
                            btn.addEventListener('click', (e) => {
                                const actorId = btn.getAttribute('data-id');
                                this.removeActor(actorId);
                            });
                        });
                    },
                    removeActor: function(actorId) {
                        if (removeActorFromFavorites(actorId)) {
                            this.actors = favoriteActors;
                            this.renderActors();
                            Lampa.Notify.show('Актора видалено', 3000);
                        }
                    }
                }
            }
        };

        return page;
    }

    // Додаємо пункт меню
    function addMenuButton() {
        // Чекаємо поки завантажиться головне меню
        const menuObserver = new MutationObserver(function(mutations) {
            const menu = document.querySelector('.main--menu');
            if (menu && !menu.querySelector('.menu--favorite-actors')) {
                const menuItem = document.createElement('div');
                menuItem.className = 'main--item menu--favorite-actors';
                menuItem.innerHTML = `
                    <div class="main--icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </div>
                    <div class="main--title">Улюблені актори</div>
                `;

                menuItem.addEventListener('click', function() {
                    const page = createFavoriteActorsPage();
                    Lampa.Page.show(page);
                });

                menu.appendChild(menuItem);
            }
        });

        menuObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Ініціалізація плагіна
    function init() {
        console.log('Ініціалізація плагіна FavoriteActors...');
        
        // Завантажуємо улюблених акторів
        loadFavoriteActors();
        
        // Модифікуємо картки акторів
        modifyActorCard();
        
        // Додаємо кнопку в меню
        addMenuButton();
        
        console.log('Плагін FavoriteActors успішно ініціалізовано');
    }

    // Запускаємо плагін коли Lampa буде готова
    if (window.Lampa) {
        init();
    } else {
        document.addEventListener('lampa-loaded', init);
    }

})();