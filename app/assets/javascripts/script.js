/* Author: Liam Mitchell <mail@liam.geek.nz> */

$(document).ready(function() {
  
  $.ajaxSetup({
    data: {
      authenticity_token: $('meta[name=csrf-token]').attr("content")
    },
    dataType: "json"
  });
  
  App();
  
});
