$(document).ready(function() {
	$('<span/>').text(siteStatus).css('font-weight', 'bold').appendTo('body');
	if(onLine) {
		//Was nützliches machen!
		$('<div/>').text('Bitte folgende Online-Angebote überprüfen: ').appendTo('body');
	} else {
		//Spezielle Offline Anzeige
		$('<div/>').text('Wir haben leider kein Offline-Angebot').appendTo('body');
	}
});