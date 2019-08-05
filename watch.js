

var restart_timeout = 60 * 60;



var fork = require('child_process').fork;

 

//Process instance

var workers = [];


var appsPath = ['./server.js'];

var createWorker = function(appPath){


　　var worker = fork(appPath);

    setTimeout(() => {
      worker.kill() // 定时自动重启
    }, restart_timeout * 1000)

　　//Child process events

　　worker.on('exit',function(){

　　　　console.log('worker: ' + worker.pid + ' exited');

　　　　delete workers[worker.pid];

　　　　createWorker(appPath);

　　 });

　　workers[worker.pid] = worker;

　　  console.log('Create worker:' + worker.pid);

　　};


for (var i = appsPath.length - 1; i >= 0; i--) {

　　createWorker(appsPath[i]);

}

process.on('exit',function(){

　　 for(var pid in workers){

　　　　workers[pid].kill();

　　}

});