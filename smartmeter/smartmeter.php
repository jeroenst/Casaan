#!/usr/bin/php
<?php  


$data = json_decode ('
{
			"electricitymeter": {
				"now":
				{
					"kw_using": null,
					"kw_providing": null
				},
				"total":
				{
					"kwh_used1": null,
					"kwh_used2": null,
					"kwh_provided1": null,
					"kwh_provided2": null
				}
			},
			"gasmeter":
			{
				"total":
				{
					"m3": null
				}
			}
		
}
', true);

include "php_serial.class.php";  
date_default_timezone_set ("Europe/Amsterdam");

$settings = array(	"device" => "/dev/ttyUSB1", "port" => "58881");
if ($argc > 1) 
{
	$settingsfile = parse_ini_file($argv[1]);
	$settings = array_merge($settings, $settingsfile);
}

// Initialize websocket
$tcpsocket = stream_socket_server("tcp://0.0.0.0:".$settings["port"], $errno, $errstr);
if (!$tcpsocket) {
	echo "$errstr ($errno}\n";
	exit(1);
}

$tcpsocketClients = array();
array_push($tcpsocketClients, $tcpsocket);


echo "Setting Serial Port Device ".$settings["device"]."...\n"; 


// Let's start the class
$serial = new phpSerial;
$serialready=0;
$receivedpacket="";
if ( $serial->deviceSet($settings["device"]))
{
	echo "Configuring Serial Port...\n";
	// We can change the baud rate, parity, length, stop bits, flow control
	echo "Baudrate... ";
	$serial->confBaudRate(115200);
	echo "Parity... ";
	$serial->confParity("none");
	echo "Bits... ";
	$serial->confCharacterLength(8);
	echo "Stopbits... ";
	$serial->confStopBits(1);
	echo "Flowcontrol... ";
	$serial->confFlowControl("none");
	echo "Done...\n";

	echo "Opening Serial Port...\n";
	// Then we need to open it
	if (!$serial->deviceOpen()) exit (1);
	else echo "Serial Port opened...\n"; 
} else exit(2);



//$Mysql_con = mysql_connect("nas","domotica","b-2020");

// First we must specify the device. This works on both linux and windows (if
// your linux serial device is /dev/ttyS0 for COM1, etc)
while(1)
{
	$readmask = $tcpsocketClients;
	$writemask = NULL;
	$errormask = NULL;
	$mod_fd = stream_select($readmask, $writemask, $errormask, 1);
	foreach ($readmask as $i) 
	{
		if ($i === $tcpsocket) 
		{
			$conn = stream_socket_accept($tcpsocket);
			echo ("\nNew tcpsocket client connected!\n\n");
			array_push($tcpsocketClients, $conn);
			echo ("Sending data to tcp client\n");
			fwrite($conn, json_encode($data));
		}
		else
		{
			$sock_data = fread($i, 1024);
			if (strlen($sock_data) === 0) { // connection closed
				$key_to_del = array_search($i, $tcpsocketClients, TRUE);
				unset($tcpsocketClients[$key_to_del]);
			} else if ($sock_data === FALSE) {
				echo "Something bad happened";
				fclose($i);
				$key_to_del = array_search($i, $tcpsocketClients, TRUE);
				unset($tcpsocketClients[$key_to_del]);
			} else {
				echo ("Received from tcpsocket client: [" . $sock_data . "]\n");
				if (trim($sock_data) == "getsmartmeterdata") 
				{
					echo ("Sending smartmeterdata to tcpsocketclient...\n");
					fwrite($conn, json_encode($data));
				}
			}
		}
	}

	try
	{
		// read from serial port
		$packetcomplete = false;
		$read = $serial->readPort();
		$receivedpacket = $receivedpacket . $read;   
		if ($read) echo "Received from serial port: ".$read; 
		if (strlen ($read) == 0 && strpos($receivedpacket, '!') && strpos($receivedpacket, 'KFM5'))
		{
			foreach(preg_split("/((\r?\n)|(\r\n?))/", $receivedpacket) as $line)
			{
				if (strlen($line) > 0)
				{
					preg_match("'\((.*)\)'si", $line, $value);
					preg_match("'(.*?)\('si", $line, $label);
					if (isset($label[1]) && isset($value[1]))
					{
						echo ("label=".$label[1]." value=".$value[1]."\n"); 
						if($label[1] == "1-0:1.7.0") $data['electricitymeter']['now']['kw_using'] = extractvalue($value[1]);
						if($label[1] == "1-0:2.7.0") $data['electricitymeter']['now']['kw_providing'] = extractvalue($value[1]);
						if($label[1] == "1-0:1.8.1") $data['electricitymeter']['total']['kwh_used1'] = extractvalue($value[1]);
						if($label[1] == "1-0:1.8.2") $data['electricitymeter']['total']['kwh_used2'] = extractvalue($value[1]);
						if($label[1] == "1-0:2.8.1") $data['electricitymeter']['total']['kwh_provided1'] = extractvalue($value[1]);
						if($label[1] == "1-0:2.8.2") $data['electricitymeter']['total']['kwh_provided2'] = extractvalue($value[1]);
						if($label[1] == "0-1:24.2.1") 
						{
							preg_match("'\((.*)\*'si", $value[1], $valuegas);
							$data['gasmeter']['total']['m3'] = extractvalue($valuegas[1]);
							
							preg_match("'(..)(..)(..)(..)(..)(..)S\)'", $value[1], $gasdatetime);
							$data['gasmeter']['updatedatetime'] = '20' . $gasdatetime[1] . '-' . $gasdatetime[2] . '-' . $gasdatetime[3] . ' ' . $gasdatetime[4] . ':' . $gasdatetime[5] . ':' . $gasdatetime[6];    
						}
					}
				}
			}
			echo "Received Data (".date('Y/m/d H:i:s').")". 
				": gas_used=".$data['gasmeter']['total']['m3'].
				": gas_datetime=".$data['gasmeter']['updatedatetime'].
				", kwh_used1=".$data['electricitymeter']['total']['kwh_used1'].
				", kwh_used2=".$data['electricitymeter']['total']['kwh_used2'].
				", kwh_provided1=".$data['electricitymeter']['total']['kwh_provided1'].
				", kwh_provided2=".$data['electricitymeter']['total']['kwh_provided2'].
				", kw_using=".$data['electricitymeter']['now']['kw_using'].
				", kw_providing=".$data['electricitymeter']['now']['kw_providing']."\n";

			$receivedpacket = ""; 
			sendToAllTcpsocketClients($tcpsocketClients,  $tcpsocket, json_encode($data)."\n\n");
		}
	}
	catch (Exception $e)
	{
		echo "Error thrown, restarting program\n";
	}
	sleep(1);
}

// If you want to change the configuration, the device must be closed
$serial->deviceClose();
exit(1);

function extractvalue($string)
{
	$tmp = ltrim(preg_replace( '/[^\d\.]/', '',  $string ), '0');;
	if ($tmp[0] == ".") $tmp = '0' + $tmp;
	return $tmp; 
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

function sendToAllTcpSocketClients($sockets, $ignoresocket, $msg)
{
	echo ("Sending smartmeterdata to all websocketclient...\n");
	foreach ($sockets as $conn) 
	{
		if ($conn != $ignoresocket) fwrite($conn, $msg);
	}
}


?>  
