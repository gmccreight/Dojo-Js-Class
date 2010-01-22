// Mashup script for Hacker Dojo javascript class by Dean Mao
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

var DojoGM={
  _prefs: null,
  _scriptCache: {},
  _scripts:  {
    'reddit.js':  /http:\/\/www\.reddit\.com/
  },
  
  isApplicable: function(href) {
    var scripts = DojoGM._scripts;
    for(var filename in scripts) {
      if (scripts[filename].test(href)) {
         return filename;
      }
    }
    return 'default.js';
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
    if ( DojoGM.isGreasemonkeyable(href) ) {
      var scriptSrc = null;
      var filename = DojoGM.isApplicable(href);
      if (filename !== null) {
        commonSrc = DojoGM.getUrlContents('chrome://dojo/content/user_scripts/common.js');
        scriptSrc = DojoGM.getUrlContents('chrome://dojo/content/user_scripts/' + filename);
        DojoGM.injectScript(commonSrc + scriptSrc, href, unsafeWin, filename);
      }
    }
  },

  injectScript: function(script, url, unsafeContentWin, user_script) {
    var safeWin = new XPCNativeWrapper(unsafeContentWin);
    var sandbox = new Components.utils.Sandbox(safeWin);
    var xmlhttpRequester=new Dojo_xmlhttpRequester(unsafeContentWin, window);

    sandbox.window = safeWin;
    sandbox.document = sandbox.window.document;
    sandbox.unsafeWindow = unsafeContentWin;

    // patch missing properties on xpcnw
    sandbox.XPathResult = Components.interfaces.nsIDOMXPathResult;

    // add our own APIs
    sandbox.GM_json_decode=function(json) { return DojoPlugin._json.decode(json); };
    sandbox.GM_addStyle=function(css) { DojoGM.addStyle(sandbox.document, css); };
    sandbox.GM_openInTab=DojoGM.hitch(this, "openInTab", unsafeContentWin);
    sandbox.GM_xmlhttpRequest=DojoGM.hitch(xmlhttpRequester, "contentStartRequest");
    
    jquerySrc = DojoGM.getUrlContents('chrome://dojo/content/jquery.js');
    jqueryNoConflictSrc = DojoGM.getUrlContents('chrome://dojo/content/jquery_noconflict.js');
    script = jquerySrc + jqueryNoConflictSrc + '\ntry {' + script + '} catch(ee3) {GM_log(ee3);}';
    
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
      dump(e2);
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

  addStyle:function(doc, css) {
    var head, style;
    head = doc.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = doc.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
  },

  onLoad: function() {
    var appcontent = window.document.getElementById("appcontent");
    if (appcontent && !appcontent.greased_DojoGM) {
      appcontent.greased_DojoGM = true;
      appcontent.addEventListener("DOMContentLoaded", DojoGM.contentLoad, false);
    }
  },
  
  onUnLoad: function() {
    //remove now unnecessary listeners
    window.removeEventListener('load', DojoGM.onLoad, false);
    window.removeEventListener('unload', DojoGM.onUnLoad, false);
    if (window.document.getElementById("appcontent")) {
      window.document.getElementById("appcontent").removeEventListener("DOMContentLoaded", DojoGM.contentLoad, false);
    }
  }
}; //object DojoGM



window.addEventListener('load', DojoGM.onLoad, false);
window.addEventListener('unload', DojoGM.onUnLoad, false);