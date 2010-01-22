var DojoPlugin = {
  _service: null,
  _json: null,
    
  onLoad: function() 
  {
    try {
      netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
      Components.utils.import("resource://dojoresource/modules/dojomod.js", this);
      this._service = this.DojoModule.service();
      this._service.setJQuery($dojoJQ);
      
      this._json = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON);
    } catch (e) {
      dump("Error: " + e);
    }
  },
  
  onUnload: function() {
  },
  
  visitHome: function(e) 
  {
    if (e && (e.button == 2)) {
      return;
    }
    
    this.loadURL("http://www.hackerdojo.com/");
  },

  loadURL: function(url)
  {
    var window_mediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
    var browser = window_mediator.getBrowser();
    browser.selectedTab = browser.addTab();
    browser.webNavigation.loadURI(url, Components.interfaces.nsIWebNavigation.LOAD_FLAGS_NONE, null, null, null);
  }
};

window.addEventListener("load", function(e) { DojoPlugin.onLoad(e); }, false); 
window.addEventListener("unload", function(e) { DojoPlugin.onUnload(e); }, false); 
