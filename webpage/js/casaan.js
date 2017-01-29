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

	var clientWidth = 1;
	
	elements = document.getElementsByClassName("fullscreen-floating-box");
	for(i=0; i<elements.length; i++)
	{
		clientHeight = elements[i].clientHeight;
		clientWidth = elements[i].clientWidth;
		if (clientWidth > 0) break;
	}


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

	elements = document.querySelectorAll('.boxtitle, .boxlabelsmall, .boxlabel2small, .boxweathertext');
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

var casaandata = {};

function startcasaanwebsocket()
{
    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
    var myIP;
    var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};
    pc.createDataChannel("");    //create a bogus data channel
    pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
    pc.onicecandidate = function(ice){  //listen for candidate events
        if(!ice || !ice.candidate || !ice.candidate.candidate)  return;
        myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
        console.log('my IP: ', myIP);
        pc.onicecandidate = noop;
    };
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
				
				console.log ("Received from casaan server: " + event.data);
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

                    document.getElementById('watercurrent').innerHTML = lmin + " liter/min";
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
var graphylabel = "";

function showPage(pageName) {
	if (pageName == "previouspage")
	{
		previousPageName.pop();
		var gotopage = previousPageName.pop();
		if (gotopage == 'mainpage') previousPageName = ['mainpage'];
	 	showPage (gotopage);
		return 0;
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
		graphtitle = "Opgewekte Zonnestroom";
		graphylabel = "kWh";
    	document.getElementById("overviewpage").style.display = "inline-block"; 
	}
	else if (pageName == "electricitypage")
	{
		graphsource = "electricitymeter";
		graphylabel = "kWh";
		graphtitle = "Netstroomgebruik";
    	document.getElementById("overviewpage").style.display = "inline-block"; 
	}
	else if (pageName == "gaspage")
	{
		graphsource = "gasmeter";
		graphylabel = "m3";
		graphtitle = "Gasgebruik";
    	document.getElementById("overviewpage").style.display = "inline-block"; 
	}
	else if (pageName == "waterpage")
	{
		graphsource = "watermeter";
		graphylabel = "m3";
		graphtitle = "Watergebruik";
    	document.getElementById("overviewpage").style.display = "inline-block"; 
	}
    else if (pageName == "graphdaypage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		var labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
		var values = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.4, 0.6, 1.4, 2, 2.1, 2.1, 2, 1.4];
		drawgraph("graph", graphtitle, "Uur", graphylabel, labels, values);
	}
    else if (pageName == "graphweekpage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		var labels = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
		var values = [10.0, 11.4,  8.2,  5,5,  7,7, 11,2, 9.9];
		drawgraph("graph", graphtitle, "Dag", graphylabel, labels, values);
	}
    else if (pageName == "graphmonthpage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		var labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
		var values = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.4, 0.6, 1.4, 2, 2.1, 2.1, 2, 1.4];
		drawgraph("graph", graphtitle, "Dag", graphylabel, labels, values);
	}
    else if (pageName == "graphyearpage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		var labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
		var values = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.4, 0.6,  1.4,    2, 2.1];
		drawgraph("graph", graphtitle, "Maand", graphylabel, labels, values);
	}
    else if (pageName == "graphpreviousdaypage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		var labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
		var values = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.4, 0.6, 1.4, 2, 2.1, 2.1, 2, 1.4];
		drawgraph("graph", graphtitle + " gisteren", "Uur", graphylabel, labels, values);
	}
    else if (pageName == "graphpreviousweekpage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		var labels = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
		var values = [10.0, 11.4,  8.2,  5,5,  7,7, 11,2, 9.9];
		drawgraph("graph", graphtitle + " vorige week", "Dag", graphylabel, labels, values);
	}
    else if (pageName == "graphpreviousmonthpage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		var labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
		var values = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.4, 0.6, 1.4, 2, 2.1, 2.1, 2, 1.4];
		drawgraph("graph", graphtitle  + " vorige maand", "Dag", graphylabel, labels, values);
	}
    else if (pageName == "graphpreviousyearpage")
	{
		document.getElementById("graphpage").style.display = "inline-block"; 
		var labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
		var values = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.4, 0.6,  1.4,    2, 2.1];
		drawgraph("graph", graphtitle  + " vorig jaar", "Maand", graphylabel, labels, values);
	}
		
		
	else if (document.getElementById(pageName)) document.getElementById(pageName).style.display = "inline-block"; 
	else document.getElementById("mainpage").style.display = "inline-block";
	autochangesizes();
	
    if (pageName != "mainpage") pageTimer = setTimeout(function(){showPage("mainpage");}, 30000);
}

function drawgraph(graphname, graphtitle, xtitle, ytitle, labels, values)
{
	var trace1 = 
	{
		x: labels, 
		y: values, 
		type: 'scatter',
		fill: 'tozeroy',
		name: graphname,
		line: 
		{
			color: '#55AA55'
		}
	};

	var layout = 
	{
		title: graphtitle,
		xaxis: {title: xtitle},
		yaxis: {title: ytitle},
		margin: {t: 70, b: 70, l:70, r:20},
	};

	var data = [trace1];
	Plotly.newPlot('plottygraph', data, layout, {displayModeBar: false});
}

function starttimepage()
{
       var times = SunCalc.getTimes(new Date(), 51.5, -0.1);
       document.getElementById("sun").innerHTML = "Op: "+
       times.sunrise.getHours()+":"+times.sunrise.getMinutes() + "<BR>Onder:  " +
       times.sunset.getHours()+":"+times.sunset.getMinutes();

       var moontimes = SunCalc.getMoonTimes(new Date(), 51.5, -0.1);
       document.getElementById("moon").innerHTML = "Op: "+
       moontimes.rise.getHours()+":"+moontimes.rise.getMinutes() + "<BR>Onder:  " +
       moontimes.set.getHours()+":"+moontimes.set.getMinutes();
}

function updateTime() {
    var d = new Date();
    document.getElementById("time").innerHTML = d.toLocaleTimeString('nl');

    var d = new Date();
    document.getElementById("timenl").innerHTML =
    d.toLocaleTimeString('nl-NL', { hour: 'numeric',minute:
    '2-digit' });

    document.getElementById("datenl").innerHTML =
    d.toLocaleString('nl-NL', {day:
    'numeric',month: '2-digit',year: 'numeric' });

    document.getElementById("timeen").innerHTML =
    d.toLocaleTimeString('nl-NL', { timeZone: 'Europe/London', hour: 'numeric',minute:
    '2-digit' });

    document.getElementById("dateen").innerHTML =
    d.toLocaleString('nl-NL', { timeZone: 'Europe/London', day:
    'numeric',month: '2-digit',year: 'numeric' });

    document.getElementById("timeny").innerHTML =
    d.toLocaleTimeString('nl-NL', {
    timeZone: 'America/New_York', hour: 'numeric',minute:
    '2-digit'});

    document.getElementById("dateny").innerHTML =
    d.toLocaleString('nl-NL', { timeZone: 'America/New_york', day:
    'numeric',month: '2-digit',year: 'numeric' });

    document.getElementById("timech").innerHTML =
    d.toLocaleTimeString('nl-NL', {
    timeZone: 'Asia/Shanghai', hour: 'numeric',minute:
    '2-digit' });
   
    document.getElementById("datech").innerHTML =
    d.toLocaleString('nl-NL', { timeZone: 'Asia/Shanghai', day:
    'numeric',month: '2-digit',year: 'numeric' });

   

	var dd = d.getDate();
	var mm = d.getMonth()+1; //January is 0!
	var yyyy = d.getFullYear();
if(dd<10){
    dd='0'+dd;
}
if(mm<10){
    mm='0'+mm;
}
var today = dd+'-'+mm+'-'+yyyy;
document.getElementById("date").innerHTML = today;

}

// Get data from buienradar.nl

function updateWeather() {
var x2jObj = null;
$.get('https://xml.buienradar.nl', function (xmlDocument) {
    x2jObj = X2J.parseXml(xmlDocument); //X2J.parseXml(xmlDocument, '/');         
	casaandata = Object.assign (casaandata, x2jObj[0]);
    //x2jObj is called jNode   
		console.log("Received buienradar update");
		console.log(x2jObj);
		for (i in casaandata.buienradarnl[0].weergegevens[0].actueel_weer[0].weerstations[0].weerstation)
		{
			var station = casaandata.buienradarnl[0].weergegevens[0].actueel_weer[0].weerstations[0].weerstation[i];
			var stationnaam = station.stationnaam[0].jValue;
			if (stationnaam == "Meetstation Eindhoven")
			{
				elements = document.getElementsByClassName('weathertemptoday');
				for(var y=0; y<elements.length; y++)
				{
					elements[y].innerHTML = station.temperatuurGC[0].jValue + " &deg;C";
				}
				
				var zin = station.icoonactueel[0].jAttr.zin;
				elements = document.getElementsByClassName('weathertexttoday');
				for(var y=0; y<elements.length; y++)
				{
					elements[y].innerHTML = zin;
				}
				document.getElementById("windnow").innerHTML = station.windsnelheidBF[0].jValue + " Bft<BR>" + station.windrichting[0].jValue;
			}
		}

	elements = document.getElementsByClassName('weatherlongtexttoday');
	for(var y=0; y<elements.length; y++)
	{
		elements[y].innerHTML = casaandata.buienradarnl[0].weergegevens[0].verwachting_vandaag[0].samenvatting[0].jValue;
	}

    document.getElementById("temptomorrow").innerHTML =
    casaandata.buienradarnl[0].weergegevens[0].verwachting_meerdaags[0]["dag-plus1"][0].mintemp[0].jValue + " / " + 
	+ casaandata.buienradarnl[0].weergegevens[0].verwachting_meerdaags[0]["dag-plus1"][0].maxtemp[0].jValue + " &deg;C";
    
    document.getElementById("tempaftertomorrow").innerHTML =
    casaandata.buienradarnl[0].weergegevens[0].verwachting_meerdaags[0]["dag-plus2"][0].mintemp[0].jValue + " / " + 
	+ casaandata.buienradarnl[0].weergegevens[0].verwachting_meerdaags[0]["dag-plus2"][0].maxtemp[0].jValue + " &deg;C";

    document.getElementById("tempafteraftertomorrow").innerHTML =
    casaandata.buienradarnl[0].weergegevens[0].verwachting_meerdaags[0]["dag-plus3"][0].mintemp[0].jValue + " / " + 
	+ casaandata.buienradarnl[0].weergegevens[0].verwachting_meerdaags[0]["dag-plus3"][0].maxtemp[0].jValue + " &deg;C";

    document.getElementById("tempafterafteraftertomorrow").innerHTML =
    casaandata.buienradarnl[0].weergegevens[0].verwachting_meerdaags[0]["dag-plus4"][0].mintemp[0].jValue + " / " + 
	+ casaandata.buienradarnl[0].weergegevens[0].verwachting_meerdaags[0]["dag-plus4"][0].maxtemp[0].jValue + " &deg;C";
});
}
