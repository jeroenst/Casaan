CC=gcc
CFLAGS=$(shell mysql_config --cflags)
LIBS=$(shell mysql_config --libs) -lmysqlclient

watermeter: watermeter.o
	$(CC) -o watermeter watermeter.o $(CFLAGS) $(LIBS)
