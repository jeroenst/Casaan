<?php  
// This php program reads data from a growatt inverter
// 
// Thanks to Lennart Kuhlmeier for providing PVOUT_GROWATT.PY on http://www.sisand.dk/?page_id=139 
//
echo ("Casaan Opentherm Gateway Software...\n"); 

$iniarray = parse_ini_file("/etc/casaan.ini",true);

if (($serialdevice = $iniarray["opentherm"]["serialdevice"]) == "") $serialdevice = "/dev/ttyUSB0";;  
if (($tcpport = $iniarray["opentherm"]["tcpport"]) == "") $tcpport = "58886";


$openthermdata["opentherm"]  = array();

exec ('stty -F '.$serialdevice.'  1:0:8bd:0:3:1c:7f:15:4:5:1:0:11:13:1a:0:12:f:17:16:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0');

include("PhpSerial.php");
$serial = new PhpSerial;



// Initialize tcpsocket
while (!$tcpsocket = stream_socket_server("tcp://0.0.0.0:".$tcpport, $errno, $errstr)) 
{
    echo "$errstr ($errno)\n";
    sleep(5);
}
echo "TCP Server listening on port ".$tcpport."\n";
 
$tcpsockets = array();
$tcpsocketClients = array();
array_push($tcpsockets, $tcpsocket);

date_default_timezone_set ("Europe/Amsterdam");


// First we must specify the device. This works on both linux and windows (if
// your linux serial device is /dev/ttyS0 for COM1, etc)
$buienradartime = time();
$timeout = 0;
$sendtimer = 0;
$dataready = 0;
$message=""; 
while(1)
{
 if ($serial->_dState != SERIAL_DEVICE_OPENED)
 {
   echo "Opening Serial Port '".$serialdevice."'...\n";

   // First we must specify the device. This works on both linux and windows (if
   // your linux serial device is /dev/ttyS0 for COM1, etc)
   $serial->deviceSet($serialdevice);

   // We can change the baud rate, parity, length, stop bits, flow control
   $serial->confBaudRate(9600);
   $serial->confParity("none");
   $serial->confCharacterLength(8);
   $serial->confStopBits(1);
   $serial->confFlowControl("none");
   
   if (!$serial->deviceOpen())
   {
     echo ("Serial Port could not be opened...\n");
   }
   else
   {
    echo "Opened Serial Port.\n";
    $serial->sendMessage("\r\nAA=28\r\n"); 
    }
 }

        $readmask = $tcpsockets;
        array_push($readmask, $serial->_dHandle);
        $writemask = NULL;
        $errormask = NULL;
        $nroffd = stream_select($readmask, $writemask, $errormask, $timeout);
        $timeout = 0;
        foreach ($readmask as $i) 
        {
            if ($i == $serial->_dHandle)
           {
 
              $message .= $serial->readPort();
              
              if (strlen($message) > 0) 
              {
               while (strpos($message, "\r\n") !== FALSE)
               { 
                // Filter first message from serial data
                $messages = explode("\r\n", $message);
                $firstmessage = $messages[0];
                // Remove first message from serial data
                $message = substr($message, strlen($firstmessage) + 2);
                echo ("Message='".$firstmessage."'\n");
                
                $data = array();
                
                
                                
                // Check for messsage from boiler
                if ($firstmessage[0] == "B")
                {
                $floatvalue = round(twobytestosignedfloat(hexdec($firstmessage[5].$firstmessage[6]), hexdec($firstmessage[7].$firstmessage[8])),1);
                $uintvalue = hexdec($firstmessage[5].$firstmessage[6]) << 8 | hexdec($firstmessage[7].$firstmessage[8]);
                $intvalue = (hexdec($firstmessage[5].$firstmessage[6]) & 0x127) << 8 | hexdec($firstmessage[7].$firstmessage[8]) * (hexdec($firstmessage[5].$firstmessage[6])&0x128 ? -1 : 1);
                 switch (hexdec($firstmessage[3].$firstmessage[4]))
                 {
                   case 14: $data["opentherm"]["burner"]["modulation"]["maxlevel"] = $floatvalue;
                   break;
                   case 17: $data["opentherm"]["burner"]["modulation"]["level"] = $floatvalue;
                   break;
                   case 116: $data["opentherm"]["burner"]["starts"] = $uintvalue;
                   break;
                   case 120: $data["opentherm"]["burner"]["hours"] = $uintvalue;
                   break;
                   case 19: $data["opentherm"]["dhw"]["flowrate"]=$floatvalue;
                   break;
                   case 26: $data["opentherm"]["dhw"]["temperature"]=$floatvalue;
                   break;
                   case 118: $data["opentherm"]["dhw"]["pump"]["starts"]=$uintvalue;
                   break;
                   case 122: $data["opentherm"]["dhw"]["pump"]["hours"]=$uintvalue;
                   break;
                   case 119: $data["opentherm"]["dhw"]["burner"]["starts"]=$uintvalue;
                   break;
                   case 123: $data["opentherm"]["dhw"]["burner"]["hours"]=$uintvalue;
                   break;
                   
                   case 25: $data["opentherm"]["boiler"]["temperature"]=$floatvalue;
                   break;
                   case 18: $data["opentherm"]["ch"]["water"]["pressure"]=$floatvalue;
                   break; 
                   case 117: $data["opentherm"]["ch"]["pump"]["starts"]=$uintvalue;
                   break; 
                   case 121: $data["opentherm"]["ch"]["pump"]["hours"]=$uintvalue;
                   break; 
                   case 19: $data["opentherm"]["dhw"]["flowrate"]=$floatvalue;
                   break; 
                   case 56: $data["opentherm"]["dhw"]["setpoint"]=$floatvalue;
                   break; 
                   case 57: $data["opentherm"]["ch"]["water"]["maxsetpoint"]=$floatvalue;
                   break; 
                   case 28: $data["opentherm"]["ch"]["water"]["returntemperature"]=$floatvalue;
                   break;
                   case 27: $data["opentherm"]["outside"]["temperature"] = $floatvalue;
                   break;
                   case 33: $data["opentherm"]["exhausttemperature"] = $intvalue;
                   break;
                 }
                }
  
                // Check for message from Thermostat              
                if ($firstmessage[0] == "T")
                {
                 if (0 === strpos($firstmessage, 'TT: ')) 
                 {
                   $data["opentherm"]["thermostat"]["setpoint"] = substr($firstmessage, 4);
                 }
                 else
                 {
                  $floatvalue = round(twobytestosignedfloat(hexdec($firstmessage[5].$firstmessage[6]), hexdec($firstmessage[7].$firstmessage[8])),1);
                  switch (hexdec($firstmessage[3].$firstmessage[4]))
                  {
                   case 1: $data["opentherm"]["thermostat"]["ch"]["water"]["setpoint"] = $floatvalue;
                   break;
                   case 16: $data["opentherm"]["thermostat"]["setpoint"] = $floatvalue;
                   break;
                   case 24: $data["opentherm"]["thermostat"]["temperature"] = $floatvalue;
                   break;
                  }
                 }
                }

                // Only update clients when data has changed
                $data2 = array_replace_recursive ($openthermdata, $data);
                if (serialize($data2) != serialize($openthermdata)) sendToAllTcpSocketClients($tcpsocketClients, json_encode($data)."\n");
                $openthermdata = array_replace_recursive ($openthermdata, $data);
               }
              }
            }
            else if ($i === $tcpsocket) 
            {
                $conn = stream_socket_accept($tcpsocket);
                echo ("### New tcpsocket client connected! ###\n");
                array_push($tcpsockets, $conn);
                array_push($tcpsocketClients, $conn);
                echo ("Sending to client: ");
                echo (json_encode($openthermdata)."\n");
                fwrite($conn, json_encode($openthermdata). "\n");
            }
            else
            {
                $sock_data = fread($i, 1024);
                if (strlen($sock_data) === 0) { // connection closed
                    $key_to_del = array_search($i, $tcpsocketClients, TRUE);
                    unset($tcpsocketClients[$key_to_del]);
                    $key_to_del = array_search($i, $tcpsockets, TRUE);
                    unset($tcpsockets[$key_to_del]);
                } else if ($sock_data === FALSE) {
                    echo "Something bad happened";
                    fclose($i);
                    $key_to_del = array_search($i, $tcpsocketClients, TRUE);
                    unset($tcpsocketClients[$key_to_del]);
                    $key_to_del = array_search($i, $tcpsockets, TRUE);
                    unset($tcpsockets[$key_to_del]);
                } else {
                      echo ("Received from tcpsocket client: [" . $sock_data . "]\n");
                      if (trim($sock_data) == "getopenthermdata") 
                      {
                        echo ("Sending openthermdata to tcpsocketclient...\n");
                        echo (json_encode($openthermdata)."\n");
                        fwrite($conn, json_encode($openthermdata)."\n");
                      }
                      if (trim($sock_data) == '{"opentherm":{"command":"tempup"}}') 
                      {
                        echo ("Tempup received...\n");
                        $serial->sendMessage("\r\nTT=".($openthermdata["opentherm"]["thermostat"]["setpoint"] + 0.5)."\r\n");
                        
                      }
                      if (trim($sock_data) == '{"opentherm":{"command":"tempdown"}}') 
                      {
                        echo ("Tempdown received...\n");
                        $serial->sendMessage("\r\nTT=".($openthermdata["opentherm"]["thermostat"]["setpoint"] - 0.5)."\r\n");
                        
                      }
              }
            }
          }

          if ($nroffd == 0)
          { 
              if ($buienradartime <= time())
              {
               $url = "http://xml.buienradar.nl";
               $xml = simplexml_load_file($url);
               foreach($xml->weergegevens->actueel_weer->weerstations->weerstation as $weer)
               {
                  if ($weer->stationcode == "6370")
                  {
                    //$data["opentherm"]["outside"]["temperature"] = (string)$weer->temperatuurGC;
                    echo ("Buienradar outsidetemp=".(string)$weer->temperatuurGC."\n");
                    //$msg = array();
                    //$msg["opentherm"]["outside"]["temperature"] = $data["opentherm"]["outside"]["temperature"];
                    //sendToAllTcpSocketClients($tcpsocketClients, json_encode($msg)."\n\n");
                    $serial->sendMessage("OT=".(string)$weer->temperatuurGC."\r\n"); 
                    break;
                  } 
               }
               $buienradartime = time() + 600; // Next update in 10 minutes
              }
           }
           
}

$serial->deviceClose();
exit(1);


function sendToAllTcpSocketClients($sockets, $msg)
{
   echo ("Sending to all clients: ");
   echo ($msg);
   foreach ($sockets as $conn) 
   {
     fwrite($conn, $msg);
   }
}


function twobytestosignedfloat($decimal, $fractional)
{
  return (($decimal & 127)  +
    (($fractional&128) ? 1/2 : 0) +
      (($fractional&64) ? 1/4 : 0) +
        (($fractional&32) ? 1/8 : 0) +
          (($fractional&16) ? 1/16 : 0) +
            (($fractional&8) ? 1/32 : 0) +
              (($fractional&4) ? 1/64 : 0) +
                (($fractional&2) ? 1/128 : 0) +
                  (($fractional&1) ? 1/265 : 0)) * (($decimal & 128) ? -1 : 1);
                  }
                  
                  

?>  

