/* Based on Alex Arnell's inheritance implementation, extracted from prototype.js */

(function(){
   function toArray(iterable) {
     if (!iterable) return [];
     var length = iterable.length || 0, results = new Array(length);
     while (length--) results[length] = iterable[length];
     return results;
   }
   
   function isFunction(obj) {
      return typeof obj == "function"
   }
   
   function keys(object) {
     var keys = [];
     for (var property in object)
       keys.push(property);
     return keys;
   }
   
   function extend(destination, source) {
     for (var property in source)
       destination[property] = source[property];
     return destination;
   }
   
   function argumentNames(obj) {
       var names = obj.toString().match(/^[\s\(]*function[^(]*\(([^\)]*)\)/)[1]
         .replace(/\s+/g, '').split(',');
       return names.length == 1 && !names[0] ? [] : names;
   }
   
   function bind(self) {
     if (arguments.length < 2 && undefined === arguments[0]) return this;
     var argsArray = toArray(arguments);
     argsArray.shift();
     var __method = self, args = argsArray, object = args.shift();
     return function() {
       return __method.apply(object, args.concat(toArray(arguments)));
     }
   }
   
   function wrap(self, wrapper) {
       var __method = self;
       return function() {
         return wrapper.apply(this, [bind(__method, this)].concat(toArray(arguments)));
       }
   }

   window.Class = (function() {
     function subclass() {};
     function create() {
       var parent = null, properties = toArray(arguments);
       if (isFunction(properties[0]))
         parent = properties.shift();

       function klass() {
         this.initialize.apply(this, arguments);
       }

       extend(klass, Class.Methods);
       klass.superclass = parent;
       klass.subclasses = [];

       if (parent) {
         subclass.prototype = parent.prototype;
         klass.prototype = new subclass;
         parent.subclasses.push(klass);
       }

       for (var i = 0; i < properties.length; i++)
         klass.addMethods(properties[i]);

       if (!klass.prototype.initialize)
         klass.prototype.initialize = Prototype.emptyFunction;

       klass.prototype.constructor = klass;
       return klass;
     }

     function addMethods(source) {
       var ancestor   = this.superclass && this.superclass.prototype;
       var properties = keys(source);

       for (var i = 0, length = properties.length; i < length; i++) {
         var property = properties[i], value = source[property];
         if (ancestor && isFunction(value) &&
             argumentNames(value)[0] == "$super") {
           var method = value;
           value = wrap((function(m) {
             return function() { return ancestor[m].apply(this, arguments); };
           })(property), method);
         }
         this.prototype[property] = value;
       }

       return this;
     }

     return {
       create: create,
       Methods: {
         addMethods: addMethods
       }
     };
   })();
})();
