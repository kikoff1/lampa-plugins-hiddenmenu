// Простий плагін для улюблених акторів
(function() {
    'use strict';
    
    const STORAGE_KEY = 'my_favorite_actors';
    let favorites = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
    
    function isFav(id) {
        return favorites.some(a => a.id === id);
    }
    
    function toggleFav(actor) {
        if (isFav(actor.id)) {
            favorites = favorites.filter(a => a.id !== actor.id);
            showNotify('🗑️ Видалено з улюблених');
        } else {
            favorites.push(actor);
            showNotify('❤️ Додано до улюблених');
        }
        save();
        updateAllButtons();
    }
    
    function showNotify(text) {
        if (window.lampa_notify && lampa_notify.show) {
            lampa_notify.show(text);
        } else {
            console.log(text);
        }
    }
    
    function createFavButton(actor) {
        const btn = document.createElement('div');
        btn.className = 'selector--button';
        btn.style.marginTop = '10px';
        btn.innerHTML = `
            <div class="selector--icon">${isFav(actor.id) ? '❤️' : '🤍'}</div>
            <div class="selector--title">${isFav(actor.id) ? 'Відписатися' : 'Підписатися'}</div>
        `;
        
        btn.onclick = (e) => {
            e.stopPropagation();
            toggleFav(actor);
        };
        
        return btn;
    }
    
    function updateAllButtons() {
        document.querySelectorAll('.selector--button').forEach(btn => {
            if (btn.innerHTML.includes('❤️') || btn.innerHTML.includes('🤍')) {
                const actorId = btn.closest('.person')?.querySelector('.person--name')?.textContent;
                if (actorId) {
                    btn.querySelector('.selector--icon').textContent = isFav(actorId) ? '❤️' : '🤍';
                    btn.querySelector('.selector--title').textContent = isFav(actorId) ? 'Відписатися' : 'Підписатися';
                }
            }
        });
    }
    
    // Додаємо кнопки до карток акторів
    setInterval(() => {
        document.querySelectorAll('.person--selector').forEach(card => {
            if (!card.querySelector('.fav-btn-added')) {
                const selector = card.querySelector('.selector');
                if (selector) {
                    const name = card.closest('.person')?.querySelector('.person--name')?.textContent;
                    const img = card.closest('.person')?.querySelector('.person--poster img')?.src;
                    
                    if (name) {
                        const actor = {
                            id: name,
                            name: name,
                            image: img || ''
                        };
                        
                        selector.appendChild(createFavButton(actor));
                        card.classList.add('fav-btn-added');
                    }
                }
            }
        });
    }, 2000);
    
    // Додаємо пункт меню
    function addMenu() {
        const menuItem = document.createElement('div');
        menuItem.className = 'main--item';
        menuItem.innerHTML = `
            <div class="main--icon">⭐</div>
            <div class="main--title">Улюблені актори (${favorites.length})</div>
        `;
        
        menuItem.onclick = () => {
            const html = `
                <div style="padding: 20px;">
                    <h1>Улюблені актори</h1>
                    ${favorites.length ? 
                        favorites.map(a => `
                            <div style="display: inline-block; margin: 10px; text-align: center; width: 150px;">
                                <img src="${a.image}" style="width: 100px; height: 150px; object-fit: cover; border-radius: 10px;" 
                                     onerror="this.style.display='none'">
                                <div style="margin-top: 10px;">${a.name}</div>
                                <button onclick="(function(){${toggleFav.toString()}})({id:'${a.id}',name:'${a.name}',image:'${a.image}'})" 
                                        style="margin-top: 5px; padding: 5px 10px; background: red; color: white; border: none; border-radius: 5px;">
                                    Видалити
                                </button>
                            </div>
                        `).join('') : 
                        '<div style="text-align: center; padding: 50px;">Немає улюблених акторів</div>'
                    }
                </div>
            `;
            
            // Відкриваємо сторінку
            if (window.lampa_page && lampa_page.show) {
                lampa_page.show({html: html});
            } else {
                document.body.innerHTML = html;
            }
        };
        
        // Додаємо в меню
        const checkMenu = setInterval(() => {
            const menu = document.querySelector('.main--menu');
            if (menu) {
                clearInterval(checkMenu);
                menu.appendChild(menuItem);
            }
        }, 1000);
    }
    
    // Запуск
    if (window.lampa) {
        addMenu();
    } else {
        document.addEventListener('lampa-loaded', addMenu);
    }
    
    console.log('Плагін улюблених акторів завантажено');
    
})();