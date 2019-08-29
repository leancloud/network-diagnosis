'use strict';
var express = require('express');
var timeout = require('connect-timeout');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var AV = require('leanengine');
var request = require('request');

var app = express();

// 设置模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// 设置默认超时时间
app.use(timeout('15s'));

// 加载云函数定义
require('./cloud');
// 加载云引擎中间件
app.use(AV.express());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

function getLocation(ip, cb ) {
  if(ip) {
    var opts = {
      url: 'http://freeapi.ipip.net/' + ip,
      timeout: 3000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'
      }
    };

    request(opts, function(err, resp, body) {
      if (!err && resp.statusCode == 200) {
        try{
          var ret = JSON.parse(body);
          cb(ret.join(','));
        }catch(err) {
          cb('unknown');
        }
      } else {
        cb('unknown');
      }
    });
  }
}

app.get('/', function(req, res) {
  var ip = req.headers['x-real-ip'];
  if(ip) {
    getLocation(ip, function(location) {
      res.render('index', { ip:  ip,
                            location: location});
    });
  } else {
    res.render('index', { ip:  ip || 'unknown',
                          location: 'unknown'});
  }
});

app.post('/save', function(req, res) {
  var data = req.body;
  var report = new AV.Object('Report', data);
  report.save().then(function(ret){
    res.send(ret.id);
  }).catch(function(err){
    res.send(err);
  });
});

app.get('/reports/:id', function(req, res) {
  var id = req.params.id;
  console.dir(id);
  var report = new AV.Query('Report');
  report.get(id).then(function(ret){
    res.send(ret);
  }).catch(function(err){
    res.send('ERROR:' + err);
  });
});

app.use(function(req, res, next) {
  // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器
  if (!res.headersSent) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
});

// error handlers
app.use(function(err, req, res, next) { // jshint ignore:line
  if (req.timedout && req.headers.upgrade === 'websocket') {
    // 忽略 websocket 的超时
    return;
  }

  var statusCode = err.status || 500;
  if(statusCode === 500) {
    console.error(err.stack || err);
  }
  if(req.timedout) {
    console.error('请求超时: url=%s, timeout=%d, 请确认方法执行耗时很长，或没有正确的 response 回调。', req.originalUrl, err.timeout);
  }
  res.status(statusCode);
  // 默认不输出异常详情
  var error = {}
  if (app.get('env') === 'development') {
    // 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
    error = err;
  }
  res.render('error', {
    message: err.message,
    error: error
  });
});

module.exports = app;
