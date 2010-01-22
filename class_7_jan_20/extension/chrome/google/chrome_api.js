var ExtensionAPI = {
  visitUrl: function(url) {
     chrome.tabs.create({url: url}, function() {});
  },
  
  sendEmail: function(contact_email, subject, url) {
     chrome.extension.sendRequest({open_mail: true, url: url, contact_email: contact_email, subject: subject}, function(response) {});
  },
  
  getVisitedUrls: function(callback) {
     chrome.extension.sendRequest({get_visited: true}, callback);
  }
};