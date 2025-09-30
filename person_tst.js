{
    name: "custom_subscribe_actors",
    version: "1.0.2",
    description: "Додає кнопку підписки на акторів та власне меню 'Персони'",
    author: "Ваше ім'я",
    components: ["button","menu"],
    
    // Конфігурація
    config: {
        subscribe_button: {
            name: "Підписатися",
            component: "button",
            on: "person",
            position: "full",
            page: "person"
        }
    },

    // Ініціалізація
    onStart: function() {
        this.addButton();
        this.addMenu();
    },

    // Додавання кнопки
    addButton: function() {
        var plugin = this;
        
        // Приховуємо стандартну кнопку
        try {
            if(window.select && window.select.component && window.select.component.person) {
                window.select.component.person.buttons = window.select.component.person.buttons || [];
                window.select.component.person.buttons = window.select.component.person.buttons.filter(function(btn) {
                    return !btn.hasOwnProperty('subscribe');
                });
            }
        } catch(e) {}
        
        // Додаємо кастомну кнопку
        lampa.addComponent(this.config.subscribe_button, function(component, object, page) {
            if(object && object.id) {
                var isSubscribed = plugin.isSubscribed(object.id);
                
                component.html = '<div class="selector-button selector-button--fullwidth selector-button--subscribe ' + (isSubscribed ? 'selector-button--active' : '') + '">' +
                    '<div class="selector-button__text">' + (isSubscribed ? 'Відписатися' : 'Підписатися') + '</div>' +
                    '</div>';
                
                component.onTap = function() {
                    plugin.toggleSubscribe(object.id, object.name, object.enName || object.name);
                    page.update();
                };
            }
        });
    },

    // Додавання меню
    addMenu: function() {
        var plugin = this;
        
        // Додаємо пункт меню "Персони"
        lampa.addMenu({
            name: "persons",
            url: "persons",
            component: "main",
            menu: {
                name: "Персони",
                icon: "person"
            },
            on: function(page) {
                plugin.showPersonsPage(page);
            }
        });
    },

    // Показати сторінку з підписаними акторами
    showPersonsPage: function(page) {
        var plugin = this;
        var persons = this.getSubscribedPersons();
        
        page.html('');
        page.title('Персони');
        
        if(persons.length === 0) {
            page.html('<div class="person-empty"><div class="person-empty__text">Немає підписаних акторів</div></div>');
            return;
        }
        
        var grid = document.createElement('div');
        grid.className = 'person-grid';
        
        persons.forEach(function(person) {
            var card = document.createElement('div');
            card.className = 'person-card';
            card.innerHTML = `
                <div class="person-card__poster">
                    <img src="${person.photo || '/img/person_empty.png'}" alt="${person.name}" onerror="this.src='/img/person_empty.png'">
                    <div class="person-card__overlay">
                        <div class="person-card__name">${person.name}</div>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', function() {
                // ВИПРАВЛЕНА ЧАСТИНА: правильне відкриття сторінки актора
                lampa.page.show('person', {id: person.id, name: person.name});
            });
            
            grid.appendChild(card);
        });
        
        page.html(grid);
    },

    // Перевірка чи підписаний актор
    isSubscribed: function(personId) {
        var persons = this.getSubscribedPersons();
        return persons.some(function(person) {
            return person.id == personId;
        });
    },

    // Перемикач підписки
    toggleSubscribe: function(personId, personName, personEnName) {
        var persons = this.getSubscribedPersons();
        var index = persons.findIndex(function(person) {
            return person.id == personId;
        });
        
        if(index !== -1) {
            // Видалити з підписки
            persons.splice(index, 1);
            lampa.noty.show("Ви відписалися від " + personName, "info");
        } else {
            // Додати до підписки
            persons.push({
                id: personId,
                name: personName,
                enName: personEnName,
                photo: this.getPersonPhoto(personId)
            });
            lampa.noty.show("Ви підписалися на " + personName, "success");
        }
        
        // Зберегти в localStorage
        localStorage.setItem('custom_subscribed_persons', JSON.stringify(persons));
    },

    // Отримати фото актора
    getPersonPhoto: function(personId) {
        // Спроба отримати фото з кешу Lampa
        try {
            var cacheKey = 'person_' + personId;
            var cached = lampa.storage.get(cacheKey);
            if(cached && cached.poster) {
                return cached.poster;
            }
        } catch(e) {}
        
        return '/img/person_empty.png';
    },

    // Отримати список підписаних акторів
    getSubscribedPersons: function() {
        try {
            var persons = localStorage.getItem('custom_subscribed_persons');
            return persons ? JSON.parse(persons) : [];
        } catch(e) {
            return [];
        }
    },

    // Очистити підписки (для тестування)
    clearSubscriptions: function() {
        localStorage.removeItem('custom_subscribed_persons');
        lampa.noty.show("Підписки очищені", "info");
    }
}