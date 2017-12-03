# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search.
  config.vm.box = "mbouchar/salt-lts"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"

  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  config.vm.provision "shell", inline: <<-SHELL
    ln -s /vagrant/salt-api.conf /etc/salt/master.d/api.conf
    systemctl restart salt-api

    apt-get -yq install apache2
    a2dissite 000-default
    ln -s /vagrant/apache2-salt.conf /etc/apache2/sites-available/salt.conf
    a2ensite salt
    a2enmod proxy_http
    systemctl restart apache2
  SHELL

  config.vm.network :forwarded_port, guest: 80, host: 8080
end
