var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    qs = require("querystring");
    port = process.argv[2] || 8888;

http.createServer(function(request, response) {
  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);

    switch(request.method){
      case "GET" : handleGet(request,response,filename); break;
      case "PUT" : handlePut(request,response,filename); break;
      case "POST": handlePost(request,response,filename); break;
    }
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");

function handleGet (request,response,filename) {

  fs.exists(filename, function(exists) {
    if(!exists) { 
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {    // file cannot be read is an error for get; not put or post
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }
      var contentTypesByExtension = {
        '.html': "text/html",
        '.css':  "text/css",
        '.js':   "text/javascript"
      };

      var headers = {};
      var contentType = contentTypesByExtension[path.extname(filename)];
      if (contentType) headers["Content-Type"] = contentType;
      response.writeHead(200, headers);
      response.write(file, "binary");
      response.end();
    });
  });
}

function handlePost (request,response,filename) {
  saveFile(request,response,filename);
}

function handlePut (request,response,filename) {
  saveFile(request,response,filename);
}

function saveFile(request,response,filename) {
  var dataToSave="";
  request.on('data', function(data) {
    dataToSave += data;
    if(dataToSave.length > 1e6) {
        dataToSave = "";
        response.writeHead(413, {'Content-Type': 'text/plain'}).end();
        request.connection.destroy();
    }
  });

  request.on('end', function() {
    fs.appendFile(filename,dataToSave,{"flag": "w"},function(err){
      if(err){
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }
      else{
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end();
        return;        
      }
    });
  });

}
