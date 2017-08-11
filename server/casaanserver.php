<?php

$buienradartimeout = 10; // In minutes

$casaandata = json_decode ('
{
	"casaan" : {},
	"buienradar" : {},
	"sunelectricity" : {
		"today": {
			"kwh_out" : null,
			"kwh_pv" : null,
			"graph" : {
				"labels" : [0, 1, 2, 3, 4, 5],
				"kwh_out" : [1.9, 1.9, 2.1, 2.0, 2.3],
				"kwh_pv" : [2, 2, 2.3, 2.1, 2.5]
			}
		}
	},
	"electricitymeter" : {
		"today": {
			"kwh_used" : null,
			"kwh_used1" : null,
			"kwh_used2" : null,
			"kwh_provided" : null,
			"kwh_provided1" : null,
			"kwh_provided2" : null,
			"graph" : {
				"labels" : [0, 1, 2, 3, 4, 5],
				"kwh_used" : [1, 0,   0, 0.3, 0.1],
				"kwh_provided" : [2, 2, 2.3, 2.1, 2.5]
			}
		}
	},
	"watermeter" : {
		"today": {
			"m3" : null,
			"graph" : {
				"labels" : [0, 1, 2, 3, 4, 5],
				"m3" : [2, 2, 2.3, 2.1, 2.5]
			}
		}
	},
	"gasmeter" : {
				"today": {
			"m3" : null,
			"graph" : {
				"labels" : [0, 1, 2, 3, 4, 5],
				"m3" : [2, 2, 2.3, 2.1, 2.5]
			}
		}

	},
	"temperature" : {}
}
', true);

// pcntl_signal(SIGTERM, "sig_handler");
// pcntl_signal(SIGHUP,  "sig_handler");
// pcntl_signal(SIGUSR1, "sig_handler");

error_reporting(E_ALL);

/* Allow the script to hang around waiting for connections. */
set_time_limit(0);

/* Turn on implicit output flushing so we see what we're getting
* as it comes in. */
ob_implicit_flush();


$settings = array(      
"mysqlserver" => "localhost",
"mysqlusername" => "casaan",
"mysqlpassword" => "casaan",
"mysqldatabase" => "casaan",   
"port" => "58880");
if ($argc > 1)
{
        $settingsfile = parse_ini_file($argv[1]);
        $settings = array_merge($settings, $settingsfile);
}


$address = '127.0.0.1';
$readsocks = array();
$writesocks = array();
$activewebsockets = array();

while (($websocket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)) === false) {
	echo "socket_create() failed: reason: " . socket_strerror(socket_last_error()) . "\n";
	sleep(1);
}
socket_set_nonblock($websocket);

while (socket_bind($websocket, $address, $settings["port"]) === false) {
	echo "socket_bind() failed: reason: " . socket_strerror(socket_last_error($websocket)) . "\n";
	sleep(1);
}

while (socket_listen($websocket, 5) === false) {
	echo "socket_listen() failed: reason: " . socket_strerror(socket_last_error($websocket)) . "\n";
	sleep(1);
}

array_push($readsocks, $websocket);

$smartmetersocket = null;
$watermetersocket = null;
$sunelectricitysocket = null;
$temperaturesocket = null;
$buienradarsocket = null;

$buienradarupdatetimeout = 0;
$reconnecttimeout = 0;


while (1) {
	if ($buienradarupdatetimeout < time() - (60 * $buienradartimeout))
	{
		if ($buienradarsocket == null)
		{
			echo ("Connecting to buienradar server...\n");
			$buienradarsocket = socketconnect('xml.buienradar.nl', 80);
			$buienradarupdatetimeout = time();
		}
	}
	
	if ($reconnecttimeout < time() - 2)
	{
		$reconnecttimeout = time();
		if ($smartmetersocket == null)
		{
			echo ("Connecting to smartmeter server...\n");
			$smartmetersocket = socketconnect('127.0.0.1', 58881);
		}

		if ($watermetersocket == null)
		{
			echo ("Connecting to watermeter server...\n");
			$watermetersocket = socketconnect('127.0.0.1', 58882);
		}

		if ($sunelectricitysocket == null)
		{
			echo ("Connecting to sunelectricity server...\n");
			$sunelectricitysocket = socketconnect('127.0.0.1', 58883);
		}

		if ($temperaturesocket == null)
		{
			echo ("Connecting to temperature server...\n");
			$temperaturesocket = socketconnect('127.0.0.1', 58884);
		}
	}

	$write = $writesocks;
	$read = $readsocks;
	$null = null;

	if (socket_select($read, $write, $null, 10) === 0)
	{
		//echo ("Select timeout!!\n");
	}
	else
	{
		foreach ($write as $sock) 
		{
			$errno = socket_get_option($sock, SOL_SOCKET, SO_ERROR);

			if ($errno == 0) 
			{
				socketconnected($sock);
			}
			else
			{
				socketdisconnected($sock, $errno);
			}
		}
		foreach ($read as $sock) {
			socketreceivedata($sock);
		}
	}
	
}

foreach ($socks as $port => $sock) {
	$desc = "$port/tcp";
	echo "$desc filtered\n";
	socket_close($sock);
}

function socketconnect($ip, $port)
{
	global $writesocks;
	$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
	socket_set_nonblock($socket);
	@socket_connect($socket, $ip, $port);
	array_push($writesocks, $socket);
	return $socket;
}

function socketconnected($sock)
{
	global $writesocks;
	global $readsocks;
	global $watermetersocket;
	global $smartmetersocket;
	global $sunelectricitysocket;
	global $buienradarsocket;
	global $temperaturesocket;
	
	if (($sock == $smartmetersocket))
	{
		echo ("Connected to smartmeter server...\n");
	}
	
	if (($sock == $watermetersocket))
	{
		echo ("Connected to watermeter server...\n");
	}

	if (($sock == $sunelectricitysocket))
	{
		echo ("Connected to sunelectricity server...\n");
	}
	
	if (($sock == $temperaturesocket))
	{
		echo ("Connected to temperature server...\n");
	}

	if (($sock == $buienradarsocket))
	{
		echo ("Connected to buienradar server...\n");
		socket_write($buienradarsocket, "GET / HTTP/1.1\nHost: xml.buienradar.nl\n\n");
	}

	if(($key = array_search($sock, $writesocks)) !== false) {
		unset($writesocks[$key]);
	}
	array_push($readsocks, $sock);
}

function socketreceivedata($sock)
{
	global $watermetersocket;
	global $smartmetersocket;
	global $sunelectricitysocket;
	global $temperaturesocket;
	global $buienradarsocket;
	global $websocket;
	global $readsocks;
	global $casaandata;
	global $activewebsockets;
	global $buienradarsocket;
	global $mysqlserver;
	global $mysqlusername;
	global $mysqlpassword;
	if (($sock == $websocket))
	{
		// IF DATA IS RECEIVED ON WEBSOCKET A NEW CLIENT HAS CONNECTED
		array_push($readsocks, socket_accept($sock));
		socket_set_nonblock($sock);
		echo ("Connection from websocket client accepted...\n");
	}
	else if (socket_recv($sock, $recvdata, 100000, MSG_DONTWAIT) > 0)
	{
		if ($sock == $smartmetersocket)
		{
			echo ("Received data from smartmeter:\n".$recvdata."\n\n");
			updateelectricitymeter(json_decode($recvdata, true)["electricitymeter"]);
			updategasmeter(json_decode($recvdata, true)["gasmeter"]);
			sendtowebsockets("{ \"electricitymeter\":".json_encode($casaandata["electricitymeter"])."}");
			sendtowebsockets("{ \"gasmeter\":".json_encode($casaandata["gasmeter"])."}");
			$mysql=new mysqli($mysqlserver, $mysqlusername, $mysqlpassword, 'casaan');
			if ($mysql->connect_error)
			{
			   echo ("ERROR: Mysql connection failed: ".$conn->connect_error);
			}
			else
			{
				$sql = 'INSERT INTO gasmeter (m3, m3h) 
						VALUES ('.$casaandata["gasmeter"]["now"]["m3"].','
							 .$casaandata["gasmeter"]["now"]["m3h"].');';
			   if (!$mysql->query($sql)) echo ("Error writing gasmeter values to database!\n");
				$sql = 'INSERT INTO electricitymeter (kwh_using, kwh_providing) 
						VALUES ('.$casaandata["electricitymeter"]["now"]["kwh_using"].','
							 .$casaandata["gasmeter"]["now"]["kwh_providing"].');';
			   if (!$mysql->query($sql)) echo ("Error writing electricitymeter values to database!\n");
			   $mysql->close();
			}
		}
		
		else if ($sock == $watermetersocket)
		{
			echo ("Received data from watermeter:\n".$recvdata."\n\n");
			updatewatermeter($casaandata["watermeter"]=json_decode($recvdata, true)["watermeter"]);
			sendtowebsockets("{ \"watermeter\":".json_encode($casaandata["watermeter"])."}");
			$mysql=new mysqli($mysqlserver, $mysqlusername, $mysqlpassword, 'casaan');
			if ($mysql->connect_error)
			{
			   echo ("ERROR: Mysql connection failed: ".$conn->connect_error);
			}
			else
			{
			   $sql = "INSERT INTO `watermeter` (m3, m3h)
			    		VALUES ( ".
			    			$casaandata['watermeter']['now']['m3h'].",".
						$casaandata['watermeter']['total']['m3'].")";
			   if (!$mysql->query($sql)) echo ("Error writing watermeter values to database!\n");
			   $mysql->close();
			}

		}

		else if ($sock == $sunelectricitysocket)
		{
			echo ("Received data from sunelectricity:\n".$recvdata."");
			$casaandata["sunelectricity"]=array_merge_recursive($casaandata["sunelectricity"], json_decode($recvdata, true)["sunelectricity"]);
			sendtowebsockets("{ \"sunelectricity\":".json_encode($casaandata["sunelectricity"])."}");

			$mysql=new mysqli($mysqlserver, $mysqlusername, $mysqlpassword, 'casaan');
			if ($mysql->connect_error)
			{
			   echo ("ERROR: Mysql connection failed: ".$conn->connect_error);
			}
			else
			{
			   $sql = "INSERT INTO `sunelectricity` (pv_watt, pv_volt, pv_amp, grid_watt, grid_volt, grid_amp, grid_frequency,kwh_today,kwh_total)
			    		VALUES ( ".
			    			$casaandata['sunelectricity']['now']['pv']['watt'].",".
						$casaandata['sunelectricity']['now']['pv']['volt'].",".
						$casaandata['sunelectricity']['now']['pv']['amp'].",".
						$casaandata['sunelectricity']['now']['grid']['watt'].",".
						$casaandata['sunelectricity']['now']['grid']['volt'].",".
						$casaandata['sunelectricity']['now']['grid']['amp'].",".
						$casaandata['sunelectricity']['now']['grid']['frequency'].",".
						$casaandata['sunelectricity']['today']['kwh'].",".
						$casaandata['sunelectricity']['total']['kwh'].")";
			   if (!$mysql->query($sql)) echo ("Error writing sunelectricity values to database!\n");
			   $mysql->close();
			}

		}
		
		else if ($sock == $temperaturesocket)
		{
			echo ("Received data from temperature:\n".$recvdata."\n\n");
			$casaandata["temperature"]=array_merge_recursive($casaandata["temperature"], json_decode($recvdata, true)["temperature"]);
			sendtowebsockets("{ \"temperature\":".json_encode($casaandata["temperature"])."}");
		}
		else if ($sock == $buienradarsocket)
		{
			static $buienradardata;
			$buienradardata .= $recvdata;
                        if (strpos($recvdata, '</buienradarnl>') !== false)
                        {
                                $first = strpos($buienradardata, '<buienradarnl>');
                                $buienradardata = substr($buienradardata, $first);
                                echo ("Received data from buienradar...\n");
                                $simpleXml = simplexml_load_string($buienradardata);
                                simplexml_to_array($simpleXml, $array);
                                if (!isset($casaandata["buienradarnl"])) $casaandata["buienradarnl"] = array();
                                if (serialize($casaandata["buienradarnl"]) != serialize($array["buienradarnl"]))
                                {
                                	echo ("Buienradar is updated.\n");
                                        $casaandata["buienradarnl"] = $array["buienradarnl"];
                                        sendtowebsockets(json_encode($array));
                                }
                                $buienradardata = "";
                                socketdisconnect ($sock);
                        }
		}
		else
		{		
			// PROCESS DATA RECEIVED FROM WEBSOCKET CLIENT
			$reply = websocketProcessHeader($recvdata);
			if ($reply !== null)
			{
				echo ("Received from websocket client:\n" . $recvdata . "\n\n");
				echo ("Sending websocket header to client...\n");
				socket_write ($sock, $reply);
				echo ("Sending data to websock client...\n");
				socket_write($sock, websocketEncode(json_encode($casaandata)));
				array_push($activewebsockets, $sock);
			}
			else
			{
				$receivedMessage = websocketDecode($recvdata);
				echo ("Received from websocket client:\n" . $receivedMessage . "\n\n");
				if (trim($receivedMessage) == "getcasaandata")
				{
					echo ("Sending casaandata to websocketclient...\n");
					socket_write($sock, websocketEncode(json_encode($casaandata)));
				}
				if (trim($receivedMessage) == "getelectricitydata")
				{
					echo ("Sending electricitydata to websocketclient...\n");
					socket_write($sock, websocketEncode(json_encode($casaandata["electricity"])));
				}
				if (trim($receivedMessage) == "getgasdata")
				{
					echo ("Sending gasdata to websocketclient...\n");
					socket_write($sock, websocketEncode(json_encode($casaandata["gas"])));
				}
				if (trim($receivedMessage) == "getwatertmeterdata")
				{
					echo ("Sending watermeterdata to websocketclient...\n");
					socket_write($sock, websocketEncode(json_encode($casaandata["watermeter"])));
				}
				if (trim($receivedMessage) == "getsunelectricitydata")
				{
					echo ("Sending sunelectricitydata to websocketclient...\n");
					socket_write($sock, websocketEncode(json_encode($casaandata["sunelectricity"])));
				}
				if (trim($receivedMessage) == "gettemperaturedata")
				{
					echo ("Sending temperaturedata to websocketclient...\n");
					socket_write($sock, websocketEncode(json_encode($casaandata["temperature"])));
				}
				if (trim($receivedMessage) == "getbuienradardata")
				{
					echo ("Sending buienradardata to websocketclient...\n");
					socket_write($sock, websocketEncode(json_encode($casaandata["buienradar"])));
				}
			}
		}
	}
	else
	{
		$errno = socket_get_option($sock, SOL_SOCKET, SO_ERROR);
		socketdisconnected($sock, $errno);
	}
}

function socketdisconnect($sock)
{
	socketdisconnected($sock,0);
}

function socketdisconnected($sock, $errno)
{
	global $readsocks;
	global $writesocks;
	global $activewebsockets;
	global $watermetersocket;
	global $buienradarsocket;
	global $smartmetersocket;
	global $sunelectricitysocket;
	global $temperaturesocket;
	
	$reason = socket_strerror($errno);

	if (($sock == $smartmetersocket))
	{
		echo ("Disconnected from smartmeter ($reason)...\n");
		$smartmetersocket = null;
	}
	
	else if (($sock == $watermetersocket))
	{
		echo ("Disconnected from watermeter ($reason)...\n");
		$watermetersocket = null;
	}

	else if (($sock == $sunelectricitysocket))
	{
		echo ("Disconnected from sunelectricity ($reason)...\n");
		$sunelectricitysocket = null;
	}
	
	else if (($sock == $temperaturesocket))
	{
		echo ("Disconnected from temperature ($reason)...\n");
		$temperaturesocket = null;
	}
	else if (($sock == $buienradarsocket))
	{
		echo ("Disconnected from buienradar ($reason)...\n");
		$buienradarsocket = null;
	}
	else
	{
		echo ("Websocketclient disconnected ($reason)...\n");
	}
	if(($key = array_search($sock, $readsocks)) !== false) {
		unset($readsocks[$key]);
	}
	
	if(($key = array_search($sock, $writesocks)) !== false) {
		unset($writesocks[$key]);
	}

	if(($key = array_search($sock, $activewebsockets)) !== false) {
		unset($activewebsockets[$key]);
	}

	socket_close($sock);
}




function extractfloat($string)
{
	$tmp = preg_replace( '/[^\d\.]/', '',  $string );
	return floatval($tmp);
}

function match($lines, $needle) 
{
	$ret = false;
	foreach ( $lines as $line ) 
	{
		list($key,$val) = explode(':',$line);
		$ret = $key==$needle ? $val : false;
		if ( $ret ) break;
	}
	return $ret;
}


function replace(&$lines, $needle, $value, $add=true) 
{
	$ret = false;
	foreach ( $lines as &$line) 
	{
		list($key,$val) = explode(':',$line);
		if ($key==$needle)
		{
			$val = $value;
			$line = $key.':'.$val;
			$ret = true;
		}
	}
	if (($ret == false)&&($add == true))
	{
		array_push ($lines,$needle.':'.$value); 
		$ret = true;
	}
	return $ret;
}                     

function removeEmptyLines(&$linksArray) 
{
	foreach ($linksArray as $key => $link)
	{
		if ($linksArray[$key] == '')
		{
			unset($linksArray[$key]);
		}
	}
}                     



function sendtowebsockets($msg)
{
	global $activewebsockets;
	foreach ($activewebsockets as $sock) 
	{
		socket_write($sock, websocketEncode($msg));
		echo ("Sending data to websocketclients:\n".$msg."\n\n");
	}
}


function websocketDecode($M){
	$M = array_map("ord", str_split($M));
	$L = $M[1] AND 127;

	if ($L == 126)
	$iFM = 4;
	else if ($L == 127)
	$iFM = 10;
	else
	$iFM = 2;

	$Masks = array_slice($M, $iFM, 4);

	$Out = "";
	for ($i = $iFM + 4, $j = 0; $i < count($M); $i++, $j++ ) {
		$Out .= chr($M[$i] ^ $Masks[$j % 4]);
	}
	return $Out;
}

function websocketEncode($message)
{
	$length = strlen($message);

	$bytesHeader = [];
	$bytesHeader[0] = 129; // 0x1 text frame (FIN + opcode)

	if ($length <= 125) {
		$bytesHeader[1] = $length;
	} else if ($length >= 126 && $length <= 65535) {
		$bytesHeader[1] = 126;
		$bytesHeader[2] = ( $length >> 8 ) & 255;
		$bytesHeader[3] = ( $length      ) & 255;
	} else {
		$bytesHeader[1] = 127;
		$bytesHeader[2] = ( $length >> 56 ) & 255;
		$bytesHeader[3] = ( $length >> 48 ) & 255;
		$bytesHeader[4] = ( $length >> 40 ) & 255;
		$bytesHeader[5] = ( $length >> 32 ) & 255;
		$bytesHeader[6] = ( $length >> 24 ) & 255;
		$bytesHeader[7] = ( $length >> 16 ) & 255;
		$bytesHeader[8] = ( $length >>  8 ) & 255;
		$bytesHeader[9] = ( $length       ) & 255;
	}

	$str = implode(array_map("chr", $bytesHeader)) . $message;

	return $str;
}


function websocketProcessHeader($message)
{
	$magicGUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
	$headers = array();
	$lines = explode("\n",$message);
	foreach ($lines as $line) {
		if (strpos($line,":") !== false) {
			$header = explode(":",$line,2);
			$headers[strtolower(trim($header[0]))] = trim($header[1]);
		}
		elseif (stripos($line,"get ") !== false) {
			preg_match("/GET (.*) HTTP/i", $message, $reqResource);
			$headers['get'] = trim($reqResource[1]);
		}
	}

	if (isset($headers['sec-websocket-key']))
	{
		$webSocketKeyHash = sha1($headers['sec-websocket-key'] . $magicGUID);

		$rawToken = "";
		for ($i = 0; $i < 20; $i++) {
			$rawToken .= chr(hexdec(substr($webSocketKeyHash,$i*2, 2)));
		}
		$handshakeToken = base64_encode($rawToken) . "\r\n";

		$subProtocol = "";
		$extensions = "";
		return "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: $handshakeToken\r\n";
	}
	else return NULL;
}


function updatebuienradar()
{
	global $casaandata;
	echo ("Updating buienradar...\n");
	$fileContents= file_get_contents('http://xml.buienradar.nl');
	//$fileContents = str_replace(array("\n", "\r", "\t"), '', $fileContents);
	//$fileContents = trim(str_replace('"', "'", $fileContents));
	$simpleXml = simplexml_load_string($fileContents);

	simplexml_to_array($simpleXml, $array);
	$casaandata["buienradarnl"]= $array["buienradarnl"];
	sendtowebsockets(json_encode($array));
}

function simplexml_to_json ($xml)
{
	simplexml_to_array ($xml, $array);
	return json_encode ($array);
}

function simplexml_to_array ($xml, &$array) {

	// Empty node : <node></node>
	//$array[$xml->getName()][] = '';

	// Nodes with children
	foreach ($xml->children() as $child) {
		$nrofsamechilds = 0;
		foreach ($xml->children() as $searchchild)
		{
			if ($child->getName() == $searchchild->getName()) $nrofsamechilds++;
		} 
		if ($nrofsamechilds > 1)
		{
			simplexml_to_array($child, $array[$xml->getName()][]);
		}
		else
		{
			simplexml_to_array($child, $array[$xml->getName()]);
		}
	}

	// Node attributes
	foreach ($xml->attributes() as $key => $att) {
		$array[$xml->getName()]['@attributes'][$key] = (string) $att;
	}

	// Node with value
	if (trim((string) $xml) != '') {
		$array[$xml->getName()][] = (string) $xml; 
	}

}



function sig_handler($signo)
{
	global $readsocks;
	global $writesocks;

	switch ($signo) {
	case SIGTERM:
		// handle shutdown tasks
		break;
	case SIGHUP:
		// handle restart tasks
		break;
	case SIGUSR1:
		// handle sigusr1 tasks
		break;
	default:
		// handle all other signals
	}

	foreach ($writesocks as $sock)
	{
		fclose($sock);
	}
	foreach ($readsock as $sock) {
		fclose($sock);
	}
	exit(0);
}


function updategasmeter($newdata)
{
        global $settings;
        global $casaandata;

        $mysqli = mysqli_connect($settings["mysqlserver"],$settings["mysqlusername"],$settings["mysqlpassword"],$settings["mysqldatabase"]);

        if (class_exists("mysqli"))
        {
	        if (!$mysqli->connect_errno)
	        {
                	$mysqli->query("INSERT INTO `gasmeter` (m3) VALUES (".$newdata["total"]["m3"].");");

                        // Read values from database
                	if ($result = $mysqli->query("SELECT * FROM `gasmeter` WHERE timestamp >= CURDATE() AND timestamp < CURDATE() + INTERVAL 1 DAY ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row = $result->fetch_object();
                		//var_dump ($row);
                		$newdata["today"]["m3"] = $newdata["total"]["m3"] - $row->m3;
			}
			else
			{
                        	echo "error reading gas values from database ".$mysqli->error."\n"; 
                        }

                                                	

                        // Read values from database
                	if ($result = $mysqli->query("SELECT * FROM `gasmeter` WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR) AND timestamp < NOW() ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row = $result->fetch_object();
                		//var_dump ($row);
                		$newdata["now"]["m3h"] = $newdata["total"]["m3"] - $row->m3;
			}
			else
			{
                        	echo "error reading gas values from database ".$mysqli->error."\n"; 
                        }

                                                	
                	$mysqli->close();
		}
		else
		{
                	echo ("Error while writing gas values to database: ".$mysqli->connect_error ."\n");
		}

	}
	
	$casaandata["gasmeter"] = $newdata;
}

function updateelectricitymeter($newdata)
{
        global $settings;
        global $casaandata;

        $mysqli = mysqli_connect($settings["mysqlserver"],$settings["mysqlusername"],$settings["mysqlpassword"],$settings["mysqldatabase"]);

        if (class_exists("mysqli"))
        {
        	if (!$mysqli->connect_errno)
        	{
		        // Write values to database
                	if (!$mysqli->query("INSERT INTO `electricitymeter` (kw_using, kw_providing, kwh_used1, kwh_used2, kwh_provided1, kwh_provided2) VALUES (".
                					$newdata["now"]["kw_using"].",".
                                                	$newdata["now"]["kw_providing"].",". 
                                                	$newdata["total"]["kwh_used1"].",". 
                                                	$newdata["total"]["kwh_used2"].",". 
                                                	$newdata["total"]["kwh_provided1"].",". 
                                                	$newdata["total"]["kwh_provided2"].");"))
			{
                        	echo "error writing electricity values to database ".$mysqli->error."\n"; 
                        }
                        

                        // Read values from database
                	if ($result = $mysqli->query("SELECT * FROM `electricitymeter` WHERE timestamp >= CURDATE() AND timestamp < CURDATE() + INTERVAL 1 DAY ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row = $result->fetch_object();
                		//var_dump ($row);
                		$newdata["today"]["kwh_used1"] = $newdata["total"]["kwh_used1"] - $row->kwh_used1;
                		$newdata["today"]["kwh_used2"]  = $newdata["total"]["kwh_used2"] - $row->kwh_used2;
                		$newdata["today"]["kwh_provided1"] = $newdata["total"]["kwh_provided1"] - $row->kwh_provided1;
                		$newdata["today"]["kwh_provided2"] = $newdata["total"]["kwh_provided2"] - $row->kwh_provided2;
                		$newdata["today"]["kwh_used"] = $newdata["today"]["kwh_used1"] + $newdata["today"]["kwh_used2"];
                		$newdata["today"]["kwh_provided"] = $newdata["today"]["kwh_provided1"] + $newdata["today"]["kwh_provided2"];
                		$newdata["today"]["kwh_total"] = $newdata["today"]["kwh_used"] - $newdata["today"]["kwh_provided"];                		  
			}
			else
			{
                        	echo "error reading electricity values from database ".$mysqli->error."\n"; 
                        }

                                                	
			$mysqli->close();
		}
		else
		{
                	echo ("Error while writing values to database: ".$mysqli->connect_error ."\n");
		}
	}
	
	
	
	
	$casaandata["electricitymeter"] = $newdata;
}


function updatewatermeter($newdata)
{
        global $settings;
        global $casaandata;

        $mysqli = mysqli_connect($settings["mysqlserver"],$settings["mysqlusername"],$settings["mysqlpassword"],$settings["mysqldatabase"]);

        if (class_exists("mysqli"))
        {
	        if (!$mysqli->connect_errno)
	        {
                	$mysqli->query("INSERT INTO `watermeter` (m3) VALUES (".$newdata["total"]["m3"].");");

                        // Read values from database
                	if ($result = $mysqli->query("SELECT * FROM `watermeter` WHERE timestamp >= CURDATE() AND timestamp < CURDATE() + INTERVAL 1 DAY ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row = $result->fetch_object();
                		//var_dump ($row);
                		$newdata["today"]["m3"] = $newdata["total"]["m3"] - $row->m3;
			}
			else
			{
                        	echo "error reading water values from database ".$mysqli->error."\n"; 
                        }

                                                	
                	$mysqli->close();
		}
		else
		{
                	echo ("Error while writing water values to database: ".$mysqli->connect_error ."\n");
		}

	}
	
	$casaandata["watermeter"] = $newdata;
}


?>  

