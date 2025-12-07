// Версія плагіну: 4.5 - Фінальна версія з адаптацією під Lampa 3.0.0+  
// Поєднує розділення кнопок та оптимізовані SVG/стилі  
  
(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'EnhancedButtonSeparator';  
    let observer = null;  
      
    function initPlugin() {  
        if (typeof Lampa === 'undefined') {  
            setTimeout(initPlugin, 100);  
            return;  
        }  
          
        initStyles();  
          
        Lampa.Listener.follow('full', function(event) {  
            if (event.type === 'complite') {  
                setTimeout(() => {  
                    processButtons(event);  
                    updateButtonSVGs();  
                    startObserver(event);  
                }, 300);  
            }  
              
            if (event.type === 'destroy') {  
                stopObserver();  
            }  
        });  
    }  
      
    function initStyles() {  
        if (!document.getElementById('enhanced-buttons-style')) {  
            const style = document.createElement('style');  
            style.id = 'enhanced-buttons-style';  
            style.textContent = `  
                .full-start__button {  
                    position: relative;  
                    transition: transform 0.2s ease !important;  
                }  
                .full-start__button:active {  
                    transform: scale(0.98) !important;  
                }  
                  
                .full-start__button.view--online svg path { fill: #2196f3 !important; }  
                .full-start__button.view--torrent svg path { fill: lime !important; }  
                .full-start__button.view--trailer svg path { fill: #f44336 !important; }  
                  
                .full-start__button svg {  
                    width: 1.5em !important;  
                    height: 1.5em !important;  
                }  
                  
                .full-start__button.loading::before {  
                    content: '';  
                    position: absolute;  
                    top: 0; left: 0; right: 0;  
                    height: 2px;  
                    background: rgba(255,255,255,0.5);  
                    animation: loading 1s linear infinite;  
                }  
                  
                @keyframes loading {  
                    from { transform: translateX(-100%); }  
                    to   { transform: translateX(100%); }  
                }  
                  
                @media (max-width: 767px) {  
                    .full-start__button {  
                        min-height: 44px !important;  
                        padding: 10px !important;  
                    }  
                }  
            `;  
            document.head.appendChild(style);  
        }  
    }  
      
    /* === SVGs === */  
    const svgs = {  
        torrent: `  
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">  
                <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2zM40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29c4.7,0,5.9-3.437,5.7-3.937c-1.2-3.5-4.2-11.5-4.2-11.5s-0.3-1.1,1.2-1.6c1.5-0.5,5.4-1.2,5.4-1.2s1.5-0.2,1.8,0.5c0.3,0.7,4.2,11.3,4.2,11.3S42.1,30.963,40.5,30.963z" fill="currentColor"/>  
            </svg>  
        `,  
        online: `  
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">  
                <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm6.5 9.5l-7.5 5.5v11l7.5-5.5v-11z" fill="currentColor"/>  
            </svg>  
        `,  
        trailer: `  
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 70">  
                <path d="M10 5h60c2.761 0 5 2.239 5 5v50c0 2.761-2.239 5-5 5H10c-2.761 0-5-2.239-5-5V10c0-2.761 2.239-5 5-5zm20 15v30l25-15-25-15z" fill="currentColor"/>  
            </svg>  
        `  
    };  
      
    function processButtons(event) {  
        try {  
            const render = event.object.activity.render();  
            const mainContainer = render.find('.full-start-new__buttons');  
            const hiddenContainer = render.find('.buttons--container');  
              
            if (!mainContainer.length) return;  
              
            // Додаємо тільки торренти та трейлери (без онлайн кнопки)  
            const torrentBtn = hiddenContainer.find('.view--torrent');  
            const trailerBtn = hiddenContainer.find('.view--trailer');  
              
            if (torrentBtn.length > 0) {  
                torrentBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(torrentBtn);  
            }  
              
            if (trailerBtn.length > 0) {  
                trailerBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(trailerBtn);  
            }  
              
            reorderButtons(mainContainer);  
              
            if (Lampa.Controller) {  
                setTimeout(() => {  
                    Lampa.Controller.collectionSet(mainContainer.parent());  
                }, 200);  
            }  
              
        } catch (error) {  
            console.error(`${PLUGIN_NAME}: Помилка`, error);  
        }  
    }  
      
    function updateButtonSVGs() {  
        // Оновлюємо кнопку "Дивитись" з іконкою онлайн  
        $('.full-start__button.button--play').each(function() {  
            const button = $(this);  
            const oldSvg = button.find('svg');  
            if (oldSvg.length > 0) {  
                // Повністю замінюємо SVG контент  
                oldSvg.empty(); // Очищуємо старий контент  
                oldSvg.append($(svgs.online).html()); // Додаємо новий контент  
                oldSvg.attr('viewBox', '0 0 32 32');  
                  
                // Додаємо синій колір через CSS  
                button.addClass('view--online');  
                console.log('Іконку онлайн застосовано до кнопки Дивитись');  
            }  
        });  
          
        // Оновлюємо торренти та трейлери  
        $('.full-start__button.view--torrent').each(function() {  
            const button = $(this);  
            const oldSvg = button.find('svg');  
            if (oldSvg.length > 0) {  
                oldSvg.empty();  
                oldSvg.append($(svgs.torrent).html());  
                oldSvg.attr('viewBox', '0 0 50 50');  
            }  
        });  
          
        $('.full-start__button.view--trailer').each(function() {  
            const button = $(this);  
            const oldSvg = button.find('svg');  
            if (oldSvg.length > 0) {  
                oldSvg.empty();  
                oldSvg.append($(svgs.trailer).html());  
                oldSvg.attr('viewBox', '0 0 80 70');  
            }  
        });  
    }  
      
    function reorderButtons(container) {  
        container.css('display', 'flex');  
          
        container.find('.full-start__button').each(function() {  
            const button = $(this);  
            const classes = button.attr('class') || '';  
              
            let order = 999;  
              
            // Кнопка "Дивитись" - перша  
            if (classes.includes('button--play')) {  
                order = 0;  
            } else if (classes.includes('view--torrent')) {  
                order = 1;  
            } else if (classes.includes('view--trailer')) {  
                order = 2;  
            }  
              
            button.css('order', order);  
        });  
    }  
      
    function startObserver(event) {  
        const render = event.object.activity.render();  
        const mainContainer = render.find('.full-start-new__buttons')[0];  
          
        if (!mainContainer) return;  
          
        observer = new MutationObserver(() => {  
            setTimeout(updateButtonSVGs, 100);  
        });  
          
        observer.observe(mainContainer, {  
            childList: true,  
            subtree: false  
        });  
    }  
      
    function stopObserver() {  
        if (observer) {  
            observer.disconnect();  
            observer = null;  
        }  
    }  
      
    // Реєстрація плагіна  
    if (typeof Lampa !== 'undefined') {  
        const manifest = {  
            type: 'component',  
            name: 'Enhanced Button Separator',  
            version: '4.5.0',  
            author: 'Merged Plugin',  
            description: 'Об\'єднаний плагін: розділення кнопок + оптимізовані SVG/стилі з адаптацією під Lampa 3.0.0+'  
        };  
          
        if (window.plugin) {  
            window.plugin('enhanced_button_separator', manifest);  
        }  
          
        Lampa.Manifest.plugins = manifest;  
    }  
      
    if (document.readyState === 'loading') {  
        document.addEventListener('DOMContentLoaded', initPlugin);  
    } else {  
        initPlugin();  
    }  
})();