// Плагін: ButtonSeparator (оновлено для Lampa 3.0+)
// Версія: 4.1 - Підтримка Lampa 3.0.0+ (data-action/data-name для online/torrent/trailer)
// Оригінал: ButtonSeparator (з додатковими правками для нової структури Lampa)
// Автор: адаптація для тебе

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

    // Основна обробка кнопок при відкритті Full Card
    function processButtons(event) {
        try {
            const render = event.object.activity.render();
            const mainContainer = render.find('.full-start-new__buttons');
            const hiddenContainer = render.find('.buttons--container');

            if (!mainContainer.length) return;

            // ========== ПІДТРИМКА СТАРИХ І НОВИХ ВЕРСІЙ LAMPA ==========
            // Пошук кнопок в hiddenContainer: старі класи та нові атрибути data-action / data-name
            const onlineBtn =
                hiddenContainer.find('.view--online')
                    .add(hiddenContainer.find('[data-action="online"]'))
                    .add(hiddenContainer.find('[data-name="online"]'));

            const torrentBtn =
                hiddenContainer.find('.view--torrent')
                    .add(hiddenContainer.find('[data-action="torrent"]'))
                    .add(hiddenContainer.find('[data-name="torrent"]'));

            const trailerBtn =
                hiddenContainer.find('.view--trailer')
                    .add(hiddenContainer.find('[data-action="trailer"]'))
                    .add(hiddenContainer.find('[data-name="trailer"]'));

            // Переносимо у головний контейнер (якщо є)
            if (onlineBtn.length > 0) {
                onlineBtn.removeClass('hide').addClass('selector');
                mainContainer.append(onlineBtn);
            }

            if (torrentBtn.length > 0) {
                torrentBtn.removeClass('hide').addClass('selector');
                mainContainer.append(torrentBtn);
            }

            if (trailerBtn.length > 0) {
                trailerBtn.removeClass('hide').addClass('selector');
                mainContainer.append(trailerBtn);
            }

            // Невелика затримка перед видаленням непотрібних кнопок
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

    // Видаляє кнопки "Джерела", "Дивитись" і порожні options, але зберігає важливі
    function removeSourcesButton(mainContainer) {
        const allButtons = mainContainer.find('.full-start__button');

        allButtons.each(function() {
            const button = $(this);
            const text = (button.text() || '').toLowerCase().trim();
            const classes = button.attr('class') || '';

            // Визначаємо, чи це важлива кнопка (онлайн, торрент, трейлер, підписки тощо)
            const isImportantButton =
                classes.includes('view--online') ||
                classes.includes('view--torrent') ||
                classes.includes('view--trailer') ||
                classes.includes('button--book') ||
                classes.includes('button--reaction') ||
                classes.includes('button--subscribe') ||
                classes.includes('button--subs') ||
                // нові формати (data-action / data-name)
                button.attr('data-action') === 'online' ||
                button.attr('data-name') === 'online' ||
                button.attr('data-action') === 'torrent' ||
                button.attr('data-name') === 'torrent' ||
                button.attr('data-action') === 'trailer' ||
                button.attr('data-name') === 'trailer' ||
                text.includes('онлайн') ||
                text.includes('online');

            const isPlayButton = classes.includes('button--play');
            const isSourcesButton =
                text.includes('джерела') ||
                text.includes('джерело') ||
                text.includes('sources') ||
                text.includes('source') ||
                text.includes('источники') ||
                text.includes('источник');
            const isOptionsButton = classes.includes('button--options');
            const isEmpty = text === '' || text.length <= 2;

            // Якщо не важлива і це play або sources або порожня options — видаляємо
            if (!isImportantButton && (isPlayButton || isSourcesButton || (isOptionsButton && isEmpty))) {
                button.remove();
            }
        });
    }

    // Встановлює порядок кнопок (online -> torrent -> trailer -> всі інші)
    function reorderButtons(container) {
        container.css('display', 'flex');

        container.find('.full-start__button').each(function() {
            const button = $(this);
            const classes = button.attr('class') || '';
            const text = (button.text() || '').toLowerCase();

            let order = 999;

            if (
                classes.includes('view--online') ||
                button.attr('data-action') === 'online' ||
                button.attr('data-name') === 'online' ||
                text.includes('онлайн') ||
                text.includes('online')
            ) {
                order = 1;
            } else if (
                classes.includes('view--torrent') ||
                button.attr('data-action') === 'torrent' ||
                button.attr('data-name') === 'torrent' ||
                text.includes('торрент') ||
                text.includes('torrent')
            ) {
                order = 2;
            } else if (
                classes.includes('view--trailer') ||
                button.attr('data-action') === 'trailer' ||
                button.attr('data-name') === 'trailer' ||
                text.includes('трейлер') ||
                text.includes('trailer')
            ) {
                order = 3;
            }

            button.css('order', order);
        });
    }

    // Запускає MutationObserver для динамічно доданих кнопок
    function startObserver(event) {
        const render = event.object.activity.render();
        const mainContainer = render.find('.full-start-new__buttons')[0];

        if (!mainContainer) return;

        // Якщо вже існує — відключимо старий, щоб не було дублювання
        stopObserver();

        observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.classList && node.classList.contains('full-start__button')) {
                            const $node = $(node);
                            const text = (node.textContent || '').toLowerCase().trim();
                            const classes = node.className || '';

                            const isImportantButton =
                                classes.includes('view--online') ||
                                classes.includes('view--torrent') ||
                                classes.includes('view--trailer') ||
                                classes.includes('button--book') ||
                                classes.includes('button--reaction') ||
                                classes.includes('button--subscribe') ||
                                classes.includes('button--subs') ||
                                $node.attr('data-action') === 'online' ||
                                $node.attr('data-name') === 'online' ||
                                text.includes('онлайн') ||
                                text.includes('online');

                            const isPlayButton = classes.includes('button--play');
                            const isSourcesButton =
                                text.includes('джерела') ||
                                text.includes('джерело') ||
                                text.includes('sources') ||
                                text.includes('source') ||
                                text.includes('источники') ||
                                text.includes('источник');

                            const isOptionsButton = classes.includes('button--options');
                            const isEmpty = text === '' || text.length <= 2;

                            if (!isImportantButton && (isPlayButton || isSourcesButton || (isOptionsButton && isEmpty))) {
                                $node.remove();
                            } else {
                                // Якщо це важлива кнопка — гарантуємо сортування та інтеграцію
                                // (викликаємо реордера в наступному тикі щоб уникнути перегонистих змін)
                                setTimeout(() => {
                                    reorderButtons($(mainContainer));
                                }, 20);
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

    // Якщо потрібна реєстрація у вікні plugin()
    function registerPlugin() {
        if (window.plugin) {
            window.plugin('button_separator', {
                type: 'component',
                name: 'Button Separator',
                version: '4.1',
                author: 'Adapted',
                description: 'Розділяє кнопки Онлайн/Торренти/Трейлери. Підтримка Lampa 3.0+'
            });
        }
    }

    // Ініціалізація (DOMContentLoaded або зараз)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initPlugin();
            registerPlugin();
        });
    } else {
        initPlugin();
        registerPlugin();
    }

})();