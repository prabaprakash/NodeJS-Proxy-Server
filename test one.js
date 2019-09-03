/*
** Created by Peter Krumins (peter@catonmat.net, @pkrumins on twitter)
** www.catonmat.net -- good coders code, great coders reuse
**
** A simple proxy server written in node.js.
**
*/

var http = require('http');
var sys  = require('sys');
var fs   = require('fs');

var blacklist = [];
var iplist    = [];

fs.watchFile('./blacklist', function(c,p) { update_blacklist(); });
fs.watchFile('./iplist', function(c,p) { update_iplist(); });

function update_blacklist() {
  fs.stat('./blacklist', function(err, stats) {
    if (!err) {
      sys.log("Updating blacklist.");
      blacklist = fs.readFileSync('./blacklist').split('\n')
                  .filter(function(rx) { return rx.length })
                  .map(function(rx) { return RegExp(rx) });
    }
  });
}

function update_iplist() {
  fs.stat('./iplist', function(err, stats) {
    if (!err) {
      sys.log("Updating iplist.");
      iplist = fs.readFileSync('./iplist').split('\n')
               .filter(function(rx) { return rx.length });
    }
  });
}

function ip_allowed(ip) {
 return true;
}

function host_allowed(host) {
  
  return true;
}

function deny(response, msg) {
  response.writeHead(401);
  response.write(msg);
  response.end();
}

http.createServer(function(request, response) {
  var ip = request.connection.remoteAddress;
  let data = []
  request.on('data', chunk => {
   console.log(chunk.toString());
  });
  request.on('end', () => {
    console.log(" fdfd" + data.toString()); // 'Buy the milk'
  })
  if (!ip_allowed(ip)) {
    msg = "IP " + ip + " is not allowed to use this proxy";
    deny(response, msg);
    sys.log(msg);
    return;
  }

  if (!host_allowed(request.url)) {
    msg = "Host " + request.url + " has been denied by proxy configuration";
    deny(response, msg);
    sys.log(msg);
    return;
  }

  sys.log(ip + ": " + request.method + " " + request.url+ " "+JSON.stringify(request.headers));
 
}).listen(8080);

update_blacklist();
update_iplist();
