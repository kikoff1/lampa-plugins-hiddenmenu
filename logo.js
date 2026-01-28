(function () {
	"use strict";

	/* =======================
	   ICON (SVG)
	======================= */

	var LOGO_ICON = `
<svg viewBox="0 0 24 24">
	<path fill="currentColor" d="M21 19V5H3v14h18zm0-16a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2h18z"/>
	<circle cx="8.5" cy="8.5" r="1.5"/>
	<path fill="currentColor" d="M21 15l-5-5-4 4-2-2-5 5"/>
</svg>`;

	/* =======================
	   LOCALIZATION
	======================= */

	var LANG = {
		ru: {
			logos: "Логотипы",
			logos_desc: "Настройки отображения логотипов",
			enable: "Отображать",
			disable: "Скрыть",
			logos_instead: "Логотипы вместо названий",
			logos_instead_desc: "Отображает логотипы фильмов вместо текста",
			logo_lang: "Язык логотипа",
			logo_lang_desc: "Приоритетный язык для поиска логотипа",
			size: "Размер логотипа",
			size_desc: "Разрешение загружаемого изображения",
			anim_type: "Тип анимации логотипов",
			anim_type_desc: "Способ анимации логотипов",
			text_height: "Логотип по высоте текста",
			text_height_desc: "Размер логотипа равен высоте текста",
			clear_cache: "Сбросить кеш логотипов",
			clear_cache_desc: "Очистка кеша изображений",
			clear_confirm: "Сбросить кеш?",
			yes: "Да",
			no: "Нет",
			original: "Оригинал",
			as_lampa: "Как в Lampa"
		},
		uk: {
			logos: "Логотипи",
			logos_desc: "Налаштування відображення логотипів",
			enable: "Показувати",
			disable: "Приховати",
			logos_instead: "Логотипи замість назв",
			logos_instead_desc: "Відображає логотипи фільмів замість тексту",
			logo_lang: "Мова логотипу",
			logo_lang_desc: "Пріоритетна мова для пошуку логотипу",
			size: "Розмір логотипу",
			size_desc: "Роздільна здатність зображення",
			anim_type: "Тип анімації логотипів",
			anim_type_desc: "Спосіб анімації логотипів",
			text_height: "Логотип за висотою тексту",
			text_height_desc: "Розмір логотипу дорівнює висоті тексту",
			clear_cache: "Очистити кеш логотипів",
			clear_cache_desc: "Очистка кешу зображень",
			clear_confirm: "Очистити кеш?",
			yes: "Так",
			no: "Ні",
			original: "Оригінал",
			as_lampa: "Як у Lampa"
		}
	};

	function t(key) {
		var lang = Lampa.Storage.get("language", "ru");
		if (!LANG[lang]) lang = "ru";
		return LANG[lang][key] || key;
	}

	/* =======================
	   ORIGINAL PLUGIN (UNCHANGED)
	======================= */

	var DISABLE_CACHE = false;

	function startPlugin() {
		var SAFE_DELAY = 200;
		var FADE_OUT_TEXT = 300;
		var MORPH_HEIGHT = 400;
		var FADE_IN_IMG = 400;

		var TARGET_WIDTH = "7em";

		window.logoplugin = true;

		function getCacheKey(type, id, lang) {
			return "logo_cache_width_based_v1_" + type + "_" + id + "_" + lang;
		}

		Lampa.Listener.follow("full", function (e) {
			if (e.type !== "complite" || Lampa.Storage.get("logo_glav") == "1") return;

			var data = e.data.movie;
			var type = data.name ? "tv" : "movie";
			var title = e.object.activity.render().find(".full-start-new__title");
			var dom = title[0];
			if (!dom) return;

			var lang =
				Lampa.Storage.get("logo_lang") ||
				Lampa.Storage.get("language");

			var size = Lampa.Storage.get("logo_size", "original");
			var cache = getCacheKey(type, data.id, lang);

			function show(url, save) {
				if (save && !DISABLE_CACHE) Lampa.Storage.set(cache, url);
				var img = new Image();
				img.src = url;
				title.empty().append(img);
			}

			var cached = Lampa.Storage.get(cache);
			if (cached && cached !== "none") {
				show(cached, false);
				return;
			}

			$.get(
				Lampa.TMDB.api(
					type +
						"/" +
						data.id +
						"/images?api_key=" +
						Lampa.TMDB.key() +
						"&include_image_language=" +
						lang +
						",en,null"
				),
				function (api) {
					if (!api.logos || !api.logos.length) return;

					var logo =
						api.logos.find(l => l.iso_639_1 === lang) ||
						api.logos.find(l => l.iso_639_1 === "en") ||
						api.logos[0];

					show(
						Lampa.TMDB.image(
							"/t/p/" + size + logo.file_path.replace(".svg", ".png")
						),
						true
					);
				}
			);
		});
	}

	/* =======================
	   SETTINGS (SVG ICON)
	======================= */

	var C = "logo_settings_nested";

	Lampa.Settings.listener.follow("open", function (e) {
		if (e.name === "main") {
			Lampa.SettingsApi.addComponent({
				component: C,
				name: t("logos"),
				icon: LOGO_ICON
			});
			Lampa.Settings.main().update();
		}
	});

	Lampa.SettingsApi.addParam({
		component: "interface",
		param: { type: "static" },
		field: {
			name: t("logos"),
			description: t("logos_desc"),
			icon: LOGO_ICON
		},
		onRender: function (i) {
			i.on("hover:enter", function () {
				Lampa.Settings.create(C);
			});
		}
	});

	if (!window.logoplugin) startPlugin();
})();
