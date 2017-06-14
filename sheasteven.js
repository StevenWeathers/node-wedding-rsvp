var dotenv = require('dotenv');
dotenv.load();
var Path = require('path');
var Hapi = require('hapi');
var Joi = require('joi');

var AWS = require('aws-sdk');
AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_KEY, region: 'us-east-1'});
var ses = new AWS.SES();

// Create a server with a host and port
var server = new Hapi.Server();
server.connection({
    port: 6969 
});

var handlebars = require("handlebars");
var fs = require("fs");
var emailTemplateDir = Path.join(__dirname, './email-templates');
var inquireTemplate = handlebars.compile(fs.readFileSync(emailTemplateDir+"/rsvp.html", "utf8"));

server.views({
    engines: {
        hbs: require('handlebars')
    },
    path: Path.join(__dirname, 'views'),
    isCached: false
});

server.route({
    method: 'POST',
    path: '/rsvp',
    config: {
      validate: {
        payload: {
            name: Joi.string().required(),
            numberGuests: Joi.number().required(),
            attending: Joi.string().required()
        }
      }
    },
    handler: function (request, reply) {
      // Setup Amazon SES for Email Sending
      var rsvpHtml = inquireTemplate({name: request.payload.name, numberGuests: request.payload.numberGuests, attending: request.payload.attending});

      var sesParams = {
        Destination: {
          ToAddresses: [
            'steven@weathers.me',
            'snh759@gmail.com'
          ]
        },
        Message: {
          Body: {
            Html: {
              Data: rsvpHtml
            },
            Text: {
              Data: 'From: '+request.payload.name+'\r\n\r\nNumber of Guests: '+request.payload.numberGuests
            }
          },
          Subject: {
            Data: 'New Wedding RSVP by ' + request.payload.name
          }
        },
        ReplyToAddresses: ['no-reply@stevenweathers.com'],
        Source: 'no-reply@stevenweathers.com'
      };

      ses.sendEmail(sesParams, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          reply('Sorry, RSVP submission failed, please try again later.');
        } else {
          // successful response
          reply('Your RSVP was succesfully submitted.');
        }
      });
    }
  });

server.route({
    method: 'GET',
    path: '/static/{param*}',
    handler: {
        directory: {
            path: 'public'
        }
    }
});

// Add the route
server.route({
    method: 'GET',
    path:'/',
    handler: function (request, reply) {
       reply.view('index');
    }
});

// Start the server
server.start();