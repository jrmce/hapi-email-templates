var Lab = require('lab');
var Hapi = require('hapi');
var path = require('path');

var lab = exports.lab = Lab.script();
var before = lab.before;
var beforeEach = lab.beforeEach;
var after = lab.after;
var describe = lab.experiment;
var it = lab.test;
var expect = require('code').expect;

var validOptions = function() {
  return {
    transporter: require('nodemailer-stub-transport'),
    templatesDir: path.resolve(__dirname, 'templates')
  };
};

describe('Registration', function() {
  var config;

  beforeEach(function(done) {
    config = validOptions();

    done();
  });
  
  it('should register with valid options', function(done) {
    var server = new Hapi.Server().connection({host: 'test'});

    server.register({register: require('../'), options: config}, function(err) {
      expect(err).to.not.exist();
      done();
    });
  });


  it('should not register without options.templatesDir', function(done) {
    var server = new Hapi.Server().connection({host: 'test'});
    delete config.templatesDir;

    server.register({register: require('../'), options: config}, function(err) {
      expect(err).to.exist();
      done();
    });
  });

  it('should not register with bogus options', function(done) {
    var server = new Hapi.Server().connection({host: 'test'});
    var bogus = {
      foo: 'bar',
      baz: {
        blah: 'tooda'
      }
    };

    server.register({register: require('../'), options: bogus}, function(err) {
      expect(err).to.exist();
      done();
    });
  });

  it('should not register without options', function(done) {
    var server = new Hapi.Server().connection({host: 'test'});

    server.register(require('../'), function(err) {
      expect(err).to.exist();
      done();
    });
  });
    
  it('should expose a send method', function(done) {
    var server = new Hapi.Server().connection({host: 'test'});

    server.register({register: require('../'), options: config}, function(err) {
      expect(err).to.not.exist();
      expect(server.plugins['hapi-email-templates'].send).to.exist();
      done();
    });
  });
});

describe('Sending an email', function() {
  var config;

  beforeEach(function(done) {
    config = validOptions();
    done();
  });

  it('should send an email with a valid template and locals', function(done) {
    var locals = {
      name: 'Johnny',
      email: 'john@kendge.com',
      subject: 'Test 1, 2',
      from: 'me@knedge.com'
    };

    var server = new Hapi.Server().connection({host: 'test'});

    server.register({register: require('../'), options: config}, function(err) {
      var send = server.plugins['hapi-email-templates'].send;

      send('good', locals, function(err, result) {
        expect(err).to.not.exist();
        done();
      });
    });
  });

  it('should not send an email with an invalid template', function(done) {
    var locals = {
      name: 'Johnny',
      email: 'john@kendge.com',
      subject: 'Test 1, 2',
      from: 'me@knedge.com'
    };

    var server = new Hapi.Server().connection({host: 'test'});

    server.register({register: require('../'), options: config}, function(err) {
      var send = server.plugins['hapi-email-templates'].send;

      send('does-not-exist', locals, function(err, result) {
        expect(err).to.exist();
        done();
      });
    });
  });

  it('should not send an email when a template name is not a string', function(done) {
    var locals = {
      name: 'Johnny',
      email: 'john@kendge.com',
      subject: 'Test 1, 2',
      from: 'me@knedge.com'
    };

    var server = new Hapi.Server().connection({host: 'test'});

    server.register({register: require('../'), options: config}, function(err) {
      var send = server.plugins['hapi-email-templates'].send;

      send(1, locals, function(err, result) {
        expect(err).to.exist();
        expect(err).to.contain('Must provide a template name as a string');
        done();
      });
    });
  });

  it('should handle no locals correctly', function(done) {
    var server = new Hapi.Server().connection({host: 'test'});

    server.register({register: require('../'), options: config}, function(err) {
      var send = server.plugins['hapi-email-templates'].send;

      send('no-locals', function(err, result) {
        expect(err).to.not.exist();
        done();
      });
    });
  });

  it('should not send if the templates dir is invalid', function(done) {
    var server = new Hapi.Server().connection({host: 'test'});
    config.templatesDir = path.resolve(__dirname, 'blah');

    server.register({register: require('../'), options: config}, function(err) {
      var send = server.plugins['hapi-email-templates'].send;

      send('good', function(err, result) {
        expect(err).to.exist();
        done();
      });
    });
  });

  it('should throw an error if send fails', function(done) {
    var server = new Hapi.Server().connection({host: 'test'});
    config.transporterConfig = {
      error: new Error('Throwing error')
    };

    server.register({register: require('../'), options: config}, function(err) {
      var send = server.plugins['hapi-email-templates'].send;

      send('good', function(err, result) {
        expect(err).to.exist();
        done();
      });
    });
  });
});
