<?php
$file = 'smartmeter.json';



if (empty($_GET['now'])) {

// init inotify
$fd = inotify_init();

// add new watch for newly created files
$watch_descriptor = inotify_add_watch($fd, $file, IN_CREATE);
// add new watch for newly created files, using the IN_ADD mask tells inotify_add_watch
// to append to existing watch and not replace it
$watch_descriptor = inotify_add_watch($fd, $file, IN_ADD | IN_MODIFY);

// wait for file update
$events = inotify_read($fd);

// clean up
inotify_rm_watch($fd, $watch_descriptor);

fclose($fd);
}

echo file_get_contents($file);

?>
