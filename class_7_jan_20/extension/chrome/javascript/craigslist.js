if ($jq('#flags')[0]) {
   $jq('a').each(function() {
      var anchor = $jq(this);
      var href = anchor.attr('href');
      if (href.match(/^mailto:/)) {
         var matches = href.match(/^mailto:(.+?)\?subject=(.+?)&body/);
         email = matches[1];
         subject = matches[2];
         anchor.attr('href', '#');
         anchor.click(function() {
            var currentLocation = window.location.href;
            ExtensionAPI.sendEmail(email, decodeURIComponent(subject), currentLocation.replace(/#.+?$/, ""));
         });
      }
   });
} else if ($jq('#showPics')[0]) {
   ExtensionAPI.getVisitedUrls(function(response) {
      var visited = response.visited;
      $jq('body > blockquote > p > a').each(function() {
         var anchor = $jq(this);
         var href = "http://" + document.domain + anchor.attr('href');
         if (visited[href]) {
            anchor.text("Replied already: "+anchor.text());
            anchor.css({'margin-left': '100px', 'color': '#ccc'});
         }
      });
   });
}
