var $DojoCommonLib = {
  addCSSToHeader: function(css, doc) {
    if (doc === undefined || doc === null) {
      doc = document;
    }
    var heads = doc.getElementsByTagName("head");
    if (heads.length > 0) {
      var node = doc.createElement("style");
      node.type = "text/css";
      node.appendChild(doc.createTextNode(css));
      heads[0].appendChild(node); 
    }
  }
};