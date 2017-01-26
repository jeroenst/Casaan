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
#include <mysql.h>
  
// Device is a comport like /dev/ttyUSB1
#define DEVICE "/dev/watermeter"
#define METERFILE "/usr/domotica/watermeter/waterreading"


#define BUFFER_SIZE 1024
#define on_error(...) { fprintf(stderr, __VA_ARGS__); fflush(stderr); exit(1); }



int writetodatabase(double waterreading, double waterflow) {
   MYSQL *conn;
   MYSQL_RES *res;
   MYSQL_ROW row;

   char *server = "localhost";
   char *user = "casaan";
   char *password = "casaan"; /* set me first */
   char *database = "casaan";

   conn = mysql_init(NULL);

   /* Connect to database */
   if (!mysql_real_connect(conn, server,
         user, password, database, 0, NULL, 0)) {
      fprintf(stderr, "%s\n", mysql_error(conn));
      exit(1);
   }

   /* send SQL query */
   
   char sqlquerystring[180];
   sprintf (sqlquerystring, "INSERT INTO watermeter (m3, lm) VALUES (%.3lf,%.3lf);", waterreading, waterflow);
   if (mysql_query(conn, sqlquerystring)) {
      fprintf(stderr, "%s\n", mysql_error(conn));
      exit(1);
   }

   res = mysql_use_result(conn);

   /* output table name */
//   printf("MySQL Tables in mysql database:\n");
//   while ((row = mysql_fetch_row(res)) != NULL)
//      printf("%s \n", row[0]);

   /* close connection */
   mysql_free_result(res);
   mysql_close(conn);
   
   return 0;
}

int server_fd, client_fd, err;
struct sockaddr_in server, client;


int create_tcpserver()
{
  int port = 58882;

  struct sockaddr_in server, client;
  char buf[BUFFER_SIZE];

  server_fd = socket(AF_INET, SOCK_STREAM, 0);
  if (server_fd < 0) on_error("Could not create socket\n");

  server.sin_family = AF_INET;
  server.sin_port = htons(port);
  server.sin_addr.s_addr = htonl(INADDR_ANY);

  int opt_val = 1;
  setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt_val, sizeof opt_val);

  err = bind(server_fd, (struct sockaddr *) &server, sizeof(server));
  if (err < 0) on_error("Could not bind socket\n");

  err = listen(server_fd, 128);
  if (err < 0) on_error("Could not listen on socket\n");

  printf("Server is listening on %d\n", port);
  
  return server_fd;
}

double read_waterreading (const char* file_name)
{
    double i = 0;
    FILE* file = fopen (file_name, "r");
    if (file)
    {
        if (!feof(file)) fscanf (file, "%lf", &i);      
        fclose (file);        
    }
    return i;
}

void write_waterreading (const char* file_name, double waterreading)
{
    FILE* file = fopen (file_name, "w");
    fprintf (file, "%.3lf", waterreading);    
    fclose (file);        
}

// read the current level from DCD pin
int get_cts_state(int fd)
{
    int serial = 0;
    if(ioctl(fd, TIOCMGET, &serial) < 0)
    {
        printf("ioctl() failed: %d: %s\n", errno, strerror(errno));
        return -1;
    }
  
    return (serial & TIOCM_CTS) ? 1 : 0;
}

int write_tcpclients(int waterreading)
{
}

int write_database(int waterreading)
{
}
  
// sample code for blocking until DCD state changes
int main(int argc, char** argv)
{
    int omode = O_RDONLY;
    double waterreading = 0;
    waterreading = read_waterreading (METERFILE);
    double waterflow = 0;
    
    int server_fd = create_tcpserver();
  
    writetodatabase(waterreading, waterflow);    
    
    int fd = -1;
    // detect DCD changes forever
    int i=0;
    int ctsstate = 0;
    int pctsstate = 0;
    while(1)
    {
        // open the serial stream
        if(fd < 0)
        { 
          fd = open(DEVICE, omode, 0777);
          if (fd < 0) 
          {
            printf("Error opening serial device: open() failed: %d: %s\n", errno, strerror(errno));
            sleep (1);
          }
          else
          {
            printf("Device opened: %s\n", DEVICE);
            ctsstate= get_cts_state(fd);
            pctsstate = ctsstate;
          }
        }
        else
        {
          printf("Waterreading = %.3lf, ctsstate=%d\r", waterreading, ctsstate);
          fflush(stdout);

        }          
          
          fd_set set;
          struct timeval timeout;
          /* Initialize the file descriptor set. */
          FD_ZERO (&set);
          FD_SET (server_fd, &set);
          if (!(fd < 0)) FD_SET (fd, &set);

          /* Initialize the timeout data structure. */
          timeout.tv_sec = 1;
          timeout.tv_usec = 0;

          /* select returns 0 if timeout, 1 if input available, -1 if error. */
          select (FD_SETSIZE,&set, NULL, NULL, &timeout);
                                               
          if (FD_ISSET(server_fd, &set))
          {
            socklen_t client_len = sizeof(client);
            client_fd = accept(server_fd, (struct sockaddr *) &client, &client_len);
            if (client_fd < 0) printf("Could not establish new connection\n");
            else printf ("Tcp client connected!");
            char json[80];
            sprintf (json, "{\"watermeter\":{\"now\":{\"lm\":%.3lf},\"total\":{\"m3\":%.3lf}}}", waterflow, waterreading);
            write (client_fd,json,strlen(json));
            writetodatabase (waterflow, waterreading);
          }          
          
          if (FD_ISSET(fd, &set))
          {
            pctsstate = ctsstate;
            ctsstate = get_cts_state(fd);
            if ((ctsstate != pctsstate))
            { 
              waterreading+=0.0005;
              write_waterreading(METERFILE, waterreading);
              write_tcpclients(waterreading);
              write_database(waterreading);
            }
          // block until line changes state
//          if(ioctl(fd, TIOCMIWAIT, TIOCM_CTS) < 0)
  //        {
    //        printf("ioctl(TIOCMIWAIT) failed: %d: %s\n", errno, strerror(errno));
      //      return -1;
        //  }

        }
    }
}

