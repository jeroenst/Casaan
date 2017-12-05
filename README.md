# casaan
Software for monitoring and controlling your home on a tablet phone or computer

![alt text](https://raw.githubusercontent.com/jeroenst/Casaan/master/Screenshot_20171205-085339.jpeg) 


This software uses the websockets proxy which has to be installed in apache.



Add the folowing rule to your website config file of apache (usually in
/etc/apache2/sites-enabled):

ProxyPass "/wscasaan" "ws://localhost:58880/"



Also enable the proxy_wstunnel module:

sudo a2enmod proxy_wstunnel

sudo service apache2 restart

