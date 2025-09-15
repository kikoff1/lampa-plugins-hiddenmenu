(() => {
    Lampa.Plugins.add({
        title: 'Custom Buttons',
        description: 'Заміняє стандартні кнопки на 3 кольорові з іконками (Онлайн, Торрент, YouTube)',
        version: '1.2',
        author: 'ChatGPT',
        type: 'button',

        run() {
            Lampa.Listener.follow('full', (e) => {
                if (e.type === 'build') {
                    let buttons = e.body.find('.full-start-buttons'); 
                    if (buttons.length) {
                        buttons.empty();

                        buttons.append(`
                            <div class="custom-btn online">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Google_Play_2016_icon.svg" class="icon"> Онлайн
                            </div>
                            <div class="custom-btn torrent">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/66/%CE%9CTorrent_logo.svg" class="icon"> Торрент
                            </div>
                            <div class="custom-btn trailer">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/9/9e/YouTube_Logo.svg" class="icon"> YouTube
                            </div>
                        `);

                        // Події
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
                display: inline-flex;
                align-items: center;
                margin: 6px;
                padding: 10px 16px;
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
            .custom-btn img.icon {
                width: 22px;
                height: 22px;
                margin-right: 8px;
            }
            .custom-btn.online { background: #4285F4; color: #fff; }
            .custom-btn.torrent { background: #4CAF50; color: #fff; }
            .custom-btn.trailer { background: #FF0000; color: #fff; }
        `
    });
})();
