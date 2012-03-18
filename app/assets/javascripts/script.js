/* Author: Liam Mitchell <mail@liam.geek.nz> */

$(document).ready(function() {
  App.Kanji.get('春秋夏冬', function(){
    App.Tester.start();
  });
});
