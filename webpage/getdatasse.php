<?php

// ------ SETTINGS ------

// These files are send to the clients to update gui

$file = array();

if (isset($_GET['smartmeter']))  array_push ($file, 'smartmeter.json');
if (isset($_GET['watermeter']))  array_push ($file, 'watermeter.json');
if (isset($_GET['sunelectricity']))    array_push ($file, 'sunelectricity.json');
if (isset($_GET['temperature'])) array_push ($file, 'temperature.json');

// -- END OF SETTINGS  --

if (empty($file)) exit(1);

ignore_user_abort(true);
header("Content-Type: text/event-stream; charset=UTF-8");

$id = 0;
$readarray = array();
$timeout = 60;

foreach ($file as $key => $value)
{
      $json_a = json_decode(file_get_contents($value), true);     
      echo ("id: ".$id++."\ndata: " . json_encode($json_a) . "\n\n");
      ob_end_flush();
      flush();

      if (extension_loaded('inotify'))
      {
            $readarray[$key] = inotify_init();
            // add new watch for newly created files
            inotify_add_watch($readarray[$key], $value, IN_CREATE);
            // add new watch for newly created files, using the IN_ADD mask tells inotify_add_watch
            // to append to existing watch and not replace it
            inotify_add_watch($readarray[$key], $value, IN_MODIFY);
            // make inotify non blocking
            stream_set_blocking($readarray[$key], false);
      }
      else $timeout = 10;
}

         $r = array(); 
         $w = array(); 
         $e = array();

         $nroftimeouts = 0;
         $r = $readarray;
         // Wait for file to change
         // send a keep alive (space) every 30 seconds
         // if browser has closed connection exit
         while (1)
         {
            if (stream_select($r, $w, $e, $timeout) > 0)
            {
               foreach($r as $socket)
               {
                  foreach($readarray as $key2 => $fd)
                  {
                     if ($socket == $fd)
                     {
                        stream_get_contents($fd);
                        $json_a = json_decode(file_get_contents($file[$key2]), true);     
                        echo ("id: ".$id++."\ndata: " . json_encode($json_a) . "\n\n");
                     }
                  }
               }
            }
            else 
            {
               if (extension_loaded('inotify')) echo ("id: ". $id++ . "\ndata: {\"keepalive\": {\"currenttime:\":".time()."}}\n\n");
               else
               {
                  sleep(10); // When inotify is not installed do update every 10 seconds
                  foreach ($file as $key => $value)
                  {
                     $json_a = json_decode(file_get_contents($value), true);     
                     echo ("id: ".$id++."\ndata: " . json_encode($json_a) . "\n\n");
                     ob_end_flush();
                     flush();
                  }
               }
            }
            ob_end_flush();
            flush();
            $r = $readarray; 
            $w = array(); 
            $e = array();
            if(connection_aborted()) break;
         }
         
         // clean up
         foreach($r as $socket)
         {
               inotify_rm_watch($socket);
               fclose($socket);
         }
?>
