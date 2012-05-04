// User model
App.User = Backbone.Model.extend({
  defaults: function(){
    return {
      settings: {}
    };
  },

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
      u.clear();
      u.trigger('signed-out');
    });
  },

  // return level or set if provided
  jlpt: function(level) {
    settings = this.get('settings');

    if (!settings.jlpt) settings.jlpt = null;

    if (level) {
      settings.jlpt = level;
      this.set('settings', settings);
    }

    return settings.jlpt;
  }
});
