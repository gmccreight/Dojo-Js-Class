const EXPORTED_SYMBOLS = ['DojoModule'];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

var DojoModule = {
  _service: null,
  
  service: function() {
    this._service = this._service || new DojoModuleService();
    return this._service;
  }
};

function DojoModuleService() {
  try {
    // preload the hidden window
    this._hiddenWindow = Cc["@mozilla.org/appshell/appShellService;1"].getService(Ci.nsIAppShellService).hiddenDOMWindow;
    this._hiddenWindow.document.location = 'about:blank';
    
    var idleService = Cc["@mozilla.org/widget/idleservice;1"].getService(Ci.nsIIdleService)
    idleService.addIdleObserver(this, (6 * 60 * 60 * 1000)); // 8 hours

    var xulRuntime = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);
  } catch (e) {
    dump(e);
  }
}

DojoModuleService.prototype = {
  QueryInterface: XPCOMUtils.generateQI([Ci.nsISupports]),

  away: false,
  _jquery: null,
  _idleService: null,
  
  setJQuery: function(jquery) {
    this._jquery = jquery;
  },
  
  loadURL: function(url)
  {
    var window_mediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("navigator:browser");
    var browser = window_mediator.getBrowser();
    browser.selectedTab = browser.addTab();
    browser.webNavigation.loadURI(url, Ci.nsIWebNavigation.LOAD_FLAGS_NONE, null, null, null);
  }
};
