#!/bin/bash 
# Absolute path to this script, e.g. /home/user/bin/foo.sh
SCRIPT=$(readlink -f "$0")
# Absolute path this script is in, thus /home/user/bin
SCRIPTPATH=$(dirname "$SCRIPT")

sudo kill `ps aux | grep casaanserver.php | awk '{print $2}'`

sudo kill `ps aux | grep smartmeter.php | awk '{print $2}'`

sudo kill `ps aux | grep watermeter | awk '{print $2}'`

sudo kill `ps aux | grep temperature.php | awk '{print $2}'`

sudo kill `ps aux | grep sunelectricity.php | awk '{print $2}'`
