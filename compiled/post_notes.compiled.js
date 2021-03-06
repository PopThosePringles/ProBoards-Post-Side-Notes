"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Post_BBC_Tab = function Post_BBC_Tab() {
	var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	var _ref$title = _ref.title;
	var title = _ref$title === undefined ? "My Tab" : _ref$title;
	var _ref$content = _ref.content;
	var content = _ref$content === undefined ? "" : _ref$content;
	var _ref$id = _ref.id;
	var id = _ref$id === undefined ? "" : _ref$id;
	var _ref$css = _ref.css;
	var css = _ref$css === undefined ? null : _ref$css;
	var _ref$events = _ref.events;
	var events = _ref$events === undefined ? {} : _ref$events;

	_classCallCheck(this, Post_BBC_Tab);

	id = id || +new Date();

	var $wysiwyg_tabs = $(".editor ul.wysiwyg-tabs");
	var $tab = $("<li id='menu-item-" + id + "'><a href='#'>" + title + "</a></li>");
	var $tab_content = $("<div id='" + id + "'></div>").append(content);

	$wysiwyg_tabs.append($tab);

	if (css && (typeof css === "undefined" ? "undefined" : _typeof(css)) == "object") {
		$tab_content.css(css);
	}

	$tab_content.hide().insertBefore($wysiwyg_tabs);

	$wysiwyg_tabs.find("li").click(function (e) {
		var $active = $(this);

		e.preventDefault();

		$active.parent().find("li").removeClass("ui-active");
		$active.addClass("ui-active");

		$active.parent().find("li").each(function () {
			var id = $(this).attr("id");

			if (id.match(/bbcode|visual/i)) {
				$(".editor .ui-wysiwyg .editors").hide();
			} else {
				if ($active.attr("id") == id) {
					return;
				}

				var _selector = "";

				if (id) {
					_selector = "#" + id.split("menu-item-")[1];
				}

				if ($(_selector).length) {
					if (events && events.hide) {
						if (events.context) {
							events.hide.bind(events.context)($tab, $tab_content);
						} else {
							events.hide($tab, $tab_content);
						}
					}

					$(_selector).hide();
				}
			}
		});

		var id = $active.attr("id");
		var selector = "";

		if (id) {
			selector = "#" + id.split("menu-item-")[1];
		}

		if (id.match(/bbcode|visual/i)) {
			$(".editor .ui-wysiwyg .editors").show();
		} else if ($(selector).length) {
			if (events && events.show) {
				if (events.context) {
					events.show.bind(events.context)($tab, $tab_content);
				} else {
					events.show($tab, $tab_content);
				}
			}

			$(selector).show();
		}
	});

	return $tab_content;
};

var Post_Notes = function () {
	function Post_Notes() {
		_classCallCheck(this, Post_Notes);
	}

	_createClass(Post_Notes, null, [{
		key: "init",
		value: function init() {
			this.PLUGIN_ID = "pd_post_notes";
			this.PLUGIN_KEY = "pd_post_notes";
			this.MAX_KEY_SPACE = parseInt(pb.data("plugin_max_key_length"), 10);

			this.images = {};

			this._textarea = document.createElement("textarea");

			this.setup();

			Post_Notes_Posts.init();
			Post_Notes_Tab.init();
		}
	}, {
		key: "setup",
		value: function setup() {
			var plugin = pb.plugin.get(this.PLUGIN_ID);

			if (plugin && plugin.settings) {
				var plugin_settings = plugin.settings;

				this.images = plugin.images;
			}
		}
	}, {
		key: "html_encode",
		value: function html_encode() {
			var str = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
			var decode_first = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

			str = decode_first ? this.html_decode(str) : str;

			return $("<div />").text(str).html();
		}
	}, {
		key: "html_decode",
		value: function html_decode() {
			var str = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

			this._textarea.innerHTML = str;

			var val = this._textarea.value;

			this._textarea.innerHTML = "";

			return val;
		}
	}, {
		key: "fetch_notes",
		value: function fetch_notes(post_id) {
			if (!post_id) {
				return {};
			}

			var data = pb.plugin.key(Post_Notes.PLUGIN_KEY).get(post_id);

			if (data && data.n) {
				return data;
			}

			return {};
		}
	}, {
		key: "parse_note",
		value: function parse_note() {
			var note = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

			return pb.text.nl2br(this.html_encode(note));
		}
	}]);

	return Post_Notes;
}();

var Post_Notes_Posts = function () {
	function Post_Notes_Posts() {
		_classCallCheck(this, Post_Notes_Posts);
	}

	_createClass(Post_Notes_Posts, null, [{
		key: "init",
		value: function init() {
			var thread_location_check = pb.data("route").name == "search_results" || pb.data("route").name == "thread" || pb.data("route").name == "list_posts" || pb.data("route").name == "permalink" || pb.data("route").name == "all_recent_posts" || pb.data("route").name == "recent_posts" || pb.data("route").name == "posts_by_ip";

			if (thread_location_check) {
				$(this.ready.bind(this));
			}
		}
	}, {
		key: "ready",
		value: function ready() {
			this.add_notes_to_posts();

			pb.events.on("afterSearch", this.add_notes_to_posts);
		}
	}, {
		key: "add_notes_to_posts",
		value: function add_notes_to_posts() {
			var $post_rows = $("tr.item.post");

			$post_rows.each(function () {
				var post_id = parseInt($(this).attr("id").split("-")[1] || "", 10);

				if (post_id) {
					var post_notes = Post_Notes.fetch_notes(post_id);
					var notes = post_notes.n || [];
					var type = parseInt(post_notes.t || 0, 10);

					if (notes.length > 0) {
						var $article = $(this).find("article");

						if ($article.length == 1) {
							var $the_notes = Post_Notes_Posts.create_notes(notes, type);

							$article.append($the_notes);
						}
					}
				}
			});
		}
	}, {
		key: "fetch_list_type",
		value: function fetch_list_type() {
			var type = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

			var list_type = "decimal";

			switch (type) {

				case 0:
					list_type = "circle";
					break;

				case 1:
					list_type = "decimal";
					break;

				case 2:
					list_type = "decimal-leading-zero";
					break;

				case 3:
					list_type = "disc";
					break;

				case 4:
					list_type = "lower-alpha";
					break;

				case 5:
					list_type = "lower-greek";
					break;

				case 6:
					list_type = "lower-lower-roman";
					break;

				case 7:
					list_type = "square";
					break;

				case 8:
					list_type = "upper-alpha";
					break;

				case 9:
					list_type = "upper-roman";
					break;

			}

			return list_type;
		}
	}, {
		key: "create_notes",
		value: function create_notes() {
			var notes = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
			var type = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

			var $html = $("<div class='post-notes'></div>");

			if (type < 10) {
				var type_class = this.fetch_list_type(type);
				var ol_html = "<ol class='" + type_class + "'>";

				for (var n = 0, l = notes.length; n < l; ++n) {
					ol_html += "<li>" + Post_Notes.parse_note(notes[n]) + "</li>";
				}

				ol_html += "</ol>";

				$html.append(ol_html);
			} else if (type == 10 || type == 11) {
				var $content = $("<div class='post-notes-tabs'></div>");

				var _loop = function _loop(_n, _l) {
					var $button = $("<a href='#' role='button' class='button'>Note " + (_n + 1) + "</a>");

					$button.on("click", function (e) {
						pb.window.dialog("post-note-dialog", {

							modal: false,
							title: "Note " + (_n + 1),
							html: Post_Notes.parse_note(notes[_n]),
							dialogClass: "post-note-dialog",
							resizable: false,
							draggable: true

						});

						e.preventDefault();
					});

					$content.append($button);
				};

				for (var _n = 0, _l = notes.length; _n < _l; ++_n) {
					_loop(_n, _l);
				}

				$html.append($content);
			}

			return $html;
		}
	}]);

	return Post_Notes_Posts;
}();

var Post_Notes_Tab = function () {
	function Post_Notes_Tab() {
		_classCallCheck(this, Post_Notes_Tab);
	}

	_createClass(Post_Notes_Tab, null, [{
		key: "init",
		value: function init() {
			var posting_location_check = pb.data("route").name == "quote_posts" || pb.data("route").name == "new_post" || pb.data("route").name == "new_thread" || pb.data("route").name == "edit_post" || pb.data("route").name == "edit_thread";

			if (posting_location_check) {
				this.key = pb.plugin.key(Post_Notes.PLUGIN_KEY);

				$(this.ready.bind(this));
			}
		}
	}, {
		key: "ready",
		value: function ready() {
			new Post_BBC_Tab({

				title: "Notes (0)",
				content: this.build_tab(),
				id: "post-notes-bbc-tab",
				css: {}

			});

			this.bind_remove_event();
			this.bind_key_events();
			this.bind_submit();

			this.update_tab_count();
		}
	}, {
		key: "build_tab",
		value: function build_tab() {
			var post = pb.data("page").post;
			var post_id = post && post.id ? parseInt(post.id, 10) : null;
			var notes_data = Post_Notes.fetch_notes(post_id);
			var current_notes = notes_data.n || [];
			var current_type = parseInt(notes_data.t, 10) || 0;
			var space_left = Post_Notes.MAX_KEY_SPACE - JSON.stringify(notes_data).length;
			var html = "<div class='bbc-notes-header'><div class='bbc-post-notes-info'><img id='notes-space-left-img' src='" + Post_Notes.images.warning + "' title='If you go over the max space allowed, your notes will be lost.' /> <strong>Space Left:</strong> <div id='notes-space-left'>" + space_left + "</div></div>";

			html += "<div class='bbc-post-notes-type-wrapper'>";

			html += this.create_additional_options(current_type);
			html += this.create_type_drop_down(current_type);

			html += "</div></div><div class='bbc-note-box-wrapper'>";

			if (current_notes.length > 0) {
				for (var n = 0, l = current_notes.length; n < l; ++n) {
					html += this.create_note_box(current_notes[n], false);
				}
			}

			if (space_left) {
				html += this.create_note_box("", false);
			}

			html += "</div>";

			var $html = $(html);

			this.bind_over_out($html);

			return $html;
		}
	}, {
		key: "create_additional_options",
		value: function create_additional_options() {
			var selected = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

			var html = "";

			//html += "<input type='checkbox' value='11' id='bbc-post-notes-accordion' />";

			return html;
		}
	}, {
		key: "create_type_drop_down",
		value: function create_type_drop_down() {
			var selected = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

			var html = "<strong>List Display Type: </strong>";

			var options = [{

				label: "Inline Lists",
				options: ["Circle", "Decimal", "Decimal Leading Zero", "Disc", "Lower Alpha", "Lower Greek", "Lower Roman", "Square", "Upper Alpha", "Upper Roman"]

			}, {

				label: "Misc",
				options: ["Inline Buttons"]

			}];

			html += "<select id='post-notes-display-type'>";

			var go = 0;
			var id = 0;

			for (var o = 0, l = options.length; o < l; ++o) {
				if (options[o].label) {
					html += "<optgroup label='" + options[o].label + "'>";

					var gl = gl = options[o].options.length;

					for (go = 0; go < gl; ++go) {
						var grp_sel = go + id == selected ? " selected='selected'" : "";

						html += "<option" + grp_sel + " value='" + (go + id) + "'>" + options[o].options[go] + "</option>";
					}

					id = go;

					html += "</optgroup>";
				}
			}

			html += "</select>";

			return html;
		}
	}, {
		key: "bind_over_out",
		value: function bind_over_out() {
			var $html = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

			$html.find(".bbc-note-box-remove").on("mouseover", function () {
				$(this).parent().addClass("bbc-note-box-over");
			}).on("mouseout", function () {
				$(this).parent().removeClass("bbc-note-box-over");
			});
		}
	}, {
		key: "bind_remove_event",
		value: function bind_remove_event() {
			var $elem = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

			var $img = $elem ? $elem.find("img") : $(".bbc-note-box img");

			$img.on("click", function () {
				var $parent = $(this).parent();
				var $wrapper = $parent.parent();

				$parent.fadeOut("slow", function () {
					$parent.remove();

					Post_Notes_Tab.update_space();

					if ($wrapper.find(".bbc-note-box").length == 0) {
						var $box = $(Post_Notes_Tab.create_note_box());

						Post_Notes_Tab.bind_remove_event($box);
						Post_Notes_Tab.bind_key_events($box);
						Post_Notes_Tab.bind_over_out($box);

						$wrapper.append($box);

						$box.fadeIn();
					}
				});
			});
		}
	}, {
		key: "bind_key_events",
		value: function bind_key_events() {
			var $box = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

			var $textareas = $box ? $box.find("textarea") : $(".bbc-note-box textarea");

			$textareas.on("keydown keyup", this.update_space);
		}
	}, {
		key: "create_note_box",
		value: function create_note_box() {
			var content = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
			var hidden = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

			var html = "";
			var display = hidden ? " style='display: none;'" : "";

			html += "<span" + display + " class='bbc-note-box'><textarea>" + Post_Notes.html_encode(content) + "</textarea><img class='bbc-note-box-remove' src='" + Post_Notes.images.remove + "' /></span>";

			return html;
		}
	}, {
		key: "update_space",
		value: function update_space() {
			var $boxes = $(".bbc-note-box textarea");
			var contents = [];

			$boxes.each(function () {
				contents.push($(this).val());
			});

			if (contents.length > 0 && contents[contents.length - 1].length) {
				var $box = $(Post_Notes_Tab.create_note_box());

				Post_Notes_Tab.bind_remove_event($box);
				Post_Notes_Tab.bind_key_events($box);
				Post_Notes_Tab.bind_over_out($box);

				$(".bbc-note-box-wrapper").append($box);

				$box.fadeIn("slow");
			}

			var used = JSON.stringify(contents).length;
			var left = Post_Notes.MAX_KEY_SPACE - used;

			var $counter = $("#notes-space-left");

			if (left < 0) {
				$counter.addClass("notes-space-left-warn");
				$("#notes-space-left-img").addClass("notes-space-left-warn");
			} else {
				$counter.removeClass("notes-space-left-warn");
				$("#notes-space-left-img").removeClass("notes-space-left-warn");
			}

			$counter.html(left);

			Post_Notes_Tab.update_tab_count();
		}
	}, {
		key: "bind_submit",
		value: function bind_submit() {
			var $form = $("form.form_thread_new, form.form_post_new, form.form_post_edit, form.form_thread_edit");

			if ($form.length > 0) {
				var hook = $form.attr("class").match(/form_(\w+_\w+)/i)[1];

				if (hook) {
					$form.on("submit", this.set_on.bind(this, hook));
				}
			}
		}
	}, {
		key: "fetch_contents",
		value: function fetch_contents() {
			var $boxes = $(".bbc-note-box textarea");
			var contents = [];

			$boxes.each(function () {
				var val = $.trim($(this).val());

				if (val.length > 0) {
					contents.push(val);
				}
			});

			return contents;
		}
	}, {
		key: "over_space",
		value: function over_space() {
			var contents = this.fetch_contents();
			var used = JSON.stringify({ n: contents, t: 10 }).length;
			var left = Post_Notes.MAX_KEY_SPACE - used;

			return left < 0;
		}
	}, {
		key: "set_on",
		value: function set_on(hook) {
			var post = pb.data("page").post;
			var post_id = post && post.id ? parseInt(post.id, 10) : null;
			var contents = this.fetch_contents();
			var type = parseInt($("#post-notes-display-type").find(":selected").val() || 0, 10);

			type = type < 0 || type > 11 ? 2 : type;

			this.key.set_on(hook, post_id, {

				n: contents,
				t: type

			});
		}
	}, {
		key: "update_tab_count",
		value: function update_tab_count() {
			$("#menu-item-post-notes-bbc-tab a").html("Notes (" + this.fetch_contents().length + ")");
		}
	}]);

	return Post_Notes_Tab;
}();


Post_Notes.init();