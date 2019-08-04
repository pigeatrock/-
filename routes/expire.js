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
});

router.get('/', (req, res, next) => {
    Promise.all([getDetailData(), getWatchList()]).then(list => {
        res.render('expire.art', {
            list,
            config
        })
    })
})

//得到详情列表
function getDetailData() {
    return new Promise((resolve, reject) => {
        db.all(`select L.productCode,D.goodsName,L.attr1,L.skuCode,L.skuStock,L.markerPrice,L.memberPrice,L.saveMoney,L.imagePath from goodsData as D,goodsDetail as L where L.productCode = D.gId and skuStock = 0`, (err, result) => {
            if (err) {
                console.log('err:', err);
            } else {
                resolve(result);
            }
        })
    })
}
//得到监控列表
function getWatchList() {
    return new Promise((resolve, reject) => {
        let sql = `select * from watchGoods`;
        db.all(sql, (err, result) => {
            if (err) {
                console.log('list_getWatchList_err:', err);
            } else {
                resolve(result);
            }
        })
    })
}

module.exports = router;