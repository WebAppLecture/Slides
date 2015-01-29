$(document).ready(function() {
	//Geht nur wenns einen Öffner gibt
	if(opener) {
		//Den Text setzen
		var body = $('body').html(opener.printSource);
		
		//Alle Codefragmente Stylen
		body.find('pre').each(function(i,v) {
			$(v).snippet($(v).attr('lang'), { 
				style: 'rand01', 
				menu: false 
			});
		});

		//Jede Folie (jetzt Seite) anschauen
		body.children('section').each(function(i,v) {
			var jv = $(v);

			//Nach Abbildungstiteln suchen und ersetzen
			jv.find('figcaption').each(function(j,w) {
				var jw = $(w);
				
				if(jw.text().match('^Abb.')=='Abb.')
					jw.text(jw.text().substring(jw.text().indexOf('/', 0) + 2));
			});

			//Unnötiges entfernen
			jv.find('title').remove();
			jv.find('meta').remove();
		});
	}
});