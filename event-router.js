(function (undefined) {

  // Regexp that parses [eventEmitterName]eventName strings.
  var RE = /\[(.+)\](.+)/;

	function EventRouter() {
    this._emitter = {};
  }

  /**
   * Registers a handler. 
   * Event emitter is chosen using event description string, e.g.:
   * .on("[testEmitter]testEvent", handler) will register
   * handler using 'testEmitter' as an event emitter.
   *
   * To connect name with real object, use .setEmitter() function.
   * @param  {string}   eventDesc
   * @param  {function} handler   
   */
  EventRouter.prototype.on = function(eventDesc, handler) {
    var parsedDesc = RE.exec(eventDesc);
    if (parsedDesc.length !== 3) {
      throw new Error("Incorrect event description " + eventDesc);
    }
    var emitterName = parsedDesc[1];
    var eventName = parsedDesc[2];
    
    this._registerEmitter(emitterName);

    this._setHandler(emitterName, eventName, handler);

    this._emitter[emitterName].handlers.push({
      eventName: eventName,
      handler: handler
    });
  };

  EventRouter.prototype.setEmitter = function(name, emitter, config) {
    this._registerEmitter(name);

    this._emitter[name].emitter = emitter;
    if (config) {
      this._emitter[name].config = config;
    }

    this._setAllHandlers(name);
  };

  EventRouter.prototype._registerEmitter = function(emitterName) {
    if (this._emitter[emitterName] === undefined) {
      this._emitter[emitterName] = {
        emitter: null,
        config: null,
        handlers: []
      };
    }
  };

  EventRouter.prototype._setAllHandlers = function(emitterName) {
    var self = this;
    this._emitter[emitterName].handlers.forEach(function (obj) {
      self._setHandler(emitterName, obj.eventName, obj.handler);
    });
  };

  EventRouter.prototype._setHandler = function(emitterName, eventName, handler) {
    var emitter = this._emitter[emitterName].emitter;
    var config = this._emitter[emitterName].config;
    if (!emitter) {
      // Emitter object isn't available yet.
      return;
    }
    if (config) {
      config.on(emitter, eventName, handler);
    } else {
      emitter.on(eventName, handler);
    }
  };

  // Support node-style modules and AMD.
  if (typeof module === "object" && module && typeof module.exports === "object") {
    module.exports = EventRouter;
  } else if (typeof define === "function" && define.amd) {
    define(function () { return EventRouter; });
  }

  // If there is a window object, that at least has a document property,
  // define Lab.EventRouter.
  if (typeof window === "object" && typeof window.document === "object") {
    window.EventRouter = EventRouter;
  }

}());
