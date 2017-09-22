#!/bin/bash 
# Absolute path to this script, e.g. /home/user/bin/foo.sh
SCRIPT=$(readlink -f "$0")
# Absolute path this script is in, thus /home/user/bin
SCRIPTPATH=$(dirname "$SCRIPT")
cd $SCRIPTPATH

sudo kill `ps aux | grep casaanserver.php | awk '{print $2}'`

sudo kill `ps aux | grep smartmeter.php | awk '{print $2}'`
nohup sudo php $SCRIPTPATH/smartmeter/smartmeter.php $SCRIPTPATH/smartmeter/smartmeter.conf >smartmeter.log 2>&1 &

sudo kill `ps aux | grep watermeter | awk '{print $2}'`
nohup sudo $SCRIPTPATH/watermeter/watermeter $SCRIPTPATH/watermeter/watermeter.conf >watermeter.log 2>&1 &

sudo kill `ps aux | grep temperature.php | awk '{print $2}'`
nohup sudo php $SCRIPTPATH/temperature/temperature.php >temperature.log 2>&1 &

sudo kill `ps aux | grep sunelectricity.php | awk '{print $2}'`
nohup sudo php $SCRIPTPATH/sunelectricity/sunelectricity.php >sunelectricity.log 2>&1 &

sudo kill `ps aux | grep casaanzwave | awk '{print $2}'`
nohup sudo $SCRIPTPATH/zwave/casaanzwave  >zwave.log 2>&1 &

nohup php $SCRIPTPATH/server/casaanserver.php >casaanserver.log 2>&1 &
