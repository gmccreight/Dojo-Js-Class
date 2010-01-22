function HackerFairHelper(email) {
  this.visitedUrls = {};
  if (email) {
     this.setEmail(email);
  }
}

$jq.extend(HackerFairHelper.prototype, {
  update: function() {
    var self = this;
    $jq.getJSON("http://craigslistjobhelper.appspot.com/index?email_hash="+this.email_hash, function(data) {
      if (data) {
        self.visitedUrls = {};
        $jq.each(data, function(i, json) {
          self.visitedUrls[json.url] = json;
        });
      }
    });
  },
  
  getMailUrl: function(contact_email, subject, body, url) {
     var self = this;
     if (this.email_hash) {
        $jq.getJSON("http://craigslistjobhelper.appspot.com/create?"+$jq.param({email_hash: this.email_hash, url: url, contact_email: contact_email}), function(data) {
          if (data) {
             self.visitedUrls[data.url] = data;
          }
        });
        return 'https://mail.google.com/mail/?view=cm&fs=1&tf=1&to='+escape(contact_email)+'&su=' + escape(subject) + '&body=' + escape(body) + escape('\n') + escape(url) + '&zx=STUFF&shva=1&disablechatbrowsercheck=1&ui=1';
     } else {
        return null;
     }
  },
  
  getVisitedUrls: function() {
     return this.visitedUrls;
  },
  
  setEmail: function(email) {
     this.email_hash = getMD5(email);
     this.update();
  },
  
  visited: function(url) {
     return this.visitedUrls[url];
  }
});
