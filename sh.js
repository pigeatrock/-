var { spawn } = require('child_process');

console.log(`守护进程启动-------------`);
console.log(`开始调用下单进程`);

// options = { stdio: ['ipc'], detached: true };
options = { stdio: ['inherit'] };

// child = spawn('node', ['test.js'], options);
child = spawn('node', ['./bin/shop1'], options);

child.stdout.on('data', (data) => {
    console.log(`${data}`);
})

reloadOptions = { stdio: 'inherit' }
child.on('close', (code) => {
    if (code == 1) {
        console.log(`下单进程异常终止，退出码：${code}`);
        console.log(`守护进程重新启动-------------`);
        spawn('node', ['sh.js'], reloadOptions);
    } else {
        console.log(`code: ${code}`);
    }
})