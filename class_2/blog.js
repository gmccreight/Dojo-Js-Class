(function() {
  var undefined;

  function SavedPost(json) {
    with(json) {
        this.html = $('<div class="post">');
        this.title = $('<div class="title">').append(title);
        this.content = $('<p class="content">').append(content);
        this.author = $('<div class="author">').append(author);
    }
    this.html.append(this.title).append(this.content).append(this.author);
  }

  SavedPost.prototype.show = function() {
  };

  function BlogController(selector) {
      this.posts = $(selector);
  }

  BlogController.prototype.list = function() {
    var self = this;
    $.getJSON("http://dojoclass.appspot.com/index?callback=?", function(array) {
      $.each(array, function(index, json) {
          var post = new SavedPost(json);
            self.posts.append(post.html);
      });
    });
  };

  window.BlogController = BlogController;

})();
