function autochangesizes()
{	
	var element;
	if ((window.innerHeight/window.innerWidth) > 1)
	{
		// Portrait Mode
		if (element = document.getElementById("portraitbr1")) element.innerHTML = "<BR>";
		if (element = document.getElementById("portraitbr2")) element.innerHTML = "<BR>";
	}
	else 
	{
		// Normal mode
		if (element = document.getElementById("portraitbr1")) element.innerHTML = "";
		if (element = document.getElementById("portraitbr2")) element.innerHTML = "";
	}


	// Auto size footer bar items
	var clientHeight = document.getElementsByClassName('tab')[0].clientHeight;
	var elements = document.querySelectorAll('.label, .backbutton, .menuitem');
	for(var i=0; i<elements.length; i++) 
	{
		elements[i].style.fontSize =
		(clientHeight / 2) + "px";
	}

	var clientWidth = 1;
	if (element = document.getElementsByClassName('fullscreen-floating-box')[0]) clientHeight = element.clientHeight;
	if (element = document.getElementsByClassName('fullscreen-floating-box')[0]) clientWidth = element.clientWidth;
	if (element = document.getElementsByClassName('floating-box')[0]) clientHeight = element.clientHeight;
	if (element = document.getElementsByClassName('floating-box')[0]) clientWidth = element.clientWidth;

	var elements = document.querySelectorAll('.boxtitle, .boxlabel2small, .boxweathertext');
	for(var i=0; i<elements.length; i++) 
	{
		elements[i].style.fontSize = (clientHeight / 14) + "px";
	}

	var elements = document.querySelectorAll('.fullscreen-boxtext');
	for(var i=0; i<elements.length; i++) 
	{
		if (clientHeight > clientWidth) elements[i].style.fontSize = (clientHeight + clientWidth)  / 45 + "px"
		else elements[i].style.fontSize = (clientHeight + (clientWidth * 0.5))  / 35 + "px"
	}

	elements = document.querySelectorAll('.wideboxtext');
	for(i=0; i<elements.length; i++) 
	{
		elements[i].style.fontSize =(clientHeight / 9) + "px";
	}

	elements = document.querySelectorAll('.boxdate, .boxvalue, .boxvalue2, .boxweathertemp, .boxlowertext');
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
              
              if (data["smartmeter"])
              {
            	console.log("Received smartmeter update");
            	var watt = data["smartmeter"]["electricity"]["now"]["watt"];
            	var kwhusedtoday = Math.round((data["smartmeter"]["electricity"]["today"]["kwhused1"] + data["smartmeter"]["electricity"]["today"]["kwhused2"]
						- data["smartmeter"]["electricity"]["today"]["kwhprovided1"] - data["smartmeter"]["electricity"]["today"]["kwhprovided2"])*10)/10;

		document.getElementById('electricitycurrent').innerHTML = watt + " watt";
		document.getElementById('electricityusedtoday').innerHTML = kwhusedtoday + " kwh";
		electricitybar.value = Math.min(2000, watt);
		electricitybar.grow();

		var gasm3h = data["smartmeter"]["gas"]["now"]["m3h"];
		var gasm3usedtoday = data["smartmeter"]["gas"]["today"]["m3used"];

		document.getElementById('gascurrent').innerHTML = gasm3h + " m3/h";
		document.getElementById('gastoday').innerHTML = gasm3usedtoday + " m3";
		gasbar.value = gasm3h;
		gasbar.grow();
               }
               
               if (data["watermeter"])
               {
                    console.log("Received watermeter update");
                    var lmin = data["watermeter"]["now"]["litermin"];
                    var m3today = Math.round(data["watermeter"]["today"]["literused"] / 100)/10;

                    document.getElementById('watercurrent').innerHTML = lmin + " liter/min";
                    document.getElementById('watertoday').innerHTML = m3today + " m3";
                    waterbar.value = lmin;
                    waterbar.grow();
               }
               
             if (data["sunelectricity"])
             {
                console.log("Received sunelectricity update");
                var watt = data["sunelectricity"]["now"]["watt"];
                var kwhtoday = 0 + data["sunelectricity"]["today"]["kwhprovided"];

                document.getElementById('sunelectricitycurrent').innerHTML = watt + " watt";
                document.getElementById('sunelectricitytoday').innerHTML = kwhtoday + " kwh";
                sunelectricitybar.value = watt;
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




function updateTime() {
    var d = new Date();
    document.getElementById("time").innerHTML = d.toLocaleTimeString();
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
function updateWeather() 
{
	var x2jObj = null;
	$.get('https://xml.buienradar.nl', function (xmlDocument) 
	{
		x2jObj = X2J.parseXml(xmlDocument); //X2J.parseXml(xmlDocument, '/');         
		console.log("Received buienradar update");
		for (i in
		x2jObj[0].buienradarnl[0].weergegevens[0].actueel_weer[0].weerstations[0].weerstation)
		{
			var station = x2jObj[0].buienradarnl[0].weergegevens[0].actueel_weer[0].weerstations[0].weerstation[i];
			var stationnaam = station.stationnaam[0].jValue;
			if (stationnaam == "Meetstation Eindhoven") 
			{
				document.getElementById("tempnow").innerHTML = station.temperatuurGC[0].jValue + " &deg;C";
				var zin = station.icoonactueel[0].jAttr.zin;
				document.getElementById("weathernow").innerHTML = zin;
			}
		}
	});
}

