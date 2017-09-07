#
# Makefile for Casaan Zwave
# GNU make only

.SUFFIXES:	.cpp .o .a .s

CC     := $(CROSS_COMPILE)gcc
CXX    := $(CROSS_COMPILE)g++
LD     := $(CROSS_COMPILE)g++
AR     := $(CROSS_COMPILE)ar rc
RANLIB := $(CROSS_COMPILE)ranlib

DEBUG_CFLAGS    := -Wall -Wno-unknown-pragmas -Wno-inline -Wno-format -g -DDEBUG -ggdb -O0
RELEASE_CFLAGS  := -Wall -Wno-unknown-pragmas -Werror -Wno-format -O3 -DNDEBUG

DEBUG_LDFLAGS	:= -g

# Change for DEBUG or RELEASE
CFLAGS	:= -c $(DEBUG_CFLAGS)
LDFLAGS	:= $(DEBUG_LDFLAGS)

OPENZWAVE := ../../open-zwave/

INCLUDES := -I $(OPENZWAVE)/cpp/src -I $(OPENZWAVE)/cpp/src/command_classes/ \
	-I $(OPENZWAVE)/cpp/src/value_classes/ -I $(OPENZWAVE)/cpp/src/platform/ \
	-I $(OPENZWAVE)/cpp/src/platform/unix -I $(OPENZWAVE)/cpp/tinyxml/ \
	-I /usr/local/include/

# Remove comment below for gnutls support
#GNUTLS := -lgnutls

LIBZWAVE := $(wildcard $(OPENZWAVE)/*.a)
LIBUSB := -ludev
LIBS := $(LIBZWAVE) $(GNUTLS) $(LIBMICROHTTPD) -pthread $(LIBUSB) -lresolv

%.o : %.cpp
	$(CXX) $(CFLAGS) $(INCLUDES) -o $@ $<

%.o : %.c
	$(CC) $(CFLAGS) $(INCLUDES) -o $@ $<

all: defs casaanzwave

defs:
ifeq ($(LIBZWAVE),)
	@echo Please edit the Makefile to avoid this error message.
	@exit 1
endif

casaanzwave:	casaanzwave.o jsoncpp.o $(LIBZWAVE)
	$(LD) -o $@ $(LDFLAGS) casaanzwave.o jsoncpp.o $(LIBS)

clean:
	rm -f casaanzwave *.o
