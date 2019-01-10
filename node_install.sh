sudo cp yum.conf /etc/yum.conf
sudo cp .bashrc ~/.bashrc
source .bashrc
node_ver='v8.11.3'
node_source="node-$node_ver-linux-x64.tar.xz"
node_install_dir='/usr/lib64/nodejs'
if [ -f "$node_source" ];                         
then
  tar -xvf "$node_source"
else
  wget "https://nodejs.org/dist/$node_ver/$node_source"
  tar -xvf "$node_source"
fi
sudo mkdir "$node_install_dir" && sudo cp -r "$node_source"/* "$node_install_dir"
