kill `ps aux | grep casaanserver.php | awk '{print $2}'`

sudo kill `ps aux | grep smartmeter.php | awk '{print $2}'`
nohup sudo php smartmeter/smartmeter.php >smartmeter.log 2>&1 &

sudo kill `ps aux | grep watermeter | awk '{print $2}'`
nohup sudo watermeter/watermeter >watermeter.log 2>&1 &

sudo kill `ps aux | grep temperature.php | awk '{print $2}'`
nohup sudo php temperature/temperature.php >temperature.log 2>&1 &

sudo kill `ps aux | grep sunelectricity.php | awk '{print $2}'`
nohup sudo php sunelectricity/sunelectricity.php >sunelectricity.log 2>&1 &

nohup php server/casaanserver.php >casaanserver.log 2>&1 &
