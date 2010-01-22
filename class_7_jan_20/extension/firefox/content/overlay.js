var HackerFairPlugin = {
  _service: null,
  _prefs: null,
  _json: null,

  debug: function(message) {
     Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService).logStringMessage(message);
  },
  
  onLoad: function() 
  {
    try {
      netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
      Components.utils.import("resource://hackerfairmods/modules/service.js", this);
      this._service = this.HackerFairModule.service();
      this._service.setJQuery($jq);
      this._prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
      this._json = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON);
      this._helper = new HackerFairHelper(this._prefs.getCharPref(Constants.EMAIL));
    } catch (e) {
       this.debug(e);
    }
    this.initialized = true;
  },
  
  sendEmail: function(contact_email, subject, url) {
     try {
        var body = "";
        if (this._prefs.getPrefType(Constants.BODY_TEMPLATE) == this._prefs.PREF_STRING) {
          body = this._prefs.getCharPref(Constants.BODY_TEMPLATE);
        }
        if (!this._helper) {
           var email = this._prefs.getCharPref(Constants.EMAIL);
           this._helper = new HackerFairHelper(email);
        }
        this.loadURL(this._helper.getMailUrl(contact_email, subject, body, url));
     } catch (e) {
        this.debug(e);
     }
  },
  
  getVisitedUrls: function() {
     if (!this._helper) {
        this._helper = new HackerFairHelper(this._prefs.getCharPref(Constants.EMAIL));
     }
     return this._helper.getVisitedUrls();
  },
  
  refresh: function() {
     if (!this._helper) {
        this._helper = new HackerFairHelper(this._prefs.getCharPref(Constants.EMAIL));
     }
     this._helper.update();
  },
  
  loadURL: function(url)
  {
    var window_mediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
    var browser = window_mediator.getBrowser();
    browser.selectedTab = browser.addTab();
    browser.webNavigation.loadURI(url, Components.interfaces.nsIWebNavigation.LOAD_FLAGS_NONE, null, null, null);
  },
  
  openPreferences: function()  
  {
    window.openDialog("chrome://hackerfair/content/preferences.xul", "", "chrome,centerscreen,resizable=yes", this);
  }
};

window.addEventListener("load", function(e) { HackerFairPlugin.onLoad(e); }, false); 
