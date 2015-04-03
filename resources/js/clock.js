$(function() {
    
    $('#set-system-date').click( setSystemDate );
    
});//ready

function setSystemDate()
{
	var d = new Date();
	var dateObj = { date: d.toString() };

	$.post('setSystemDate', dateObj, function(param){
		console.log(param);
	});
}