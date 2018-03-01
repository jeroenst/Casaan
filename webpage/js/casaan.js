// The object casaandata is filled with data from the casaan server
var casaandata = {};
var currentpage = ""; 

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

	var clientHeight = window.innerHeight;//document.getElementsByClassName("mainarea")[0].clientHeight;
	var clientWidth = window.innerWidth; //document.getElementsByClassName("mainarea")[0].clientWidth;
	var floatingboxWidthHeight = 0;
	
	if (clientHeight > clientWidth)
	{
		// Portrait Mode
		elements = document.getElementsByClassName("portraitbr");
		for(i=0; i<elements.length; i++)
		{
			elements[i].innerHTML = "<BR>"
		}
		floatingboxWidthHeight = clientHeight / 4.6;
		if (floatingboxWidthHeight * 2.3 > clientWidth) floatingboxWidthHeight = clientWidth / 2.3;		
	}
	else
	{
		// Landscape Mode
		elements = document.getElementsByClassName("portraitbr");
		for (i = 0; i < elements.length; i++) 
		{
			elements[i].innerHTML = "";
		}
		floatingboxWidthHeight = clientWidth / 4.3;
		if (floatingboxWidthHeight * 2.3 > clientHeight) floatingboxWidthHeight = clientHeight / 2.3;
	}

	var elements = document.querySelectorAll('.floating-box');
	for(var i=0; i<elements.length; i++)
	{
		elements[i].style.height = floatingboxWidthHeight + "px";
		elements[i].style.width = floatingboxWidthHeight + "px";
	}


	var elements = document.querySelectorAll(".wide-floating-box");
        for(var i=0; i<elements.length; i++)
        {
                elements[i].style.height = floatingboxWidthHeight + "px";
                elements[i].style.width = (floatingboxWidthHeight*2.01) + "px";
        }

	// Auto size footer bar items
	var clientHeight = document.getElementsByClassName('tab')[0].clientHeight;
	elements = document.querySelectorAll('.label, .backbutton, .menuitem');
	for(var i=0; i<elements.length; i++)
	{
		elements[i].style.fontSize = (floatingboxWidthHeight  / 10) + "px";
	}

	//	var clientWidth = 1;
	
	//	elements = document.getElementsByClassName("fullscreen-floating-box");
	//	for(i=0; i<elements.length; i++)
	//	{
	//		clientHeight = elements[i].clientHeight;
	//		clientWidth = elements[i].clientWidth;
	//		if (clientWidth > 0) break;
	//	}

	


/*	var elements = document.querySelectorAll('.fullscreen-boxtext');
	for(var i=0; i<elements.length; i++)
	{
		if (clientHeight > clientWidth) elements[i].style.fontSize = floatingboxWidthHeight  / 45 + "px"
		else elements[i].style.fontSize = (clientHeight + (clientWidth * 0.5))  / 35 + "px";
		elements[i].style.fontSize = floatingboxWidthHeight  / 45 + "px";
	}
*/
	elements = document.querySelectorAll('.boxtitle, .boxlabelsmall, .boxlabel2small, .weathertext');
	for(i=0; i<elements.length; i++)
	{
		elements[i].style.fontSize = (floatingboxWidthHeight / 17) + "px";
	}

	elements = document.querySelectorAll('.wideboxtext');
	for(i=0; i<elements.length; i++)
	{
		elements[i].style.fontSize =(floatingboxWidthHeight / 9) + "px";
	}

	elements = document.querySelectorAll('.boxdate, .boxvalue, .boxvalue2,.boxweathertemp, .boxlowertext');
	for(i=0; i<elements.length; i++)
	{
		elements[i].style.fontSize =(floatingboxWidthHeight / 10) + "px";
	}

	elements = document.querySelectorAll('.boxtime');
	for(i=0; i<elements.length; i++)
	{
		elements[i].style.fontSize = (floatingboxWidthHeight / 5) + "px";
	}


	elements = document.getElementsByClassName('boxweathericon');
	for(i=0; i<elements.length; i++)
	{
		document.getElementsByClassName('boxweathericon')[i].style.fontSize =
		(floatingboxWidthHeight / 3.5) + "px";
	}

	elements = document.getElementsByClassName('domoticabutton');
	for(i=0; i<elements.length; i++)
	{
		document.getElementsByClassName('domoticabutton')[i].style.width = floatingboxWidthHeight /3 + "px";
		document.getElementsByClassName('domoticabutton')[i].style.height = floatingboxWidthHeight /3 + "px";
		document.getElementsByClassName('domoticabutton')[i].style.fontSize = floatingboxWidthHeight /10 + "px";
	}

	elements = document.getElementsByClassName('tempbutton');
	for(i=0; i<elements.length; i++)
	{
		elements[i].style.width = floatingboxWidthHeight /4 + "px";
		elements[i].style.height = floatingboxWidthHeight /4 + "px";
		elements[i].style.fontSize = floatingboxWidthHeight /10 + "px";
	}

	elements = document.getElementsByClassName('domoticabuttons');
	for(i=0; i<elements.length; i++)
	{
		document.getElementsByClassName('domoticabuttons')[i].style.marginTop = floatingboxWidthHeight / 9 + "px";
	}

	elements = document.getElementsByClassName('domoticainfo');
	for(i=0; i<elements.length; i++)
	{
		document.getElementsByClassName('domoticainfo')[i].style.marginTop = floatingboxWidthHeight / 15 + "px";
		document.getElementsByClassName('domoticainfo')[i].style.fontSize = floatingboxWidthHeight /15 + "px";
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
width: floatingboxWidthHeight *0.4,
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
		element.style.fontSize = "60px";
		for (var i = 60; (element.offsetHeight > clientHeight) && (i > 1); i--)
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
var temperaturebar;
var overviewpagebar = [];

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

	temperaturebar = new RGraph.VProgress(
	{
id: 'temperaturebar',
min: 16,
max: 22,
value: 0,
options: {
textAccessible: true,
tickmarks: false,
shadow: false,
colors: ['Gradient(#966:#f55:#f55)'],
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
max: 9000,
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
max: 3000,
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
	//document.documentElement.requestFullscreen();
	//document.body.requestFullscreen();
	startcasaanwebsocket();
	setInterval(updateTime, 1000);
	setInterval(updateWeather, 600000);
	updateTime();
	autochangesizes();
	starttimepage();
	createBars();
	createDomoticaPage();
	document.onHistoryGo = showPage("previouspage");

	
}

function createDomoticaPage()
{

	var domoticapagestring;
	
	domoticapagestring += '<div class="floating-box"><div class="boxtitle">Spots Huiskamer</div><div class="domoticabuttons"><div><button class="domoticabutton" id="buttonzwave4off" onclick="sendzwave(10,1,\'setswitchmultilevel\' ,0)">Uit</button><button class="domoticabutton" id="buttonzwave4dim" onclick="sendzwave(10,1,\'setswitchmultilevel\',10)">10%</button><br><button class="domoticabutton" id="buttonzwave4dim" onclick="sendzwave(10,1,\'setswitchmultilevel\',50)">50%</button><button class="domoticabutton" id="buttonzwave4on" onclick="sendzwave(10,1,\'setswitchmultilevel\',99)">100%</button></div></div><div class="domoticainfo">-</div></div>';
	domoticapagestring += '<div class="floating-box"><div class="boxtitle">TV & Radio</div><div class="domoticabuttons"><div><button class="domoticabutton" id="buttonzwave3off" onclick="sendzwave(4,1,\'setswitchbinairy\',0)">Uit</button><button class="domoticabutton" id="buttonzwave3off" onclick="sendzwave(4,1,\'setswitchbinairy\',1)">Aan</button></div></div><div class="domoticainfo">test</div></div>';
	domoticapagestring += '<div class="floating-box"><div class="boxtitle">Stalamp Huiskamer</div><div class="domoticabuttons"><div><button class="domoticabutton" id="buttonzwave6off" onclick="sendzwave(11,1,\'setswitchmultilevel\',0);">Off</button><button class="domoticabutton" id="buttonzwave6ww" onclick="sendzwave(11,1,\'setcolor\',\'#FF80180000\'); sendzwave(11,1,\'setswitchmultilevel\',10);">10%</button><br><button class="domoticabutton" id="buttonzwave6ww" onclick="sendzwave(11,1,\'setcolor\',\'#FF90200000\'); sendzwave(11,1,\'setswitchmultilevel\',50);">50%</button><button class="domoticabutton" id="buttonzwave6ww" onclick="sendzwave(11,1,\'setcolor\',\'#FFAA330000\'); sendzwave(11,1,\'setswitchmultilevel\',99);">100%</button></div></div><div class="domoticainfo"></div></div>';
	domoticapagestring += '<div class="floating-box"><div class="boxtitle">Lamp Eettafel</div><div class="domoticabuttons"><div><button class="domoticabutton" id="buttonzwave5off" onclick="sendzwave(9,1,\'setswitchmultilevel\' ,0)">Uit</button><button class="domoticabutton" id="buttonzwave5dim" onclick="sendzwave(9,1,\'setswitchmultilevel\',10)">10%</button><br><button class="domoticabutton" id="buttonzwave5dim" onclick="sendzwave(9,1,\'setswitchmultilevel\',50)">50%</button><button class="domoticabutton" id="buttonzwave5on" onclick="sendzwave(9,1,\'setswitchmultilevel\',99)">100%</button></div></div><div class="domoticainfo">-</div></div><br>';
	domoticapagestring += '<div class="floating-box"><div class="boxtitle">Keuken</div><div class="domoticabuttons"><div><button class="domoticabutton" id="buttonzwave1off" onclick="sendzwave(2,1,\'setswitchmultilevel\' ,0)">Uit</button><button class="domoticabutton" id="buttonzwave1dim" onclick="sendzwave(2,1,\'setswitchmultilevel\',10)">10%</button><br><button class="domoticabutton" id="buttonzwave1dim" onclick="sendzwave(2,1,\'setswitchmultilevel\',50)">50%</button><button class="domoticabutton" id="buttonzwave1on" onclick="sendzwave(2,1,\'setswitchmultilevel\',99)">100%</button></div></div><div class="domoticainfo">-</div></div>';
	domoticapagestring += '<div class="floating-box"><div class="boxtitle">Wasmachine</div><div class="domoticabuttons"><div><button class="domoticabutton" id="buttonzwave2off" onclick="">Uit</button><button class="domoticabutton" id="buttonzwave2off" onclick="sendzwave(3,1,\'setswitchbinairy\',1)">Aan</button></div></div><div class="domoticainfo">test</div></div>';
	domoticapagestring += '<div class="floating-box"><div class="boxtitle">Scenes</div><div class="domoticabuttons"><div><button class="domoticabutton" id="buttonzwavescene1" onclick="zwavescene(\'avond\');">Avond</button><button class="domoticabutton" id="buttonzwavescene2" onclick="zwavescene(\'film\');">Film</button><br><button class="domoticabutton" id="buttonzwavescene3"" onclick="zwavescene(\'fel\');">Fel</button><button class="domoticabutton" id="buttonzwavescene4" onclick="zwavescene(\'uit\');">Uit</button></div></div><div class="domoticainfo"></div></div>';
	domoticapagestring += '<div class="floating-box"><div class="boxtitle">Stalamp Huiskamer</div><div class="domoticabuttons"><div><button class="domoticabutton" id="buttonzwave6off" onclick="sendzwave(11,1,\'setcolor\',\'#FF00000000\');">Rood</button><button class="domoticabutton" id="buttonzwave6ww" onclick="sendzwave(11,1,\'setcolor\',\'#00ff000000\');">Groen</button><br><button class="domoticabutton" id="buttonzwave6ww" onclick="sendzwave(11,1,\'setcolor\',\'#0000FF0000\');">Blauw</button><button class="domoticabutton" id="buttonzwave6ww" onclick="sendzwave(11,1,\'setcolor\',\'#5522FF0000\');">Paars</button></div></div><div class="domoticainfo"></div></div>';
	document.getElementById("domoticapage").innerHTML = domoticapagestring;
}

function zwavescene(sceneid)
{
	switch (sceneid)
	{
		case "avond":
			sendzwave(2,1,"setswitchmultilevel",20); 
			sendzwave(4,1,"setswitchbinairy",1); 
			sendzwave(9,1,"setswitchmultilevel",0);
			sendzwave(10,1,"setswitchmultilevel",20);
			sendzwave(11,1,"setcolor","#FF88200000");
			sendzwave(11,1,"setswitchmultilevel",50); 
		break;
		case "film":
			sendzwave(2,1,"setswitchmultilevel",1);
			sendzwave(4,1,"setswitchbinairy",1); 
			sendzwave(9,1,"setswitchmultilevel",0); 
			sendzwave(10,1,"setswitchmultilevel",1); 
			sendzwave(11,1,"setcolor","#FF88180000");
			sendzwave(11,1,"setswitchmultilevel",1);
		break
		case "fel":
			sendzwave(2,1,"setswitchmultilevel",99); 
			sendzwave(4,1,"setswitchbinairy",1); 
			sendzwave(9,1,"setswitchmultilevel",99); 
			sendzwave(10,1,"setswitchmultilevel",99); 
			sendzwave(11,1,"setcolor","#FF90300000");
			sendzwave(11,1,"setswitchmultilevel",99); 
		break;
		case "uit":
			sendzwave(2,1,"setswitchmultilevel",0); 
			sendzwave(4,1,"setswitchbinairy",0); 
			sendzwave(9,1,"setswitchmultilevel",0); 
			sendzwave(10,1,"setswitchmultilevel",0); 
			sendzwave(11,1,"setcolor","#FF88180000");
			sendzwave(11,1,"setswitchmultilevel",0); 
		break;
	}
}



var ws;
function startcasaanwebsocket()
{	
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
			// objectnulltodash(data);
			
			// 				console.log ("Received from casaan server: " + event.data);
			if (data != null)
			{
			_.merge(casaandata, data);
			if ((data["smartmeter"]) && (data["smartmeter"]["electricity"]))
			{
				console.log("Received electricitymeter update");
				if ((data["smartmeter"]["electricity"]["kw_using"]) || (data["smartmeter"]["electricity"]["kw_providing"]))
				{
					var watt = null;
					if (data["smartmeter"]["electricity"]["kw_using"]) watt = Math.round(data["smartmeter"]["electricity"]["kw_using"] * 1000);
					if (data["smartmeter"]["electricity"]["kw_providing"]) watt = -Math.round(data["smartmeter"]["electricity"]["kw_providing"] * 1000);
					if (watt != null) 
					{
						document.getElementById('electricitycurrent').innerHTML = watt + " watt";
						electricitybar.value = watt;
						electricitybar.grow();
					}
					else
                                        {
                                                document.getElementById('electricitycurrent').innerHTML = "- watt";
                                                electricitybar.value = 0;
                                                electricitybar.grow();
                                        }
 
				}
				
				if (isNaN(watt)) watt = "-";
				
				var kwhtoday = "-";
				try
				{
					var kwhtoday =  (data["electricitymeter"]["today"]["kwh_used1"] + data["electricitymeter"]["today"]["kwh_used2"]
					- data["electricitymeter"]["today"]["kwh_provided1"] - data["electricitymeter"]["today"]["kwh_provided2"]).toFixed(3);
					if (data["electricitymeter"]["today"]["kwh_used1"] == null) kwhusedtoday = "-";
				}
				catch(err)
				{
					kwhtoday = "-";
				}
				
				if (isNaN(kwhtoday)) kwhtoday = "-";

				
				document.getElementById('electricityusedtoday').innerHTML = kwhtoday + " kwh";
			}

			if (data["smartmeter"])
			{
				console.log("Received gasmeter update");
				var gasm3h = "-";
				var gasm3today = "-";
				try
				{
					var gasm3h = data["smartmeter"]["gas"]["m3h"];
					var gasm3today = data["smartmeter"]["gas"]["today"]["m3"];
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

			if (data["growatt"])
			{
				console.log("Received growatt update");
				var watt = "-";
				var kwhtoday = "-";
				var kwbarvalue = 0;
				
				if (data["growatt"]["grid"])
				{
				if (data["growatt"]["grid"]["watt"] !== undefined)
				{					
					watt = Math.round(data["growatt"]["grid"]["watt"]);
					if (watt == null) watt = "-"; 
						else kwbarvalue = watt;
					document.getElementById('sunelectricitycurrent').innerHTML = watt + " watt";
					sunelectricitybar.value = kwbarvalue;
					sunelectricitybar.grow();
				}

				if ((data["growatt"]["grid"]["today"]) && (data["growatt"]["grid"]["today"]["kwh"] !== undefined))
				{					

					kwhtoday = (data["growatt"]["grid"]["today"]["kwh"]);
					if (kwhtoday == null) kwhtoday = "-";
					document.getElementById('sunelectricitytoday').innerHTML = kwhtoday + " kwh";
				}
				}
				
				if (currentpage == "sunelectricitypage")
				{
					fillSunElectricityPage();
				}
			}

			if (data["opentherm"])
			{
			   try
			   {
			   	if (data["opentherm"]["thermostat"]["temperature"])
			   	{
			   		document.getElementById('livingroomtemperaturenow').innerHTML = parseFloat(data["opentherm"]["thermostat"]["temperature"]).toFixed(1);
			   		temperaturebar.value =  data["opentherm"]["thermostat"]["temperature"];
			   		temperaturebar.grow();
				}
			   }
			   catch(err)
			   {
			   }
			   try
			   {
			   	if (data["opentherm"]["thermostat"]["setpoint"])
			   	{
			   		document.getElementById('livingroomtemperatureset').innerHTML = parseFloat(data["opentherm"]["thermostat"]["setpoint"]).toFixed(1);  
				}
			   }
			   catch(err)
			   {
			   }
			   if (currentpage == "climatecontrolpage") fillClimateControlPage();
 			} 

			if (data["ducobox"])
			{
			   if (currentpage == "climatecontrolpage") fillClimateControlPage();
 			} 
 			
			if (data["zwave"])
			{
				console.log("Received zwave update: "+JSON.stringify(data["zwave"]));

				try
				{					
					elements = document.getElementsByClassName('domoticabutton');
					buttononcolor = "#66ff66"; 
					buttonsceneoncolor = "#00ccff"; 
					buttonoffcolor = "";  
					try
					{
						// Spots Keuken
						var value = casaandata["zwave"]["2"]["1"]["SWITCH_MULTILEVEL"]["Level"]["value"];
						var watt = casaandata["zwave"]["2"]["1"]["SENSOR_MULTILEVEL"]["Power"]["value"];
						document.getElementsByClassName('domoticabutton')[14].style.backgroundColor = value == 0 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticabutton')[15].style.backgroundColor = value == 10 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticabutton')[16].style.backgroundColor = value == 50 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticabutton')[17].style.backgroundColor = value == 99 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticainfo')[4].innerHTML = value + "% - " + watt + " watt";
		                        }        
					catch(err)
                		        {
                		        }

					try
					{
						// Stalamp
						var value = casaandata["zwave"]["11"]["1"]["SWITCH_MULTILEVEL"]["Level"]["value"];
						document.getElementsByClassName('domoticabutton')[6].style.backgroundColor = value == 0 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticabutton')[7].style.backgroundColor = value == 10 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticabutton')[8].style.backgroundColor = value == 50 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticabutton')[9].style.backgroundColor = value == 99 ? buttononcolor : buttonoffcolor;
						//document.getElementsByClassName('domoticainfo')[4].innerHTML = value + "% - " + watt + " watt";
		                        }        
					catch(err)
                		        {
                		        }

                		        try
                		        {
                		        	// Wasmachine
						var value = casaandata["zwave"]["3"]["1"]["SWITCH_BINARY"]["Switch"]["value"] == "True";
						var watt = casaandata["zwave"]["3"]["1"]["METER"]["Power"]["value"];
						document.getElementsByClassName('domoticabutton')[18].style.backgroundColor = value == 0 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticabutton')[19].style.backgroundColor = value == 1 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticainfo')[5].innerHTML = (watt < 1 ? "Uit " : watt < 4 ? "Klaar " : "Wassen ") + watt + " watt";
					}
					catch(err)
					{
					}
					//console.log ("Watt=" + casaandata["zwave"]["node"]["2"]["1"]["4"]);     

					try
					{
						// Gereserveerd
						var value = casaandata["zwave"]["4"]["1"]["SWITCH_BINARY"]["Switch"]["value"] == "True";
						var watt = casaandata["zwave"]["4"]["1"]["METER"]["Power"]["value"];
						document.getElementsByClassName('domoticabutton')[4].style.backgroundColor = value == 0 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticabutton')[5].style.backgroundColor = value == 1 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticainfo')[1].innerHTML = value == 1 ? "Aan - " + watt + " watt" : "Uit - " + watt + " watt";
					}
					catch(err)
					{
					}
					//console.log ("Watt=" + casaandata["zwave"]["node"]["2"]["1"]["4"]);     

					try
					{
						// Lamp Eettafel
						var value = casaandata["zwave"]["9"]["1"]["SWITCH_MULTILEVEL"]["Level"]["value"];
						var watt = casaandata["zwave"]["9"]["1"]["SENSOR_MULTILEVEL"]["Power"]["value"];
						document.getElementsByClassName('domoticabutton')[10].style.backgroundColor = value == 0 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticabutton')[11].style.backgroundColor = value == 10 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticabutton')[12].style.backgroundColor = value == 50 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticabutton')[13].style.backgroundColor = value == 99 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticainfo')[3].innerHTML = value + "% - " + watt + " watt";
					}
					catch(err)
					{
					}

					try
					{
						// Spots Huiskamer
						var value = casaandata["zwave"]["10"]["1"]["SWITCH_MULTILEVEL"]["Level"]["value"];
						var watt = casaandata["zwave"]["10"]["1"]["SENSOR_MULTILEVEL"]["Power"]["value"];
						document.getElementsByClassName('domoticabutton')[0].style.backgroundColor = value == 0 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticabutton')[1].style.backgroundColor = value == 10 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticabutton')[2].style.backgroundColor = value == 50 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticabutton')[3].style.backgroundColor = value == 99 ? buttononcolor : buttonoffcolor;
						document.getElementsByClassName('domoticainfo')[0].innerHTML = value + "% - " + watt + " watt";
					}
					catch(err)
					{
					}
					
					try
					{
						// Scenes
						var value = (casaandata["zwave"]["2"]["1"]["SWITCH_MULTILEVEL"]["Level"]["value"] == 10) && 
						            (casaandata["zwave"]["3"]["1"]["SWITCH_BINARY"]["Switch"]["value"]  == "True" ) &&
						            (casaandata["zwave"]["4"]["1"]["SWITCH_BINARY"]["Switch"]["value"]  == "True") &&
						            (casaandata["zwave"]["10"]["1"]["SWITCH_MULTILEVEL"]["Level"]["value"] == 10)
						document.getElementsByClassName('domoticabutton')[20].style.backgroundColor = value ? buttonsceneoncolor : buttonoffcolor;

						var value = (casaandata["zwave"]["2"]["1"]["SWITCH_MULTILEVEL"]["Level"]["value"] == 1) && 
						            (casaandata["zwave"]["3"]["1"]["SWITCH_BINARY"]["Switch"]["value"] == "False") &&
						            (casaandata["zwave"]["4"]["1"]["SWITCH_BINARY"]["Switch"]["value"]  == "True") &&
						            (casaandata["zwave"]["10"]["1"]["SWITCH_MULTILEVEL"]["Level"]["value"] == 1)
						document.getElementsByClassName('domoticabutton')[21].style.backgroundColor = value ? buttonsceneoncolor : buttonoffcolor;

						var value = (casaandata["zwave"]["2"]["1"]["SWITCH_MULTILEVEL"]["Level"]["value"] == 99) && 
						            (casaandata["zwave"]["3"]["1"]["SWITCH_BINARY"]["Switch"]["value"] == "True") &&
						            (casaandata["zwave"]["10"]["1"]["SWITCH_MULTILEVEL"]["Level"]["value"] == 99)
						document.getElementsByClassName('domoticabutton')[22].style.backgroundColor = value ? buttonsceneoncolor : buttonoffcolor;

						var value = (casaandata["zwave"]["2"]["1"]["SWITCH_MULTILEVEL"]["Level"]["value"] == 0) && 
						            (casaandata["zwave"]["3"]["1"]["SWITCH_BINARY"]["Switch"]["value"]  == "False") &&
						            (casaandata["zwave"]["4"]["1"]["SWITCH_BINARY"]["Switch"]["value"]  == "False" ) &&
						            (casaandata["zwave"]["10"]["1"]["SWITCH_MULTILEVEL"]["Level"]["value"] == 0)
						document.getElementsByClassName('domoticabutton')[23].style.backgroundColor = value ? buttonsceneoncolor : buttonoffcolor;
					}
					catch(err)
					{
					}
					//console.log ("Watt=" + casaandata["zwave"]["node"]["2"]["1"]["4"]);     

				}
				catch (err)
				{
				}
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

function sendzwave(nodeid, instanceid, command, value)
{
	var jsonobject = new Object;
	jsonobject['zwave'] = new Object; 
	jsonobject['zwave'][nodeid] = new Object;
	jsonobject['zwave'][nodeid][instanceid] = new Object;
	jsonobject['zwave'][nodeid][instanceid][command] = value; 
	ws.send (JSON.stringify(jsonobject));
}

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
/*function fillDomoticaPage()
{
	var titels = ["Spots Keuken", "Stalamp huiskamer", "Tv & Radio", "Lamp Eettafel", "Spots Huiskamer", "Scenes", "", ""];
	var elements = document.getElementById("domoticapage").getElementsByClassName("floating-box");
	for (var key = 0; key < elements.length; key++)
	{
		elements[key].getElementsByClassName("boxtitle")[0].innerHTML = titels[key];
	}

}*/
function settempup()
{
        var jsonobject = new Object;
        jsonobject['opentherm'] = new Object;
        jsonobject['opentherm']['command'] = "tempup";
        ws.send (JSON.stringify(jsonobject));


var e = window.event; 
  e.cancelBubble = true;
  if (e.stopPropagation) e.stopPropagation();
}

function settempdown()
{
        var jsonobject = new Object;
        jsonobject['opentherm'] = new Object;
        jsonobject['opentherm']['command'] = "tempdown";
        ws.send (JSON.stringify(jsonobject));
var e = window.event; 
  e.cancelBubble = true;
  if (e.stopPropagation) e.stopPropagation();
}

function fillClimateControlPage()
{
	elements = document.getElementById("overviewpage").getElementsByClassName("floating-box");
	for (var key = 0; key < elements.length; key++)
	{
		titel = "";
		label1= "";
		value1 = "";
		label2 = "";
		value2 = "";
		    
		switch (key)
		{
			case 0:
			titel = "Cv Ketel"
			label1 = "Boiler"
			if (casaandata["opentherm"]["boiler"] !== undefined)
			{
				value1 = casaandata["opentherm"]["boiler"]["temperature"] + " &deg;C";  
				overviewpagebar[key].max = 60;
				overviewpagebar[key].value = casaandata["opentherm"]["boiler"]["temperature"];
				overviewpagebar[key].grow();
			}


			label2 = "Warmwater"
			if (casaandata["opentherm"]["dhw"] !== undefined) value2 = casaandata["opentherm"]["dhw"]["temperature"] + " &deg;C";
			break;  
			case 1:
			titel = "Cv Ketel"
			label1 = "Vlam"
			if (casaandata["opentherm"]["burner"] !== undefined)
			{
				value1 = casaandata["opentherm"]["burner"]["modulation"]["level"] + " %";  
				overviewpagebar[key].max = 100;
				overviewpagebar[key].value = casaandata["opentherm"]["burner"]["modulation"]["level"];
				overviewpagebar[key].grow();
			}

			label2 = "CV Druk"
			if (casaandata["opentherm"]["ch"] !== undefined)value2 = casaandata["opentherm"]["ch"]["water"]["pressure"] + " bar";
			break;  
			case 2:
			titel = "Thermostaat"
			label1 = "Water Instelling"
			if (casaandata["opentherm"]["thermostat"] !== undefined)
			{
				value1 = casaandata["opentherm"]["thermostat"]["ch"]["water"]["setpoint"] + " &deg;C";    
				overviewpagebar[key].max = 60;
				overviewpagebar[key].value = casaandata["opentherm"]["thermostat"]["ch"]["water"]["setpoint"];
				overviewpagebar[key].grow();
			}

			label2 = "Ruimte &Delta;T"
			if (casaandata["opentherm"]["thermostat"] !== undefined) value2 = (casaandata["opentherm"]["thermostat"]["temperature"]-casaandata["opentherm"]["thermostat"]["setpoint"] ).toFixed(1) + " &deg;C";
			break;
			case 4:
			titel = "Ventilatie Box"
			label1 = "Ventilator"
			if ((casaandata["ducobox"]["1"] !== undefined) && (casaandata["ducobox"]["1"]["fanspeed"] !== ""))
			{
				value1 = casaandata["ducobox"]["1"]["fanspeed"] + " rpm";
				overviewpagebar[key].max = 2500;
				overviewpagebar[key].value = casaandata["ducobox"]["1"]["fanspeed"];
				overviewpagebar[key].grow();
			}
			else
                        {
                                value1 = "- rpm";
                                overviewpagebar[key].value = 0;
                                overviewpagebar[key].grow();
                        }

			break;  
			case 5:
                        titel = "Ventilatie Huiskamer"
                        label1 = "CO2"
                        if ((casaandata["ducobox"]["2"] !== undefined) && (casaandata["ducobox"]["2"]["co2"] !== ""))
                        {
	 	                      	value1 = casaandata["ducobox"]["2"]["co2"] + " ppm";
        	                        overviewpagebar[key].max = 3000;
                	                overviewpagebar[key].value = casaandata["ducobox"]["2"]["co2"];
                        	        overviewpagebar[key].grow();
			}
			else
			{
                                       value1 = "- ppm";
                                       overviewpagebar[key].value = 0;
                                       overviewpagebar[key].grow();
			}
                        label2 = "Temperatuur"
                        if ((casaandata["ducobox"]["2"] !== undefined) && (casaandata["ducobox"]["2"]["temperature"] !== "")) value2 = (casaandata["ducobox"]["2"]["temperature"]/10) + " &deg;C";
                        else value2 = "- &deg;C"; 
                        break;

		}
		elements[key].getElementsByClassName("boxtitle")[0].innerHTML = titel;
		elements[key].getElementsByClassName("boxvalue")[0].innerHTML = value1;
		elements[key].getElementsByClassName("boxvalue2")[0].innerHTML = value2;
		elements[key].getElementsByClassName("boxlabelsmall")[0].innerHTML = label1;
		elements[key].getElementsByClassName("boxlabel2small")[0].innerHTML = label2;
	}
}

function fillSunElectricityPage()
{
	fillOverviewPage("sunelectricity");
	elements = document.getElementById("overviewpage").getElementsByClassName("floating-box");
	for (var key = 0; key < elements.length; key++)
	{

		var fillbox = 0;
		switch (key)
		{
			case 7:
			titel = "Technische Info"
			label1 = "Netspanning"
			value1 = casaandata["sunelectricity"]["now"]["grid"]["volt"] + " V";  
			label2 = "Netfrequentie"
			value2 = casaandata["sunelectricity"]["now"]["grid"]["frequency"] + " Hz";
			fillbox = 1; 
			break; 
		}
		if (fillbox)
		{
			elements[key].getElementsByClassName("boxtitle")[0].innerHTML = titel;
			elements[key].getElementsByClassName("boxvalue")[0].innerHTML = value1;
			elements[key].getElementsByClassName("boxvalue2")[0].innerHTML = value2;
			elements[key].getElementsByClassName("boxlabelsmall")[0].innerHTML = label1;
			elements[key].getElementsByClassName("boxlabel2small")[0].innerHTML = label2;
		}
	}
}


function fillOverviewPage(nodename)
{
	elements = document.getElementById("overviewpage").getElementsByClassName("floating-box");

	var titels = [];
	var unit = "";
	var jsonitems = [];
	var jsonunit = "";
	var label1 = "";
	var label2 = "";

	if (nodename == "electricitymeter")
	{
		titels = ["Vandaag", "Deze Maand", "Dit Jaar", "Totaal", "Gisteren", "Vorige Maand", "Vorig Jaar", ""];
		unit = "kwh"
		jsonitems = ["today",  "month", "year", "total", "yesterday", "lastmonth", "lastyear", ""];
		label1 = "Verbruikt";
		jsonunit = "kwh_used";
		label2 = "Teruggeleverd";
		jsonunit2 = "kwh_provided";
	}
	
	if (nodename == "sunelectricity")
	{
		titels = ["Vandaag", "Deze Maand", "Dit Jaar", "Totaal", "Gisteren", "Vorige Maand", "Vorig Jaar", "Technische Info"];
		unit = "kwh"
		jsonitems = ["today",  "month", "year", "total", "yesterday", "lastmonth", "lastyear", ""];
		label1 = "Opgewekt";
		jsonunit = "kwh";
	}
	
	if ((nodename == "gasmeter") || (nodename == "watermeter"))
	{
		titels = ["Vandaag", "Deze Maand", "Dit Jaar", "Totaal", "Gisteren", "Vorige Maand", "Vorig Jaar", ""];
		unit = "m3"
		jsonitems = ["today", "month", "year", "total",  "yesterday", "lastmonth", "lastyear", ""];
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
			if (jsonitems[key] != "") value1 = casaandata[nodename][jsonitems[key]][jsonunit];
		}
		catch (err)
		{
			
		}
		var value2 = null;
		try
		{
			if (jsonitems[key] != "") value2 = casaandata[nodename][jsonitems[key]][jsonunit2];
		}
		catch (err)
		{
			
		}
		if ((nodename == "sunelectricitymeter") || (nodename == "electricitymeter"))
		{
			if (value1 != null) value1 = Math.round(value1*10)/10;
			if (value1 != null) value2 = Math.round(value2*10)/10;
		}
		if (value1 != null) value1 = value1 + " " + unit;
		else value1 = "";
		
		if (label2 != "")
		{
			if (value2 != null) value2 = value2 + " " + unit;
			else value2 = "";
		}
		else value2="";
		
		if (value1 != "")
		{
			elements[key].getElementsByClassName("boxtitle")[0].innerHTML = titels[key];
			elements[key].getElementsByClassName("boxvalue")[0].innerHTML = value1;
			elements[key].getElementsByClassName("boxvalue2")[0].innerHTML = value2;
			elements[key].getElementsByClassName("boxlabelsmall")[0].innerHTML = label1;
			elements[key].getElementsByClassName("boxlabel2small")[0].innerHTML = label2;
		}
		else
		{
			elements[key].getElementsByClassName("boxtitle")[0].innerHTML = titels[key];
			elements[key].getElementsByClassName("boxvalue")[0].innerHTML = "" ;
			elements[key].getElementsByClassName("boxvalue2")[0].innerHTML = "";
			elements[key].getElementsByClassName("boxlabelsmall")[0].innerHTML = "";
			elements[key].getElementsByClassName("boxlabel2small")[0].innerHTML = "";
		}
	}
}

//
// showPage hides the current page and shows the page selected
//


function showPage(pageName) {
	currentpage = pageName;
        document.getElementById("graphbuttons").style.display = "none";
	elements = document.getElementById("overviewpage").getElementsByClassName("floating-box");

        for (var key = 0; key < elements.length; key++)
        {
                overviewpagebar[key].max = 10;
                overviewpagebar[key].value = 0;
                overviewpagebar[key].grow();
	}

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
		fillSunElectricityPage();
	}
	else if (pageName == "domoticapage")
	{
	/*	graphjsonsource = "";
		graphjsonitem1 = "";
		graphjsonitem2 = ""
		graphunit = "";
		graphtitle = "";
		graphylabel = "";
		graphcolors = ["#00FF00", "#00FFFF"];
		graphnames = ["Geleverd Omvormer", "Opgewekt Zonnepanelen"];*/
		document.getElementById("domoticapage").style.display = "inline-block"; 
		//createDomoticaPage();
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
	else if (pageName == "climatecontrolpage")
	{
		document.getElementById("overviewpage").style.display = "inline-block"; 
		fillClimateControlPage();
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
	
	if (pageName != "mainpage") pageTimer = setTimeout(function(){showPage("mainpage");}, 600000);
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