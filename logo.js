(function () {
	"use strict";

	/* =======================
	   ЛОКАЛІЗАЦІЯ
	======================= */

	var LANG = {
		ru: {
			logos: "Логотипы",
			logos_desc: "Настройки отображения логотипов",
			back: "Назад",
			back_desc: "Вернуться в настройки интерфейса",
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
			clear_cache_desc: "Нажмите для очистки кеша изображений",
			clear_confirm: "Сбросить кеш?",
			yes: "Да",
			no: "Нет",
			original: "Оригинал",
			as_lampa: "Как в Lampa"
		},
		uk: {
			logos: "Логотипи",
			logos_desc: "Налаштування відображення логотипів",
			back: "Назад",
			back_desc: "Повернутися до налаштувань інтерфейсу",
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
			clear_cache_desc: "Натисніть для очищення кешу",
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
	   ОСНОВНИЙ ПЛАГІН
	======================= */

	var DISABLE_CACHE = false;

	function startPlugin() {
		var SAFE_DELAY = 200;
		var FADE_OUT_TEXT = 300;
		var MORPH_HEIGHT = 400;
		var FADE_IN_IMG = 400;

		var TARGET_WIDTH = "7em";
		var PADDING_TOP_EM = 0;
		var PADDING_BOTTOM_EM = 0.2;

		window.logoplugin = true;

		function getCacheKey(type, id, lang) {
			return "logo_cache_width_based_v1_" + type + "_" + id + "_" + lang;
		}

		Lampa.Listener.follow("full", function (e) {
			if (e.type == "complite" && Lampa.Storage.get("logo_glav") != "1") {
				var data = e.data.movie;
				var type = data.name ? "tv" : "movie";

				var title_elem = e.object.activity.render().find(".full-start-new__title");
				var dom_title = title_elem[0];

				var target_lang =
					Lampa.Storage.get("logo_lang") ||
					Lampa.Storage.get("language");

				var size = Lampa.Storage.get("logo_size", "original");
				var cache_key = getCacheKey(type, data.id, target_lang);

				function showLogo(img_url, save) {
					if (save && !DISABLE_CACHE)
						Lampa.Storage.set(cache_key, img_url);

					var img = new Image();
					img.src = img_url;
					img.style.maxWidth = "100%";
					img.style.height = "auto";

					img.onload = function () {
						title_elem.empty().append(img);
					};

					img.onerror = function () {
						if (!DISABLE_CACHE)
							Lampa.Storage.set(cache_key, "none");
					};
				}

				var cached = Lampa.Storage.get(cache_key);
				if (cached && cached !== "none") {
					showLogo(cached, false);
					return;
				}

				if (!data.id) return;

				var url = Lampa.TMDB.api(
					type +
						"/" +
						data.id +
						"/images?api_key=" +
						Lampa.TMDB.key() +
						"&include_image_language=" +
						target_lang +
						",en,null"
				);

				$.get(url, function (api) {
					var logo = null;

					if (api.logos && api.logos.length) {
						api.logos.some(function (l) {
							if (l.iso_639_1 === target_lang) {
								logo = l.file_path;
								return true;
							}
						});

						if (!logo) {
							api.logos.some(function (l) {
								if (l.iso_639_1 === "en") {
									logo = l.file_path;
									return true;
								}
							});
						}

						if (!logo) logo = api.logos[0].file_path;
					}

					if (logo) {
						showLogo(
							Lampa.TMDB.image(
								"/t/p/" + size + logo.replace(".svg", ".png")
							),
							true
						);
					}
				});
			}
		});
	}

	/* =======================
	   НАЛАШТУВАННЯ
	======================= */

	var LOGO_COMPONENT = "logo_settings_nested";

	Lampa.Settings.listener.follow("open", function (e) {
		if (e.name == "main") {
			Lampa.SettingsApi.addComponent({
				component: LOGO_COMPONENT,
				name: t("logos")
			});
			Lampa.Settings.main().update();
		}
	});

	Lampa.SettingsApi.addParam({
		component: "interface",
		param: { name: "logo_settings_entry", type: "static" },
		field: { name: t("logos"), description: t("logos_desc") },
		onRender: function (item) {
			item.on("hover:enter", function () {
				Lampa.Settings.create(LOGO_COMPONENT);
			});
		}
	});

	Lampa.SettingsApi.addParam({
		component: LOGO_COMPONENT,
		param: { name: "logo_back", type: "static" },
		field: { name: t("back"), description: t("back_desc") },
		onRender: function (item) {
			item.on("hover:enter", function () {
				Lampa.Settings.create("interface");
			});
		}
	});

	Lampa.SettingsApi.addParam({
		component: LOGO_COMPONENT,
		param: {
			name: "logo_glav",
			type: "select",
			values: { 0: t("enable"), 1: t("disable") },
			default: "0"
		},
		field: {
			name: t("logos_instead"),
			description: t("logos_instead_desc")
		}
	});

	Lampa.SettingsApi.addParam({
		component: LOGO_COMPONENT,
		param: {
			name: "logo_lang",
			type: "select",
			values: {
				"": t("as_lampa"),
				ru: "Русский",
				uk: "Українська",
				en: "English"
			},
			default: ""
		},
		field: {
			name: t("logo_lang"),
			description: t("logo_lang_desc")
		}
	});

	Lampa.SettingsApi.addParam({
		component: LOGO_COMPONENT,
		param: {
			name: "logo_size",
			type: "select",
			values: {
				w300: "w300",
				w500: "w500",
				w780: "w780",
				original: t("original")
			},
			default: "original"
		},
		field: {
			name: t("size"),
			description: t("size_desc")
		}
	});

	Lampa.SettingsApi.addParam({
		component: LOGO_COMPONENT,
		param: { name: "logo_clear_cache", type: "button" },
		field: {
			name: t("clear_cache"),
			description: t("clear_cache_desc")
		},
		onChange: function () {
			Lampa.Select.show({
				title: t("clear_confirm"),
				items: [
					{ title: t("yes"), confirm: true },
					{ title: t("no") }
				],
				onSelect: function (a) {
					if (a.confirm) {
						Object.keys(localStorage).forEach(function (k) {
							if (k.indexOf("logo_cache_width_based_v1_") === 0)
								localStorage.removeItem(k);
						});
						location.reload();
					}
				}
			});
		}
	});

	if (!window.logoplugin) startPlugin();
})();
