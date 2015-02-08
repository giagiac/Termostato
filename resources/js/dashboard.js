$(function() {
	getSetHeatingSystem("/getHeatingSystem");
   	getSetDisplayLight("/getDisplayLight");
   	getSetSeason("/getSeason");

    $('#radio-choice-winter').click(function(){
    	getSetSeason('/setSeason', { season: "Winter" });
    });
    $('#radio-choice-summer').click(function(){
    	getSetSeason('/setSeason', { season: "Summer" } );
    });
    
    $('#radio-choice-display-always-on').click(function(){
    	getSetDisplayLight('/setDisplayLight', { alwaysOn: true } );
    });
    $('#radio-choice-display-sec-20').click(function(){
    	getSetDisplayLight('/setDisplayLight', { sec20: true } );
    }); 
    $('#radio-choice-display-hour-1').click(function(){
    	getSetDisplayLight('/setDisplayLight', { hour1: true } );
    });
    
    $('#checkbox-manual').click(function(){
		getSetHeatingSystem("/setHeatingSystem");
    });
});//ready

//HEATINGSYSTEM
function getSetHeatingSystem(url)
{
   	waitShow();
   	
	$.get( url, function(param){
		if(param.param1 == "heatingSystemOn")
		{
			$('#checkbox-manual').prop('checked', true).checkboxradio('refresh');
			waitHide();
		}
		else if(param.param1 == "heatingSystemOff")
		{
			$('#checkbox-manual').prop('checked', false).checkboxradio('refresh');
			waitHide();
		}
    });//get
}//getSetHeatingSystem

function getSetDisplayLight(url, param)
{
   	waitShow();
	$.post( url, param, function(param){
		if(param != undefined)
   		{
			if(param.alwaysOn === true)
			{
				$('#radio-choice-display-always-on').attr("checked", true).checkboxradio("refresh");
				$('#radio-choice-display-sec-20').attr("checked", false).checkboxradio("refresh");
    			$('#radio-choice-display-hour-1').attr("checked", false).checkboxradio("refresh");
    		}
    		else if(param.sec20 === true) 
    		{
    			$('#radio-choice-display-always-on').attr("checked", false).checkboxradio("refresh");
    			$('#radio-choice-display-sec-20').attr("checked", true).checkboxradio("refresh");
    			$('#radio-choice-display-hour-1').attr("checked", false).checkboxradio("refresh");
    		}
    		else if(param.hour1 === true) 
    		{
    			$('#radio-choice-display-always-on').attr("checked", false).checkboxradio("refresh");
    			$('#radio-choice-display-sec-20').attr("checked", false).checkboxradio("refresh");
    			$('#radio-choice-display-hour-1').attr("checked", true).checkboxradio("refresh");
    		}
    	}//if
    	waitHide();
    });//get
}//getSetHeatingSystem

function getSetSeason(url, param)
{
	waitShow();
	$.post(url, param, function(param){
		if(param != undefined)
   		{
   			if(param.season === "Winter")
   			{
   				$('#radio-choice-winter').attr("checked", true).checkboxradio("refresh");
				$('#radio-choice-summer').attr("checked", false).checkboxradio("refresh");
   			}
   			else if(param.season === "Summer") 
   			{
   				$('#radio-choice-summer').attr("checked", true).checkboxradio("refresh");
   				$('#radio-choice-winter').attr("checked", false).checkboxradio("refresh");
   			}
   		}//if
   		waitHide();
   	 });//post
}//getSetSeason
