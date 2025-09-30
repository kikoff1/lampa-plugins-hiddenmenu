{
    name: "Favorite Actors Plugin",
    version: "1.0.0",
    description: "Додає функціонал підписки на акторів",

    // Головна функція плагіна
    run: function() {
        console.log("Favorite Actors Plugin запущено!");
        
        const STORAGE_KEY = 'favorite_actors_list';
        let favorites = [];
        
        // Завантажуємо улюблених акторів
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) favorites = JSON.parse(saved);
        } catch(e) {
            console.error("Помилка завантаження:", e);
        }
        
        // Функції для роботи з улюбленими
        const saveFavorites = () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        };
        
        const isFavorite = (actorId) => {
            return favorites.some(actor => actor.id === actorId);
        };
        
        const toggleFavorite = (actorInfo) => {
            const index = favorites.findIndex(a => a.id === actorInfo.id);
            
            if (index > -1) {
                favorites.splice(index, 1);
                Lampa.Notify.show(`Видалено ${actorInfo.name} з улюблених`);
            } else {
                favorites.push(actorInfo);
                Lampa.Notify.show(`Додано ${actorInfo.name} до улюблених`);
            }
            saveFavorites();
            updateButtons();
        };
        
        // Оновлення всіх кнопок
        const updateButtons = () => {
            document.querySelectorAll('.favorite-actor-btn').forEach(btn => {
                const actorId = btn.getAttribute('data-actor-id');
                if (actorId) {
                    const icon = btn.querySelector('.favorite-icon');
                    const text = btn.querySelector('.favorite-text');
                    
                    if (isFavorite(actorId)) {
                        if (icon) icon.textContent = '❤️';
                        if (text) text.textContent = 'Відписатися';
                    } else {
                        if (icon) icon.textContent = '🤍';
                        if (text) text.textContent = 'Підписатися';
                    }
                }
            });
        };
        
        // Додаємо кнопку на картку актора
        const addButtonToActorCard = () => {
            const actorSelectors = document.querySelectorAll('.person--selector');
            
            actorSelectors.forEach(selector => {
                // Перевіряємо чи вже додана кнопка
                if (selector.querySelector('.favorite-actor-btn')) return;
                
                const container = selector.querySelector('.selector');
                if (!container) return;
                
                // Знаходимо інформацію про актора
                const personCard = selector.closest('.person');
                if (!personCard) return;
                
                const nameElem = personCard.querySelector('.person--name');
                const imageElem = personCard.querySelector('.person--poster img');
                
                if (!nameElem) return;
                
                const actorInfo = {
                    id: nameElem.textContent.trim(),
                    name: nameElem.textContent.trim(),
                    image: imageElem ? imageElem.src : ''
                };
                
                // Створюємо кнопку
                const button = document.createElement('div');
                button.className = 'selector--button favorite-actor-btn';
                button.setAttribute('data-actor-id', actorInfo.id);
                button.style.cssText = 'margin-top: 8px;';
                
                button.innerHTML = `
                    <div class="selector--icon favorite-icon">${isFavorite(actorInfo.id) ? '❤️' : '🤍'}</div>
                    <div class="selector--title favorite-text">${isFavorite(actorInfo.id) ? 'Відписатися' : 'Підписатися'}</div>
                `;
                
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(actorInfo);
                });
                
                container.appendChild(button);
            });
        };
        
        // Спостерігач за змінами DOM
        const observer = new MutationObserver(function(mutations) {
            let shouldUpdate = false;
            
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        if (node.classList && node.classList.contains('person--selector')) {
                            shouldUpdate = true;
                        }
                        if (node.querySelector && node.querySelector('.person--selector')) {
                            shouldUpdate = true;
                        }
                    }
                });
            });
            
            if (shouldUpdate) {
                setTimeout(addButtonToActorCard, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Додаємо пункт в головне меню
        const addMenuButton = () => {
            // Чекаємо поки меню завантажиться
            const checkMenu = setInterval(() => {
                const mainMenu = document.querySelector('.main--menu');
                if (mainMenu && !mainMenu.querySelector('.favorite-actors-menu-item')) {
                    clearInterval(checkMenu);
                    
                    const menuItem = document.createElement('div');
                    menuItem.className = 'main--item favorite-actors-menu-item';
                    menuItem.innerHTML = `
                        <div class="main--icon">⭐</div>
                        <div class="main--title">Улюблені актори (${favorites.length})</div>
                    `;
                    
                    menuItem.addEventListener('click', function() {
                        // Створюємо сторінку з улюбленими акторами
                        const favoritesPage = `
                            <div class="fullscreen-page">
                                <div class="fullscreen-page--head">
                                    <div class="fullscreen-page--title">Улюблені актори</div>
                                </div>
                                <div class="fullscreen-page--content">
                                    <div style="padding: 20px;">
                                        ${favorites.length === 0 ? 
                                            `<div style="text-align: center; padding: 50px 20px; color: #888;">
                                                <div style="font-size: 48px; margin-bottom: 20px;">⭐</div>
                                                <div style="font-size: 18px;">У вас ще немає улюблених акторів</div>
                                            </div>` :
                                            `<div class="person-view" style="display: flex; flex-wrap: wrap; gap: 15px;">
                                                ${favorites.map(actor => `
                                                    <div class="person--card" style="width: 150px;">
                                                        <div class="person--poster">
                                                            <div class="person--image">
                                                                <img src="${actor.image}" alt="${actor.name}" 
                                                                     style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;"
                                                                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDE1MCAyMDAiIGZpbGw9IiMzMzMiPjx0ZXh0IHg9Ijc1IiB5PSIxMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM4ODgiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
                                                            </div>
                                                        </div>
                                                        <div class="person--name" style="text-align: center; margin-top: 10px; font-size: 14px;">${actor.name}</div>
                                                        <div style="text-align: center; margin-top: 10px;">
                                                            <button onclick="
                                                                const plugin = window.lampa_plugins.find(p => p.name === 'Favorite Actors Plugin');
                                                                if (plugin) plugin.toggleFavorite(${JSON.stringify(actor).replace(/"/g, '&quot;')});
                                                                setTimeout(() => window.location.reload(), 500);
                                                            " style="padding: 5px 10px; background: #ff4444; color: white; border: none; border-radius: 4px; font-size: 12px;">
                                                                Видалити
                                                            </button>
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>`
                                        }
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        // Відкриваємо сторінку
                        Lampa.Page.show({
                            html: favoritesPage,
                            onReady: function() {
                                console.log("Сторінка улюблених акторів завантажена");
                            }
                        });
                    });
                    
                    mainMenu.appendChild(menuItem);
                    console.log("Пункт меню додано");
                }
            }, 1000);
        };
        
        // Додаємо метод для виклику з HTML
        this.toggleFavorite = toggleFavorite;
        
        // Початкова ініціалізація
        setTimeout(() => {
            addButtonToActorCard();
            addMenuButton();
        }, 2000);
        
        // Періодично оновлюємо кнопки (на випадок динамічного завантаження)
        setInterval(() => {
            addButtonToActorCard();
            
            // Оновлюємо лічильник в меню
            const menuItem = document.querySelector('.favorite-actors-menu-item');
            if (menuItem) {
                const titleElem = menuItem.querySelector('.main--title');
                if (titleElem) {
                    titleElem.textContent = `Улюблені актори (${favorites.length})`;
                }
            }
        }, 3000);
    }
}