#!/bin/bash 
# Absolute path to this script, e.g. /home/user/bin/foo.sh
SCRIPT=$(readlink -f "$0")
# Absolute path this script is in, thus /home/user/bin
SCRIPTPATH=$(dirname "$SCRIPT")

sudo kill `ps aux | grep casaanserver.php | awk '{print $2}'`

sudo kill `ps aux | grep smartmeter.php | awk '{print $2}'`
nohup sudo php smartmeter/smartmeter.php $SCRIPTPATH/smartmeter/smartmeter.conf >smartmeter.log 2>&1 &

sudo kill `ps aux | grep watermeter | awk '{print $2}'`
nohup sudo watermeter/watermeter $SCRIPTPATH/watermeter/watermeter.conf >watermeter.log 2>&1 &

sudo kill `ps aux | grep temperature.php | awk '{print $2}'`
nohup sudo php temperature/temperature.php >temperature.log 2>&1 &

sudo kill `ps aux | grep sunelectricity.php | awk '{print $2}'`
nohup sudo php sunelectricity/sunelectricity.php >sunelectricity.log 2>&1 &

nohup php server/casaanserver.php >casaanserver.log 2>&1 &
