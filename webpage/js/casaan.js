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

}


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
					}
					catch(err)
					{
					}
					
					
					if (data["electricitymeter"]["now"]["kw_using"] == null)
					{
						watt = "-";
						wattbar = 0;
					}
					else
					{
						wattbar = watt;
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
					if (m3today == null) m3today = "-";

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
					var tempnow = data["temperature"]["livingroom"]["now"];
					var tempset = data["temperature"]["livingroom"]["set"];

					canvas = document.getElementById('#insidetemperaturegauge');
					if (canvas != null)
					{
                        ctx = canvas.getContext('2d');
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
					}

					document.getElementById('livingroomtemperaturenow').innerHTML = tempnow + " &deg;C";
					document.getElementById('insidetempgauge').innerHTML = '<div id="insidetemperaturegauge">'+tempnow+'</div>';
					document.getElementById('livingroomtemperatureset').innerHTML = tempset + " &deg;C";



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

function showPage(pageName) {
    var i;
    var x = document.getElementsByClassName("submainarea");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none"; 
    }
if ((pageName == "sunelectricitypage") || (pageName == "electricitypage") || (pageName == "gaspage") || (pageName == "waterpage"))
    document.getElementById("overviewpage").style.display = "inline-block"; 
	else    document.getElementById(pageName).style.display = "inline-block"; 
	autochangesizes();
}


function updateTime() {
    var d = new Date();
    document.getElementById("time").innerHTML = d.toLocaleTimeString('nl');
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
    //x2jObj is called jNode   
		console.log("Received buienradar update");
		console.log(x2jObj);
		for (i in x2jObj[0].buienradarnl[0].weergegevens[0].actueel_weer[0].weerstations[0].weerstation)
		{
			var station = x2jObj[0].buienradarnl[0].weergegevens[0].actueel_weer[0].weerstations[0].weerstation[i];
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
		elements[y].innerHTML = x2jObj[0].buienradarnl[0].weergegevens[0].verwachting_vandaag[0].samenvatting[0].jValue;
	}

    document.getElementById("temptomorrow").innerHTML =
    x2jObj[0].buienradarnl[0].weergegevens[0].verwachting_meerdaags[0]["dag-plus1"][0].mintemp[0].jValue + " / " + 
	+ x2jObj[0].buienradarnl[0].weergegevens[0].verwachting_meerdaags[0]["dag-plus1"][0].maxtemp[0].jValue + " &deg;C";
    
    document.getElementById("tempaftertomorrow").innerHTML =
    x2jObj[0].buienradarnl[0].weergegevens[0].verwachting_meerdaags[0]["dag-plus2"][0].mintemp[0].jValue + " / " + 
	+ x2jObj[0].buienradarnl[0].weergegevens[0].verwachting_meerdaags[0]["dag-plus2"][0].maxtemp[0].jValue + " &deg;C";

    document.getElementById("tempafteraftertomorrow").innerHTML =
    x2jObj[0].buienradarnl[0].weergegevens[0].verwachting_meerdaags[0]["dag-plus3"][0].mintemp[0].jValue + " / " + 
	+ x2jObj[0].buienradarnl[0].weergegevens[0].verwachting_meerdaags[0]["dag-plus3"][0].maxtemp[0].jValue + " &deg;C";
});
}
