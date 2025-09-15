(() => {
    Lampa.Plugins.add({
        title: 'Custom Buttons',
        description: 'Заміняє стандартні кнопки на 3 кольорові (Онлайн, Торрент, YouTube)',
        version: '1.1',
        author: 'ChatGPT',
        type: 'button',

        run() {
            // Відслідковуємо відкриття картки фільму
            Lampa.Listener.follow('full', (e) => {
                if (e.type === 'build') {
                    let buttons = e.body.find('.full-start-buttons'); // контейнер кнопок
                    if (buttons.length) {
                        buttons.empty(); // видаляємо стандартні

                        // Додаємо тільки 3 кастомні кнопки
                        buttons.append(`
                            <div class="custom-btn online">▶ Онлайн</div>
                            <div class="custom-btn torrent">⬇ Торрент</div>
                            <div class="custom-btn trailer">▶ YouTube</div>
                        `);

                        // Події для натискань
                        buttons.find('.custom-btn.online').on('click', () => {
                            Lampa.Noty.show('Відкриття онлайн-плеєра');
                        });

                        buttons.find('.custom-btn.torrent').on('click', () => {
                            Lampa.Noty.show('Відкриття торрентів');
                        });

                        buttons.find('.custom-btn.trailer').on('click', () => {
                            Lampa.Noty.show('Відкриття трейлера з YouTube');
                        });
                    }
                }
            });
        },

        style: `
            .custom-btn {
                display: inline-block;
                margin: 6px;
                padding: 10px 18px;
                border-radius: 12px;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s, opacity 0.2s;
            }
            .custom-btn:hover {
                transform: scale(1.05);
                opacity: 0.9;
            }
            .custom-btn.online { background: #4285F4; color: #fff; }
            .custom-btn.torrent { background: #4CAF50; color: #fff; }
            .custom-btn.trailer { background: #FF0000; color: #fff; }
        `
    });
})();
