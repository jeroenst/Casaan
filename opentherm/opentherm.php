<?php  
// This php program reads data from a growatt inverter
// 
// Thanks to Lennart Kuhlmeier for providing PVOUT_GROWATT.PY on http://www.sisand.dk/?page_id=139 
//
echo ("Casaan Opentherm Gateway Software...\n"); 

$iniarray = parse_ini_file("../casaan.ini",true);

if (($serialdevice = $iniarray["opentherm"]["serialdevice"]) == "") $serialdevice = "/dev/ttyUSB0";;  
if (($tcpport = $iniarray["opentherm"]["tcpport"]) == "") $tcpport = "58886";


$data["opentherm"]  = array();
$data["opentherm"]["room"]["temperature"]=0;
$data["opentherm"]["room"]["setpoint"]=0;
$data["opentherm"]["tapwater"]["temperature"]=0;
$data["opentherm"]["tapwater"]["setpoint"]=0;
$data["opentherm"]["tapwater"]["status"]=0;  
$data["opentherm"]["boiler"]["temperature"]=0;
$data["opentherm"]["outside"]["temperature"]=0;
$data["opentherm"]["heating"]["water"]["pressure"]=0;
$data["opentherm"]["heating"]["water"]["temperaturereturn"]=0;
$data["opentherm"]["heating"]["water"]["setpointmax"]=0;
$data["opentherm"]["heating"]["status"]=0; 
$data["opentherm"]["burner"]["modulation"]["level"]=0;
$data["opentherm"]["burner"]["modulation"]["levelmax"]=0;
$data["opentherm"]["burner"]["status"]=0;

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
   }
 }

        $readmask = $tcpsockets;
        $writemask = NULL;
        $errormask = NULL;
        $nroffd = stream_select($readmask, $writemask, $errormask, $timeout);
        $timeout = 1;
        foreach ($readmask as $i) 
        {
            if ($i === $tcpsocket) 
            {
                $conn = stream_socket_accept($tcpsocket);
                echo ("\nNew tcpsocket client connected!\n\n");
                array_push($tcpsockets, $conn);
                array_push($tcpsocketClients, $conn);
                echo ("Sending data to tcp client\n");
                echo (json_encode($data)."\n\n");
                fwrite($conn, json_encode($data). "\n\n");
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
                        echo (json_encode($data)."\n\n");
                        fwrite($conn, json_encode($data)."\n\n");
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
                    $data["opentherm"]["outside"]["temperature"] = (string)$weer->temperatuurGC;
                    echo ("Buienradar outsidetemp=".$data["opentherm"]["outside"]["temperature"]."\n");
                    $msg["opentherm"]["outside"]["temperature"] = $data["opentherm"]["outside"]["temperature"];
                    sendToAllTcpSocketClients($tcpsocketClients, json_encode($msg)."\n\n");
                    break;
                  } 
               }
               $buienradartime = time() + 600; // Next update in 10 minutes
              }
 
              $message .= $serial->readPort();
              
              if (strlen($message) > 0) 
              {
               echo ("Received: '".bin2hex($message)."'\n");
    
                $data["opentherm"]["room"]["temperature"]=0;
                $data["opentherm"]["room"]["setpoint"]=0;
                $data["opentherm"]["tapwater"]["temperature"]=0;
                $data["opentherm"]["tapwater"]["setpoint"]=0;
                $data["opentherm"]["tapwater"]["status"]=0;  
                $data["opentherm"]["boiler"]["temperature"]=0;
                $data["opentherm"]["outside"]["temperature"]=0;
                $data["opentherm"]["heating"]["water"]["pressure"]=0;
                $data["opentherm"]["heating"]["water"]["temperaturereturn"]=0;
                $data["opentherm"]["heating"]["water"]["setpointmax"]=0;
                $data["opentherm"]["heating"]["status"]=0; 
                $data["opentherm"]["burner"]["modulation"]["level"]=0;
                $data["opentherm"]["burner"]["modulation"]["levelmax"]=0;
                $data["opentherm"]["burner"]["status"]=0;
                 
                echo (json_encode($data)."\n\n");
                sendToAllTcpSocketClients($tcpsocketClients, json_encode($data)."\n\n");
                $message = ""; 
               }
            }
}

$serial->deviceClose();
exit(1);


function sendToAllTcpSocketClients($sockets, $msg)
{
   echo ("Sending openthermdata to all websocketclient...\n");
   echo ($msg."\n\n");
   foreach ($sockets as $conn) 
   {
     fwrite($conn, $msg);
   }
}


?>  
