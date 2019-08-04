var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var path = require('path');
var dir = path.join(process.cwd(),'./config.js')
var config = require(dir);

var router = express.Router();
console.log('load accent');
var db = new sqlite3.Database(config.dbPath, (err) => {
    if (err) {
        console.log('Could not connect to database', err)
    } else {
        console.log('Connect to database success');
    }
})
router.get('/', (req, res, next) => {
    getAllUser().then((userList) => {
        res.render('accent.art', {
            userList,config
        });
    })
})
router.get('/delUser',(req,res,next)=>{
    let uid = req.param('uid');
    let sql = `delete from user where uid = ${uid}`;
    console.log(sql);
    db.run(sql,[],(err)=>{
        if(err){
            console.log('err:',err);
        }else{
            res.send('OK')
        }
    })
})
//获取已登录列表
function getAllUser() {
    return new Promise((resolve, reject) => {
        db.all('select * from user', (err, result) => {
            if (err) {
                console.log('Error running sql:', err);
            } else {
                resolve(result)
            }
        })
    })
}

module.exports = router;