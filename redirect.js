(function() {     
    'use strict';     
    Lampa.Platform.tv();     
        
    // Додаємо локалізацію    
    Lampa.Lang.add({    
        location_redirect_title: {    
            ru: 'Смена сервера',    
            uk: 'Зміна сервера',    
            en: 'Change server'    
        },    
        location_redirect_current: {    
            ru: 'Текущий',    
            uk: 'Поточний',    
            en: 'Current'    
        },    
        location_redirect_select_domain: {    
            ru: 'Выберите домен Lampa',    
            uk: 'Виберіть домен Lampa',    
            en: 'Choose Lampa domain'    
        },  
        location_redirect_server_address: {  
            ru: 'Адрес сервера',  
            uk: 'Адреса сервера',  
            en: 'Server address'  
        },  
        location_redirect_server_descr: {  
            ru: 'Нажмите для ввода, смену сервера можно сделать кнопкой в верхнем баре',  
            uk: 'Натисніть для вводу, зміну сервера можна зробити кнопкою у верхньому барі',  
            en: 'Click to enter, server change can be done with button in top bar'  
        }  
    });     
        
    var icon_server_redirect = `<svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">    
        <path d="M19 2L24 7L19 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>    
        <path d="M19 24L24 29L19 34" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>    
        <path d="M14 7H8C5.79086 7 4 8.79086 4 11V25C4 27.2091 5.79086 29 8 29H14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>    
        <path d="M24 7H30C32.2091 7 34 8.79086 34 11V25C34 27.2091 32.2091 29 30 29H24" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>    
        <circle cx="19" cy="18" r="3" stroke="white" stroke-width="2"/>    
    </svg>`;    
        
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://'  
        
    function startMe() {     
        if (window.location.search!='?redirect=1') {     
            if(window.location.hostname!=Lampa.Storage.get('location_server')) {     
                if (Lampa.Storage.get('location_server')!='-' && Lampa.Storage.get('location_server')!='')     
                    window.location.href = server_protocol + Lampa.Storage.get('location_server')+'?redirect=1';     
            }     
        } else {     
            Lampa.Storage.set('location_server','-');     
        }     
            
        // Видаляємо стару кнопку якщо є  
        $('#REDIRECT').remove()  
          
        // Додаємо кнопку в хедер  
        if(Lampa.Storage.get('location_server') && Lampa.Storage.get('location_server') != '-') {  
            var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen">' + icon_server_redirect + '</div>';  
            $('#app > div.head > div > div.head__actions').append(domainBUTT);  
            $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');  
              
            $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {  
                window.location.href = server_protocol + Lampa.Storage.get('location_server')  
            });  
        }  
            
        Lampa.SettingsApi.addComponent({     
            component: 'location_redirect',     
            name: Lampa.Lang.translate('location_redirect_title'),     
            icon: icon_server_redirect     
        });     
            
        Lampa.SettingsApi.addParam({     
            component: 'location_redirect',     
            param: {     
                name: 'location_server',     
                type: 'input',   
                values: '',  
                placeholder: 'lampaua.mooo.com або lampa.mx',  
                default: ''  
            },     
            field: {     
                name: Lampa.Lang.translate('location_redirect_server_address'),    
                description: Lampa.Lang.translate('location_redirect_server_descr')  
            },     
            onChange: function (value) {     
                if (value == '') {  
                    $('#REDIRECT').remove()  
                } else {  
                    startMe();  
                }  
            }     
        });     
    }     
        
    if(window.appready) startMe();     
    else {     
        Lampa.Listener.follow('app', function(e) {     
            if(e.type == 'ready') {     
                startMe();     
            }     
        });     
    }     
})();