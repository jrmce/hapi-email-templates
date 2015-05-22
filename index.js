var Joi = require('joi');
var Hoek = require('hoek');
var nodemailer = require('nodemailer');
var emailTemplates = require('email-templates');

var internals = {
  defaults: {
    transporter: nodemailer.createTransport,
    transporterConfig: {}
  },
  options: Joi.object({
    transporter: Joi.func(),
    transporterConfig: Joi.object(),
    templatesDir: Joi.string().required()
  })
};

internals.sendEmail = function(transporter, dir) {
  var mailer = transporter;
  var templatesDir = dir;
  
  return function(templateName, locals, callback) {
    if (typeof templateName !== 'string') {
      callback('Must provide a template name as a string');
      return;
    }

    if (typeof locals === 'function') {
      callback = locals;
      locals = {};
    }

    emailTemplates(templatesDir, function(err, template) {
      if (err) {
        callback(err);
        return;
      }

      template(templateName, locals, function(err, html, text) {
        if (err) {
          callback(err);
          return;
        }

        mailer.sendMail({
          from: locals.from || 'admin',
          to: locals.to,
          subject: locals.subject,
          html: html,
          text: text
        }, function(err, res) {
          if (err) {
            callback(err);
            return;
          }

          callback(null, res);
        });
      });
    });
  };
};

internals.createTransporter = function(options) {
  return nodemailer.createTransport(options.transporter(options.transporterConfig));
};

exports.register = function(server, options, next) {
  var validateOptions = internals.options.validate(options);
  
  if (validateOptions.error) {
    return next(validateOptions.error);
  }

  var settings = Hoek.clone(internals.defaults);
  Hoek.merge(settings, options);

  var transporter = internals.createTransporter(settings);

  server.expose({
    send: internals.sendEmail(transporter, settings.templatesDir)
  });

  next();
};

exports.register.attributes = {
  name: 'hapi-email-templates',
  version: '0.1.0'
};
