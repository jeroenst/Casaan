//-----------------------------------------------------------------------------
//
//	Main.cpp
//
//	Minimal application to test OpenZWave.
//
//	Creates an OpenZWave::Driver and the waits.  In Debug builds
//	you should see verbose logging to the console, which will
//	indicate that communications with the Z-Wave network are working.
//
//	Copyright (c) 2010 Mal Lansell <mal@openzwave.com>
//
//
//	SOFTWARE NOTICE AND LICENSE
//
//	This file is part of OpenZWave.
//
//	OpenZWave is free software: you can redistribute it and/or modify
//	it under the terms of the GNU Lesser General Public License as published
//	by the Free Software Foundation, either version 3 of the License,
//	or (at your option) any later version.
//
//	OpenZWave is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//	GNU Lesser General Public License for more details.
//
//	You should have received a copy of the GNU Lesser General Public License
//	along with OpenZWave.  If not, see <http://www.gnu.org/licenses/>.
//
//-----------------------------------------------------------------------------

#include <unistd.h>
#include <stdlib.h>
#include <pthread.h>
#include "Options.h"
#include "Manager.h"
#include "Driver.h"
#include "Node.h"
#include "Group.h"
#include "Notification.h"
#include "value_classes/ValueStore.h"
#include "value_classes/Value.h"
#include "value_classes/ValueBool.h"
#include "command_classes/SwitchMultilevel.h"
#include "platform/Log.h"
#include "Defs.h"
#include <inttypes.h>


#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <string.h>
#include <termios.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/ioctl.h>
#include <sys/signal.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <stdint.h>
#include <inttypes.h>
#include <netinet/in.h>
#include <unistd.h>
#include <inttypes.h>
#include <math.h>
#include <time.h>
#include <sys/wait.h>
#include <iostream>
#include "json/json.h"
#include <netinet/tcp.h>
#include <string>
#include <algorithm> 

#define BUFFER_SIZE 1024
#define on_error(...) { fprintf(stderr, __VA_ARGS__); fflush(stderr); exit(1); }

int port = 58885;
Json::Value jsonglobalobject; 

using namespace OpenZWave;

        bool temp = false;



static uint32 g_homeId = 0;
static bool   g_initFailed = false;

typedef struct
{
	uint32			m_homeId;
	uint8			m_nodeId;
	bool			m_polled;
	list<ValueID>	m_values;
}NodeInfo;

static list<NodeInfo*> g_nodes;
static pthread_mutex_t g_criticalSection;
static pthread_cond_t  initCond  = PTHREAD_COND_INITIALIZER;
static pthread_mutex_t initMutex = PTHREAD_MUTEX_INITIALIZER;

int server_fd, client_fd = 0, err;


int create_tcpserver()
{
        int server_fd, err;

        struct sockaddr_in server;

        server_fd = socket(AF_INET, SOCK_STREAM, 0);
        if (server_fd < 0) on_error("Could not create socket\n");

        server.sin_family = AF_INET;
        server.sin_port = htons(port);
        server.sin_addr.s_addr = htonl(INADDR_ANY);

        int opt_val = 1;
        setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt_val, sizeof opt_val);

        while (err = bind(server_fd, (struct sockaddr *) &server, sizeof(server)) < 0)
        {
                if (err < 0) on_error("Could not bind socket\n");
                sleep(1);
        }

        while (err = listen(server_fd, 128) < 0)
        {
                on_error("Could not listen on socket\n");
                sleep(1);
        }

        printf("TCP Server is listening on %d\n", port);

        return server_fd;
}




void SetDimmerValue(int nodeid, int instanceid, uint8 value)
{
    pthread_mutex_lock( &g_criticalSection );
    for( list<NodeInfo*>::iterator it = g_nodes.begin(); it != g_nodes.end(); ++it )
    {
	NodeInfo* nodeInfo = *it;
	if( nodeInfo->m_nodeId != nodeid ) continue;
	for( list<ValueID>::iterator it2 = nodeInfo->m_values.begin();
	it2 != nodeInfo->m_values.end(); ++it2 )
	{
	    ValueID v = *it2;
	    if( v.GetCommandClassId() == 0x26 && v.GetIndex() == 0 && v.GetInstance() == instanceid)
	    {
		printf("\n Setting Node Dimmmer %d to %d ",
		       nodeInfo->m_nodeId,
		       value);
		Manager::Get()->SetValue(v, value);
		uint8 response = 0;
		Manager::Get()->GetValueAsByte(v, &response);
		printf("\n Node %d is now %d \n",
		       nodeInfo->m_nodeId,
		       response);

		break;
	    }
	}
    }

    pthread_mutex_unlock( &g_criticalSection );
}

void SetSwitchValue(int nodeid, int instanceid, bool value)
{
    pthread_mutex_lock( &g_criticalSection );
    for( list<NodeInfo*>::iterator it = g_nodes.begin(); it != g_nodes.end(); ++it )
    {
	NodeInfo* nodeInfo = *it;
	if( nodeInfo->m_nodeId != nodeid ) continue;
	for( list<ValueID>::iterator it2 = nodeInfo->m_values.begin();
	it2 != nodeInfo->m_values.end(); ++it2 )
	{
	    ValueID v = *it2;
	    if( v.GetCommandClassId() == 0x25 && v.GetIndex() == 0 && v.GetInstance() == instanceid)
	    {
		printf("\n Setting Node Switch %d to %d ",
		       nodeInfo->m_nodeId,
		       value);
		Manager::Get()->SetValue(v, value);
		bool response = false;
		Manager::Get()->GetValueAsBool(v, &response);
		printf("\n Node %d is now %d \n",
		       nodeInfo->m_nodeId,
		       response);

		break;
	    }
	}
    }

    pthread_mutex_unlock( &g_criticalSection );
}

void SetColor(int nodeid, int instanceid, string value)
{
    pthread_mutex_lock( &g_criticalSection );
    for( list<NodeInfo*>::iterator it = g_nodes.begin(); it != g_nodes.end(); ++it )
    {
	NodeInfo* nodeInfo = *it;
	if( nodeInfo->m_nodeId != nodeid ) continue;
	for( list<ValueID>::iterator it2 = nodeInfo->m_values.begin();
	it2 != nodeInfo->m_values.end(); ++it2 )
	{
	    ValueID v = *it2;
	    if( v.GetCommandClassId() == 0x33 && v.GetIndex() == 0 && v.GetInstance() == instanceid)
	    {
		printf("\n Setting Node %d Color to %d ",
		       nodeInfo->m_nodeId,
		       value);
		Manager::Get()->SetValue(v, value);
		string response = "" ;
		Manager::Get()->GetValueAsString(v, &response);
		printf("\n Node %d color is now %d \n",
		       nodeInfo->m_nodeId,
		       response);

		break;
	    }
	}
    }

    pthread_mutex_unlock( &g_criticalSection );
}


//-----------------------------------------------------------------------------
// <GetNodeInfo>
// Return the NodeInfo object associated with this notification
//-----------------------------------------------------------------------------
NodeInfo* GetNodeInfo
(
	Notification const* _notification
)
{
	uint32 const homeId = _notification->GetHomeId();
	uint8 const nodeId = _notification->GetNodeId();
	for( list<NodeInfo*>::iterator it = g_nodes.begin(); it != g_nodes.end(); ++it )
	{
		NodeInfo* nodeInfo = *it;
		if( ( nodeInfo->m_homeId == homeId ) && ( nodeInfo->m_nodeId == nodeId ) )
		{
			return nodeInfo;
		}
	}

	return NULL;
}

//-----------------------------------------------------------------------------
// <OnNotification>
// Callback that is triggered when a value, group or node changes
//-----------------------------------------------------------------------------
void OnNotification
(
	Notification const* _notification,
	void* _context
)
{
	bool updatejson = false;
	// Must do this inside a critical section to avoid conflicts with the main thread
	pthread_mutex_lock( &g_criticalSection );
	
	ValueID v =  _notification->GetValueID();

                    //    ValueType_Bool = 0,                     /**< Boolean, true or false */
                     //   ValueType_Byte,                         /**< 8-bit unsigned value */
                    //    ValueType_Decimal,                      /**< Represents a non-integer value as a string, to avoid floating point accuracy issues. */
                    //    ValueType_Int,                          /**< 32-bit signed value */
                    //    ValueType_List,                         /**< List from which one item can be selected */
                    //    ValueType_Schedule,                     /**< Complex type used with the Climate Control Schedule command class */
                    //    ValueType_Short,                        /**< 16-bit signed value */
                    //    ValueType_String,                       /**< Text string */
                    //    ValueType_Button,                       /**< A write-only value that is the equivalent of pressing a button to send a command to a device */
                    //    ValueType_Raw,                          /**< A collection of bytes */
                    //    ValueType_Max = ValueType_Raw

//	printf ("Received Notification! NodeId=%d Instance=%d Index=%d Type=%d ",_notification->GetNodeId(),v.GetInstance(),v.GetIndex(),v.GetType());

	
	switch( _notification->GetType() )
	{
		case Notification::Type_ValueAdded:
		{
			if( NodeInfo* nodeInfo = GetNodeInfo( _notification ) )
			{
				// Add the new value to our list
				nodeInfo->m_values.push_back( _notification->GetValueID() );
				updatejson = true;
			}
			break;
		}

		case Notification::Type_ValueRemoved:
		{
			if( NodeInfo* nodeInfo = GetNodeInfo( _notification ) )
			{
				// Remove the value from out list
				for( list<ValueID>::iterator it = nodeInfo->m_values.begin(); it != nodeInfo->m_values.end(); ++it )
				{
					if( (*it) == _notification->GetValueID() )
					{
						nodeInfo->m_values.erase( it );
						break;
					}
				}
			}
			break;
		}

		case Notification::Type_ValueChanged:
		{
			// One of the node values has changed
			if( NodeInfo* nodeInfo = GetNodeInfo( _notification ) )
			{
				nodeInfo = nodeInfo;		// placeholder for real action
				updatejson = true;
			}
			break;
		}

		case Notification::Type_Group:
		{
			// One of the node's association groups has changed
			if( NodeInfo* nodeInfo = GetNodeInfo( _notification ) )
			{
				nodeInfo = nodeInfo;		// placeholder for real action
			}
			break;
		}

		case Notification::Type_NodeAdded:
		{
			// Add the new node to our list
			NodeInfo* nodeInfo = new NodeInfo();
			nodeInfo->m_homeId = _notification->GetHomeId();
			nodeInfo->m_nodeId = _notification->GetNodeId();
			nodeInfo->m_polled = false;		
			g_nodes.push_back( nodeInfo );
		        if (temp == true) {
			    Manager::Get()->CancelControllerCommand( _notification->GetHomeId() );
                        }
			break;
		}

		case Notification::Type_NodeRemoved:
		{
			// Remove the node from our list
			uint32 const homeId = _notification->GetHomeId();
			uint8 const nodeId = _notification->GetNodeId();
			for( list<NodeInfo*>::iterator it = g_nodes.begin(); it != g_nodes.end(); ++it )
			{
				NodeInfo* nodeInfo = *it;
				if( ( nodeInfo->m_homeId == homeId ) && ( nodeInfo->m_nodeId == nodeId ) )
				{
					g_nodes.erase( it );
					delete nodeInfo;
					break;
				}
			}
			break;
		}

		case Notification::Type_NodeEvent:
		{
			// We have received an event from the node, caused by a
			// basic_set or hail message.
			if( NodeInfo* nodeInfo = GetNodeInfo( _notification ) )
			{
				nodeInfo = nodeInfo;		// placeholder for real action
				updatejson = true;
			}
			break;
		}

		case Notification::Type_PollingDisabled:
		{
			if( NodeInfo* nodeInfo = GetNodeInfo( _notification ) )
			{
				nodeInfo->m_polled = false;
			}
			break;
		}

		case Notification::Type_PollingEnabled:
		{
			if( NodeInfo* nodeInfo = GetNodeInfo( _notification ) )
			{
				nodeInfo->m_polled = true;
			}
			break;
		}

		case Notification::Type_DriverReady:
		{
			g_homeId = _notification->GetHomeId();
			
			break;
		}

		case Notification::Type_DriverFailed:
		{
			g_initFailed = true;
			pthread_cond_broadcast(&initCond);
			break;
		}

		case Notification::Type_AwakeNodesQueried:
		case Notification::Type_AllNodesQueried:
		case Notification::Type_AllNodesQueriedSomeDead:
		{
			pthread_cond_broadcast(&initCond);
			break;
		}

		case Notification::Type_DriverReset:
		case Notification::Type_Notification:
		case Notification::Type_NodeNaming:
		case Notification::Type_NodeProtocolInfo:
		case Notification::Type_NodeQueriesComplete:
		default:
		{
		}
	}


//	printf ("Received Notification Type=%d! NodeId=%d Instance=%d Genre=%d Class=%d Index=%d Type=%d Value=%s\n",_notification->GetType(),_notification->GetNodeId(),v.GetInstance(),v.GetGenre(),v.GetCommandClassId(),v.GetIndex(),v.GetType(),strvalue);



        if (updatejson)
        {
        string className;
        uint8 classVersion;
        Manager::Get()->GetNodeClassInformation(_notification->GetHomeId(), _notification->GetNodeId(),  v.GetCommandClassId(), &className, &classVersion);
        className.erase(0,14);             
        string valueLabel;
        valueLabel = Manager::Get()->GetValueLabel(v);
        string value;
        Manager::Get()->GetValueAsString(v, &value);
        string valueUnits = Manager::Get()->GetValueUnits(v);
        
        printf ("\n\n######## NOTIFICATION RECEIVED ##############\n NODEID=%d\n INSTANCE=%d\n CLASSNAME=%s\n LABEL=%s\n VALUE=%s\n UNITS=%s\n#############################################\n\n", 
                _notification->GetNodeId(), v.GetInstance(), className.c_str(), valueLabel.c_str(), value.c_str(), valueUnits.c_str());

	Json::Value jsonobject;
	const char *nodeid = to_string(_notification->GetNodeId()).c_str();
	const char *instanceid = to_string(v.GetInstance()).c_str();
	if (value != "")
	{ 
	        jsonobject["zwave"][nodeid][instanceid][className][valueLabel]["value" ] = value;
	        jsonobject["zwave"][nodeid][instanceid][className][valueLabel]["units"] = valueUnits;
	        jsonglobalobject["zwave"][nodeid][instanceid][className][valueLabel]["value"] = value;
	        jsonglobalobject["zwave"][nodeid][instanceid][className][valueLabel]["units"] = valueUnits;
	
		if (jsonobject.isObject() && (client_fd > 0))
		{
			Json::StreamWriterBuilder wbuilder;
			wbuilder["indentation"] = "";
			std::string document = '\x02'+Json::writeString(wbuilder, jsonobject);
  
			printf ("Sending %d bytes to tcp client: %s\n", strlen(document.c_str()), document.c_str());
			int flag = 1; 
			setsockopt(client_fd, IPPROTO_TCP, TCP_NODELAY, (char *) &flag, sizeof(int));
			write (client_fd,document.c_str(),strlen(document.c_str()));
		}
        }
        }

	pthread_mutex_unlock( &g_criticalSection );
}

//-----------------------------------------------------------------------------
// <main>
// Create the driver and then wait
//-----------------------------------------------------------------------------
int main( int argc, char* argv[] )
{
	pthread_mutexattr_t mutexattr;

	pthread_mutexattr_init ( &mutexattr );
	pthread_mutexattr_settype( &mutexattr, PTHREAD_MUTEX_RECURSIVE );
	pthread_mutex_init( &g_criticalSection, &mutexattr );
	pthread_mutexattr_destroy( &mutexattr );

	pthread_mutex_lock( &initMutex );


	printf("Starting MinOZW with OpenZWave Version %s\n", Manager::getVersionAsString().c_str());

	// Create the OpenZWave Manager.
	// The first argument is the path to the config files (where the manufacturer_specific.xml file is located
	// The second argument is the path for saved Z-Wave network state and the log file.  If you leave it NULL 
	// the log file will appear in the program's working directory.
	Options::Create( "../../../config/", "", "" );
	Options::Get()->AddOptionInt( "SaveLogLevel", LogLevel_Detail );
	Options::Get()->AddOptionInt( "QueueLogLevel", LogLevel_Debug );
	Options::Get()->AddOptionInt( "DumpTrigger", LogLevel_Error );
	Options::Get()->AddOptionInt( "PollInterval", 500 );
//	Options::Get()->AddOptionInt( "RetryTimeout", 2);
	Options::Get()->AddOptionBool( "IntervalBetweenPolls", true );
	Options::Get()->AddOptionBool("ValidateValueChanges", true);
	Options::Get()->Lock();

	Manager::Create();

	// Add a callback handler to the manager.  The second argument is a context that
	// is passed to the OnNotification method.  If the OnNotification is a method of
	// a class, the context would usually be a pointer to that class object, to
	// avoid the need for the notification handler to be a static.
	Manager::Get()->AddWatcher( OnNotification, NULL );



	// Add a Z-Wave Driver
	// Modify this line to set the correct serial port for your PC interface.

#ifdef DARWIN
	string port = "/dev/cu.usbserial";
#elif WIN32
        string port = "\\\\.\\COM6";
#else
	string port = "/dev/ttyACM0";
#endif
	if ( argc > 1 )
	{
//		port = argv[1];
	}
	if( strcasecmp( port.c_str(), "usb" ) == 0 )
	{
		Manager::Get()->AddDriver( "HID Controller", Driver::ControllerInterface_Hid );
	}
	else
	{
		Manager::Get()->AddDriver( port );
	}

	// Now we just wait for either the AwakeNodesQueried or AllNodesQueried notification,
	// then write out the config file.
	// In a normal app, we would be handling notifications and building a UI for the user.
	pthread_cond_wait( &initCond, &initMutex );

	// Since the configuration file contains command class information that is only 
	// known after the nodes on the network are queried, wait until all of the nodes 
	// on the network have been queried (at least the "listening" ones) before
	// writing the configuration file.  (Maybe write again after sleeping nodes have
	// been queried as well.)
	if( !g_initFailed )
	{

//		Manager::Get()->AddNode( g_homeId );
//		Manager::Get()->RemoveNode( g_homeId );
		// The section below demonstrates setting up polling for a variable.  In this simple
		// example, it has been hardwired to poll COMMAND_CLASS_BASIC on the each node that 
		// supports this setting.
		pthread_mutex_lock( &g_criticalSection );
		for( list<NodeInfo*>::iterator it = g_nodes.begin(); it != g_nodes.end(); ++it )
		{
			NodeInfo* nodeInfo = *it;

			// skip the controller (most likely node 1)
			if( nodeInfo->m_nodeId == 1) continue;

			printf("NodeID: %d \n ", nodeInfo->m_nodeId);
			printf("\t NodeName: %s \n ", Manager::Get()->GetNodeName(nodeInfo->m_homeId,nodeInfo->m_nodeId).c_str());
			printf("\t ManufacturerName: %s \n ", Manager::Get()->GetNodeManufacturerName(nodeInfo->m_homeId,nodeInfo->m_nodeId).c_str());
			printf("\t NodeProductName: %s \n ", Manager::Get()->GetNodeProductName(nodeInfo->m_homeId,nodeInfo->m_nodeId).c_str());

			printf("Values announced by the nodes without polling: \n");
			for( list<ValueID>::iterator it2 = nodeInfo->m_values.begin(); it2 != nodeInfo->m_values.end(); ++it2 )
			{
				ValueID v = *it2;
				printf("\t ClassId: %d\n",v.GetCommandClassId());
				
				printf("\t Id: %" PRIu64 " \n",  v.GetId());
				printf("\t ValueLabel: %s \n", Manager::Get()->GetValueLabel(v).c_str());
        string className;
        uint8 classVersion;
        Manager::Get()->GetNodeClassInformation(g_homeId, nodeInfo->m_nodeId,  v.GetCommandClassId(), &className, &classVersion);
        className.erase(0,14);             
        string valueLabel;
        valueLabel = Manager::Get()->GetValueLabel(v);
        string value;
        Manager::Get()->GetValueAsString(v, &value);
        string valueUnits = Manager::Get()->GetValueUnits(v);
        
 
        printf ("\n\n######## ANNOUNCEMENT RECEIVED ##############\n NODEID=%d\n INSTANCE=%d\n CLASSNAME=%s\n LABEL=%s\n VALUE=%s\n UNITS=%s\n#############################################\n\n", 
                nodeInfo->m_nodeId, v.GetInstance(), className.c_str(), valueLabel.c_str(), value.c_str(), valueUnits.c_str());

	Json::Value jsonobject;
	const char *nodeid = to_string(nodeInfo->m_nodeId).c_str();
	const char *instanceid = to_string(v.GetInstance()).c_str();
	if (value != "")
	{ 
	        jsonobject["zwave"][nodeid][instanceid][className][valueLabel]["value" ] = value;
	        jsonobject["zwave"][nodeid][instanceid][className][valueLabel]["units"] = valueUnits;
	        jsonglobalobject["zwave"][nodeid][instanceid][className][valueLabel]["value"] = value;
	        jsonglobalobject["zwave"][nodeid][instanceid][className][valueLabel]["units"] = valueUnits;
	
		if (jsonobject.isObject() && (client_fd > 0))
		{
			Json::StreamWriterBuilder wbuilder;
			wbuilder["indentation"] = "";
			std::string document = '\x02'+Json::writeString(wbuilder, jsonobject);
  
			printf ("Sending %d bytes to tcp client: %s\n", strlen(document.c_str()), document.c_str());
			int flag = 1; 
			setsockopt(client_fd, IPPROTO_TCP, TCP_NODELAY, (char *) &flag, sizeof(int));
			write (client_fd,document.c_str(),strlen(document.c_str()));
		}
	}

				if( v.GetCommandClassId() == COMMAND_CLASS_BASIC )
				{
//					Manager::Get()->EnablePoll( v, 2 );		// enables polling with "intensity" of 2, though this is irrelevant with only one value polled
					break;
				}
				
			}
		}
		pthread_mutex_unlock( &g_criticalSection );


//	Options::Get()->AddOptionInt( "RetryTimeout", 2);
              // Initialize TCP server
                struct sockaddr_in server, client;
                server_fd = create_tcpserver();


                struct timeval timeout;

                        /* Initialize the timeout data structure. */
                        timeout.tv_sec = 1;
                        timeout.tv_usec = 0;


                /* select returns 0 if timeout, 1 if input available, -1 if error. */
                while(1)
                {

                        /* Initialize the file descriptor set. */
                        fd_set set;
                        FD_ZERO (&set);
                        FD_SET (server_fd, &set);
                        if (client_fd > 0) FD_SET(client_fd, &set);

                        select (FD_SETSIZE,&set, NULL, NULL, &timeout);
                        if (FD_ISSET(server_fd, &set))
                        {
                                printf ("Server_fd!\n");
                                // Connection made on TCP socket!
                                socklen_t client_len = sizeof(client);
                                client_fd = accept(server_fd, (struct sockaddr *) &client, &client_len);
                                if (client_fd < 0) printf("Could not establish new connection\n");
                                else
                                {
                                        printf ("Tcp client connected!\n");

                                        Json::StreamWriterBuilder wbuilder;
					wbuilder["indentation"] = "";
					std::string document = '\x02'+Json::writeString(wbuilder, jsonglobalobject);
					write (client_fd,document.c_str(),strlen(document.c_str()));
                                }
                        }
                        else if (FD_ISSET(client_fd, &set))
                        {
                                // Received message from tcp client!
                                char msg[800];
                                bzero(msg, 800);
                                int n = read(client_fd, msg, 800);
                                if (n <= 0)
                                {
                                        // Connection was closed
                                        printf("TCP Client closed connection\n");
                                        close(client_fd);
                                }
                                else
                                {
                                        printf("Received %d bytes from TCP client: %s\n", n, msg);
                                        Json::Value root;   
                                        Json::Reader reader;
                                        std::string jsoncommand = "";
                                        for (int i = 0; i < strlen(msg); i++)
                                        {
                                                if (msg[i] != 30)
                                                {
                                                        jsoncommand.push_back(msg[i]);
                                                }
                                                else
                                                {
                                                        bool parsingSuccessful = reader.parse( jsoncommand.c_str(), root );     //parse process
                                                        if ( !parsingSuccessful )
                                                        {
                                                	        std::cout  << "Failed to parse " << reader.getFormattedErrorMessages();
                					}
	                				else
		                			{
			                			for (auto const& nodeid : root["zwave"].getMemberNames()) 
			                			{
				                			for (auto const& instanceid :  root["zwave"][nodeid].getMemberNames()) 
				                			{
					                			for (auto const& command : root["zwave"][nodeid][instanceid] .getMemberNames()) 
					                			{
						                			if (command == "setswitchmultilevel" ) SetDimmerValue (std::stoi(nodeid), std::stoi(instanceid), root["zwave"][nodeid][instanceid]["setswitchmultilevel"].asUInt() );
							                		if (command == "setswitchbinairy" ) SetSwitchValue (std::stoi(nodeid), std::stoi(instanceid), root["zwave"][nodeid][instanceid]["setswitchbinairy"].asUInt() );
							                		if (command == "setcolor" ) SetColor (std::stoi(nodeid), std::stoi(instanceid), root["zwave"][nodeid][instanceid]["setcolor"].asString() );
                                                                                }
        								}
	        						}
		        				}
		        				jsoncommand = ""; 
                                                }
					}
                                }
                        }
                        else
                        {
                                /* Re-Initialize the timeout data structure. */
                                timeout.tv_sec = 1;
                                timeout.tv_usec = 0;

				// If we want to access our NodeInfo list, that has been built from all the
				// notification callbacks we received from the library, we have to do so
				// from inside a Critical Section.  This is because the callbacks occur on other 
				// threads, and we cannot risk the list being changed while we are using it.  
				// We must hold the critical section for as short a time as possible, to avoid
				// stalling the OpenZWave drivers.
				// At this point, the program just waits for 3 minutes (to demonstrate polling),
				// then exits
				
				pthread_mutex_lock( &g_criticalSection );
				// but NodeInfo list and similar data should be inside critical section
				pthread_mutex_unlock( &g_criticalSection );

                        }
                }






		Driver::DriverData data;
		Manager::Get()->GetDriverStatistics( g_homeId, &data );
		printf("SOF: %d ACK Waiting: %d Read Aborts: %d Bad Checksums: %d\n", data.m_SOFCnt, data.m_ACKWaiting, data.m_readAborts, data.m_badChecksum);
		printf("Reads: %d Writes: %d CAN: %d NAK: %d ACK: %d Out of Frame: %d\n", data.m_readCnt, data.m_writeCnt, data.m_CANCnt, data.m_NAKCnt, data.m_ACKCnt, data.m_OOFCnt);
		printf("Dropped: %d Retries: %d\n", data.m_dropped, data.m_retries);
	}

	// program exit (clean up)
	if( strcasecmp( port.c_str(), "usb" ) == 0 )
	{
		Manager::Get()->RemoveDriver( "HID Controller" );
	}
	else
	{
		Manager::Get()->RemoveDriver( port );
	}
	Manager::Get()->RemoveWatcher( OnNotification, NULL );
	Manager::Destroy();
	Options::Destroy();
	pthread_mutex_destroy( &g_criticalSection );
	return 0;
}
