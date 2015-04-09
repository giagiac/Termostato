<!DOCTYPE html> <html> <head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
	<title>pageMain</title>
	
	<!-- Socket io import nodejs module -->
	<script src="/socket.io/socket.io.js"></script>
	
	<link rel="shortcut icon" href="resources/js/jquery/favicon.ico"/>
    <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Open+Sans:300,400,700"/>
	<link rel="stylesheet" href="resources/css/themes/default/jquery.mobile-1.4.5.min.css"/>
	<script src="resources/js/jquery/jquery.js"></script>
	<script src="resources/js/jquery/jquery.mobile-1.4.5.min.js"></script>

	<!--jqmDateBox-->
	<link rel="stylesheet" href="resources/css/jqm-datebox.css"/>	
	<script src="resources/js/jquery/jqmDateBox/jqm-datebox.core.js"></script>
	<script src="resources/js/jquery/jqmDateBox/jqm-datebox.mode.datebox.js"></script>
	
	<script src="resources/js/calendar.js"></script>
	<script src="resources/js/clock.js"></script>
		<script src="resources/js/dashboard.js"></script>
	<link rel="stylesheet" href="resources/css/main.css" />
	
	<script type="text/javascript">
	function waitShow(){
		$.mobile.loading( "show", {
			theme: "z"
		});
	}
	function waitHide(){
		$.mobile.loading( "hide" );
	}
	</script>
</head>
<body>

<div data-role="page" id="pageone">

  <div data-role="header" data-theme="b">
    <h1>Clock</h1>
  </div>
  (:file ~ /Termostato/template/clock.tpl:)

  <div data-role="header" data-theme="b">
    <h1>Sensors</h1>
  </div>
  (:file ~ /Termostato/template/sensors.tpl:)


  <div data-role="header" data-theme="b">
    <h1>Calendar</h1>
  </div>
  (:file ~ /Termostato/template/calendar.tpl:)
  
  <div data-role="header" data-theme="b">
  	<h1>Dashboard</h1>
  </div>  
  (:file ~ /Termostato/template/dashboard.tpl:)

  <div data-role="header" data-theme="b">
  	<h1>Display text</h1>
  </div>  
  (:file ~ /Termostato/template/displayText.tpl:)
  
</div>

</body>
</html>
