
                         xlr8.online readme


                    + --------------------------------+
                    |    __   ___      _____   __     |
                    |   \ \ / / |    |  __ \ /  _\    |
                    |    \ V /| |    | |__| | (_) |   |
                    |     > < | |    |  _  / > _ <    |
                    |    / . \| |____| | \ \| (_) |   |
                    |   /_/ \_\______|_|  \_\\___/    |
                    |                                 |
                    + --------------------------------+

---------------------------------=+_|_+---------------------------------
To start server:
    1. SCP xlr8-server directory to Ec2 server
        --> Current Ec2 is: i-09cd4a365b3ee9aad at Elastic IP 52.86.25.219
        --> You need the key (xlr8-private-key.pem)
        --> Example Command: ssh -i /path/to/your/key.pem xlr8-server 
            ubuntu@52.86.25.219:home/ubuntu/
    2. SSH Into Ec2 Server
        --> Example Command: ssh -i /path/to/your/key.pem ubuntu@52.86.25.219
    3. Navigate to xlr8-server directory
    4. run "bash startup.sh". You should see Flask logs.
    5. *optional Check the Nginx proxy to make sure 
        SSL certificates are still good.

Otherwise check the notion or the code comments for any other questions.