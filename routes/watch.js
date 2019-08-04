var express = require('express');
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
    getWatchList().then((watchList) => {
        res.render('watch.art', {
            watchList,
            config
        })
    })
})

router.get('/watch', (req, res, next) => {
    let skuCode = req.param('skuCode');
    watch(skuCode).then(() => {
        res.end('ok');
    }).catch(() => {
        res.end('err');
    });
})

router.get('/cancelWatch', (req, res, next) => {
    let skuCode = req.param('skuCode');
    cancelWatch(skuCode).then(() => {
        res.end('ok');
    }).catch(() => {
        res.end('err');
    });
})
//监控商品
function watch(skuCode) {
    return new Promise((resolve, reject) => {
        getWatchInfo(skuCode).then((watchInfo) => {
            let sql = `insert into watchGoods (productCode,skuCode,goodsName,memberPrice,storeId) values ('${watchInfo["productCode"]}','${skuCode}','${watchInfo["goodsName"]}','${watchInfo["memberPrice"]}','${watchInfo["storeId"]}')`;
            console.log('watch_sql:', sql);
            db.run(sql, (err) => {
                if (err) {
                    reject();
                    console.log('watch_watch_err:', err);
                } else {
                    resolve();
                }
            })
        })
    })
}
//获得需要监控商品的信息
function getWatchInfo(skuCode) {
    return new Promise((resolve, reject) => {
        let sql = `select D.goodsName,L.storeId,L.memberPrice,L.productCode from goodsDetail as L,goodsData as D where L.skuCode = '${skuCode}' and L.productCode = D.gId`;
        db.get(sql, [], (err, watchInfo) => {
            if (err) {
                console.log('watch_getWatchInfo_err:', err);
                reject(err);
            } else {
                resolve(watchInfo);
            }
        })
    })
}
//取消商品监控
function cancelWatch(skuCode) {
    return new Promise((resolve, reject) => {
        let sql = `delete from watchGoods where skuCode = '${skuCode}'`;
        console.log('cancelWatch_sql:', sql)
        db.run(sql, (err) => {
            if (err) {
                reject();
                console.log('watch_cancelWatch_err:', err);
            } else {
                resolve();
            }
        })
    })
}
//获得监控中的商品列表
function getWatchList() {
    return new Promise((resolve, reject) => {
        let sql = `select D.goodsName,L.attr1,L.skuCode,L.skuStock,L.memberPrice,L.productCode,L.imagePath from goodsDetail as L,goodsData as D,watchGoods as W where W.skuCode = L.skuCode and L.productCode = D.gId`
        db.all(sql, (err, result) => {
            if (err) {
                console.log('watch_getWathList_err:', err);
            } else {
                resolve(result);
            }
        })
    })
}

module.exports = router;