var should = require('should');
var EventEmitter = require('events').EventEmitter;
var EventRouter = require('../event-router.js');

describe('EventRouter', function () {
  it('should exist', function () {
    should.exist(EventRouter);
  });

  describe('support of API .on(<event name>, <handler>) (e.g. used by EventEmitter)', function () {
    var router;
    var emitter;
    var handlerCalled;
    function handler() {
      handlerCalled++;
    }

    beforeEach(function () {
      router = new EventRouter();
      emitter = new EventEmitter();
      handlerCalled = 0;
    });

    it('should register handler on the event emitter using a special [<emitter-name>] syntax', function () {
      router.setEmitter('objectA', emitter);
      router.on('[objectA]testEvent', handler);
      emitter.emit('testEvent');
      handlerCalled.should.eql(1);
    });

    it('should allow to register handler before emitter', function () {
      router.on('[objectA]testEvent', handler);
      router.setEmitter('objectA', emitter);
      emitter.emit('testEvent');
      handlerCalled.should.eql(1);
    });

    it('should register all handlers again when a new emitter object is provided', function () {
      router.setEmitter('objectA', emitter);
      router.on('[objectA]testEvent', handler);
      emitter.emit('testEvent');
      handlerCalled.should.eql(1);
      // Create a new emitter object and register it again. No need to set handlers again.
      emitter = new EventEmitter();
      router.setEmitter('objectA', emitter);
      emitter.emit('testEvent');
      handlerCalled.should.eql(2);
    });
  });

  describe('support of custom API', function () {
    // Use PropertySupport instance as an emitter object in EventRouter. Note that it has
    // totally different API than e.g. standard EventEmitter.
    function PropertySupport() {
      this._listeners = {};
      this.addPropertyListener = function(propertyName, listener) {
        if (!this._listeners[propertyName]) {
          this._listeners[propertyName] = [];
        }
        this._listeners[propertyName].push(listener);
      };
      this.changeProperty = function(propertyName) {
        if (this._listeners[propertyName]) {
          this._listeners[propertyName].forEach(function (listenerFunc) {
            listenerFunc();
          });
        }
      };
    }
    // This configuration file translates router.on("[emitterName]change:propertyName", handler) calls
    // to API that can be understood by the custom emitter object - instance of PropertySupport.
    var emitterConfig = {
      on: function(emitter, eventDesc, handler) {
        var desc = eventDesc.split(':');
        if (desc[0] === 'change') {
          emitter.addPropertyListener(desc[1], handler);
        }
      }
    };
    var router;
    var emitter;
    var handlerCalled;
    function handler() {
      handlerCalled++;
    }

    beforeEach(function () {
      router = new EventRouter();
      emitter = new PropertySupport();
      handlerCalled = 0;
    });

    it('should register handler on the event emitter using a special [<emitter-name>] syntax', function () {
      router.setEmitter('objectA', emitter, emitterConfig);
      router.on('[objectA]change:testProperty', handler);
      emitter.changeProperty('testProperty');
      handlerCalled.should.eql(1);
    });

    it('should allow to register handler before emitter', function () {
      router.on('[objectA]change:testProperty', handler);
      router.setEmitter('objectA', emitter, emitterConfig);
      emitter.changeProperty('testProperty');
      handlerCalled.should.eql(1);
    });

    it('should register all handlers again when a new emitter object is provided', function () {
      router.on('[objectA]change:testProperty', handler);
      router.setEmitter('objectA', emitter, emitterConfig);
      emitter.changeProperty('testProperty');
      handlerCalled.should.eql(1);
      // Create a new emitter object and register it again. No need to set handlers again.
      emitter = new PropertySupport();
      // Note that you don't have to provide configuration object again.
      router.setEmitter('objectA', emitter);
      emitter.changeProperty('testProperty');
      handlerCalled.should.eql(2);
    });
  });
});
