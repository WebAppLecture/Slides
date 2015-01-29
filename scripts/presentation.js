//Sobald das Dokument verfügbar ist wollen wir die Präsentation starten
$(document).ready(function() {
	//globale Variablen
	var slides = null;
	var current_index = -1;
	var history_index = 0;
	var num_slides = 0;
	var codeView = false;
	var pulse = null;
	var scrolldelta = 0;
	var zero = -25;
	var this_slide = null;
	var prev_slide = null;
	var next_slide = null;

	//Rechnet die Transformationsanweisung aus
	function getTransform() {
		var denominator = Math.max(
			1024 / window.innerWidth,
			800 / window.innerHeight
		);
		return 'scale(' + (1 / denominator) + ')';
	}

	//Weist die Transformationsanweisung zu
	function applyTransform(transform) {
		/*this_slide.css({
			WebkitTransform : transform,
			MozTransform : transform,
			msTransform : transform,
			OTransform : transform,
			transform : transform,
		});*/
	}

	function resetTransform(transform) {
		applyTransform('scale(1)');
	}

	//Funktion um die aktuelle Folie festzulegen
	function set_current_slide(index) {
		if(codeView)
			switch_code();
		
		//Im Inhaltsverzeichnis wollen wir keine Codeschau präsentieren
		if(slides.eq(current_index).hasClass('toc'))
			$('#nav-code').removeClass('disabled');
		
		if(slides.eq(index).hasClass('toc'))
			$('#nav-code').addClass('disabled');
		
		//Prüfen ob wir ganz vorne sind - zurück disablen
		if(index === 0)
			$('#nav-prev').addClass('disabled');
		else
			$('#nav-prev').removeClass('disabled');
		
		//Prüfen ob wir ganz hinten sind - nächstes disablen
		if(index === num_slides - 1)
			$('#nav-next').addClass('disabled');
		else
			$('#nav-next').removeClass('disabled');

		if (this_slide !== null) {
			resetTransform();
			this_slide.removeClass('current');
		}
			
		this_slide = $(slides.get(index)).addClass('current');
		applyTransform(getTransform());
		$('#nav-open').addClass('disabled');
		$('#nav-page').val(index + 1);
		
		//Vorherige und aktuelle Seite setzen
		history_index = current_index;
		current_index = index;
		//Den Hash (#...) aktualisieren falls die Folie eine id besitzt
		var id = this_slide.attr('id');
		var previous = slides.index(this_slide) - 1;
		var next = slides.index(this_slide) + 1;

		if (prev_slide !== null) {
			prev_slide.removeClass('previous');
		}

		if (next_slide !== null) {
			next_slide.removeClass('next');
		}

		if (previous >= 0) {
			prev_slide = slides.eq(previous).addClass('previous');
		}

		if(next < slides.length) {
			next_slide = slides.eq(next).addClass('next');
		}
		
		if (id) {
			//Hash ändern			
			location.hash = id;
			
			//Abfragen ob wir die Folie per AJAX laden sollen
			if (id.length > 3 && id.substring(0, 3) === 'lec') {
				var url = "lectures/" + id.substring(3, 5) + "/" + id.substring(6) + ".html";
				this_slide.addClass('loading');
				$.ajax({
					isLocal: true,
					cache: false,
					dataType: 'html',
					url: url,
					context: this_slide,
					success: function(response) {
						response = response.replace(/<base href="..\/..\/" \/>/, '');
						this_slide.html(response);
						this_slide.find('title').remove();
						this_slide.find('meta').remove();
						setFigures(current_index, this_slide);
						this_slide.find('pre').each(function(i,v) { $(v).snippet($(v).attr('lang'), { style: 'rand01'}); });
						setReferences(this_slide);
						$('#nav-open').removeClass('disabled');
						this_slide.removeClass('loading');
					},
					error: function(response) {
						this_slide.html('<div class="error"><h1>Fehler</h1><p>Beim Laden der Seite kam es zu einem Fehler. Versuchen Sie es später noch einmal oder kontaktieren Sie mich per <a href="mailto:mail@florian-rappl.de">Mail</a>.<p></div>');
						setReferences(this_slide);
						this_slide.removeClass('loading');
					}
				});
			}
			else
				setReferences(this_slide);
		}
	}
	
	//Wir suchen (live oder nach Button-Eingabe)
	function do_search() {		
		if(pulse) { //Sucht bereits?! Bitte abbrechen!
			pulse.abort();
			erase_search();
		}
		
		if(this.value === '') //Leere Eingabe? Löschen!
			return erase_search();
		
		//OK Wir starten die Suche, daher setzen wir den Button so...
		$('#search > button').css('background-image', 'url(icons/searchload.gif)');
		
		pulse = $.ajax({ //Machen einen AJAX (JSON) Request
			url: 'http://html5skript.florian-rappl.de/search.aspx?callback=?',
			cache: false,
			type: 'GET',
			dataType: 'json',
			data: { s : $('#search > input').val().replace(/</g, '&lt;').replace(/>/g, '&gt;') },
			success: function(data) {
				//Altes Ergebnis löschen
				erase_search();

				//Leeres Ergebnis
				if(data.hits.length === 0)
					return;
				
				//Ergebnisse löschen Text setzen
				$('#clearsearch').text('[ ' + data.count + ' ] Ergebnisse löschen').show();
				
				$.each(data.hits, function(i,v) {
					var hash = v.url ? '#lec' + v.url.replace('/','-').replace('.html','') : 'Rechnung';
					$('<li/>').html(v.title + '<small>' + hash + '</small>').appendTo('#searchresults > ul').click(function() {
						if(v.url) set_current_slide(slides.index($(hash).get(0)));
					});
				});
				
				//Zuviele Ergebnisse - Scrollbalken
				if(data.hits.length > 20) {
					var h = Math.ceil(8000 / data.hits.length);
					$('#scrollarea').show();
					scrolldelta = Math.round(($('#scrollarea').height() - h) / (data.hits.length - 20));
					$('#scrollleiste').height(h).css('margin-top', 0);
				} else {
					$('#scrollarea').hide();
				}

				//Ausgabe
				$('#searchresults > ul').css('margin-top', 0);//Scrollbalken reseten
				$('#search').css('height', 60 + Math.min(data.hits.length, $('#searchresults').css('max-height') === '400px' ? 20 : data.hits.length) * 20);//Größe der Box bestimmen
			},
			complete: function() {
				pulse = null;//Die Suchreferenz entfernen
				$('#search > button').css('background-image', 'url(icons/search.png)');//Button entsprechend setzen
			}
		});
	}
	
	function erase_search() { //Löscht das Suchergebnis
		$('#searchresults li').remove();
		$('#clearsearch').hide();
		$('#search').css('height', 40);//Und setzt die ursprüngliche Höhe in Kraft
	}
	
	//Die Suche über den Button abbrechen
	function cancel_search() {
		if(pulse)//Schauen ob im Moment eine Suche durchgeführt wird
			pulse.abort();//Suche abbrechen
		else //Ansonsten
			do_search();//Suche starten
	}

	//Mit dem Mausrad scrollen
	function wheel_search(e, wheeldelta) {
		var sca = $('#scrollarea');

		//Geht nur wenn man auch scrollen kann (sichtbar)
		if(!sca.is(':visible'))
			return;

		var scl = $('#scrollleiste');

		if(wheeldelta < 0 && scl.outerHeight(true) + scrolldelta <= sca.height()) {
			//Nach unten
			scl.css('margin-top', '+=' + scrolldelta);
			$('#searchresults > ul').css('margin-top', '-=20');
		} else if(wheeldelta > 0 && scl.outerHeight(true) - scl.height() > 0) {
			//Nach oben
			scl.css('margin-top', '-=' + scrolldelta);
			$('#searchresults > ul').css('margin-top', '+=20');
		}
	};
	
	//Methode um in der Scrollbar an bestimmten Punkt zu scrollen
	function scroll_search(e) {
		var scl = $('#scrollleiste');
		var offset = $('#scrollleiste').offset().top - e.pageY;
		var move = -1;
		var rel = ['+', '-'];
		
		//Einige kryptische Berechnungen
		if(offset > 0)
			move = 1;
		else
			offset += scl.height();
		
		//Wie oft müssen wir scrollen?!
		var count = Math.ceil(move * offset / scrolldelta);
		
		//Vorzeichen relativ setzen
		if(move > 0) {
			rel[0] = '-';
			rel[1] = '+';
		}
		
		//Ausgeben
		scl.css('margin-top', rel[0] + '=' + (count * scrolldelta));
		$('#searchresults > ul').css('margin-top', rel[1] + '=' + (20 * count));
	}
	
	//Zeigt die aktuelle (externe) Seite auch wirklich extern an
	function show_extern_page() {
		//Die externe Seite auch extern anzeigen - erstmal ermitteln ob es sich um eine externe Seite handelt
		var id = $(slides.get(current_index)).attr('id');
		
		//Seite aufmachen
		if(id.length > 3 && id.substring(0, 3) === 'lec') {
			var url = "lectures/" + id.substring(3, 5) + "/" + id.substring(6) + ".html";
			window.open(url);
		}
	}
	
	//Setzt die Referenzen entsprechend (in aside)
	function setReferences(slide) {
		//Die Referenzen bestimmen - falls diese da sind soll auch der Stil der Helper Bar angepasst werden
		if(slide.find('aside').hide().length > 0)
			$('#nav-res').removeClass('disabled');
		else
			$('#nav-res').addClass('disabled');
	}

	//Funktion um einen offset zur aktuellen Folie einzustellen
	function set_slide(offset) {
		var index = current_index + offset;
		
		//Kleiner 0 ?? Auf 0 setzen
		if (index < 0) 
			index = 0;
			
		//Out of Bounds ?? Auf letztes Element setzen
		if (index > num_slides-1) 
			index = num_slides - 1;
		
		//Slide setzen
		set_current_slide(index);
	}

	//Funktion um zur vorherigen Folie zurückzugehen
	function goto_prev_slide() {
		set_slide(-1);
		return false;
	}

	//Funktion um zur nächsten Folie weiterzugehen
	function goto_next_slide() {
		set_slide(1);
		return false;
	}

	//Funktion um zu einer bestimmten Folie über die Textbox zu navigieren
	function nav_slide() {
		var p = $('#nav-page').val();
		var pageint = parseInt(p);
		
		if (pageint !== p || pageint < 1 || pageint > num_slides)
			pageint = current_index;
		else
			pageint = pageint - 1;
			
		set_current_slide(pageint);
		return false;
	}
	
	//Funktion um das Inhaltsverzeichnis automatisch zu generieren
	function generate_toc() {
		var tocs = $('.toc > p').html('');
		var num = tocs.length / slides.length;
		slides.each(function(i,v) {
			var title = $(v).attr('title');
			
			//Falls es einen Titel gibt wollen wir diesen setzen
			if (title) {
				var language = $(v).data('lang');
				var color = '#000000';

				switch(language) {
					case 'html':
						color = '#F69240';
						break;
					case 'js':
						color = '#98B954';
						break;
					case 'css':
						color = '#46AAC5';
						break;
				}
				$('<a />').appendTo(tocs.get(~~(i * num))).click(function() { 
					set_current_slide(i); 
				}).text(title).css('color', color);
			}
		});
	}
	
	//Die Bildtitel bei allen Seiten setzen
	function generate_enum() {
		slides.each(function(i,v) {
			setFigures(i, v);
		});
	}
	
	//Erstellt den Druckdialog
	function generate_print() {
		//Über jQueryUI Dialog erstellen
		$('#print').dialog({
			autoOpen: false,
			width: 600,
			modal: true,
			title: 'Druckvorschau zusammenstellen',
			buttons: {
				//OK Gedrückt - Druckansicht erstellen
				"Vorschau": function() {
					//Progress Bar und Blocker erstellen!
					var block = $('<div />').addClass('block').appendTo('body');
					var progress = $('<div />').addClass('progress').appendTo(block);
					var bar = $('<div />').addClass('bar').appendTo(progress);
					//Selektion merken
					var selection = (current_index + 1) + '';
					//Eingabe in Textbox
					var selected = $('input[name=page]:checked', '#print').val();
					//Array mit zu erstellenden Seiten
					var pages = [];
					
					//Schauen was ausgewählt wurde
					if(selected == 'all')
						selection = '1-' + (num_slides + 1);
					else if(selected == 'pages')
						selection = $('input[name=pages]', '#print').val();
					
					//Die Selektion an ; spalten (verschiedene Bereiche)
					var selarray = selection.split(';');
					
					//Das erhaltene Array durchgehen und jedes Element an - spalten (Seitenbereiche)
					for(var i = 0; i < selarray.length; i++) {
						var mobi = selarray[i].split('-');
						
						//Sollte nur 1 oder 2 sein - 3 oder mehr nehmen wir nicht!
						if(mobi.length == 1) {
							pages.push(parseInt(mobi[0]));
						} else if(mobi.length == 2) {
							for(var j = parseInt(mobi[0]); j <= parseInt(mobi[1]); j++)
								pages.push(j);
						}
					}
					
					//Die Seiten durchgehen und Duplikate sowie ungültige Einträge entfernen
					for(var i = pages.length - 1; i >= 0; i--) {
						if(isNaN(pages[i]) || pages[i] < 1 || pages[i] > num_slides) {
							pages.splice(i, 1);
						} else {
							for(var j = i - 1; j >= 0; j--) {
								if(pages[j] == pages[i]) {
									pages.splice(j, 1);
									i--;
								}
							}
						}
					}
					
					var growth = parseInt(400 / pages.length);
					var gr_err = 400 % pages.length;
					var totalwidth = 0;

					//Schauen ob wir einen gültigen Seitenbereich angegeben haben
					if(pages.length > 0) {
						pages.sort(function(a,b){ return a - b; });
						var html = new Array(pages.length);

						var setHtml = function(i, ctn, id, cls) {
							totalwidth += gr_err-- > 0 ? 1 : 0;
							totalwidth += growth;
							bar.css({ width : totalwidth });
							html[i] = '<section id="' + id + '" class="' + cls + '">' + ctn + '</section>';
						};
						
						$.each(pages, function(i, v) {
							var slide = $(slides.get(v - 1));
							var id = slide.attr('id');
							var cls = slide.attr('class');

							var change = function(ctn) {
								ctn = ctn.replace(/<base href="..\/..\/" \/>/, '');
								setHtml(i, ctn, id, cls);
							};
							
							if(id) {
								//Abfragen ob wir die Folie per AJAX laden sollen
								if (id.length > 3 && id.substring(0, 3) === 'lec') {
									var url = "lectures/" + id.substring(3, 5) + "/" + id.substring(6) + ".html";
									$.ajax({
										async: false,
										isLocal: true,
										cache: false,
										dataType: 'html',
										url: url,
										context: slide,
										success: change
									});
								} else //Ansonsten Quellcode direkt nehmen
									change(slide.html());
							}
						});
						
						block.remove();
						//Text festlegen - kann nun abgerufen werden
						window.printSource = html.join('');
						//Das Fenster mit dem Druckdialog öffnen
						window.open('print.html');
						$(this).dialog("close");
					} else //Wenn nicht dann geben wir einen Fehler aus...
						alert('Fehler bei der Eingabe der Seitenzahlen. Bitte einen gültigen Bereich auswählen!');
				}, 
				//Abbrechen Gedrückt - Einfach nur schließen
				"Abbrechen": function() { 
					$(this).dialog("close"); 
				} 
			}
		});
	}
	
	//Erstellt den Texteingabedialog
	function generate_input() {
		//Über jQueryUI Dialog erstellen
		$('#textinput').dialog({
			autoOpen: false,
			width: 600,
			modal: false,
			title: 'Texteingabe',
			buttons: {
				//Einfach nur schließen
				"Schließen": function() { 
					$(this).dialog("close"); 
				} 
			}
		});
	}
	
	//Die Bildtitel setzen
	function setFigures(i, v) {
		var figcount = 0;
		
		//Alle figcaptions finden und ersetzen
		$(v).find('figcaption').each(function(j, w) {
			figcount++;
			$(w).text('Abb. ' + (i + 1) + '-' + figcount + ' / ' + $(w).text());
		});
	}

	//Funktion um automatisch durch die Folien durchzulaufen
	function auto() {
		setInterval(next_slide, 15 * 1000);
		return false;
	}

	function handle_keys(event) {
		//Wenn wir gerade im Druckerdialog sind - keine Behandlung
		if($('#print').dialog('isOpen'))
			return true;
		//Abfrage ob in nav-page - dann darin Event Behandlung
		else if($('#nav-page').is(':focus')) {
			if(event.keyCode == 13) {
				nav_slide();
				return false;
			}
			
			return true;
		}
		//Wenn wir gerade in einem Formularelement sind dann weiterreichen (keine Behandlung)
		else if($(document.activeElement).is(':input'))
			return true;
			
		//Solche Events (mit Modizierer Tasten) auslassen
		if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
			return true;
		else //Benötigt um Propagation von Tastatur events bei WebKit-based Browsern zu verhindern, so dass diese nicht alles doppelt sehen!
			event.stopPropagation();

		switch (event.keyCode) {
			case 8://Backspace
				set_current_slide(history_index);
				break;
			case 36://POS1
				set_current_slide(0);
				break;
			case 35://ENDE
				set_current_slide(num_slides - 1);
				break;
			case 13://Enter
			case 32://Space
			case 40://Pfeiltaste nach unten
			case 39://Rechte Pfeiltaste
				goto_next_slide();
				break;
			case 37://Linke Pfeiltaste
			case 38://Pfeiltaste nach oben
				goto_prev_slide();
				break;
			case 33://BILD-HOCH
				set_current_slide(Math.max(0, current_index - 10));
				break;
			case 34://BILD-RUNTER
				set_current_slide(Math.min(num_slides - 1, current_index + 10));
				break;
			case 69://e
				show_extern_page();
				break;
			case 72://h
				show_help();
				break;
			case 73://i
				show_toc();
				break;
			case 80://p
				print_view();
				break;
			case 81://q
				switch_code();
				break;
			case 82://r
				show_res();
				break;
			case 84://t
				input_view();
				break;
			default://Keine Übereinstimmung - weiterreichen!
				return true;
		}
		
		//Übereinstimmung gefunden (sonst vorher raus) => nicht weiterreichen!
		return false;
	}
	
	//Funktion um die Buttons anzuzeigen
	function show_helpers() {
		$(this).stop().animate({bottom: '0'}, 500, function() {});
	}
	
	//Funktion um die Buttons zu verstecken
	function hide_helpers() {
		$(this).stop().animate({bottom: zero}, 500, function() {});
	}
	
	//Funktion um zum Inhaltsverzeichnis zu gehen
	function show_toc() {
		set_current_slide(slides.index($('.toc').get(0)));
	}
	
	//Funktion um den Hilfsdialog anzuzeigen
	function show_help() {
		$('#help').slideToggle(500);
	}
	
	//Funktion um den Code anzuzeigen
	function switch_code() {
		//Nicht im Inhaltsverzeichnis anwenden
		if(slides.eq(current_index).hasClass('toc'))
			return;
			
		//Abfrage ob wir gerade im Codeview --> zurück zu normal
		if(codeView) {
			this_slide.css({ 'overflow-y' : 'hidden'});
			var html = this_slide.children('#temp').html();
			this_slide.html(html);
		} else { //Wenn wir nicht im CodeView sind dann dort reingehen
			var html = this_slide.html();
			this_slide.html('');
			this_slide.css({ 'overflow-y' : 'scroll'});
			$('<div id="temp" />').html(html).appendTo(this_slide).hide();
			$('<pre />').text(html.replace(/\t/g, '').replace(/\n\n/g, '\n')).appendTo(this_slide).snippet('html', { style: 'rand01'});
		}
		
		//CodeView switch!
		codeView = !codeView;
	}
	
	//Funktion um weitere Resourcen von der aktuellen Folie anzuzeigen
	function show_res() {
		$(slides.get(current_index)).find('aside').toggle(1000);
	}
	
	//Funktion um den Druckdialog zu starten
	function print_view() {
		$('#print').dialog('open');
	}
	
	//Funktion um den Texteingabedialog zu starten
	function input_view() {
		$('#textinput').dialog('open');
	}
	
	//Handler für das onhashchange Event
	function hashchanged() {
		var index = location.hash !== '' ? slides.index($(location.hash).get(0)) : 0;//Index des aktuellen hashes auslesen
		
		if(index !== current_index) //Wenn diese Slide noch nicht gesetzt wurde dann setzen
			set_current_slide(index);
	}

	//Einiges verstecken und Slides zusammenstellen
	$('#help').hide();
	slides = $('article.deck > section');
	num_slides = slides.size();
	zero = $('#helpers').css('bottom');
	
	//Mausrad festlegen - würde funktionieren aber dann stellt sich die Frage mit Scrollbaren Flächen --> ich denke OHNE MausRad ist es schöner.
	//document.body.onmousewheel = function(e) { if(e.wheelDelta < 0) goto_next_slide(); else goto_prev_slide(); };
	
	//Alles generieren
	generate_toc();
	generate_enum();
	generate_print();
	generate_input();

	//Falls es einen hash gibt (#) dann damit anfangen
	hashchanged();

	//Hier könnten wir die Präsentation skalieren
	window.addEventListener('resize', function (e) {
		applyTransform(getTransform());
	}, false);

	//Die Ereignisse festlegen
	$('#helpers').mouseenter(show_helpers).mouseleave(hide_helpers);
	$('#nav-prev').click(goto_prev_slide);
	$('#nav-next').click(goto_next_slide);
	$('#nav-toc').click(show_toc);
	$('#nav-help').click(show_help);
	$('#nav-code').click(switch_code);
	$('#nav-res').click(show_res);
	$('#nav-open').click(show_extern_page);
	$('#nav-print').click(print_view);
	$('#nav-page').change(nav_slide);
	$('html').bind('keydown', handle_keys);
	$('#clearsearch').click(erase_search).hide();
	$('#search > input').bind('keyup', do_search);
	$('#search > button').click(cancel_search);
	$('#searchresults > ul').mousewheel(wheel_search);
	$('#scrollarea').click(scroll_search);
	window.onhashchange = hashchanged;
	
	//Ladescreen entfernen - erste Möglichkeit ist eingebaute Funktion für opacity -> 0
	//zweite ist eigene die auch nach oben fährt
	//$('#loadscreen').fadeOut('slow', function() { $(this).remove(); });
	$('#loadscreen').animate({top: '-100%', opacity: 0}, 1200, function() { 
		$(this).remove(); 
	});

	applyTransform(getTransform());
});