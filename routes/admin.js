var express = require('express');
var fs = require('fs');
var router = express.Router();
var path = require('path');

var dir = path.join(process.cwd(),'./res/code');

router.get('/ver',(req,res,next)=>{
    console.log(dir);
    let userCode = req.param('code');
    console.log('userCode:',userCode);
    fs.writeFileSync(dir,userCode);
    res.send('ok');
})
module.exports = router;