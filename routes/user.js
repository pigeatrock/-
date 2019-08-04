var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var request = require('request');
var path = require('path');
const crypto = require('crypto');
// var md5 = crypto.createHash('md5');
var dir = path.join(process.cwd(),'./config.js')
var config = require(dir);
console.log('load userRouter')
var webguid;
var phoneMob; //手机号
var code; //图片验证码
var checkCode; //验证码
var accent; //账号
var pwd; //密码
var invitationCode; //邀请码
var registerInviter; //注册邀请人
var userId;
var token;

var router = express.Router();
var db = new sqlite3.Database(config.dbPath, (err) => {
    if (err) {
        console.log('Could not connect to database', err)
    } else {
        console.log('Connect to database success');
    }
});

router.get('/', (req, res, next) => {
    res.render('user.art', {
        config
    });
})

/*获得webguid,保存*/
router.get('/getWebGuid', (req, res, next) => {
    getWebGuid().then((webguid) => {
        // let sql = 'INSERT INTO user (webguid) VALUES (?,?)';
        // console.log('webguid:',webguid)
        // db.run(sql,[webguid])
        res.send(webguid);
    });
})
/*账号密码登录*/
router.get('/pwdLogin',(req,res,next)=>{
    accent = req.param('accent');
    phoneMob = accent;
    var pwd_tmp = req.param('pwd');
    pwd = crypto.createHash('md5').update(pwd_tmp).digest('hex');
    pwdToken().then(()=>{
        res.send('OK');
    }).catch(()=>{
        res.send('err');
    })
})
// 得到手机验证码
router.get('/getVerificationCode', (req, res, next) => {
    phoneMob = req.param('phoneMob');
    code = req.param('code');
    getVerificationCode(phoneMob, code);
    res.send('OK');
})
//登录=>token
router.get('/getCheckCode', (req, res, next) => {
    checkCode = req.param('checkCode');
    console.log('-----------:getToken')
    getToken().then(() => {
        res.send('OK');
    }).catch(()=>{
        res.send('err');
    });
})

/*获得webguid*/
function getWebGuid() {
    return new Promise(function (resolve, reject) {
        request('https://m.teshehui.com/user/login?redirect=%2Fuser%2F&invitationCode=', function (err, res, body) {
            console.log('error:', err);
            console.log('statusCode:', res.statusCode);
            // console.log('headers:',res.headers);
            var webguid_tmp = res.headers['set-cookie'];
            webguid = webguid_tmp[0].slice(0, webguid_tmp[0].indexOf(';')).split('=')[1];
            if (err) {
                reject(err);
            } else {
                resolve(webguid);
            }
        })
    })
}

/*检验手机号（传入验证码）=>（手机短信验证码）*/
function getVerificationCode(phoneMob, code) {
    request('https://m.teshehui.com/user/get_verification_code?phone_mob=' + phoneMob + '&type=1' + '&code=' + code, (err, res, body) => {})
}

//账号密码方式获得token
function pwdToken(){
    return new Promise((resolve,reject)=>{
        var pwdOptions = {
            url: 'https://portal-api.teshehui.com/client',
            method: 'POST',
            form: {
                requestObj:'{"number":"'+phoneMob+'","password":"'+pwd+'","reportData":"cn\u003d深圳\u0026lon\u003d4.9E-324\u0026plf\u003d2\u0026nko\u003d1\u0026nkt\u003d1\u0026lgt\u003d102\u0026lt\u003d1\u0026pm\u003dHuawen\u0026os\u003d23,6.0.1\u0026xuid\u003d051441u0s7gwvxOO9ocT\u0026av\u003d91\u0026dn\u003d00000000-2496-dc11-0674-b34a63940b97\u0026sid\u003d1001\u0026rsl\u003d720X1280\u0026qd\u003dhuawei\u0026ip\u003d192.168.1.108\u0026lat\u003d4.9E-324","appType":"tsh","businessType":"01","clientType":"ANDROID","clientVersion":"7.0.2","ditchCode":"xiaomi","imei":"00000000-2496-dc11-0674-b34a63940b97","network":"WIFI","requestClassName":"com.teshehui.portal.client.user.request.PortalUserLoginRequest","screenHeight":"1280","screenWidth":"720","timestamp":1556964614810,"url":"/user/userLogin","version":"1.0.0"}'
            }
        }
        request(pwdOptions, (err, res, body) => {
            var Obody = JSON.parse(body);
            if (Obody['userId']) {
                userId = Obody.userId;
                token = Obody.token;
                //登录成功-》写入数据库
                db.get(`select * from user where mobilePhone = ?`, [phoneMob], (err, result) => {
                    if (err) {
                        console.log('Error running sql:', err);
                    } else if (result) {
                        db.run(`update user set webguid = ?,mobilePhone = ?,userId=?,token=? where mobilePhone = ?`,
                            [webguid, phoneMob, userId, token, phoneMob]);
                        resolve();
                    } else {
                        console.log('userId:', userId)
                        console.log('token:', token)
                        db.run(`insert into user (webguid,mobilePhone,userId,token) values (?,?,?,?)`,
                            [webguid, phoneMob, userId, token]);
                        resolve();
                    }
                })
            }else{
                reject();
            }
        })
        
    })
}
//验证码方式获得token
function getToken() {
    return new Promise((resolve, reject) => {
        /*login=>获取token*/
        var loginOptions = {
            url: 'https://m.teshehui.com/user/login',
            method: 'POST',
            headers: {
                'Host': 'm.teshehui.com',
                'Connection': 'keep-alive',
                'Accept': '*/*',
                'Origin': 'https://m.teshehui.com',
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Mobile Safari/537.36',
                'DNT': '1',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': 'https://m.teshehui.com/user/login?redirect=%2Fuser%2F&invitationCode=',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Cookie': 'webguid=' + webguid,
            },
            form: {
                phoneMob,
                checkCode,
                invitationCode,
                registerInviter
            }
        }
        console.log('webguid:', webguid)
        console.log('phoneMob:', phoneMob)
        console.log('checkCode:', checkCode)

        request(loginOptions, (err, res, body) => {
            console.log('resHeader:', res.headers)
            console.log('body:', body);
            var Obody = JSON.parse(body);
            if (Obody['userId']) {
                userId = Obody.userId;
                token = Obody.token;
                //登录成功-》写入数据库
                db.get(`select * from user where mobilePhone = ?`, [phoneMob], (err, result) => {
                    if (err) {
                        console.log('Error running sql:', err);
                    } else if (result) {
                        db.run(`update user set webguid = ?,mobilePhone = ?,userId=?,token=? where mobilePhone = ?`,
                            [webguid, phoneMob, userId, token, phoneMob]);
                        resolve();
                    } else {
                        console.log('userId:', userId)
                        console.log('token:', token)
                        db.run(`insert into user (webguid,mobilePhone,userId,token) values (?,?,?,?)`,
                            [webguid, phoneMob, userId, token]);
                        resolve();
                    }
                })
            }else{
                reject();
            }
        })
    })
}



module.exports = router;