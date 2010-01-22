// Mashup script for HackerFair by Dean Mao
// used under GPL permission
//
// script-compiler adapted from bettergmail
// from Gina Trapani
// used under GPL permission
//
// getUrlContents adapted from Greasemonkey Compiler
// http://www.letitblog.com/code/python/greasemonkey.py.txt
// used under GPL permission
//
// most everything else below based heavily off of Greasemonkey
// http://greasemonkey.mozdev.org/
// used under GPL permission

var HackerFairGM={
  _prefs: null,
  _scriptCache: {},
  
  isApplicable: function(href) {
    if (! /craigslist/.test(href)) {
      // quick escape if it doesn't match our general pattern
      return null;
    } else {
       return 'craigslist.js'
    }
  },
  
  getUrlContents: function(aUrl){
    var str = null;
    
    if (!this._scriptCache[aUrl]) {
      var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
      var scriptableStream = Components.classes["@mozilla.org/scriptableinputstream;1"].getService(Components.interfaces.nsIScriptableInputStream);

      var channel = ioService.newChannel(aUrl, null, null);
      var input = channel.open();
      scriptableStream.init(input);
      str = scriptableStream.read(input.available());
      scriptableStream.close();
      input.close();
      
      this._scriptCache[aUrl] = str;
    } else {
      // cache file contents in memory for faster future delivery
      str = this._scriptCache[aUrl];
    }

    return str;
  },

  isGreasemonkeyable: function(url) {
    var scheme=Components.classes["@mozilla.org/network/io-service;1"]
      .getService(Components.interfaces.nsIIOService)
      .extractScheme(url);
    return (
      (scheme == "http" || scheme == "https" || scheme == "file") &&
      !/hiddenWindow\.html$/.test(url)
    );
  },

  contentLoad: function(e) {
    var unsafeWin = e.target.defaultView;
    if (unsafeWin.wrappedJSObject) {
      unsafeWin = unsafeWin.wrappedJSObject;
    }

    var unsafeLoc = new XPCNativeWrapper(unsafeWin, "location").location;
    var href = new XPCNativeWrapper(unsafeLoc, "href").href;

    // find out which script matches
    if ( HackerFairGM.isGreasemonkeyable(href) ) {
      var scriptSrc = null;
      var filename = HackerFairGM.isApplicable(href);
      if (filename !== null) {
        scriptSrc = HackerFairGM.getUrlContents('chrome://hackerfair/content/' + filename);
        HackerFairGM.injectScript(scriptSrc, href, unsafeWin, filename);
      }
    }
  },

  injectScript: function(script, url, unsafeContentWin, user_script) {
    var self = this;
    var safeWin = new XPCNativeWrapper(unsafeContentWin);
    var sandbox = new Components.utils.Sandbox(safeWin);
    var xmlhttpRequester=new HackerFair_xmlhttpRequester(unsafeContentWin, window);

    sandbox.window = safeWin;
    sandbox.document = sandbox.window.document;
    sandbox.unsafeWindow = unsafeContentWin;

    // patch missing properties on xpcnw
    sandbox.XPathResult = Components.interfaces.nsIDOMXPathResult;


    // add our own APIs
    sandbox.GM_json_decode=function(json) { return HackerFairPlugin._json.decode(json); };
    sandbox.GM_openInTab=HackerFairGM.hitch(this, "openInTab", unsafeContentWin);
    sandbox.GM_xmlhttpRequest=HackerFairGM.hitch(xmlhttpRequester, "contentStartRequest");
    sandbox.ExtensionAPI = {
       sendEmail: function(contact_email, subject, url) {
          HackerFairPlugin.sendEmail(contact_email, subject, url);
       },

       getVisitedUrls: function(callback) {
          callback({visited: HackerFairPlugin.getVisitedUrls()});
       }
    };
    
    jquerySrc = HackerFairGM.getUrlContents('chrome://hackerfair/content/jquery.js');
    jqueryNoConflictSrc = HackerFairGM.getUrlContents('chrome://hackerfair/content/jquery_noconflict.js');
    script = jquerySrc + jqueryNoConflictSrc + '\n;\ntry {'+script+'} catch(ee3) {GM_log(ee3);}';

    
    //unsupported
    sandbox.GM_registerMenuCommand=function(){};
    sandbox.GM_log=function(message){Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService).logStringMessage(message);};

    sandbox.__proto__=sandbox.window;

    try {
      this.evalInSandbox(
        "(function(){"+script+"})()",
        url,
        sandbox);
    } catch (e) {
      var e2=new Error(typeof e=="string" ? e : e.message);
      e2.fileName=script.filename;
      e2.lineNumber=0;
      Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService).logStringMessage(e2);
    }
  },

  evalInSandbox: function(code, codebase, sandbox) {
    if (Components.utils && Components.utils.Sandbox) {
      // DP beta+
      Components.utils.evalInSandbox(code, sandbox);
    } else if (Components.utils && Components.utils.evalInSandbox) {
      // DP alphas
      Components.utils.evalInSandbox(code, codebase, sandbox);
    } else if (Sandbox) {
      // 1.0.x
      evalInSandbox(code, sandbox, codebase);
    } else {
      throw new Error("Could not create sandbox.");
    }
  },

  openInTab: function(domWindow, url) {
      document.getElementById("content").addTab(url);
  },

  hitch: function(obj, meth) {
    if (!obj[meth]) {
      throw "method '" + meth + "' does not exist on object '" + obj + "'";
    }

    var staticArgs = Array.prototype.splice.call(arguments, 2, arguments.length);

    return function() {
      // make a copy of staticArgs (don't modify it because it gets reused for
      // every invocation).
      var args = staticArgs.concat();

      // add all the new arguments
      for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
      }

      // invoke the original function with the correct this obj and the combined
      // list of static and dynamic arguments.
      return obj[meth].apply(obj, args);
    };
  },

  onLoad: function() {
    var appcontent = window.document.getElementById("appcontent");
    if (appcontent && !appcontent.greased_HackerFairGM) {
      appcontent.greased_HackerFairGM = true;
      appcontent.addEventListener("DOMContentLoaded", HackerFairGM.contentLoad, false);
    }
  },
  
  onUnLoad: function() {
    //remove now unnecessary listeners
    window.removeEventListener('load', HackerFairGM.onLoad, false);
    window.removeEventListener('unload', HackerFairGM.onUnLoad, false);
    if (window.document.getElementById("appcontent")) {
      window.document.getElementById("appcontent").removeEventListener("DOMContentLoaded", HackerFairGM.contentLoad, false);
    }
  }
}; //object HackerFairGM

window.addEventListener('load', HackerFairGM.onLoad, false);
window.addEventListener('unload', HackerFairGM.onUnLoad, false);
