#!/usr/bin/php
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
					"out":
					{
					  "watt": null,
					  "frequency": null,
					  "volt": null
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

include("PhpSerialModbus/PhpSerialModbus.php");
$modbus = new PhpSerialModbus;


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
// Then we need to open it
  if (!$modbus->deviceOpened())
  {
    $modbus->deviceInit($serialdevice,9600,'none',8,1,'none');
    $modbus->deviceOpen();
  }

  if ($modbus->deviceOpened())
  {
    // Read pv watts
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

  $mysqli = mysqli_connect('localhost', 'casaan', 'casaan', 'casaan');

  if (!$mysqli->connect_errno) {
    $sql = "INSERT INTO `sunelectricity` (pv_watt, pv_volt, pv_amp, out_watt, out_frequency, out_volt,kwh_today,kwh_total)
        VALUES ( ".
                 $data['sunelectricity']['now']['pv']['watt'].",".
                 $data['sunelectricity']['now']['pv']['volt'].",".
                 $data['sunelectricity']['now']['pv']['amp'].",".
                 $data['sunelectricity']['now']['out']['watt'].",".
                 $data['sunelectricity']['now']['out']['frequency'].",".
                 $data['sunelectricity']['now']['out']['volt'].",".
                 $data['sunelectricity']['today']['kwh'].",".
                 $data['sunelectricity']['total']['kwh'].")";
    if (!$result = $mysqli->query($sql)) echo ("Error writing values to database!\n");
    $mysqli->close();
  }
  }
  else echo ("Connection to growwatt inverter failed!\n");
  sleep(5);
}

}
mysql_close($Mysql_con);

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
