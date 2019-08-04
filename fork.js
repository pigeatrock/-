var { spawn } = require('child_process');
var path = require('path');

const path_to_entrypoint = path.resolve(require.main.filename);


console.log(`守护进程启动-------------`);
console.log(`开始调用下单进程`);
options = { stdio: ['inherit'] };
child = spawn('./shop.exe', [], options);

child.stdout.on('data', (data) => {
    console.log(`${data}`);
})

reloadOptions = { stdio: 'inherit' }
child.on('close', (code) => {
    if (code == 1) {
        console.log(`下单进程异常终止，退出码：${code}`);
        console.log(`守护进程重新启动-------------`);
        spawn('./shouhu.exe', [path_to_entrypoint], reloadOptions);
    } else {
        console.log(`code: ${code}`);
    }
})