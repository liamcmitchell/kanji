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
