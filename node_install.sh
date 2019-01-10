#!/bin/bash

# script to install nodejs on oneops CENTOS 7 

sudo cp yum.conf /etc/yum.conf
sudo cp .bashrc ~/.bashrc  
source .bashrc 
#node version to be installed 
node_ver='v8.11.3'

#file name containing node  
node_source="node-$node_ver-linux-x64.tar.xz"

node_install_dir='/usr/lib64/nodejs'

if [ -f "$node_source" ];                         
then
    tar -xvf "$node_source"                     #if the node source file exists in the current directory the extract it
else                                       
     wget "https://nodejs.org/dist/$node_ver/$node_source" 
     tar -xvf "$node_source" 
fi

sudo mkdir "$node_install_dir" && sudo cp -r "$node_source"/* "$node_install_dir"

