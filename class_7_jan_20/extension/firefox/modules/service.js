const EXPORTED_SYMBOLS = ['HackerFairModule'];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

var HackerFairModule = {
  _service: null,
  
  service: function() {
    this._service = this._service || new HackerFairService();
    return this._service;
  }
};

function HackerFairService() {
  try {
    // preload the hidden window
    this._growlInstalled = false;
    this._hiddenWindow = Cc["@mozilla.org/appshell/appShellService;1"].getService(Ci.nsIAppShellService).hiddenDOMWindow;
    this._hiddenWindow.document.location = 'about:blank';

  } catch (e) {
    dump(e);
  }
}

HackerFairService.prototype = {
  //classDescription: "HackerFairModule Service",
  //contractID: "@mozilla.org/HackerFairModule/service;1",
  //classID: Components.ID("{cf80de10-5d57-11dd-ad8b-0800200c9a69}"),
  QueryInterface: XPCOMUtils.generateQI([Ci.nsISupports]),

  away: false,
  _jquery: null,
  _scriptCache: {},
  
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
