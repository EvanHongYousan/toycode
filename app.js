/**
 * Created by yantianyu on 2016/4/13.
 */

var express = require('express');
var app = express();
var port = process.env.PORT || 3021;

app.use(express.static(__dirname+'/teacherOnline/canvasVideo-phone'));

app.listen(port,function(){
    console.log('app is listening at port ' + port);
    console.log('http://localhost:3021');
});