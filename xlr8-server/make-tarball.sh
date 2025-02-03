tar -czvf xlr8-server.tar.gz xlr8-server
scp -i /home/sdatnmdt/private-keys/xlr8-private-key.pem -r /home/sdatnmdt/xlr8/xlr8-server.tar.gz ubuntu@52.86.25.219:/home/ubuntu/
ssh -i /home/sdatnmdt/private-keys/xlr8-private-key.pem ubuntu@52.86.25.219 "tar -xzvf xlr8-server.tar.gz"
echo "Tarball Successfully Created/Served/Executed"

