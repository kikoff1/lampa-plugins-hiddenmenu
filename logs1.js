showLogs: function() {  
    var self = this;  
      
    if (this.logs.length === 0) {  
        Lampa.Noty.show('Логи порожні. Спочатку відкрийте список акторів.');  
        return;  
    }  
  
    var logsText = this.logs.join('\n');  
      
    // Створюємо textarea для легкого виділення тексту  
    var textarea = $('<textarea readonly style="width: 100%; height: 60vh; font-family: monospace; font-size: 0.9em; padding: 10px; background: #1a1a1a; color: #fff; border: 1px solid #333; resize: none;"></textarea>');  
    textarea.val(logsText);  
      
    var container = $('<div class="about"></div>');  
    container.append(textarea);  
      
    Lampa.Modal.open({  
        title: 'Логи акторів',  
        html: container,  
        size: 'large',  
        buttons: [  
            {  
                name: 'Скопіювати',  
                onSelect: function() {  
                    // Виділяємо весь текст у textarea  
                    textarea[0].select();  
                    textarea[0].setSelectionRange(0, 99999); // Для мобільних пристроїв  
                      
                    // Спроба скопіювати в буфер обміну  
                    try {  
                        var successful = document.execCommand('copy');  
                        if (successful) {  
                            Lampa.Noty.show('Логи скопійовано');  
                        } else {  
                            Lampa.Noty.show('Текст виділено. Скопіюйте вручну (Ctrl+C або довге натискання)');  
                        }  
                    } catch (err) {  
                        Lampa.Noty.show('Текст виділено. Скопіюйте вручну (Ctrl+C або довге натискання)');  
                    }  
                }  
            },  
            {  
                name: 'Виділити все',  
                onSelect: function() {  
                    textarea[0].select();  
                    textarea[0].setSelectionRange(0, 99999);  
                    Lampa.Noty.show('Текст виділено. Скопіюйте вручну');  
                }  
            },  
            {  
                name: 'Очистити логи',  
                onSelect: function() {  
                    self.logs = [];  
                    Lampa.Noty.show('Логи очищено');  
                    Lampa.Modal.close();  
                }  
            },  
            {  
                name: 'Закрити',  
                onSelect: function() {  
                    Lampa.Modal.close();  
                }  
            }  
        ]  
    });  
      
    // Автоматично виділяємо текст при відкритті  
    setTimeout(function() {  
        textarea[0].focus();  
        textarea[0].select();  
    }, 100);  
}