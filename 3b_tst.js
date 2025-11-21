// Версія плагіну: 3.5 - Фінальна версія без логування  
// Розділяє кнопки окремо: Онлайн, Торренти, Трейлери  
  
(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'ButtonSeparator';  
    let observer = null;  
      
    function initPlugin() {  
        if (typeof Lampa === 'undefined') {  
            setTimeout(initPlugin, 100);  
            return;  
        }  
          
        Lampa.Listener.follow('full', function(event) {  
            if (event.type === 'complite') {  
                setTimeout(() => {  
                    processButtons(event);  
                    startObserver(event);  
                }, 300);  
            }  
              
            if (event.type === 'destroy') {  
                stopObserver();  
            }  
        });  
    }  
      
    function processButtons(event) {  
        try {  
            const render = event.object.activity.render();  
            const mainContainer = render.find('.full-start-new__buttons');  
            const hiddenContainer = render.find('.buttons--container');  
              
            if (!mainContainer.length) return;  
              
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
              
            setTimeout(() => {  
                removeSourcesButton(mainContainer);  
            }, 150);  
              
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
      
    function removeSourcesButton(mainContainer) {  
        const allButtons = mainContainer.find('.full-start__button');  
          
        allButtons.each(function() {  
            const button = $(this);  
            const text = button.text().toLowerCase().trim();  
            const classes = button.attr('class') || '';  
              
            const isImportantButton = classes.includes('view--online') ||   
                                     classes.includes('view--torrent') ||   
                                     classes.includes('view--trailer') ||  
                                     classes.includes('button--book') ||  
                                     classes.includes('button--reaction') ||  
                                     classes.includes('button--subscribe') ||  
                                     classes.includes('button--subs');  
              
            const isPlayButton = classes.includes('button--play');  
              
            const isSourcesButton = text.includes('джерела') ||   
                                   text.includes('джерело') ||  
                                   text.includes('sources') ||   
                                   text.includes('source') ||  
                                   text.includes('источники') ||  
                                   text.includes('источник');  
              
            const isOptionsButton = classes.includes('button--options');  
            const isEmpty = text === '' || text.length <= 2;  
              
            if (!isImportantButton && (isPlayButton || isSourcesButton || (isOptionsButton && isEmpty))) {  
                button.remove();  
            }  
        });  
    }  
      
    function reorderButtons(container) {  
        container.css('display', 'flex');  
          
        container.find('.full-start__button').each(function() {  
            const button = $(this);  
            const classes = button.attr('class') || '';  
            const text = button.text().toLowerCase();  
              
            let order = 999;  
              
            if (classes.includes('view--online') || text.includes('онлайн')) {  
                order = 1;  
            } else if (classes.includes('view--torrent') || text.includes('торрент')) {  
                order = 2;  
            } else if (classes.includes('view--trailer') || text.includes('трейлер')) {  
                order = 3;  
            }  
              
            button.css('order', order);  
        });  
    }  
      
    function startObserver(event) {  
        const render = event.object.activity.render();  
        const mainContainer = render.find('.full-start-new__buttons')[0];  
          
        if (!mainContainer) return;  
          
        observer = new MutationObserver(function(mutations) {  
            mutations.forEach(function(mutation) {  
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {  
                    mutation.addedNodes.forEach(function(node) {  
                        if (node.nodeType === 1 && $(node).hasClass('full-start__button')) {  
                            const text = $(node).text().toLowerCase().trim();  
                            const classes = $(node).attr('class') || '';  
                              
                            const isImportantButton = classes.includes('view--online') ||   
                                                     classes.includes('view--torrent') ||   
                                                     classes.includes('view--trailer') ||  
                                                     classes.includes('button--book') ||  
                                                     classes.includes('button--reaction') ||  
                                                     classes.includes('button--subscribe') ||  
                                                     classes.includes('button--subs');  
                              
                            const isPlayButton = classes.includes('button--play');  
                              
                            const isSourcesButton = text.includes('джерела') ||   
                                                   text.includes('джерело') ||  
                                                   text.includes('sources') ||   
                                                   text.includes('source') ||  
                                                   text.includes('источники') ||  
                                                   text.includes('источник');  
                              
                            const isOptionsButton = classes.includes('button--options');  
                            const isEmpty = text === '' || text.length <= 2;  
                              
                            if (!isImportantButton && (isPlayButton || isSourcesButton || (isOptionsButton && isEmpty))) {  
                                $(node).remove();  
                            }  
                        }  
                    });  
                }  
            });  
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
      
    if (document.readyState === 'loading') {  
        document.addEventListener('DOMContentLoaded', initPlugin);  
    } else {  
        initPlugin();  
    }  
      
})();