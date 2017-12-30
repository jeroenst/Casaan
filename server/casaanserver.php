<?php

$buienradartimeout = 10; // In minutes

$casaandata = array();

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
$mysqlserver = $settings["mysqlserver"];
$mysqlusername = $settings["mysqlusername"];
$mysqlpassword = $settings["mysqlpassword"];

$readsocks = array();
$writesocks = array();
$activewebsockets = array();

while (($websocket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)) === false) {
	echo "socket_create() failed: reason: " . socket_strerror(socket_last_error()) . "\n";
	sleep(1);
}
socket_set_nonblock($websocket);
socket_set_option($websocket, SOL_SOCKET, SO_REUSEADDR, 1); 
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
$zwavesocket = null;
$openthermsocket = null;

$buienradarupdatetimeout = 0;
$reconnecttimeout = 0;


while (1) {
	if ($buienradarupdatetimeout < time())
	{
		//if ($buienradarsocket == null)
		//{
			// For now we use synchone fetching of buienradar because they changed from http to https :-(
			echo ("Fetching data from  buienradar server...\n");
			//$buienradarsocket = socketconnect('xml.buienradar.nl', 443);
	               $url = "https://xml.buienradar.nl";
	               $array = [];
	               $simpleXml = simplexml_load_file($url);
                       if ($simpleXml)
                       {
                                                simplexml_to_array($simpleXml, $array);
                                                if (!isset($casaandata["buienradarnl"])) $casaandata["buienradarnl"] = array();
                                                if (serialize($casaandata["buienradarnl"]) != serialize($array["buienradarnl"]))
                                                {
                                                        echo ("Buienradar is updated.\n");
                                                        $casaandata["buienradarnl"] = $array["buienradarnl"];
                                                        sendtowebsockets(json_encode($array));
                                                }
                        }

			$buienradarupdatetimeout = time() + (60 * $buienradartimeout);
		//}
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
			$sunelectricitysocket = socketconnect('rpi01', 58883);
		}

		if ($temperaturesocket == null)
		{
			echo ("Connecting to temperature server...\n");
			$temperaturesocket = socketconnect('127.0.0.1', 58884);
		}

		if ($zwavesocket == null)
		{
			echo ("Connecting to zwave server...\n");
			$zwavesocket = socketconnect('127.0.0.1', 58885);
		}

		if ($openthermsocket == null)
		{
			echo ("Connecting to opentherm server...\n");
			$openthermsocket = socketconnect('rpi01', 58886);
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
	socket_set_option($socket, SOL_SOCKET, SO_KEEPALIVE, 1);
	socket_connect($socket, $ip, $port);
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
	global $zwavesocket;
	global $openthermsocket;
	
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
		stream_socket_enable_crypto ($buienradarsocket, TRUE, STREAM_CRYPTO_METHOD_ANY_CLIENT);
		socket_write($buienradarsocket, "GET / HTTPS/1.1\nHost: xml.buienradar.nl\n\n");
	}

	if (($sock == $zwavesocket))
	{
		echo ("Connected to zwave server...\n");
	}

	if (($sock == $openthermsocket))
	{
		echo ("Connected to opentherm server...\n");
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
	global $zwavesocket;
	global $openthermsocket;
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
		}
		
		else if ($sock == $watermetersocket)
		{
			echo ("Received data from watermeter:\n".$recvdata."\n\n");
			updatewatermeter(json_decode($recvdata, true)["watermeter"]);
		}

		else if ($sock == $zwavesocket)
		{
			echo ("Received data from zwave:\n".$recvdata."\n\n");
			$recvpackets = explode(chr(2),$recvdata);

			foreach($recvpackets as $recvpacket) {    
				if ($recvpacket != '')
				{  
					$recvdatajson = json_decode(utf8_encode($recvpacket), true);
					updatezwave($recvdatajson["zwave"]);
				}
			}
		}

		else if ($sock == $sunelectricitysocket)
		{
			echo ("Received data from sunelectricity:\n".$recvdata."");
			updatesunelectricity(json_decode($recvdata, true)["sunelectricity"]);

		}
		else if ($sock == $openthermsocket)
		{
			echo ("Received data from opentherm:\n".$recvdata."");
			updateopentherm(json_decode($recvdata, true)["opentherm"]);

		}
		
		else if ($sock == $temperaturesocket)
		{
			echo ("Received data from temperature:\n".$recvdata."\n\n");
			$casaandata["temperature"]=array_merge_recursive($casaandata["temperature"], json_decode($recvdata, true)["temperature"]);
			sendtowebsockets("{\"temperature\":".json_encode($casaandata["temperature"])."}");
		}
		else if ($sock == $buienradarsocket)
		{
			static $buienradardata;
			$buienradardata .= $recvdata;
                        if (strpos($recvdata, '</buienradarnl>') !== false)
                        {
                                echo ("Received data from buienradar...\n");
                                $last = strrpos($buienradardata, '<buienradarnl>');
                                $buienradardata = substr($buienradardata, $last);
                                try
                                {
                                	// Remove bogus before and after xml
                                	$buienradardata = strstr($buienradardata, '<buienradarnl>');
                                	$buienradardata = preg_replace("/<\/buienradarnl>.*/", "", $buienradardata).'</buienradarnl>';
                                	echo $buienradardata;
                                	$simpleXml = simplexml_load_string($buienradardata);
	                                if ($simpleXml) 
	                                {
	                                	simplexml_to_array($simpleXml, $array);
	                                	if (!isset($casaandata["buienradarnl"])) $casaandata["buienradarnl"] = array();
	                                	if (serialize($casaandata["buienradarnl"]) != serialize($array["buienradarnl"]))
	                                	{
                                			echo ("Buienradar is updated.\n");
                                			$casaandata["buienradarnl"] = $array["buienradarnl"];
                                			sendtowebsockets(json_encode($array));
						}
					}
				}
				catch (Exception $e)
				{
				}
				$buienradardata = "";
	                        socketdisconnected ($sock, 0);
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
				echo (json_encode($casaandata,JSON_FORCE_OBJECT));
				socket_write($sock, websocketEncode(json_encode($casaandata)));
				array_push($activewebsockets, $sock);
			}
			else
			{
				$receivedMessages = websocketDecode($recvdata);
				foreach ($receivedMessages as $receivedMessage)
				{
					echo ("Received from websocket client:\n" . $receivedMessage . "\n\n");
					$receivedjson = json_decode($receivedMessage, true);
					if (isset($receivedjson["zwave"]))
					{
						socket_write($zwavesocket, $receivedMessage . chr(30));
						echo ("Sending data to zwave:\n" . $receivedMessage . "\n\n");
					}
					if (isset($receivedjson["opentherm"]))
					{
						socket_write($openthermsocket, $receivedMessage);
						echo ("Sending data to opentherm:\n" . $receivedMessage . "\n\n");
					}
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


function socketdisconnected($sock, $errno)
{
	global $readsocks;
	global $writesocks;
	global $activewebsockets;
	global $watermetersocket;
	global $buienradarsocket;
	global $zwavesocket;
	global $openthermsocket;
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
	else if (($sock == $zwavesocket))
	{
		echo ("Disconnected from zwave ($reason)...\n");
		$zwavesocket = null;
	}
	else if (($sock == $openthermsocket))
	{
		echo ("Disconnected from opentherm ($reason)...\n");
		$openthermsocket = null;
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


function websocketDecode($Message){

	$returnarray = array();
	for ($messagenr = 0; strlen($Message) > 0; $messagenr++)
	{
		$M = array_map("ord", str_split($Message));
		$L = $M[1] & 127;
		if ($L == 126)
		{
			$iFM = 4;
			$L = ($M[2] << 8) + $M[3];
		}
		else if ($L == 127)
		{
			$iFM = 10;
			$L = ($M[2] << 56) + ($M[3] << 48) + ($M[4] << 40) + ($M[5] << 32) + ($M[6] << 24) + ($M[7] << 16) + ($M[8] << 8) + $M[9];
		}
		else
		$iFM = 2;

		$Masks = array_slice($M, $iFM, 4);

		$Out = "";
		for ($i = $iFM + 4, $j = 0; $j < $L; $i++, $j++ ) {
			$Out .= chr($M[$i] ^ $Masks[$j % 4]);
		}
		$returnarray[$messagenr] = $Out;
		$messagelength =  $iFM + 4 + $L;
		$Message = substr($Message, $messagelength);
	}
	return $returnarray;
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
        // only update when value has changed
        if (isset($newdata['updatedatetime']) && (((!isset($casaandata["gasmeter"])) || ($casaandata["gasmeter"]['updatedatetime'] != $newdata['updatedatetime']))))
        {   
        
        echo ("Received new values from gasmeter...\n");

        $mysqli = mysqli_connect($settings["mysqlserver"],$settings["mysqlusername"],$settings["mysqlpassword"],$settings["mysqldatabase"]);

        if (class_exists("mysqli"))
        {
	        if (!$mysqli->connect_errno)
	        {
	        	$sql = "INSERT INTO `gasmeter` (timestamp, m3) VALUES ('".$newdata["updatedatetime"]."','" .$newdata["total"]["m3"]."');";
	        	echo $sql;
                	if (!$mysqli->query($sql))
                	{
                        	echo "error writing gas values to database ".$mysqli->error."\n";
                	}

                        // Read values from database
                	if ($result = $mysqli->query("SELECT * FROM `gasmeter` WHERE timestamp >= CURDATE() ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row = $result->fetch_object();
                		//var_dump ($row);
                		$newdata["today"]["m3"] = round($newdata["total"]["m3"] - $row->m3, 3);
			}
			else
			{
                        	echo "error reading gas values from database ".$mysqli->error."\n";
                        	$newdata["today"]["m3"] = 0; 
                        }

                                                	

                        // Read values from database
                	if ($result = $mysqli->query("SELECT * FROM `gasmeter` WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR) ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row = $result->fetch_object();
                		//var_dump ($row);
                		if ($row)
                		{
                			$newdata["now"]["m3h"] = round($newdata["total"]["m3"] - $row->m3,3);
				}
				else
				{
					$newdata["now"]["m3h"] = 0;
				}
			}
			else
			{
                        	echo "no gas values from database ".$mysqli->error."\n"; 
                		$newdata["now"]["m3h"] = 0;
                        }



                        // Calculate values from yesterday
                	if ($result = $mysqli->query("SELECT * FROM `gasmeter` WHERE timestamp >= CURDATE() - INTERVAL 1 DAY ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row1 = $result->fetch_object();
	                	if ($result = $mysqli->query("SELECT * FROM `gasmeter` WHERE timestamp >= CURDATE() ORDER BY timestamp ASC LIMIT 1")) 
        	        	{
                			$row2 = $result->fetch_object();
                			//var_dump ($row);
                			$newdata["yesterday"]["m3"] = round($row2->m3 - $row1->m3,3);
				}
			}
			else
			{
                        	echo "error reading gas values from database ".$mysqli->error."\n"; 
                        }
                         

                        // Calculate values from this month
                	if ($result = $mysqli->query("SELECT * FROM `gasmeter` WHERE timestamp >= DATE_FORMAT(NOW() ,'%Y-%m-01') ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row = $result->fetch_object();
                		//var_dump ($row);
                		$newdata["month"]["m3"] = round($newdata["total"]["m3"] - $row->m3,3);
			}
			else
			{
                        	echo "error reading gas values from database ".$mysqli->error."\n"; 
                        }

                        // Calculate values from previous month
                	if ($result = $mysqli->query("SELECT * FROM `gasmeter` WHERE timestamp >= DATE_FORMAT(NOW() ,'%Y-%m-01') - INTERVAL 1 MONTH ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row1 = $result->fetch_object();
	                	if ($result = $mysqli->query("SELECT * FROM `gasmeter` WHERE timestamp >= DATE_FORMAT(NOW() ,'%Y-%m-01') ORDER BY timestamp ASC LIMIT 1")) 
        	        	{
                			$row2 = $result->fetch_object();
                			//var_dump ($row);
                			$newdata["lastmonth"]["m3"] = round($row2->m3 - $row1->m3,3);
				}
			}
			else
			{
                        	echo "error reading gas values from database ".$mysqli->error."\n"; 

			}
			
                        // Calculate values from this year
                	if ($result = $mysqli->query("SELECT * FROM `gasmeter` WHERE timestamp >= DATE_FORMAT(NOW() ,'%Y-01-01') ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row = $result->fetch_object();
                		//var_dump ($row);
                		if (isset($row))
                		{
                			$newdata["year"]["m3"] = round($newdata["total"]["m3"] - $row->m3,3);
				}
			}
			else
			{
                        	echo "error reading gas values from database ".$mysqli->error."\n"; 
                        }

                        // Calculate values from previous year
                	if ($result = $mysqli->query("SELECT * FROM `gasmeter` WHERE timestamp >= DATE_FORMAT(NOW() ,'%Y-01-01') - INTERVAL 1 YEAR ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row1 = $result->fetch_object();
	                	if ($result = $mysqli->query("SELECT * FROM `gasmeter` WHERE timestamp >= DATE_FORMAT(NOW() ,'%Y-01-01') ORDER BY timestamp ASC LIMIT 1")) 
        	        	{
                			$row2 = $result->fetch_object();
                			//var_dump ($row);
                			$newdata["lastyear"]["m3"] = round($row2->m3 - $row1->m3,3);
				}
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
	
			sendtowebsockets("{\"gasmeter\":".json_encode($newdata)."}");
			$casaandata["gasmeter"] = $newdata;
	}
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
                        
                        $newdata["total"]["kwh_used"] = $newdata["total"]["kwh_used1"] + $newdata["total"]["kwh_used2"];
			$newdata["total"]["kwh_provided"] = $newdata["total"]["kwh_provided1"] + $newdata["total"]["kwh_provided2"];

                        // Read values from database
                	if ($result = $mysqli->query("SELECT * FROM `electricitymeter` WHERE timestamp >= CURDATE() ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row = $result->fetch_object();
                		//var_dump ($row);
                		$newdata["today"]["kwh_used1"] = round($newdata["total"]["kwh_used1"] - $row->kwh_used1,3);
                		$newdata["today"]["kwh_used2"]  = round($newdata["total"]["kwh_used2"] - $row->kwh_used2,3);
                		$newdata["today"]["kwh_provided1"] = round($newdata["total"]["kwh_provided1"] - $row->kwh_provided1,3);
                		$newdata["today"]["kwh_provided2"] = round($newdata["total"]["kwh_provided2"] - $row->kwh_provided2,3);
                		$newdata["today"]["kwh_used"] = round($newdata["today"]["kwh_used1"] + $newdata["today"]["kwh_used2"],3);
                		$newdata["today"]["kwh_provided"] = round($newdata["today"]["kwh_provided1"] + $newdata["today"]["kwh_provided2"],3);
                		$newdata["today"]["kwh_total"] = round($newdata["today"]["kwh_used"] - $newdata["today"]["kwh_provided"],3);                		  
			}
			else
			{
                        	echo "error reading electricity values from database ".$mysqli->error."\n"; 
                        }

                        // Calculate values from yesterday
                	if ($result = $mysqli->query("SELECT * FROM `electricitymeter` WHERE timestamp >= CURDATE() - INTERVAL 1 DAY ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row1 = $result->fetch_object();
	                	if ($result = $mysqli->query("SELECT * FROM `electricitymeter` WHERE timestamp >= CURDATE() ORDER BY timestamp ASC LIMIT 1")) 
        	        	{
                			$row2 = $result->fetch_object();
                			//var_dump ($row);
                			$newdata["yesterday"]["kwh_used1"] = round($row2->kwh_used1 - $row1->kwh_used1,3);
	                		$newdata["yesterday"]["kwh_used2"]  = round($row2->kwh_used2 - $row1->kwh_used2,3);
        	        		$newdata["yesterday"]["kwh_provided1"] = round($row2->kwh_provided1 - $row1->kwh_provided1,3);
                			$newdata["yesterday"]["kwh_provided2"] = round($row2->kwh_provided2 - $row1->kwh_provided2,3);
                			$newdata["yesterday"]["kwh_used"] = round($newdata["yesterday"]["kwh_used1"] + $newdata["yesterday"]["kwh_used2"],3);
                			$newdata["yesterday"]["kwh_provided"] = round($newdata["yesterday"]["kwh_provided1"] + $newdata["yesterday"]["kwh_provided2"],3);
	                		$newdata["yesterday"]["kwh_total"] = round($newdata["yesterday"]["kwh_used"] - $newdata["yesterday"]["kwh_provided"],3);                		  
				}
			}
			else
			{
                        	echo "error reading electricity values from database ".$mysqli->error."\n"; 
                        }


                        // Calculate values from this month
                	if ($result = $mysqli->query("SELECT * FROM `electricitymeter` WHERE timestamp >= DATE_FORMAT(NOW() ,'%Y-%m-01') ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row = $result->fetch_object();
                		//var_dump ($row);
                		$newdata["month"]["kwh_used1"] = round($newdata["total"]["kwh_used1"] - $row->kwh_used1,3);
                		$newdata["month"]["kwh_used2"]  = round($newdata["total"]["kwh_used2"] - $row->kwh_used2,3);
                		$newdata["month"]["kwh_provided1"] = round($newdata["total"]["kwh_provided1"] - $row->kwh_provided1,3);
                		$newdata["month"]["kwh_provided2"] = round($newdata["total"]["kwh_provided2"] - $row->kwh_provided2,3);
                		$newdata["month"]["kwh_used"] = round($newdata["month"]["kwh_used1"] + $newdata["month"]["kwh_used2"],3);
                		$newdata["month"]["kwh_provided"] = round($newdata["month"]["kwh_provided1"] + $newdata["month"]["kwh_provided2"],3);
                		$newdata["month"]["kwh_total"] = round($newdata["month"]["kwh_used"] - $newdata["month"]["kwh_provided"],3);                		  
			}
			else
			{
                        	echo "error reading electricity values from database ".$mysqli->error."\n"; 
                        }

                        // Calculate values from previous month
                	if ($result = $mysqli->query("SELECT * FROM `electricitymeter` WHERE timestamp >= DATE_FORMAT(NOW() ,'%Y-%m-01') - INTERVAL 1 MONTH ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row1 = $result->fetch_object();
	                	if ($result = $mysqli->query("SELECT * FROM `electricitymeter` WHERE timestamp >= DATE_FORMAT(NOW() ,'%Y-%m-01') ORDER BY timestamp ASC LIMIT 1")) 
        	        	{
                			$row2 = $result->fetch_object();
                			//var_dump ($row);
                			$newdata["lastmonth"]["kwh_used1"] = round($row2->kwh_used1 - $row1->kwh_used1,3);
	                		$newdata["lastmonth"]["kwh_used2"]  = round($row2->kwh_used2 - $row1->kwh_used2,3);
        	        		$newdata["lastmonth"]["kwh_provided1"] = round($row2->kwh_provided1 - $row1->kwh_provided1,3);
                			$newdata["lastmonth"]["kwh_provided2"] = round($row2->kwh_provided2 - $row1->kwh_provided2,3);
                			$newdata["lastmonth"]["kwh_used"] = round($newdata["lastmonth"]["kwh_used1"] + $newdata["lastmonth"]["kwh_used2"],3);
                			$newdata["lastmonth"]["kwh_provided"] = round($newdata["lastmonth"]["kwh_provided1"] + $newdata["lastmonth"]["kwh_provided2"],3);
	                		$newdata["lastmonth"]["kwh_total"] = round($newdata["lastmonth"]["kwh_used"] - $newdata["lastmonth"]["kwh_provided"],3);                		  
				}
			}
			else
			{
                        	echo "error reading electricity values from database ".$mysqli->error."\n"; 

			}
			
                        // Calculate values from this year
                	if ($result = $mysqli->query("SELECT * FROM `electricitymeter` WHERE timestamp >= DATE_FORMAT(NOW() ,'%Y-01-01') ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row = $result->fetch_object();
                		//var_dump ($row);
                		if (isset($row))
                		{
                			$newdata["year"]["kwh_used1"] = round($newdata["total"]["kwh_used1"] - $row->kwh_used1,3);
                			$newdata["year"]["kwh_used2"]  = round($newdata["total"]["kwh_used2"] - $row->kwh_used2,3);
                			$newdata["year"]["kwh_provided1"] = round($newdata["total"]["kwh_provided1"] - $row->kwh_provided1,3);
                			$newdata["year"]["kwh_provided2"] = round($newdata["total"]["kwh_provided2"] - $row->kwh_provided2,3);
                			$newdata["year"]["kwh_used"] = round($newdata["year"]["kwh_used1"] + $newdata["year"]["kwh_used2"],3);
                			$newdata["year"]["kwh_provided"] = round($newdata["year"]["kwh_provided1"] + $newdata["year"]["kwh_provided2"],3);
                			$newdata["year"]["kwh_total"] = round($newdata["year"]["kwh_used"] - $newdata["year"]["kwh_provided"],3);                		  
				}
			}
			else
			{
                        	echo "error reading electricity values from database ".$mysqli->error."\n"; 
                        }

                        // Calculate values from previous year
                	if ($result = $mysqli->query("SELECT * FROM `electricitymeter` WHERE timestamp >= DATE_FORMAT(NOW() ,'%Y-01-01') - INTERVAL 1 YEAR ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row1 = $result->fetch_object();
	                	if ($result = $mysqli->query("SELECT * FROM `electricitymeter` WHERE timestamp >= DATE_FORMAT(NOW() ,'%Y-01-01') ORDER BY timestamp ASC LIMIT 1")) 
        	        	{
                			$row2 = $result->fetch_object();
                			//var_dump ($row);
                			$newdata["lastyear"]["kwh_used1"] = round($row2->kwh_used1 - $row1->kwh_used1,3);
	                		$newdata["lastyear"]["kwh_used2"]  = round($row2->kwh_used2 - $row1->kwh_used2,3);
        	        		$newdata["lastyear"]["kwh_provided1"] = round($row2->kwh_provided1 - $row1->kwh_provided1,3);
                			$newdata["lastyear"]["kwh_provided2"] = round($row2->kwh_provided2 - $row1->kwh_provided2,3);
                			$newdata["lastyear"]["kwh_used"] = round($newdata["lastyear"]["kwh_used1"] + $newdata["lastyear"]["kwh_used2"],3);
                			$newdata["lastyear"]["kwh_provided"] = round($newdata["lastyear"]["kwh_provided1"] + $newdata["lastyear"]["kwh_provided2"],3);
	                		$newdata["lastyear"]["kwh_total"] = round($newdata["lastyear"]["kwh_used"] - $newdata["lastyear"]["kwh_provided"],3);                		  
				}
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
	sendtowebsockets("{\"electricitymeter\":".json_encode($newdata)."}");
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
                	if ($result = $mysqli->query("SELECT * FROM `watermeter` WHERE timestamp >= CURDATE() ORDER BY timestamp ASC LIMIT 1")) 
                	{
                		$row = $result->fetch_object();
                		//var_dump ($row);
                		$newdata["today"]["m3"] = number_format($newdata["total"]["m3"] - $row->m3,3);
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
	sendtowebsockets("{\"watermeter\":".json_encode($newdata)."}");
}

function updatesunelectricity($newdata)
{
        global $settings;
        global $casaandata;

        $mysqli = mysqli_connect($settings["mysqlserver"],$settings["mysqlusername"],$settings["mysqlpassword"],$settings["mysqldatabase"]);

        if (class_exists("mysqli"))
        {
	        if (!$mysqli->connect_errno)
	        {
	        	$sql = "INSERT INTO `sunelectricity` (pv_watt, pv_1_volt, pv_2_volt, grid_watt, grid_volt, grid_amp, grid_freq, kwh_today, kwh_total) VALUES ('".
                                                $newdata['now']['pv']['watt']."','".
                                                $newdata['now']['pv']['1']['volt']."','".
                                                $newdata['now']['pv']['2']['volt']."','".
                                                $newdata['now']['grid']['watt']."','".
                                                $newdata['now']['grid']['volt']."','".
                                                $newdata['now']['grid']['amp']."','".
                                                $newdata['now']['grid']['frequency']."','".
                                                $newdata['today']['kwh']."','".
                                                $newdata['total']['kwh']."');";
                                                
			echo $sql;
			
			$result = $mysqli->query ($sql);
                        // write values from database
                        if (!$result)
                        {
                                echo "error writing sunelectricty values to database ".$mysqli->error."\n";
                        }
                                                	

			// Read values from database
        	        if ($result = $mysqli->query("SELECT * FROM `sunelectricity` WHERE DATE(timestamp) = CURDATE() - INTERVAL 1 DAY ORDER BY timestamp DESC LIMIT 1")) 
        	        {
	                	$row = $result->fetch_object();
				$newdata['yesterday']['kwh'] = $row->kwh_today;
			}
			else
			{
                	       	echo "error reading sunelectricty values from database ".$mysqli->error."\n"; 
	                }

                	$mysqli->close();
		}
		else
		{
                	echo ("Error while writing water values to database: ".$mysqli->connect_error ."\n");
		}



	}
	
	$casaandata["sunelectricity"] = $newdata;
        sendtowebsockets("{\"sunelectricity\":".json_encode($newdata)."}");
}


function updatezwave($newdata)
{
        global $settings;
        global $casaandata;
	if (isset($newdata)) 
	{
		if (!isset($casaandata["zwave"])) $casaandata["zwave"] = array();
		$zwavereplacedata = array_replace_recursive($casaandata["zwave"], $newdata);
		if (isset($zwavereplacedata))  $casaandata["zwave"] = $zwavereplacedata;
		sendtowebsockets("{\"zwave\":".json_encode($newdata)."}");
	}
}

function updateopentherm($newdata)
{
        echo ("Received new value from opentherm...\n");

        global $settings;
        global $casaandata;
	if (isset($newdata)) 
	{
		if (!isset($casaandata["opentherm"])) $casaandata["opentherm"] = array();
		$zwavereplacedata = array_replace_recursive($casaandata["opentherm"], $newdata);
		if (isset($zwavereplacedata))  $casaandata["opentherm"] = $zwavereplacedata;
		sendtowebsockets("{\"opentherm\":".json_encode($newdata)."}");
	}


        $mysqli = mysqli_connect($settings["mysqlserver"],$settings["mysqlusername"],$settings["mysqlpassword"],$settings["mysqldatabase"]);

        if (class_exists("mysqli"))
        {
                if (!$mysqli->connect_errno)
                {
                        $type = NULL;
                        $value = NULL;
                        if ($value = $newdata["boiler"]["temperature"]) { $type = "boiler_temperature"; $sqlvalue = $value;}
                        if ($value = $newdata["dhw"]["temperature"]) {$type = "dhw_temperature"; $sqlvalue = $value;}
                        if ($value = $newdata["thermostat"]["setpoint"]) {$type = "thermostat_setpoint"; $sqlvalue = $value;}
                        if ($value = $newdata["thermostat"]["temperature"]) {$type = "thermostat_temperature"; $sqlvalue = $value;}
                        if ($value = $newdata["thermostat"]["heating"]["water"]["temperature"]["setpoint"]) {$type = "thermostat_water_setpoint"; $sqlvalue = $value;}
                        if ($value = $newdata["burner"]["modulation"]["level"]) {$type = "burner_modulationlevel"; $sqlvalue = $value;}
                        
                        if ($type != NULL)
                        {
                        	$sql = "INSERT INTO `opentherm` (type, value) VALUES ('".$type."','".$sqlvalue."');";
                        	echo $sql;
                        	if (!$mysqli->query($sql))
                        	{
                                	echo "error writing opentherm value to database ".$mysqli->error."\n";
				}
			}
			$mysqli->close();
		}
	}
}




?>  

