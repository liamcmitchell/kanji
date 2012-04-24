/* Author: Liam Mitchell <mail@liam.geek.nz> */

$(document).ready(function() {
  
  // Set ajax defaults
  $.ajaxSetup({
    data: {
      authenticity_token: $('meta[name=csrf-token]').attr("content")
    },
    dataType: "json"
  });
  
  // User model
  var User = Backbone.Model.extend({
    isSignedIn : function() {
      return !this.isNew();
    },

    signIn: function(email, password, onFail, onSucceed) {
      $.ajax({
        url       : '/auth/identity/callback',
        type      : 'POST',
        data      : { auth_key : email, password : password },
        error     : onFail,
        success   : onSucceed,
        context   : this
      });
      return this;
    },

    signOut : function() {
      var u = this;
      $.ajax({
        url       : '/signout.json',
        type    : 'GET'
      }).done(function() {
        console.log(this);
        u.clear();
        u.trigger('signed-out');
      });
    }
  });
  
  // Card model
  var Card = Backbone.Model.extend({
    
    defaults: function() {
      return {
        revisions: 0
      };
    },
  
  });
  
  currentUser = new User(USER);
  
  App();
  
});
