// User model
App.User = Backbone.Model.extend({
  urlRoot: '/users',

  initialize: function() {
    if (this.isSignedIn()) console.log('User ' + this.get('name') + ' loaded');

    this.on('change', function(){
      // don't save if the user is being changed (sign in/out)
      // the id attr shows when this happens
      if (this.isSignedIn() && !this.changedAttributes().hasOwnProperty('id')) {
        console.log('Updating user');
        this.save();
      }
    }, this);

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
      type    : 'POST'
    }).done(function() {
      console.log('Signed out');
      App.reset();
      App.router.navigate('', true);
    });
  },

  // return level or set if provided
  level: function(level) {
    settings = this.settings();

    if (typeof(settings) != 'object') settings = {};
    if (!settings.level) settings.level = null;

    if (level) {
      settings.level = level;
      this.settings(settings);
    }

    return settings.level;
  },
  
  // return or set settings object
  // needed to call change event on set
  settings: function(settings) {
    if (settings) {
      this.set('settings', settings);
      this.trigger('change');
    }
    else {
      settings = this.get('settings');
    }
    
    return settings;
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
    App.router.navigate('settings/level');
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
    "click .button:eq(0)": function(){ App.currentUser.level(1); this.close(); },
    "click .button:eq(1)": function(){ App.currentUser.level(2); this.close(); },
    "click .button:eq(2)": function(){ App.currentUser.level(3); this.close(); },
    "click .button:eq(3)": function(){ App.currentUser.level(4); this.close(); }
  },
  close: function() {
    if (typeof App.destination == 'string') {
      App.router.navigate(App.destination, true);
      App.destination = null;
    }
    else App.router.navigate('settings', true);
  }
});
