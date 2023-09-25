const cluster = require('cluster');
const GNB = require('./S28_1603.js');

if(cluster.isMaster) {
    var checkarr = new Object();
    var now = 0;
    var work = 3;       // Worker 갯수
    var total = 188;    // 작업할 Target URL 갯수

    for(var i=now; i<total; i++) {
        checkarr[i] = "Ready";
    }

    for(let i =0; i < work; i++){
        // var worker = cluster.fork({'cata': xlsx_Data[now][Object.keys(xlsx_Data[now])[0]], 'now': now});
        createWorker(now, total);
        now++;
    }
    now--;

    // When worker is created
    cluster.on('online', function(worker) {
        //console.log('Worker ID : ' + worker.process.pid);
        checkarr[Object.keys(checkarr)[worker.id - 1]] = "Loading";
    });

    // When worker is dead
    cluster.on('exit', (worker, code, signal) => {
        // if Worker worked well
        if(checkarr[Object.keys(checkarr)[worker.id - 1]] == "Done") {
            now++;
            if(now < total) createWorker(now, total);
            else if(now == work + total - 1){
                notice();
                console.log();
                console.log("All Working is done!!")
            }
        }
        // if Worker couldn't work, Retry same working
        else if(checkarr[Object.keys(checkarr)[worker.id - 1]] == "Ready") {
            checkarr[Object.keys(checkarr)[worker.id - 1]] = "Retry";
            // worker = cluster.fork({'cata': xlsx_Data[now][Object.keys(xlsx_Data[now])[0]], 'now': now});
            createWorker(worker.id - 1, total);
        }
        // if Retrying work also couldn't work, Skip and go to next work
        else {
            checkarr[Object.keys(checkarr)[worker.id - 1]] = "Error";
            now++;
            if(now < total) createWorker(now, total);
            else if(now == work + total - 1){
                notice();
                console.log("All Working is done!!")
            }
        }
    });
    
    /////////////////////////////////////// Create Worker Funtion ///////////////////////////////////////////
    function createWorker(now, total) {
        // var worker = cluster.fork({'cata': xlsx_Data[now][Object.keys(xlsx_Data[now])[0]], 'now': now});
        var worker = cluster.fork({'now': now, "total": total});
        checkarr[Object.keys(checkarr)[now]] = "Loading";
        worker.on('message', function (msg) {
            console.log(msg.from + " : " + msg.type);
            if(msg.type == "end"){
                checkarr[Object.keys(checkarr)[msg.from]] = "Done";
            } else {
                notice();
            }
        });
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    function notice() {
       
        console.log("--------------------------------- Progress ---------------------------------"); 
        for(var i = 0 ; i < Object.keys(checkarr).length; i++) {
            process.stdout.write(Object.keys(checkarr)[i] + " : " + Object.values(checkarr)[i] + " | ");
        }    
        
    }

} else {
    process.setMaxListeners(50);
    // task.PFPD(cluster.worker.process.env.cata, cluster.worker.process.env.now);
    // PFtask.PFPD(cluster.worker.process.env.cata, cluster.worker.process.env.now);
    // PDtask.PD(cluster.worker.process.env.now);
    GNB.GNB(cluster.worker.process.env.now, cluster.worker.process.env.total);
}
