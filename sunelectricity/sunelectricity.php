!/usr/bin/php
<?php  
// This php program reads data from a growatt inverter
// 
// Thanks to Lennart Kuhlmeier for providing PVOUT_GROWATT.PY on http://www.sisand.dk/?page_id=139 
//

$serialdevice = '/dev/ttyUSB0';

$data = json_decode ('
{
			"sunelectricity": {
				"now":
				{
					"pv":
					{
					  "watt": null,
					  "volt": null,
					  "amp": null
					},
					"grid":
					{
					  "watt": null,
					  "frequency": null,
					  "volt": null,
					  "amp": null
					}
				},
				"today":
				{
					"kwh": null
				},
				"total":
				{
					"kwh": null
				}
			}
}
');

include("PhpSerial.php");
$serial = new PhpSerial;


// Initialize tcpsocket
while (!$tcpsocket = stream_socket_server("tcp://0.0.0.0:58883", $errno, $errstr)) 
{
    echo "$errstr ($errno)\n";
    sleep(1);
}

$tcpsockets = array();
$tcpsocketClients = array();
array_push($tcpsockets, $tcpsocket);

date_default_timezone_set ("Europe/Amsterdam");
// First we must specify the device. This works on both linux and windows (if
// your linux serial device is /dev/ttyS0 for COM1, etc)
$serial->deviceSet($serialdevice);

// We can change the baud rate, parity, length, stop bits, flow control
$serial->confBaudRate(9600);
$serial->confParity("none");
$serial->confCharacterLength(8);
$serial->confStopBits(1);
$serial->confFlowControl("none");


// First we must specify the device. This works on both linux and windows (if
// your linux serial device is /dev/ttyS0 for COM1, etc)
while(1)
{
        $readmask = $tcpsockets;
        $writemask = NULL;
        $errormask = NULL;
        $mod_fd = stream_select($readmask, $writemask, $errormask, 1);
        foreach ($readmask as $i) 
        {
            if ($i === $tcpsocket) 
            {
                $conn = stream_socket_accept($tcpsocket);
                echo ("\nNew tcpsocket client connected!\n\n");
                array_push($tcpsockets, $conn);
                array_push($tcpsocketClients, $conn);
                echo ("Sending data to tcp client\n");
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
                      if (trim($sock_data) == "getsunelectricitydata") 
                      {
                        echo ("Sending smartmeterdata to tcpsocketclient...\n");
                        fwrite($conn, json_encode($data)."\n\n");
                      }
              }
            }
          }


          echo "Opening SerialModbus Port...\n";

  if ($serial->deviceOpen())
  {
    
    echo ("Serial Port is open...\n");
    $bExterTxBuffer = sprintf ("%c%c%c%c%c%c",  0x3F, 0x23, 1, 0x32, 0x41, 0);
    $wStringSum = 0;
    for($i=0;$i<strlen($bExterTxBuffer);$i++)
    {
      $wStringSum += (ord($bExterTxBuffer[$i]) ^ $i);
      
      if($wStringSum==0||$wStringSum>0xFFFF)$wStringSum = 0xFFFF;
    }

    $bExterTxBuffer .= sprintf ("%c%c", $wStringSum >> 8, $wStringSum & 0xFF);
    
    echo bin2hex($bExterTxBuffer)."\n" ;

    $serial->sendMessage($bExterTxBuffer,1);

    $message = $serial->readPort();
    echo ("Received: ".bin2hex($message)."\n");
    
    echo ("PV Volt1 = ".((ord($message[7]) << 8)| $message[8])/10 . "\n");
    echo ("PV Volt2 = ".((ord($message[9]) << 8)| $message[10])/10 . "\n");
    echo ("PV Watt = ".((ord($message[11]) << 8)| $message[12])/10 . "\n");
    echo ("AC Volt = ".((ord($message[13]) << 8)| $message[14])/10 . "\n");
    echo ("AC Amp = ".((ord($message[15]) << 8)| $message[16]) / 10 . "\n");
    echo ("AC Freq = ".((ord($message[17]) << 8)| $message[18])/100 . "\n");
    echo ("AC Watt = ".((ord($message[19]) << 8)| $message[20])/10 . "\n");
    
/*    // Read pv watts
    $value=$modbus->sendQuery(1,4,"3002",1);
    if ($value != 0) 
    {
    if ($value != 0) $value = hexdec($value)[0]/10; else $value = null;
    $data["sunelectricity"]["now"]["pv"]["watt"]=$value;

    // Read pv volt
    $value=$modbus->sendQuery(1,4,"3003",1);
    if ($value != 0) $value = hexdec($value)[0]/10; else $value = null;
    $data["sunelectricity"]["now"]["pv"]["volt"]=$value;

    // Read pv amps
    $value=$modbus->sendQuery(1,4,"3004",1);
    if ($value != 0) $value = hexdec($value)[0]/10; else $value = null;
    $data["sunelectricity"]["now"]["pv"]["amp"]=$value;

    // Read output watts
    $value=$modbus->sendQuery(1,4,"300C",1);
    if ($value != 0) $value = hexdec($value)[0]/10; else $value = null;
    $data["sunelectricity"]["now"]["out"]["watt"]=$value;

    // Read output frequency
    $value=$modbus->sendQuery(1,4,"300D",1);
    if ($value != 0) $value = hexdec($value)[0]/100; else $value = null;
    $data["sunelectricity"]["now"]["out"]["frequency"]=$value;

    // Read output voltage
    $value=$modbus->sendQuery(1,4,"300E",1);
    if ($value != 0) $value = hexdec($value)[0]/10; else $value = null;
    $data["sunelectricity"]["now"]["out"]["volt"]=$value;

    // Read kwh provided today
    $value=$modbus->sendQuery(1,4,"301B",1);
    if ($value != 0) $value = hexdec($value)[0]/10; else $value = null;
    $data["sunelectricity"]["today"]["kwh"]=$value;

    // Read kwh provided total
    $value=$modbus->sendQuery(1,4,"301D",1);
    if ($value != 0) $value = hexdec($value)[0]/10; else $value = null;
    $data["sunelectricity"]["total"]["kwh"]=$value;

    echo (json_encode($data)."\n\n");
    
    sendToAllTcpSocketClients($tcpsocketClients, json_encode($data)."\n\n");
*/
/*# The basic stuff is read not all is used but just added for later use
rr = client.read_input_registers(2,1) #Watts delivered by panels (DC side)
value=rr.registers
pv_watts=float(value[0])/10
rr = client.read_input_registers(3,1) # Volts on DC side
value=rr.registers
pv_volts=float(value[0])/10
rr = client.read_input_registers(4,1) # Amps on DC side??? Not sure.
value=rr.registers
pv_amps=float(value[0])/10
rr = client.read_input_registers(12,1) #watts delivered by inverter to net
value=rr.registers
out_watts=float(value[0])/10
rr = client.read_input_registers(13,1) # frequenzy of AC
value=rr.registers
ac_hz=float(value[0])/100
rr = client.read_input_registers(14,1) # volts on AC side delivered by inverter
value=rr.registers
ac_volts=float(value[0])/10
rr = client.read_input_registers(27,1) # Total energy production today
value=rr.registers
Wh_today=float(value[0])*100
rr = client.read_input_registers(29,1) # Total energy production in inervter storage
value=rr.registers
Wh_total=float(value[0])*100
*/

  }
  else echo ("Connection to growwatt inverter failed!\n");
  sleep(5);
}

}
// If you want to change the configuration, the device must be closed
$serial->deviceClose();
exit(1);


function sendToAllTcpSocketClients($sockets, $msg)
{
   echo ("Sending smartmeterdata to all websocketclient...\n");
   foreach ($sockets as $conn) 
   {
     fwrite($conn, $msg);
   }
}


?>  
