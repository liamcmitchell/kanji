// User model
App.User = Backbone.Model.extend({
  urlRoot: '/users',

  initialize: function() {
    if (this.isSignedIn()) console.log('User ' + this.get('name') + ' loaded');

    this.on('change', function(){
      // don't save if the user is being changed (sign in/out)
      // the id attr shows when this happens
      if (this.isSignedIn() && !this.changedAttributes().hasOwnProperty('id')) {
        console.log('Saving user');
        this.save();
      }
    });

  },

  isSignedIn : function() {
    return !this.isNew();
  },

  signIn: function(auth_key, password, onFail, onSucceed) {
    var u = this;
    $.ajax({
      url       : '/auth/identity/callback',
      type      : 'POST',
      data      : { auth_key : auth_key, password : password },
      error     : onFail,
      success   : function(data, textStatus, jqXHR){
        // server responds with json false if login failed
        if (data) {
          App.reset();
          u.set(data);
          console.log('User ' + u.get('name') + ' loaded');
          onSucceed(data, textStatus, jqXHR);
        }
        else {
          onFail(jqXHR, textStatus, 'Login failed');
        }
      },
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
      console.log('Signed out');
      App.reset();
      App.router.navigate('', true);
    });
  },

  // return level or set if provided
  jlpt: function(level) {
    settings = this.get('settings');

    if (typeof(settings) != 'object') settings = {};
    if (!settings.jlpt) settings.jlpt = null;

    if (level) {
      settings.jlpt = level;
      this.set('settings', settings);
    }

    return settings.jlpt;
  }
});

App.UserView = Backbone.View.extend({
  className: 'user',
  initialize: function(){
    this.render();
    var v = this;
    this.model.on('change:name', function(){ v.render(); });
  },
  render: function(){
    this.$el.html( _.template( $('#user-template').html(), {user: this.model} ) );
  },
  events: {

  }
});

App.UserSettingsView = Backbone.View.extend({
  className: 'settings dialogue',
  initialize: function(){
    this.render();
  },
  render: function(){
    this.$el.html( _.template( $('#user-settings-template').html() ) );
  },
  events: {
    'click a.sign-out': function(){ App.currentUser.signOut(); return false; }
  }
});

App.UserSignInView = Backbone.View.extend({
  className: 'sign-in dialogue',
  initialize: function(){
    this.render();
  },
  render: function(){
    this.$el.html( _.template( $('#user-sign-in-template').html() ) );
  },
  events: {
    'submit #sign-in': 'signInSubmit',
    'submit #register': 'registerSubmit'
  },
  signInSubmit: function(e) {
    var form = $(e.currentTarget);
    App.disableForm(form);
    App.currentUser.signIn(
      form.find('input[name=auth_key]').val(),
      form.find('input[name=password]').val(),
      function(){
        // display error to the user
        App.resetForm(form);
        form.addClass('error');
        App.message('Sign in failed', 'error');
      },
      function(){
        // redirect to start
        App.resetForm(form);
        App.router.navigate('', true);
      }
    );
    return false;
  },
  registerSubmit: function(e){

    return false;
  }
});

App.UserJlptView = Backbone.View.extend({
  className: 'dialogue',
  initialize: function(){
    this.render();
  },
  render: function(){
    var title = 'Select JLPT level';
    if (!App.currentUser.isSignedIn()) {
      title += ' or sign in for saved settings';
    }
    this.$el.html( _.template( $('#jlpt-dialogue-template').html(), {title: title}) );
  },
  events: {
    "click .button:eq(0)": function(){ App.currentUser.jlpt(1); this.callback(); },
    "click .button:eq(1)": function(){ App.currentUser.jlpt(2); this.callback(); },
    "click .button:eq(2)": function(){ App.currentUser.jlpt(3); this.callback(); },
    "click .button:eq(3)": function(){ App.currentUser.jlpt(4); this.callback(); }
  },
  callback: function() {
    if (typeof(this.options.callback) == 'function') this.options.callback();
  }
});
