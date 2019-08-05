
mkdir -p /home/wwwroot/
chmod 777 -R /home/wwwroot
cd /home/wwwroot/
git clone https://github.com/cubehashio/CubeHashExplorer.git
cd explorer
npm install

vim app/config.json

npm start


curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

export NVM_DIR="${XDG_CONFIG_HOME/:-$HOME/.}nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm


nvm install node
nvm use node