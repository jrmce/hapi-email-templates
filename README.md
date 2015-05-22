## Description
Plugin that exposes a `send` method on your hapi server object. The method accepts an ejs template with an optional context object for the template. 

Uses nodemailer and email-templates behind the scenes.


## Usage

```javascript
var Hapi = require('hapi');
var path = require('path');

var server = new Hapi.Server();
server.connection({ port: 80 });

server.register(
  {
    register: require('hapi-email-templates') 
    options: {
      transporter: require('nodemailer-sendgrid-transport'),
      transporterConfig: {
        auth: {
          api_user: 'username',
          api_key: 'password'
        }
      }
    },
    templatesDir: path.resolve(__dirname, 'templates')
    }, function(err) {
});

server.start();
```
