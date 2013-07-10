/*
 * Simple static Webserver
 * 
 * History:
 * 28.03.13 mojoaxel: created file
 */
var connect = require('connect');

connect.createServer(
    connect.static(__dirname)
).listen(8080);