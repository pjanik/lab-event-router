Event Router
===========

It provides simplified event handlers registration and management.

```javascript
  var router = new EventRouter();
  // You can use anything you want, but node's EventEmitter API is supported out of the box.
  var emitter = new EventEmitter(); 
  var handlerCalled = false;
  router.setEmitter('objectA', emitter);
  router.on('[objectA]testEvent', function () {
  	handlerCalled = true;
  });
  emitter.emit('testEvent');
  console.log(handlerCalled); // true
```

No magic yet, but you can also create a new emitter and EventRouter will ensure that previously registered handlers will be still working fine.


```javascript
  emitter = new EventEmitter();
  handlerCalled = false;
  router.setEmitter('objectA', emitter);
  // Note that we don't call router.on('[objectA]testEvent', ...) again.
  emitter.emit('testEvent');
  console.log(handlerCalled); // true
```

You can also provide configuration object to support emitters with completely different API.
Let's assume that ```emitter``` is an object that provides 

```javascript 
.addPropertyListener(name, listener)
``` 
method, however we want to support syntax like: 
```javascript 
router.on('[objectA]change:propertyName', handler)
```
It's enough to provide custom configuration object that will do the API translation.

```javascript
  router.setEmitter('objectA', emitter, {
    on: function (emitter, eventDesc, handler) {
      var desc = eventDesc.split(':');
      if (desc[0] === 'change') {
        emitter.addPropertyListener(desc[1], handler);
      }
    }
  });
  router.on('[objectA]change:testProperty', function () {
    handlerCalled = true;
  });
  handlerCalled = false;
  emitter.set('testProperty', 15);
  console.log(handlerCalled); // true
```

Important: EventRouter doesn't pass events from source to handler. It registers handler directly on the provided emitter object.

### Supported environments

EventRouter works in node, browser and it also supports AMD.

### Docs, test

Take a look at tests (test/test.js) to see other examples and use cases.

To run tests just type ```npm test```
