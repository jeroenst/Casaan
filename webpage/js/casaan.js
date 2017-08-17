// The object casaandata is filled with data from the casaan server
var casaandata = {};


//
//	Autochangesizes calculates the size of fonts and elements
//  for best fit on screen. Also changes from portrait to
//  landscape mode based on screen aspect ratio
//
function autochangesizes()
{
	var element;
	var elements;
	var i;
	if ((window.innerHeight/window.innerWidth) > 1)
	{
		// Portrait Mode
		elements = document.getElementsByClassName("portraitbr");
		for(i=0; i<elements.length; i++)
		{
			elements[i].innerHTML = "<BR>"
		}
		var clientheight = window.innerHeight / 4;
		var clientwidth = window.innerWidth / 2;
	}
	else
	{
		// Normal mode
		// Portrait Mode
		elements = document.getElementsByClassName("portraitbr");
		for (i = 0; i < elements.length; i++) 
		{
			elements[i].innerHTML = "";
		}
	}


	// Auto size footer bar items
	var clientHeight = document.getElementsByClassName('tab')[0].clientHeight;
	elements = document.querySelectorAll('.label, .backbutton, .menuitem');
	for(var i=0; i<elements.length; i++)
	{
		elements[i].style.fontSize = (clientHeight / 2) + "px";
	}

	//	var clientWidth = 1;
	
	//	elements = document.getElementsByClassName("fullscreen-floating-box");
	//	for(i=0; i<elements.length; i++)
	//	{
	//		clientHeight = elements[i].clientHeight;
	//		clientWidth = elements[i].clientWidth;
	//		if (clientWidth > 0) break;
	//	}

	

	elements = document.getElementsByClassName("floating-box");
	for(i=0; i< elements.length; i++)
	{
		clientHeight = elements[i].clientHeight;
		clientWidth = elements[i].clientWidth;
		if (clientWidth > 0) break;
	}

	var elements = document.querySelectorAll('.fullscreen-boxtext');
	for(var i=0; i<elements.length; i++)
	{
		if (clientHeight > clientWidth) elements[i].style.fontSize = (clientHeight + clientWidth)  / 45 + "px"
		else elements[i].style.fontSize = (clientHeight + (clientWidth * 0.5))  / 35 + "px"
	}

	elements = document.querySelectorAll('.boxtitle, .boxlabelsmall, .boxlabel2small, .weathertext');
	for(i=0; i<elements.length; i++)
	{
		elements[i].style.fontSize =(clientHeight / 15) + "px";
	}

	elements = document.querySelectorAll('.wideboxtext');
	for(i=0; i<elements.length; i++)
	{
		elements[i].style.fontSize =(clientHeight / 9) + "px";
	}

	elements = document.querySelectorAll('.boxdate, .boxvalue, .boxvalue2,.boxweathertemp, .boxlowertext');
	for(i=0; i<elements.length; i++)
	{
		elements[i].style.fontSize =(clientHeight / 8) + "px";
	}

	elements = document.querySelectorAll('.boxtime');
	for(i=0; i<elements.length; i++)
	{
		elements[i].style.fontSize = (clientHeight / 5) + "px";
	}


	elements = document.getElementsByClassName('boxweathericon');
	for(i=0; i<elements.length; i++)
	{
		document.getElementsByClassName('boxweathericon')[i].style.fontSize =
		(clientHeight / 3.5) + "px";
	}





	var canvas = document.getElementById('insidetemperaturegauge');

	if (canvas == null)
	{
		try
		{
			ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
		catch (err)
		{
		}
	}

	$('#insidetemperaturegauge').tempGauge({
width: clientHeight *0.4,
borderWidth:2,
showLabel:false,
showScale:false,
borderColor: "#EEEEEE",
maxTemp: 25,
minTemp: 15,
	});


	clientHeight =  document.getElementsByClassName("fullboxtext")[0].clientHeight;
	clientWidth =  document.getElementsByClassName("fullboxtext")[0].clientWidth;
	element = document.getElementById("weathertextlong");
	if (clientHeight > 0)
	{
		document.getElementById("weathertextlong").style.fontSize = "50px";
		for (var i = 50; ((element.offsetWidth > clientWidth) || (element.offsetHeight > clientHeight)) && (i > 1); i--)
		{
			document.getElementById("weathertextlong").style.fontSize = i + "px";
		}
	}
}

//
// The function createBars creates the vertical gauge bars on all pages
//
var waterbar;
var gasbar;
var electricitybar;
var sunelectricitybar;
function createBars()
{
	waterbar = new RGraph.VProgress(
	{
id: 'waterbar',
min: 0,
max: 10,
value: 0,
options: {
textAccessible: true,
tickmarks: false,
shadow: false,
colors: ['Gradient(#699:#5ff:#5ff)'],
gutterTop: 0,
gutterBottom: 0,
gutterLeft: 0,
gutterRight: 0
			
		}
	}).draw();
	
	gasbar = new RGraph.VProgress(
	{
id: 'gasbar',
min: 0,
max: 3,
value: 0,
options: {
textAccessible: true,
tickmarks: false,
shadow: false,
colors: ['Gradient(#996:#ff5:#ff5)'],
gutterTop: 0,
gutterBottom: 0,
gutterLeft: 0,
gutterRight: 0
			
		}
	}).draw();
	
	electricitybar = new RGraph.VProgress(
	{
id: 'electricitybar',
min: 0,
max: 2000,
value: 0,
options: {
textAccessible: true,
tickmarks: false,
shadow: false,
colors: ['Gradient(#555:#555:#555)'],
gutterTop: 0,
gutterBottom: 0,
gutterLeft: 0,
gutterRight: 0
			
		}
	}).draw();
	
	sunelectricitybar = new RGraph.VProgress(
	{
id: 'sunelectricitybar',
min: 0,
max: 2000,
value: 0,
options: {
textAccessible: true,
tickmarks: false,
shadow: false,
colors: ['Gradient(#696:#7d7:#7d7)'],
gutterTop: 0,
gutterBottom: 0,
gutterLeft: 0,
gutterRight: 0
			
		}
	}).draw();

	var overviewpagebar = [];
	for (i=0; i < 8; i++)
	{
		overviewpagebar[i] = new RGraph.VProgress(
		{
id: 'overviewpagebar'+i,
min: 0,
max: 10,
value: 0,
options: {
textAccessible: true,
tickmarks: false,
shadow: false,
colors: ['Gradient(#699:#5ff:#5ff)'],
gutterTop: 0,
gutterBottom: 0,
gutterLeft: 0,
gutterRight: 0
				
			}
		}).draw();
	}
}

//
// Startcasaan() initializes the webpage and creates connection to the casaanserver
//
function startcasaan()
{
	startcasaanwebsocket();
	setInterval(updateTime, 1000);
	setInterval(updateWeather, 600000);
	updateTime();
	autochangesizes();
	starttimepage();
	createBars();
}

function startcasaanwebsocket()
{	
	var ws;
	// Let us open a web socket
	console.log ("Connecting to casaan server websocket...");
	ws = new WebSocket("wss://" + window.location.hostname + "/wscasaan");

	if ("WebSocket" in window)
	{
		ws.onopen = function()
		{
			// Web Socket is connected, send data using send()
			console.log ("Connected to casaan server websocket!");
			ws.send("{casaanclient: []}");
		};

		ws.onmessage = function (event)
		{
			var data = JSON.parse(event.data);
			objectnulltodash(data);
			
			// 				console.log ("Received from casaan server: " + event.data);
			casaandata = Object.assign(casaandata,data);
			if (data["electricitymeter"])
			{
				console.log("Received electricitymeter update");
				var watt =  "-";
				try
				{
					watt = (data["electricitymeter"]["now"]["kw_using"]-data["electricitymeter"]["now"]["kw_providing"])*1000;
				}
				catch(err)
				{
				}
				
				if (isNaN(watt)) watt = "-";
				
				var kwhtoday = "-";
				try
				{
					var kwhtoday =  Math.round((data["electricitymeter"]["today"]["kwh_used1"] + data["electricitymeter"]["today"]["kwh_used2"]
					- data["electricitymeter"]["today"]["kwh_provided1"] - data["electricitymeter"]["today"]["kwh_provided2"])*10)/10;
					if (data["electricitymeter"]["today"]["kwh_used1"] == null) kwhusedtoday = "-";
				}
				catch(err)
				{
					kwhtoday = "-";
				}
				
				try
				{	

					if (data["electricitymeter"]["now"]["kw_using"] == null)
					{
						watt = "-";
						wattbar = 0;
					}
					else
					{
						wattbar = watt;
					}
				}
				catch(err)
				{
					watt = "-";							
					wattbar = 0;
				}
				
				if (isNaN(kwhtoday)) kwhtoday = "-";

				
				document.getElementById('electricitycurrent').innerHTML = watt + " watt";
				document.getElementById('electricityusedtoday').innerHTML = kwhtoday + " kwh";
				electricitybar.value = wattbar;
				electricitybar.grow();
			}

			if (data["gasmeter"])
			{
				console.log("Received gasmeter update");
				var gasm3h = "-";
				var gasm3today = "-";
				try
				{
					var gasm3h = data["gasmeter"]["now"]["m3h"];
					var gasm3today = data["gasmeter"]["today"]["m3"];
				}
				catch(err)
				{
				}
				
				if (gasm3h == null) 
				{
					gasm3h = "-";
					gasm3hbar = 0;
				}
				else
				{
					gasm3hbar = gasm3h;
				}
				
				if (gasm3today == null) gasm3today = "-";
				

				document.getElementById('gascurrent').innerHTML = gasm3h + " m3/h";
				document.getElementById('gastoday').innerHTML = gasm3today + " m3";
				gasbar.value = gasm3h;
				gasbar.grow();
			}

			if (data["watermeter"])
			{
				console.log("Received watermeter update");

				var m3h = "-";
				var m3today = "-";
				
				try
				{
					m3h = data["watermeter"]["now"]["m3h"];
					m3today = data["watermeter"]["today"]["m3"];
				}
				catch (err)
				{
				}

				if (m3h == null) m3h = "-";
				if (m3today == null) m3today = "-";

				if (m3h == "-")
				{
					lmin = "-";
					lminbar = 0;
				}
				else
				{
					lmin = Math.round((m3h * 1000) /6)/10;
					lminbar = lmin;
				}

				if (isNaN (lmin)) lmin = "-";
				
				document.getElementById('watercurrent').innerHTML = lmin + " l/min";
				document.getElementById('watertoday').innerHTML = m3today + " m3";
				waterbar.value = lminbar;
				waterbar.grow();
			}

			if (data["sunelectricity"])
			{
				console.log("Received sunelectricity update");
				var watt = "-";
				var kwhtoday = "-";
				var kwbarvalue = 0;
				
				try
				{					
					watt = data["sunelectricity"]["now"]["grid"]["watt"];
					kwhtoday = (data["sunelectricity"]["today"]["kwh"]);
					if (watt == null) watt = "-"; else kwbarvalue = watt;
					if (kwhtoday == null) kwhtoday = "-";
				}
				catch (err)
				{
				}

				document.getElementById('sunelectricitycurrent').innerHTML = watt + " watt";
				document.getElementById('sunelectricitytoday').innerHTML = kwhtoday + " kwh";
				sunelectricitybar.value = kwbarvalue;
				sunelectricitybar.grow();
			}

			if (data["buienradarnl"])
			{
				updateWeather()
			}
			if (data["temperature"])
			{
				console.log("Received temperature update");
				
				var tempnow = "-";
				var tempset = "-";

				var canvas = document.getElementById('insidetemperaturegauge');
				
				if (canvas != null)
				{
					ctx = canvas.getContext('2d');
					ctx.clearRect(0, 0, canvas.width, canvas.height);
				}
				
				try
				{
					tempnow = data["temperature"]["livingroom"]["now"];
					tempset = data["temperature"]["livingroom"]["set"];
					document.getElementById('livingroomtemperaturenow').innerHTML = tempnow+" &deg;C";
					document.getElementById('insidetempgauge').innerHTML = '<div id="insidetemperaturegauge">0</div>';
					document.getElementById('livingroomtemperatureset').innerHTML = tempset+" &deg;C";
				}
				catch(err)
				{
					document.getElementById('livingroomtemperaturenow').innerHTML = "- &deg;C";
					document.getElementById('insidetempgauge').innerHTML = '<div id="insidetemperaturegauge">0</div>';
					document.getElementById('livingroomtemperatureset').innerHTML = "- &deg;C";
				}


				$('#insidetemperaturegauge').tempGauge({
width: document.getElementById('sunelectricity').clientHeight *0.4,
borderWidth:2,
showLabel:false,
showScale:false,
borderColor: "#EEEEEE",
maxTemp: 25,
minTemp: 15,
				});
			}
		};
		
		ws.onclose = function()
		{
			// websocket is closed
			ws = null;
			setTimeout(function(){startcasaanwebsocket();}, 5000);
		};
	}

}

var pageTimer;
var previousPageName = ['mainpage'];
var graphsource = "";
var graphtitle = "";
var graphlabel = "";

function objectnulltodash(obj)
{
	for(key in obj){
		if(obj[key] instanceof Object){
			objectnulltodash(obj[key]);
		}else{
			if (obj[key] == null) obj[key] = "-";
		}
	}	
}

//
// Filloverviewpage fills all the items in the overviewpages
//
function fillOverviewPage(nodename)
{
	elements = document.getElementById("overviewpage").getElementsByClassName("floating-box");

	var titels = [];
	var unit = "";
	var jsonitems = [];
	var jsonunit = "";
	var label1 = "";
	var label2 = "";

	if ((nodename == "sunelectricitymeter") || (nodename == "electricitymeter"))
	{
		titels = ["Vandaag", "Maand", "Jaar", "Totaal", "Gisteren", "Vorige Maand", "Vorig Jaar", ""];
		unit = "kwh"
		jsonitems = ["today", "week", "month", "year", "yesterday", "lastweek", "lastmonth", "lastyear"];
		label1 = "Verbruikt";
		jsonunit = "kwh_used";
		label2 = "Teruggeleverd";
		jsonunit2 = "kwh_provided";
	}
	
	if ((nodename == "gasmeter") || (nodename == "watermeter"))
	{
		titels = ["Vandaag", "Maand", "Jaar", "Totaal", "Gisteren", "Vorige Maand", "Vorig Jaar", ""];
		unit = "m3"
		jsonitems = ["today", "week", "month", "year", "yesterday", "lastweek", "lastmonth", "lastyear"];
		jsonunit = "m3";
	}

	if (nodename == "temperature")
	{
		titels = ["Huiskamer", "Slaapkamer", "Badkamer", "Zolder", "Buiten", "Koelkast", "Diepvriezer", "CV"];
		unit = " &deg;C"
		jsonitems = ["huiskamer", "slaapkamer", "badkamer", "zolder", "buiten", "koelkast", "diepvriezer", "cv"];
		jsonunit = "";
	}

	for (var key = 0; key < elements.length; key++)
	{
		var value1 = null;
		try
		{
			value1 = casaandata[nodename][jsonitems[key]][jsonunit];
		}
		catch (err)
		{
			
		}
		var value2 = null;
		try
		{
			value2 = casaandata[nodename][jsonitems[key]][jsonunit2];
		}
		catch (err)
		{
			
		}
		if (value1) value1 = value1 + " " + unit;
		else value1 = "- " + unit;
		
		if (label2 != "")
		{
			if (value2) value2 = value2 + " " + unit;
			else value2 = "- " + unit;
		}
		else value2="";
		
		elements[key].getElementsByClassName("boxtitle")[0].innerHTML = titels[key];
		elements[key].getElementsByClassName("boxvalue")[0].innerHTML = value1;
		elements[key].getElementsByClassName("boxvalue2")[0].innerHTML = value2;
		elements[key].getElementsByClassName("boxlabelsmall")[0].innerHTML = label1;
		elements[key].getElementsByClassName("boxlabel2small")[0].innerHTML = label2;
	}
}

//
// showPage hides the current page and shows the page selected
//

function showPage(pageName) {
        document.getElementById("graphbuttons").style.display = "none";
	if (pageName == '') pageName = 'mainpage';
	if (pageName == "previouspage")
	{
		previousPageName.pop();
		var pageName = previousPageName.pop();
		if (pageName == 'mainpage') previousPageName = ['mainpage'];
		if (pageName == '') pageName = 'mainpage';
	}
	if (pageName == "mainpage")
	{
		document.getElementsByClassName("backbutton")[0].style.display = "none"; 
	}
	else
	{
		document.getElementsByClassName("backbutton")[0].style.display = "inline-block"; 
	}
	previousPageName.push(pageName)
	console.log("Opening page:"+pageName);
	clearTimeout(pageTimer);
	var i;
	var x = document.getElementsByClassName("submainarea");
	for (i = 0; i < x.length; i++) {
		x[i].style.display = "none"; 
	}
	if (pageName == "sunelectricitypage")
	{
		graphjsonsource = "sunelectricity";
		graphjsonitem1 = "kwh_out";
		graphjsonitem2 = "kwh_pv"
		graphunit = "kwh";
		graphtitle = "Zonnestroom";
		graphylabel = "kwh";
		graphcolors = ["#00FF00", "#00FFFF"];
		graphnames = ["Geleverd Omvormer", "Opgewekt Zonnepanelen"];
		document.getElementById("overviewpage").style.display = "inline-block"; 
		fillOverviewPage("sunelectricity");
	}
	else if (pageName == "electricitypage")
	{
		graphjsonsource = "electricitymeter";
		graphjsonitem1 = "kwh_used";
		graphjsonitem2 = "kwh_provided"
		graphylabel = "kwh";
		graphtitle = "Netstroom";
		graphcolors = ["#666666", "#00FF00"];
		graphnames = ["Verbruikt", "Teruggeleverd"];
		document.getElementById("overviewpage").style.display = "inline-block"; 
		fillOverviewPage("electricitymeter");
	}
	else if (pageName == "gaspage")
	{
		graphjsonsource = "gasmeter";
		graphjsonitem1 = "m3";
		graphjsonitem2 = "";
		graphylabel = "m3";
		graphtitle = "Gasgebruik";
		graphcolors = ["#FFFF00"];
		graphnames = ["Verbruikt"];
		document.getElementById("overviewpage").style.display = "inline-block"; 
		fillOverviewPage("gasmeter");
	}
	else if (pageName == "waterpage")
	{
		graphjsonsource = "watermeter";
		graphjsonitem1 = "m3";
		graphjsonitem2 = "";
		graphylabel = "m3";
		graphtitle = "Watergebruik";
		graphcolors = ["#0000FF"];
		graphnames = ["Verbruikt"];
		document.getElementById("overviewpage").style.display = "inline-block"; 
		fillOverviewPage("watermeter");
	}
	else if (pageName == "temperaturepage")
	{
		graphjsonsource = "temperature";
		graphjsonitem1 = "temp";
		graphjsonitem2 = "";
		graphylabel = "&deg;C";
		graphtitle = "Temperatuur";
		graphcolors = ["#FF0000"];
		graphnames = ["Temperatuur"];
		document.getElementById("overviewpage").style.display = "inline-block"; 
		fillOverviewPage("temperature");
	}
	else if (pageName == "graphdaypage")
	{
		document.getElementById("graphbuttons").style.display = "inline-block";
		document.getElementById("graphpage").style.display = "inline-block"; 
		values = [];
		labels = [];
		try
		{
			labels = casaandata[graphjsonsource].today.graph.labels;
			values[0] = casaandata[graphjsonsource].today.graph[graphjsonitem1];
			values[1] = casaandata[graphjsonsource].today.graph[graphjsonitem2];
		}
		catch(err)
		{
		}
		drawgraph("graph", graphtitle, "Uur", graphylabel, graphnames, labels, values, graphcolors);
	}
	else if (pageName == "graphmonthpage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		document.getElementById("graphbuttons").style.display = "inline-block";
		values = [];
		labels = [];
		try
		{
			labels = casaandata[graphjsonsource].month.graph.labels;
			values[0] = casaandata[graphjsonsource].month.graph[graphjsonitem1];
			values[1] = casaandata[graphjsonsource].month.graph[graphjsonitem2];
		}
		catch(err)
		{
		}
		drawgraph("graph", graphtitle, "Dag", graphylabel, graphnames, labels, values, graphcolors);
	}
	else if (pageName == "graphyearpage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		document.getElementById("graphbuttons").style.display = "inline-block";
		values = [];
		labels = [];
		try
		{
			labels = casaandata[graphjsonsource].year.graph.labels;
			values[0] = casaandata[graphjsonsource].year.graph[graphjsonitem1];
			values[1] = casaandata[graphjsonsource].year.graph[graphjsonitem2];
		}
		catch(err)
		{
		}
		drawgraph("graph", graphtitle, "Maand", graphylabel, graphnames, labels, values, graphcolors);
	}
	else if (pageName == "graphtotalpage")
	{
		document.getElementById("graphbuttons").style.display = "inline-block";
		document.getElementById("graphpage").style.display = "inline-block"; 
		values = [];
		labels = [];
		try
		{
			labels = casaandata[graphjsonsource].total.graph.labels;
			values[0] = casaandata[graphjsonsource].total.graph[graphjsonitem1];
			values[1] = casaandata[graphjsonsource].total.graph[graphjsonitem2];
		}
		catch(err)
		{
		}
		drawgraph("graph", graphtitle, "Jaar", graphylabel, graphnames, labels, values, graphcolors);
	}
	else if (pageName == "graphpreviousdaypage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		document.getElementById("graphbuttons").style.display = "inline-block";
		try
		{
			labels = casaandata[graphjsonsource].yesterday.graph.labels;
			values[0] = casaandata[graphjsonsource].yesterday.graph[graphjsonitem1];
			values[1] = casaandata[graphjsonsource].yesterday.graph[graphjsonitem2];
		}
		catch(err)
		{
		}
		drawgraph("graph", graphtitle + " gisteren", "Uur", graphylabel, graphnames, labels, values, graphcolors);
	}
	else if (pageName == "graphpreviousmonthpage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		document.getElementById("graphbuttons").style.display = "inline-block";
		try
		{
			labels = casaandata[graphjsonsource].previousmonth.graph.labels;
			values[0] = casaandata[graphjsonsource].previousmonth.graph[graphjsonitem1];
			values[1] = casaandata[graphjsonsource].previousmonth.graph[graphjsonitem2];
		}
		catch(err)
		{
		}
		drawgraph("graph", graphtitle  + " vorige maand", "Dag", graphylabel, graphnames, labels, values, graphcolors);
	}
	else if (pageName == "graphpreviousyearpage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		document.getElementById("graphbuttons").style.display = "inline-block";
		try
		{
			labels = casaandata[graphjsonsource].previousyear.graph.labels;
			values[0] = casaandata[graphjsonsource].previousyear.graph[graphjsonitem1];
			values[1] = casaandata[graphjsonsource].previousyear.graph[graphjsonitem2];
		}
		catch(err)
		{
		}
		drawgraph("graph", graphtitle  + " vorig jaar", "Maand", graphylabel, graphnames, labels, values, graphcolors);
	}
	
	
	else if (document.getElementById(pageName)) document.getElementById(pageName).style.display = "inline-block"; 
	else document.getElementById("mainpage").style.display = "inline-block";
	autochangesizes();
	
	if (pageName != "mainpage") pageTimer = setTimeout(function(){showPage("mainpage");}, 60000);
}

function drawgraph(graphname, graphtitle, xtitle, ytitle, names, labels, values, colors)
{
	
if (values[1] != undefined)
{
	var chart = Highcharts.chart('graph', 
	{
chart: 
		{
type: 'line'
		},
title: 
		{
text: graphtitle
		},
legend: {
enabled: true
		},
exporting: { enabled: false },
xAxis: {
title: {
text: xtitle
			},
categories: labels
		},
yAxis: {
title: {
text: ytitle
			}
		},
credits: {
enabled: false
		},
colors: colors,
plotOptions: {
line: {
dataLabels: {
enabled: true
				},
enableMouseTracking: false
			}
		},
series: [{
name: names[0],
data: values[0]
		},
		{
name: names[1],
data: values[1]
		}]
	});
}
else
{
		var chart = Highcharts.chart('graph', 
	{
chart: 
		{
type: 'line'
		},
title: 
		{
text: graphtitle
		},
legend: {
enabled: true
		},
exporting: { enabled: false },
xAxis: {
title: {
text: xtitle
			},
categories: labels
		},
yAxis: {
title: {
text: ytitle
			}
		},
credits: {
enabled: false
		},
colors: colors,
plotOptions: {
line: {
dataLabels: {
enabled: true
				},
enableMouseTracking: false
			}
		},
series: [{
name: names[0],
data: values[0]
}],
	});

}	
	
}

function starttimepage()
{
	var times = SunCalc.getTimes(new Date(), 51.5, -0.1);
	document.getElementById("sun").innerHTML = "Op: "+
	(times.sunrise ? times.sunrise.getHours()+":"+times.sunrise.getMinutes() : "") + "<BR>Onder:  " +
	(times.sunset ? times.sunset.getHours()+":"+times.sunset.getMinutes() : "");

	var moontimes = SunCalc.getMoonTimes(new Date(), 51.5, -0.1);
	document.getElementById("moon").innerHTML = "Op: "+
	(moontimes.rise ? moontimes.rise.getHours()+":"+moontimes.rise.getMinutes() : "") + "<BR>Onder:  " +
	(moontimes.set ? moontimes.set.getHours()+":"+moontimes.set.getMinutes() : "") ;
}

function updateTime() {
	moment.locale('nl');
	document.getElementById("time").innerHTML = moment().format('LTS');
	document.getElementById("date").innerHTML = moment().format('L');
	document.getElementById("timenl").innerHTML = moment().format('LT');
	document.getElementById("datenl").innerHTML = moment().format('L');

	document.getElementById("timeen").innerHTML = moment().tz('Europe/London').format('LT');
	document.getElementById("dateen").innerHTML = moment().tz('Europe/London').format('L');

	document.getElementById("timeny").innerHTML = moment().tz('America/New_York').format('LT');
	document.getElementById("dateny").innerHTML = moment().tz('America/New_york').format('L');

	document.getElementById("timech").innerHTML = moment().tz('Asia/Shanghai').format('LT');
	document.getElementById("datech").innerHTML = moment().tz('Asia/Shanghai').format('L');
}

// Get data from buienradar.nl

function updateWeather() {
	console.log("Received buienradar update");
	for (i in casaandata.buienradarnl.weergegevens.actueel_weer.weerstations)
	{
		var station = casaandata.buienradarnl.weergegevens.actueel_weer.weerstations[i].weerstation;
		var stationnaam = station.stationnaam[0];
		if (stationnaam == "Meetstation Eindhoven")
		{
			elements = document.getElementsByClassName('weathertemptoday');
			for(var y=0; y<elements.length; y++)
			{
				elements[y].innerHTML = station.temperatuurGC[0] + " &deg;C";
			}
			
			var zin = station.icoonactueel["@attributes"].zin;
			elements = document.getElementsByClassName('weathertexttoday');
			for(var y=0; y<elements.length; y++)
			{
				elements[y].innerHTML = zin;
			}
			document.getElementById("windnow").innerHTML = station.windsnelheidBF + " Bft<BR>" + station.windrichting;
		}
	}

	document.getElementsByClassName('weathertext')[0].innerHTML = 
	casaandata.buienradarnl.weergegevens.verwachting_vandaag.samenvatting[0];

	document.getElementById("temptomorrow").innerHTML =
	casaandata.buienradarnl.weergegevens.verwachting_meerdaags["dag-plus1"].mintemp + " / " + 
	+ casaandata.buienradarnl.weergegevens.verwachting_meerdaags["dag-plus1"].maxtemp + " &deg;C";
	
	document.getElementById("tempaftertomorrow").innerHTML =
	casaandata.buienradarnl.weergegevens.verwachting_meerdaags["dag-plus2"].mintemp + " / " + 
	+ casaandata.buienradarnl.weergegevens.verwachting_meerdaags["dag-plus2"].maxtemp + " &deg;C";

	document.getElementById("tempafteraftertomorrow").innerHTML =
	casaandata.buienradarnl.weergegevens.verwachting_meerdaags["dag-plus3"].mintemp + " / " + 
	+ casaandata.buienradarnl.weergegevens.verwachting_meerdaags["dag-plus3"].maxtemp + " &deg;C";

	document.getElementById("tempafterafteraftertomorrow").innerHTML =
	casaandata.buienradarnl.weergegevens.verwachting_meerdaags["dag-plus4"].mintemp + " / " + 
	+ casaandata.buienradarnl.weergegevens.verwachting_meerdaags["dag-plus4"].maxtemp + " &deg;C";
	
	document.getElementById("weathertextlong").innerHTML =
	casaandata.buienradarnl.weergegevens.verwachting_vandaag.tekst[0];
	
	var d = new Date();
	d.setDate(d.getDate()+1);
	var daynames = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
	elements = document.getElementsByClassName('nametoday+1');
	for(i=0; i<elements.length; i++)
	{
		elements[i].innerHTML = daynames[d.getDay()];
	}
	d.setDate(d.getDate()+1);
	elements = document.getElementsByClassName('nametoday+2');
	for(i=0; i<elements.length; i++)
	{
		elements[i].innerHTML = daynames[d.getDay()];
	}
	d.setDate(d.getDate()+1);
	elements = document.getElementsByClassName('nametoday+3');
	for(i=0; i<elements.length; i++)
	{
		elements[i].innerHTML = daynames[d.getDay()];
	}
	d.setDate(d.getDate()+1);
	elements = document.getElementsByClassName('nametoday+4');
	for(i=0; i<elements.length; i++)
	{
		elements[i].innerHTML = daynames[d.getDay()];
	}
}