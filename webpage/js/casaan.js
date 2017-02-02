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
				colors: ['Gradient(#777:#BBB:#BBB)'],
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
	setInterval(updateTime, 1000);
	setInterval(updateWeather, 600000);
	updateTime();
	autochangesizes();
	starttimepage();
	createBars();

	// Getting IP doesn't work for ms edge
    var myIP;
	try
	{
    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
    var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};
    pc.createDataChannel("");    //create a bogus data channel
    pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
    pc.onicecandidate = function(ice){  //listen for candidate events
        if(!ice || !ice.candidate || !ice.candidate.candidate)  return;
        myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
        console.log('my IP: ', myIP);
        pc.onicecandidate = noop;
    };
	}
	catch (err)
	{
	}
	
	
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
                 ws.send("{casaanclient:{\"ip\":\""+myIP+"\"}}");
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
						watt = data["electricitymeter"]["now"]["kw_using"]-data["electricitymeter"]["now"]["kw_providing"];;
					}
					catch(err)
					{
					}
					
					
					
					var kwhusedtoday = "-";
					try
					{
						var kwhusedtoday =  Math.round((data["electricitymeter"]["today"]["kwh_used1"] + data["electricitymeter"]["today"]["kwh_used2"]
							- data["electricitymeter"]["today"]["kwh_provided1"] - data["electricitymeter"]["today"]["kwh_provided2"])*10)/10;
						
						if (data["electricitymeter"]["today"]["kwh_used1"] == null) kwhusedtoday = "-";

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
					
					
					
					document.getElementById('electricitycurrent').innerHTML = watt + " watt";
					document.getElementById('electricityusedtoday').innerHTML = kwhusedtoday + " kwh";
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

                    document.getElementById('watercurrent').innerHTML = lmin + " l/min";
                    document.getElementById('watertoday').innerHTML = m3today + " m3";
                    waterbar.value = lminbar;
                    waterbar.grow();
				}

				if (data["sunelectricity"])
				{
					console.log("Received sunelectricity update");
					var kw = "-";
					var kwhtoday = "-";
					var kwbarvalue = 0;
					
					try
					{					
						kw = data["sunelectricity"]["now"]["out"]["watt"];
						kwhtoday = (data["sunelectricity"]["today"]["kwh"]);
						if (kw == null) watt = "-"; else kwbarvalue = watt;
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

	if ((nodename == "sunelectricity") || (nodename == "electricity"))
	{
		titels = ["Vandaag", "Maand", "Jaar", "Totaal", "Gisteren", "Vorige Maand", "Vorig Jaar", ""];
		unit = "kwh"
		jsonitems = ["today", "week", "month", "year", "yesterday", "lastweek", "lastmonth", "lastyear"];
		jsonunit = "kwh";
		label2 = "Teruggeleverd";
	}
	
	if ((nodename == "gas") || (nodename == "water"))
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
		if (value1) value1 = value1 + " " + unit;
		else value1 = "- " + unit;
	
		if (label2 != "") value2 = "- " + unit;
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
		graphsource = "sunelectricity";
		graphtitle = "Zonnestroom";
		graphylabel = "kwh";
		graphcolors = ["#00FF00","#00FFFF"];
		graphnames = ["Opgewekt", "Terruggeleverd"];
		document.getElementById("overviewpage").style.display = "inline-block"; 
		fillOverviewPage("sunelectricity");
	}
	else if (pageName == "electricitypage")
	{
		graphsource = "electricitymeter";
		graphylabel = "kwh";
		graphtitle = "Netstroom";
		graphcolors = ["#666666", "#00FF00"];
		graphnames = ["Verbruikt", "Terruggeleverd"];
		document.getElementById("overviewpage").style.display = "inline-block"; 
		fillOverviewPage("electricity");
	}
	else if (pageName == "gaspage")
	{
		graphsource = "gasmeter";
		graphylabel = "m3";
		graphtitle = "Gasgebruik";
		graphcolors = ["#FFFF00"];
		graphnames = ["Verbruikt"];
		document.getElementById("overviewpage").style.display = "inline-block"; 
		fillOverviewPage("gas");
	}
	else if (pageName == "waterpage")
	{
		graphsource = "watermeter";
		graphylabel = "m3";
		graphtitle = "Watergebruik";
		graphcolors = ["#0000FF"];
		graphnames = ["Verbruikt"];
		document.getElementById("overviewpage").style.display = "inline-block"; 
		fillOverviewPage("water");
	}
	else if (pageName == "temperaturepage")
	{
		graphsource = "temperature";
		graphylabel = "&deg;C";
		graphtitle = "Temperatuur";
		graphcolors = ["#FF0000"];
		graphnames = ["Temperatuur"];
		document.getElementById("overviewpage").style.display = "inline-block"; 
		fillOverviewPage("temperature");
	}
    else if (pageName == "graphdaypage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		var values = [];
		var labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
		values[0] = [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.8, 0.6, 0.2, 0.2, 0.1, 0.2, 0.2, 0.4];
		values[1] = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.4, 0.6, 1.4, 2, 2.1, 2.1, 2, 1.4];
		drawgraph("graph", graphtitle, "Uur", graphylabel, graphnames, labels, values, graphcolors);
	}
    else if (pageName == "graphmonthpage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		var values = [];
		var labels = [1   ,    2,    3,    4,    5,    6,   7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,21,22,23,24,25,26,27,28,29,30,31];
		values[0] = [10.0, 11.4,  8.2,  5.5,  7.7, 11.2, 9.9, 0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		values[1] = [1.0, 1.4,  1.2,  2.5,  1.7, 1.2, 1.9, 0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		drawgraph("graph", graphtitle, "Dag", graphylabel, graphnames, labels, values, graphcolors);
	}
    else if (pageName == "graphyearpage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		var values = [];
		var labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
		values[0] = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.4, 0.6,  1.4,    2, 2.1];
		drawgraph("graph", graphtitle, "Maand", graphylabel, graphnames, labels, values, graphcolors);
	}
    else if (pageName == "graphtotalpage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		var values = [];
		var labels = [2010, 2011, 2012, 2013, 2014, 2015, 2016];
		values[0] = [2023, 2130, 1932, 2041, 1987, 1889, 1920];
		drawgraph("graph", graphtitle, "Jaar", graphylabel, graphnames, labels, values, graphcolors);
	}
    else if (pageName == "graphpreviousdaypage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		var values = [];
		var labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
		values = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.4, 0.6, 1.4, 2, 2.1, 2.1, 2, 1.4];
		drawgraph("graph", graphtitle + " gisteren", "Uur", graphylabel, graphnames, labels, values, graphcolors);
	}
    else if (pageName == "graphpreviousweekpage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		var values = [];
		var labels = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
		values = [10.0, 11.4,  8.2,  5,5,  7,7, 11,2, 9.9];
		drawgraph("graph", graphtitle + " vorige week", "Dag", graphylabel, graphnames, labels, values, graphcolors);
	}
    else if (pageName == "graphpreviousmonthpage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		var values = [];
		var labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
		values = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.4, 0.6, 1.4, 2, 2.1, 2.1, 2, 1.4];
		drawgraph("graph", graphtitle  + " vorige maand", "Dag", graphylabel, graphnames, labels, values, graphcolors);
	}
    else if (pageName == "graphpreviousyearpage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		var values = [];
		var labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
		values = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.4, 0.6,  1.4,    2, 2.1];
		drawgraph("graph", graphtitle  + " vorig jaar", "Maand", graphylabel, graphnames, labels, values, graphcolors);
	}
		
		
	else if (document.getElementById(pageName)) document.getElementById(pageName).style.display = "inline-block"; 
	else document.getElementById("mainpage").style.display = "inline-block";
	autochangesizes();
	
    if (pageName != "mainpage") pageTimer = setTimeout(function(){showPage("mainpage");}, 30000);
}

function drawgraph(graphname, graphtitle, xtitle, ytitle, names, labels, values, colors)
{
    var chart = Highcharts.chart('graph', {
        chart: {
            type: 'line'
        },
        title: {
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