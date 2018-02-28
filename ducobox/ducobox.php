<?php  
// This php program reads data from a ducobox silent (and maybe others)
// 
echo ("Casaan Opentherm Gateway Software...\n"); 

$iniarray = parse_ini_file("/etc/casaan.ini",true);

if (($serialdevice = $iniarray["ducobox"]["serialdevice"]) == "") $serialdevice = "/dev/ttyUSB1";;  
if (($tcpport = $iniarray["ducobox"]["tcpport"]) == "") $tcpport = "58887";


$openthermdata["opentherm"]  = array();

exec ('stty -F '.$serialdevice.'  1:0:18b2:0:3:1c:7f:15:4:5:1:0:11:13:1a:0:12:f:17:16:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0');

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
$sendtimer = 0;
$dataready = 0;
$requesteditem = ""; 
$requestitemid = 0;
$requestednodeid = ""; 
$message=""; 
$ducodata = array();
while(1)
{
 if ($serial->_dState != SERIAL_DEVICE_OPENED)
 {
   echo "Opening Serial Port '".$serialdevice."'...\n";

   // First we must specify the device. This works on both linux and windows (if
   // your linux serial device is /dev/ttyS0 for COM1, etc)
   $serial->deviceSet($serialdevice);

   // We can change the baud rate, parity, length, stop bits, flow control
   $serial->confBaudRate(115200);
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
//    writeserial($serial, "\r\n");
    $sendtimer = 0;
    }
 }

        $readmask = $tcpsockets;
        array_push($readmask, $serial->_dHandle);
        $writemask = NULL;
        $errormask = NULL;
        $nroffd = stream_select($readmask, $writemask, $errormask, 1);

        if ($nroffd == 0)
        {
          if ($sendtimer == 0)
          {
            $sendtimer = 0;
            $requestitemid = 0;
            writeserial ($serial, "fanspeed\r\n");
            $requesteditem = "fanspeed";
            $requestednodeid = 1;
          }
          $sendtimer++;
          // If 30 seconds are past retry...
          if ($sendtimer > 30) $sendtimer = 0;
        }

        foreach ($readmask as $i) 
        {
           if ($i == $serial->_dHandle)
           {
              $message .= str_replace(array("\r", "\n"), "\n", $serial->readPort());  
//              echo $message;
             

              if (strlen($message) > 0)
              {
               while (strpos($message, "\n") !== FALSE)
               {
                 $firstmessage = strtok ($message, "\n");
                 // Remove first message from serial data
                 $message = substr($message, strlen($firstmessage) + 1);
                 echo ("Message='".$firstmessage."'\n");
                 if  (strpos($firstmessage, " -->") !== FALSE)
                 {
                  $senddata["ducobox"][$requestednodeid][$requesteditem] =  substr($firstmessage, 5);
                 }

                 if  (strpos($firstmessage, " FanSpeed: ") !== FALSE)
                 {
                  $senddata["ducobox"][$requestednodeid][$requesteditem] = explode(" ",$firstmessage)[8];
                 }
                 
               }  

                 if (strpos($message, ">") === 0)
                 {
                   $message = substr($message, 2);

                  echo "Ducobox ready for next command.\n";
                  switch ($requestitemid) 
                  {
                   case 0:
                    writeserial ($serial, "nodeparaget 2 73\r\n");
                    $requesteditem = "temperature" ;
                    $requestednodeid = 2;
                   break;
                   case 1:
                    writeserial ($serial, "nodeparaget 2 74\r\n");
                    $requesteditem = "co2";
                    $requestednodeid = 2;
                   break;
                   case 2:
                    writeserial ($serial, "nodeparaget 2 75\r\n");
                    $requesteditem = "rh" ;
                    $requestednodeid = 2;
                   break;
                   case 3:
                    sendToAllTcpSocketClients($tcpsocketClients, json_encode($senddata));
                    echo "Waiting for next query...\n";
                    $sendtimer = -10; // Wait 10 seconds before next query
                   break;
                  }
                  $requestitemid++;
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
                echo (json_encode($ducodata)."\n");
                fwrite($conn, json_encode($ducodata). "\n");
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
                      if (trim($sock_data) == "getducodata") 
                      {
                        echo ("Sending ducodata to tcpsocketclient...\n");
                        echo (json_encode($ducodata)."\n");
                        fwrite($conn, json_encode($ducodata)."\n");
                      }
                      if (trim($sock_data) == '{"ducobox":{"command":"setrpm"}}') 
                      {
                        echo ("Setrpm received...\n");
                      }
                      if (trim($sock_data) == '{"ducobox":{"command":"resetrpm"}}') 
                      {
                        echo ("resetrpm received...\n");
                      }
              }
            }
          }

}

$serial->deviceClose();
exit(1);


function sendToAllTcpSocketClients($sockets, $msg)
{
   echo ("Sending to all clients: ");
   echo ($msg."\n");
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
                  
                  

function floatvalue ($firstmessage)
{
 return round(twobytestosignedfloat(hexdec($firstmessage[5].$firstmessage[6]), hexdec($firstmessage[7].$firstmessage[8])),1);
}

function uintvalue ($firstmessage)
{
 return hexdec($firstmessage[5].$firstmessage[6]) << 8 | hexdec($firstmessage[7].$firstmessage[8]);
}

function intvalue ($firstmessage)
{
 return (hexdec($firstmessage[5].$firstmessage[6]) & 0x127) << 8 | hexdec($firstmessage[7].$firstmessage[8]) * (hexdec($firstmessage[5].$firstmessage[6])&0x128 ? -1 : 1);
}

function writeserial ($serial, $message)
{
 $pos = 0;
 while ($pos < strlen($message))
 {
   $serial->sendMessage($message[$pos], 0);
   echo $message[$pos];
   $pos++;
   usleep(10000);
 }
 
}


?>  

