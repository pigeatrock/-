var express = require('express');
var request = require('request');
var sqlite3 = require('sqlite3').verbose();
var path = require('path');
var dir = path.join(process.cwd(),'./config.js')
var config = require(dir);
var router = express.Router();

var db = new sqlite3.Database(config.dbPath, (err) => {
    if (err) {
        console.log('Could not connect to database', err)
    } else {
        console.log('Connect to database success');
    }
})

router.get('/', (req, res, next) => {
    getOrderList().then((orderList) => {
        console.log('orderList----------------:',orderList)
        res.render('data.art', {
            orderList,config
        })
    })
})

function getOrderList() {
    return new Promise((resolve, reject) => {
        let orderList = [];
        let n = 0;
        getUserInfo().then((userList) => {
            for (let i = 0; i < userList.length; i++) {
                (function () {
                    let orderListOptions = {
                        url: 'https://m.teshehui.com/order/getorderlist?pagesize=30&type=1&pageno=1',
                        method: 'GET',
                        headers: {
                            'Cookie': 'webguid=' + userList[i]['webguid'] + ';' + 'userid=' + userList[i].userId + ';' + 'skey=' + userList[i].token + ';' + 'invitationcode=undefined; makerinvitationcode=null'
                        }
                    }
                    request(orderListOptions, (err, res, body) => {
                        n++;
                        let body_tmp = JSON.parse(body);
                        // console.log('body_tmp:',body_tmp)
                        if (err) {
                            console.log('data_getUserInfo_err:', err);
                            reject(err);
                        } else if (Object.getOwnPropertyNames(body_tmp).length >= 2) {
                            let items = body_tmp['data2']['items'];
                            orderList.push({
                                phoneMob: userList[i]['mobilePhone'],
                                items
                            })
                            // console.log('bodyStr:', body);
                            // console.log('orders:', orders);
                            if (n >= userList.length) {
                                resolve(orderList)
                            }
                        } else {
                            resolve('0'); //没有下单
                        }
                    })
                })()
            }
        })
    })
}
//从数据库获得登录用户信息
function getUserInfo() {
    return new Promise((resolve, reject) => {
        db.all(`select * from user`, (err, result) => {
            if (err) {
                console.log('shop_getUserInfo_err:', err);
            } else {
                resolve(result);
            }
        })
    })
}
module.exports = router;