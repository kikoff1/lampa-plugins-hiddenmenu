function startPlugin() {  
    window.premium_status_unlocker = true  
  
    // Перевизначаємо функцію перевірки Premium  
    if (window.Lampa && window.Lampa.Account) {  
        const originalHasPremium = window.Lampa.Account.hasPremium  
          
        window.Lampa.Account.hasPremium = function() {  
            // Завжди повертаємо true для статусів  
            return true  
        }  
          
        // Зберігаємо оригінальну функцію для можливого відновлення  
        window.Lampa.Account.originalHasPremium = originalHasPremium  
    }  
  
    // Модифікуємо функцію toggle для улюблених  
    if (window.Lampa && window.Lampa.Favorite) {  
        const originalToggle = window.Lampa.Favorite.toggle  
          
        window.Lampa.Favorite.toggle = function(where, data) {  
            // Дозволяємо всі статуси  
            return originalToggle.call(this, where, data)  
        }  
          
        window.Lampa.Favorite.originalToggle = originalToggle  
    }  
  
    // Перевизначаємо функцію check для улюблених  
    if (window.Lampa && window.Lampa.Favorite) {  
        const originalCheck = window.Lampa.Favorite.check  
          
        window.Lampa.Favorite.check = function(data) {  
            const result = originalCheck.call(this, data)  
              
            // Переконуємось що всі статуси доступні  
            const statusMarks = ['look', 'viewed', 'scheduled', 'continued', 'thrown']  
            statusMarks.forEach(mark => {  
                if (result[mark] === undefined) {  
                    result[mark] = false  
                }  
            })  
              
            return result  
        }  
          
        window.Lampa.Favorite.originalCheck = originalCheck  
    }  
  
    // Додаємо обробник для меню карток  
    if (window.Lampa && window.Lampa.Card) {  
        const originalOnMenu = window.Lampa.Card.prototype.onMenu  
          
        window.Lampa.Card.prototype.onMenu = function(target, data) {  
            // Викликаємо оригінальний метод  
            originalOnMenu.call(this, target, data)  
              
            // Модифікуємо результати  
            if (this.menu_items) {  
                this.menu_items.forEach(item => {  
                    if (item.collect && !window.Lampa.Account.hasPremium()) {  
                        // Прибираємо обмеження  
                        item.noenter = false  
                        item.ghost = false  
                    }  
                })  
            }  
        }  
          
        window.Lampa.Card.originalOnMenu = originalOnMenu  
    }  
  
    // Додаємо функцію відновлення  
    window.restoreOriginalPremium = function() {  
        if (window.Lampa && window.Lampa.Account && window.Lampa.Account.originalHasPremium) {  
            window.Lampa.Account.hasPremium = window.Lampa.Account.originalHasPremium  
        }  
          
        if (window.Lampa && window.Lampa.Favorite && window.Lampa.Favorite.originalToggle) {  
            window.Lampa.Favorite.toggle = window.Lampa.Favorite.originalToggle  
        }  
          
        if (window.Lampa && window.Lampa.Favorite && window.Lampa.Favorite.originalCheck) {  
            window.Lampa.Favorite.check = window.Lampa.Favorite.originalCheck  
        }  
          
        if (window.Lampa && window.Lampa.Card && window.Lampa.Card.originalOnMenu) {  
            window.Lampa.Card.prototype.onMenu = window.Lampa.Card.originalOnMenu  
        }  
    }  
  
    console.log('Premium Status Unlocker plugin loaded')  
}  
  
// Запускаємо плагін  
if (window.appready) {  
    startPlugin()  
} else {  
    window.addEventListener('load', startPlugin)  
}