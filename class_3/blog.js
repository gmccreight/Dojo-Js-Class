(function() {
  var undefined;
  
  function getUrl(action, nameValuePairs, key) {
    nameValuePairs = nameValuePairs || [];
    if (key) {
      nameValuePairs.push({name: 'key', value: key});
    }
    return "http://dojoclass.appspot.com/"+action+"?callback=?&"+$.param(nameValuePairs);
  }
  
  function SavedPost(json) {
    var self = this;
    this.html = $('<div class="post">');
    this.title = $('<div class="title">');
    this.content = $('<p class="content">');
    this.author = $('<div class="author">');
    var deleteButton = $('<button>delete</button>').click(function() {
      self.destroy();
    });
    this.html.append(this.title).append(this.content).append(this.author).children().click(function(){self.edit();});
    this.html.append(deleteButton);
    this.data = json;
    this.view();
  }
  $.extend(SavedPost.prototype, {
    view: function() {
      this.editing = false;
      this.html.find('.save_button').remove();
      this.html.find('.cancel_button').remove();
      this.title.empty().text(this.data.title);
      this.author.empty().text(this.data.author);
      this.content.empty().text(this.data.content);
    },
    
    save: function() {
      var self = this;
      $.getJSON(getUrl('update', this.html.find(":input").serializeArray(), this.data.key), function(data) {
        self.data = data;
        self.view();
      });
    },
    
    destroy: function() {
      var self = this;
      $.getJSON(getUrl('destroy', null, this.data.key), function() {
        self.html.remove();
      });
    },
    
    edit: function() {
      var self = this;
      if (!this.editing) {
        this.editing = true;
        var saveButton = $('<button class="save_button">Save</button>');
        var cancelButton = $('<button class="cancel_button">Cancel</button>');
        saveButton.click(function() {
          self.save();
        });
        cancelButton.click(function() {
          self.view();
        });
        this.title.empty().append($('<input type="text" name="title" size="80">').val(this.data.title));
        this.content.empty().append($('<textarea name="content" rows="5" cols="80">').val(this.data.content));
        this.author.empty().append($('<input type="text" name="author" size="40">').val(this.data.author));
        this.html.append(saveButton).append(cancelButton);
      }
    }
  });
  
  function BlogController(selector) {
    var self = this;
    this.blog = $(selector);
    this.blog.find('.submit').click(function(){self.create();});
    this.form = this.blog.find('.create');
    this.posts = this.blog.find('.list');
    $('input').live('keydown', function(e) {
      e.stopPropagation();
      if (e.which === 13 || e.keyCode === 13) {
        return false;
      }
    });
  }
  
  $.extend(BlogController.prototype, {
    list: function(){
      var self = this;
      this.posts.empty();
      $.getJSON(getUrl('index'), function(array) {
        $.each(array, function(i, json) {
          var post = new SavedPost(json);
          self.posts.append(post.html);
        });
      });
    },
    
    create: function() {
      var self = this;
      $.getJSON(getUrl('create', self.form.serializeArray()), function(json) {
        var post = new SavedPost(json);
        self.posts.append(post.html);
        self.form.find(':input').val('');
      });
    }
  });

  window.BlogController = BlogController;
})();