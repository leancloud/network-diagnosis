$( document ).ready(function(){
  function detectLocalStorage(){
    var test = 'test';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return '正常';
    } catch(e) {
      return '不可用';
    }
  }

  function debugLC(){
    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var browserName  = navigator.appName;
    var fullVersion  = ''+parseFloat(navigator.appVersion);
    var majorVersion = parseInt(navigator.appVersion,10);
    var nameOffset,verOffset,ix;

    // In Opera, the true version is after "Opera" or after "Version"
    if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
      browserName = "Opera";
      fullVersion = nAgt.substring(verOffset+6);
      if ((verOffset=nAgt.indexOf("Version"))!=-1)
        fullVersion = nAgt.substring(verOffset+8);
    }
    // In MSIE, the true version is after "MSIE" in userAgent
    else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
      browserName = "Microsoft Internet Explorer";
      fullVersion = nAgt.substring(verOffset+5);
    }
    // In Chrome, the true version is after "Chrome"
    else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
      browserName = "Chrome";
      fullVersion = nAgt.substring(verOffset+7);
    }
    // In Safari, the true version is after "Safari" or after "Version"
    else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
      browserName = "Safari";
      fullVersion = nAgt.substring(verOffset+7);
      if ((verOffset=nAgt.indexOf("Version"))!=-1)
        fullVersion = nAgt.substring(verOffset+8);
    }
    // In Firefox, the true version is after "Firefox"
    else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
      browserName = "Firefox";
      fullVersion = nAgt.substring(verOffset+8);
    }
    // In most other browsers, "name/version" is at the end of userAgent
    else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) <
              (verOffset=nAgt.lastIndexOf('/')) )
    {
      browserName = nAgt.substring(nameOffset,verOffset);
      fullVersion = nAgt.substring(verOffset+1);
      if (browserName.toLowerCase()==browserName.toUpperCase()) {
        browserName = navigator.appName;
      }
    }
    // trim the fullVersion string at semicolon/space if present
    if ((ix=fullVersion.indexOf(";"))!=-1)
      fullVersion=fullVersion.substring(0,ix);
    if ((ix=fullVersion.indexOf(" "))!=-1)
      fullVersion=fullVersion.substring(0,ix);

    majorVersion = parseInt(''+fullVersion,10);
    if (isNaN(majorVersion)) {
      fullVersion  = ''+parseFloat(navigator.appVersion);
      majorVersion = parseInt(navigator.appVersion,10);
    }

    $('#browser').text(browserName + ' ' + fullVersion);
    $('#ua').text(navigator.userAgent);
    $('#ls_status').text(detectLocalStorage());


    var OSName="Unknown OS";
    if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
    if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
    if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
    if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";

    $('#os').text(OSName);

    function pingDomain(site, selector) {
      ping(site).then(function(delta) {
        $(selector).text('正常，延迟 ' + delta + ' 毫秒')
      }).catch(function(err) {
        selector.text('Ping 失败');
      });
    }

    function pingWSS(site, selector) {
      var start = Date.now();

      websocket = new WebSocket(site);
      websocket.onopen = function(evt) {
        var end = Date.now();
        console.log("start: " + start + ", end: " + end);
        $(selector).text('正常，延迟 ' + (end - start) + ' 毫秒');
      };
      websocket.onerror = function(evt) {
        $(selector).text('WSS Ping 失败');
      };
    }

    pingDomain('https://api.leancloud.cn/1.1/ping', '#lc_ping');
    pingDomain('https://us-api.leancloud.cn/1.1/ping', '#us_lc_ping');
    pingDomain('http://leanapp.cn/', '#lc_app_ping');
    pingDomain('https://pxnn5aqv.api.lncld.net/1.1/ping', '#lc_api_cn_n1_ping');
    pingDomain('https://ol0cw6zl.api.lncldglobal.com/1.1/ping', '#lc_api_us_w1_ping');
    pingDomain('https://router-g0-push.leancloud.cn/v1/route?appId=PXnN5AqVpgEI4esrTLhoxUkd-gzGzoHsz', '#lc_push_router_ping');
    pingDomain('https://app-router.leancloud.cn/1/route?appId=test', '#lc_app_router_ping');

    pingDomain('https://upload.qiniup.com/', '#qiniu_up_ping');
    pingDomain('https://up.qbox.me/', '#qbox_up_ping');

    pingDomain('https://tds-tapsdk.cn.tapapis.com', '#tds_cn_eco_ping');
    pingDomain('https://xyz.cloud.tds1.tapapis.cn/1.1/ping', '#tds_cn_cloud_ping');
    pingDomain('https://xyz.cloud.ap-sg.tapapis.com/1.1/ping', '#tds_sg_cloud_ping');

    pingDomain('http://www.163.com/', '#163_ping');
    pingDomain('http://www.sina.com.cn/', '#sina_ping');
    pingDomain('https://www.baidu.com/', '#baidu_ping');

    pingWSS('wss://xyz.im.cn-n1.lncldapi.com', '#wss_cn_n1_ping');
    pingWSS('wss://xyz.rtm.lncldglobal.com', '#wss_us_w1_ping');

    pingWSS('wss://xyz.im.tds1.tapapis.cn', '#tds_cn_wss_ping');
    pingWSS('wss://xyz.im.ap-sg.tapapis.com', '#tds_sg_wss_ping');
  }

  var selectors = ["ip", 'location', 'browser', 'os' ,'ua',
                   'ls_status', 'lc_ping','us_lc_ping', 'lc_app_ping',
                   'lc_api_cn_n1_ping', 'lc_api_us_w1_ping',
                   'lc_app_router_ping', 'lc_push_router_ping',
                   'qiniu_up_ping', 'qbox_up_ping',
                   'wss_cn_n1_ping', 'wss_cn_n1_ping',
                   '163_ping', 'sina_ping', 'baidu_ping'];

  function saveReport(){
    var data = {};
    $.each(selectors, function(i, s){
      data[s] = $('#' + s).text();
    });
    $.post('/save',data).done(function(ret){
      $('#saved_url').text('拷贝 URL： ' + 'http://ping.leanapp.cn/#' + ret);
    });
  }

  function getReport(code){
    $.get('/reports/'+ code).done(function(ret){
      $.each(selectors, function(i, s){
        $('#' + s).text(ret[s]);
      });
    });
  }

  var code = window.location.hash.substr(1);
  if(code){
    getReport(code);
  } else {
    debugLC();
  }

  $('#save_btn').click(saveReport);
});
