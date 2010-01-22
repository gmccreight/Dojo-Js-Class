var HackerFair_Prefs = {
   debug: function(msg) {
     this._console.logStringMessage(msg);
   },
   
  load: function()
  {
    try {
      this._console = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
      this._emailField = document.getElementById("hackerfair-prefs-email");
      this._bodyTemplateField = document.getElementById("hackerfair-prefs-body-template");

      var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
      if (prefs.getPrefType(Constants.BODY_TEMPLATE) == prefs.PREF_STRING) {
        this._bodyTemplateField.value = prefs.getCharPref(Constants.BODY_TEMPLATE);
      }
      if (prefs.getPrefType(Constants.EMAIL) == prefs.PREF_STRING) {
        this._emailField.value = prefs.getCharPref(Constants.EMAIL);
      }
    } catch(ex) {
       dump(ex);
    }
  },
  
  unload: function()
  {
  },
  
  cancel: function()
  {
    self.close();
  },

  okay: function()
  {
     try {
        var body = this._bodyTemplateField.value;
        var email = this._emailField.value;
        var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
        prefs.setCharPref(Constants.EMAIL, email);
        prefs.setCharPref(Constants.BODY_TEMPLATE, body);
     } catch (e) {
        this.debug(e);
     } finally {
        self.close();
     }
  },
  
  action: function(e)
  {
    var localName = e.originalTarget.localName;
    var isApply = e.originalTarget.getAttribute("apply");
    
    if (localName == "button" || localName == "tab" || isApply == "false") {
      return;
    }
  }
};