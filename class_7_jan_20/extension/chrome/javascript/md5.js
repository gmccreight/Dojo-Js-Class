/*!
 * Crypto-JS v1.1.0
 * http://code.google.com/p/crypto-js/
 * Copyright (c) 2009, Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 */
((function(){
   var base64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

   // Global Crypto object
   window.Crypto = {};

   // Crypto utilities
   var util = Crypto.util = {

      // Bit-wise rotate left
      rotl: function (n, b) {
         return (n << b) | (n >>> (32 - b));
      },

      // Bit-wise rotate right
      rotr: function (n, b) {
         return (n << (32 - b)) | (n >>> b);
      },

      // Swap big-endian to little-endian and vice versa
      endian: function (n) {

         // If number given, swap endian
         if (n.constructor === Number) {
            return util.rotl(n,  8) & 0x00FF00FF |
                   util.rotl(n, 24) & 0xFF00FF00;
         }

         // Else, assume array and swap all items
         for (var i = 0; i < n.length; i++) {
            n[i] = util.endian(n[i]);
         }
         return n;

      },

      // Generate an array of any length of random bytes
      randomBytes: function (n) {
         for (var bytes = []; n > 0; n--) {
            bytes.push(Math.floor(Math.random() * 256));
         }
         return bytes;
      },

      // Convert a string to a byte array
      stringToBytes: function (str) {
         var bytes = [];
         for (var i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i));
         }
         return bytes;
      },

      // Convert a byte array to a string
      bytesToString: function (bytes) {
         var str = [];
         for (var i = 0; i < bytes.length; i++) {
            str.push(String.fromCharCode(bytes[i]));
         }
         return str.join("");
      },

      // Convert a string to big-endian 32-bit words
      stringToWords: function (str) {
         var words = [];
         for (var c = 0, b = 0; c < str.length; c++, b += 8) {
            words[b >>> 5] |= str.charCodeAt(c) << (24 - b % 32);
         }
         return words;
      },

      // Convert a byte array to big-endian 32-bits words
      bytesToWords: function (bytes) {
         var words = [];
         for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
            words[b >>> 5] |= bytes[i] << (24 - b % 32);
         }
         return words;
      },

      // Convert big-endian 32-bit words to a byte array
      wordsToBytes: function (words) {
         var bytes = [];
         for (var b = 0; b < words.length * 32; b += 8) {
            bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
         }
         return bytes;
      },

      // Convert a byte array to a hex string
      bytesToHex: function (bytes) {
         var hex = [];
         for (var i = 0; i < bytes.length; i++) {
            hex.push((bytes[i] >>> 4).toString(16));
            hex.push((bytes[i] & 0xF).toString(16));
         }
         return hex.join("");
      },

      // Convert a hex string to a byte array
      hexToBytes: function (hex) {
         var bytes = [];
         for (var c = 0; c < hex.length; c += 2) {
            bytes.push(parseInt(hex.substr(c, 2), 16));
         }
         return bytes;
      },

      // Convert a byte array to a base-64 string
      bytesToBase64: function (bytes) {

         // Use browser-native function if it exists
         if (typeof btoa === "function") {
            return btoa(util.bytesToString(bytes));
         }
         
         var base64 = [],
             overflow;

         for (var i = 0; i < bytes.length; i++) {
            switch (i % 3) {
               case 0:
                  base64.push(base64map.charAt(bytes[i] >>> 2));
                  overflow = (bytes[i] & 0x3) << 4;
                  break;
               case 1:
                  base64.push(base64map.charAt(overflow | (bytes[i] >>> 4)));
                  overflow = (bytes[i] & 0xF) << 2;
                  break;
               case 2:
                  base64.push(base64map.charAt(overflow | (bytes[i] >>> 6)));
                  base64.push(base64map.charAt(bytes[i] & 0x3F));
                  overflow = -1;
            }
         }

         // Encode overflow bits, if there are any
         if (overflow !== undefined && overflow !== -1) {
            base64.push(base64map.charAt(overflow));
         }

         // Add padding
         while (base64.length % 4 !== 0) {
            base64.push("=");
         }

         return base64.join("");

      },

      // Convert a base-64 string to a byte array
      base64ToBytes: function (base64) {

         // Use browser-native function if it exists
         if (typeof atob === "function") {
            return util.stringToBytes(atob(base64));
         }
         
         // Remove non-base-64 characters
         base64 = base64.replace(/[^A-Z0-9+\/]/ig, "");

         var bytes = [];

         for (var i = 0; i < base64.length; i++) {
            switch (i % 4) {
               case 1:
                  bytes.push((base64map.indexOf(base64.charAt(i - 1)) << 2) |
                             (base64map.indexOf(base64.charAt(i)) >>> 4));
                  break;
               case 2:
                  bytes.push(((base64map.indexOf(base64.charAt(i - 1)) & 0xF) << 4) |
                             (base64map.indexOf(base64.charAt(i)) >>> 2));
                  break;
               case 3:
                  bytes.push(((base64map.indexOf(base64.charAt(i - 1)) & 0x3) << 6) |
                             (base64map.indexOf(base64.charAt(i))));
                  break;
            }
         }

         return bytes;

      }

   };

   // Crypto mode namespace
   Crypto.mode = {};

// Public API
var MD5 = Crypto.MD5 = function (message, options) {
   var digestbytes = util.wordsToBytes(MD5._md5(message));
   return options && options.asBytes ? digestbytes :
          options && options.asString ? util.bytesToString(digestbytes) :
          util.bytesToHex(digestbytes);
};

// The core
MD5._md5 = function (message) {

   var m = util.stringToWords(message),
       l = message.length * 8,
       a =  1732584193,
       b = -271733879,
       c = -1732584194,
       d =  271733878;

   // Swap endian
   for (var j = 0; j < m.length; j++) {
      m[j] = ((m[j] <<  8) | (m[j] >>> 24)) & 0x00FF00FF |
             ((m[j] << 24) | (m[j] >>>  8)) & 0xFF00FF00;
   }

   // Padding
   m[l >>> 5] |= 0x80 << (l % 32);
   m[(((l + 64) >>> 9) << 4) + 14] = l;

   for (var i = 0; i < m.length; i += 16) {

      var aa = a,
          bb = b,
          cc = c,
          dd = d;

      a = MD5._ff(a, b, c, d, m[i+ 0],  7, -680876936);
      d = MD5._ff(d, a, b, c, m[i+ 1], 12, -389564586);
      c = MD5._ff(c, d, a, b, m[i+ 2], 17,  606105819);
      b = MD5._ff(b, c, d, a, m[i+ 3], 22, -1044525330);
      a = MD5._ff(a, b, c, d, m[i+ 4],  7, -176418897);
      d = MD5._ff(d, a, b, c, m[i+ 5], 12,  1200080426);
      c = MD5._ff(c, d, a, b, m[i+ 6], 17, -1473231341);
      b = MD5._ff(b, c, d, a, m[i+ 7], 22, -45705983);
      a = MD5._ff(a, b, c, d, m[i+ 8],  7,  1770035416);
      d = MD5._ff(d, a, b, c, m[i+ 9], 12, -1958414417);
      c = MD5._ff(c, d, a, b, m[i+10], 17, -42063);
      b = MD5._ff(b, c, d, a, m[i+11], 22, -1990404162);
      a = MD5._ff(a, b, c, d, m[i+12],  7,  1804603682);
      d = MD5._ff(d, a, b, c, m[i+13], 12, -40341101);
      c = MD5._ff(c, d, a, b, m[i+14], 17, -1502002290);
      b = MD5._ff(b, c, d, a, m[i+15], 22,  1236535329);

      a = MD5._gg(a, b, c, d, m[i+ 1],  5, -165796510);
      d = MD5._gg(d, a, b, c, m[i+ 6],  9, -1069501632);
      c = MD5._gg(c, d, a, b, m[i+11], 14,  643717713);
      b = MD5._gg(b, c, d, a, m[i+ 0], 20, -373897302);
      a = MD5._gg(a, b, c, d, m[i+ 5],  5, -701558691);
      d = MD5._gg(d, a, b, c, m[i+10],  9,  38016083);
      c = MD5._gg(c, d, a, b, m[i+15], 14, -660478335);
      b = MD5._gg(b, c, d, a, m[i+ 4], 20, -405537848);
      a = MD5._gg(a, b, c, d, m[i+ 9],  5,  568446438);
      d = MD5._gg(d, a, b, c, m[i+14],  9, -1019803690);
      c = MD5._gg(c, d, a, b, m[i+ 3], 14, -187363961);
      b = MD5._gg(b, c, d, a, m[i+ 8], 20,  1163531501);
      a = MD5._gg(a, b, c, d, m[i+13],  5, -1444681467);
      d = MD5._gg(d, a, b, c, m[i+ 2],  9, -51403784);
      c = MD5._gg(c, d, a, b, m[i+ 7], 14,  1735328473);
      b = MD5._gg(b, c, d, a, m[i+12], 20, -1926607734);

      a = MD5._hh(a, b, c, d, m[i+ 5],  4, -378558);
      d = MD5._hh(d, a, b, c, m[i+ 8], 11, -2022574463);
      c = MD5._hh(c, d, a, b, m[i+11], 16,  1839030562);
      b = MD5._hh(b, c, d, a, m[i+14], 23, -35309556);
      a = MD5._hh(a, b, c, d, m[i+ 1],  4, -1530992060);
      d = MD5._hh(d, a, b, c, m[i+ 4], 11,  1272893353);
      c = MD5._hh(c, d, a, b, m[i+ 7], 16, -155497632);
      b = MD5._hh(b, c, d, a, m[i+10], 23, -1094730640);
      a = MD5._hh(a, b, c, d, m[i+13],  4,  681279174);
      d = MD5._hh(d, a, b, c, m[i+ 0], 11, -358537222);
      c = MD5._hh(c, d, a, b, m[i+ 3], 16, -722521979);
      b = MD5._hh(b, c, d, a, m[i+ 6], 23,  76029189);
      a = MD5._hh(a, b, c, d, m[i+ 9],  4, -640364487);
      d = MD5._hh(d, a, b, c, m[i+12], 11, -421815835);
      c = MD5._hh(c, d, a, b, m[i+15], 16,  530742520);
      b = MD5._hh(b, c, d, a, m[i+ 2], 23, -995338651);

      a = MD5._ii(a, b, c, d, m[i+ 0],  6, -198630844);
      d = MD5._ii(d, a, b, c, m[i+ 7], 10,  1126891415);
      c = MD5._ii(c, d, a, b, m[i+14], 15, -1416354905);
      b = MD5._ii(b, c, d, a, m[i+ 5], 21, -57434055);
      a = MD5._ii(a, b, c, d, m[i+12],  6,  1700485571);
      d = MD5._ii(d, a, b, c, m[i+ 3], 10, -1894986606);
      c = MD5._ii(c, d, a, b, m[i+10], 15, -1051523);
      b = MD5._ii(b, c, d, a, m[i+ 1], 21, -2054922799);
      a = MD5._ii(a, b, c, d, m[i+ 8],  6,  1873313359);
      d = MD5._ii(d, a, b, c, m[i+15], 10, -30611744);
      c = MD5._ii(c, d, a, b, m[i+ 6], 15, -1560198380);
      b = MD5._ii(b, c, d, a, m[i+13], 21,  1309151649);
      a = MD5._ii(a, b, c, d, m[i+ 4],  6, -145523070);
      d = MD5._ii(d, a, b, c, m[i+11], 10, -1120210379);
      c = MD5._ii(c, d, a, b, m[i+ 2], 15,  718787259);
      b = MD5._ii(b, c, d, a, m[i+ 9], 21, -343485551);

      a += aa;
      b += bb;
      c += cc;
      d += dd;

   }

   return util.endian([a, b, c, d]);

};

// Auxiliary functions
MD5._ff  = function (a, b, c, d, x, s, t) {
   var n = a + (b & c | ~b & d) + (x >>> 0) + t;
   return ((n << s) | (n >>> (32 - s))) + b;
};
MD5._gg  = function (a, b, c, d, x, s, t) {
   var n = a + (b & d | c & ~d) + (x >>> 0) + t;
   return ((n << s) | (n >>> (32 - s))) + b;
};
MD5._hh  = function (a, b, c, d, x, s, t) {
   var n = a + (b ^ c ^ d) + (x >>> 0) + t;
   return ((n << s) | (n >>> (32 - s))) + b;
};
MD5._ii  = function (a, b, c, d, x, s, t) {
   var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
   return ((n << s) | (n >>> (32 - s))) + b;
};

// Package private blocksize
MD5._blocksize = 16;
window.getMD5 = window.Crypto.MD5;
})());
