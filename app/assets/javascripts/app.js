// App namespace
window.App = {};

App.options = {
  speed: 150,                   // base unit for animation and pause speed
  testingCardSetSize: 7         // number of cards that will be tested at the same time
};

App.init = function() {

  console.log('App', App);

  // Set ajax defaults
  $.ajaxSetup({
    data: {
      authenticity_token: $('meta[name=csrf-token]').attr("content")
    },
    dataType: "json"
  });

  // log all ajax errors
  $(document).ajaxError(function(event, request, settings){
    console.log('AJAX failed', event, request, settings);
  });

  // use alternate template settings so it will play nice in erb
  _.templateSettings = {
    interpolate: /\<\@\=(.+?)\@\>/gim,
    evaluate: /\<\@(.+?)\@\>/gim
  };

  App.lock            = false;
  App.$canvas         = $('#canvas');
  App.router          = new App.Router;
  App.currentUser     = new App.User(USER);
  App.testingCardSet  = new App.CardSet;
  App.learntCardSet   = new App.CardSet;
  App.previousTests   = new App.Tests;
  App.messages        = new App.Messages;

  App.testTypes = [
    {id: 1, question: 'literal', answer: 'meaning', times: 1},
    {id: 2, question: 'meaning', answer: 'literal', times: 0},
    {id: 3, question: 'literal', answer: 'reading', times: 0},
    {id: 4, question: 'reading', answer: 'literal', times: 0}
  ];

  // set up keyboard listeners
  $(document).bind('keydown.1', function(){ App.$canvas.find('.options > div:eq(0)').trigger('click'); });
  $(document).bind('keydown.2', function(){ App.$canvas.find('.options > div:eq(1)').trigger('click'); });
  $(document).bind('keydown.3', function(){ App.$canvas.find('.options > div:eq(2)').trigger('click'); });
  $(document).bind('keydown.4', function(){ App.$canvas.find('.options > div:eq(3)').trigger('click'); });

  // set user interface
  
  $('#user').html(new App.UserView({model: App.currentUser}).$el);

  Backbone.history.start();

}

// reset app (when user changes)
// TODO move to event bindings?
App.reset = function() {
  App.currentUser.clear();
  App.currentTest = null;
  App.testingCardSet.reset();
  App.learntCardSet.reset();
  App.previousTests.reset();
  App.messages.reset();
}

// app router
App.Router = Backbone.Router.extend({
  initialize: function() {
    this.on('all', function(event){ console.log(event); });
  },
  routes: {
    ""                : "test",
    "settings"        : "settings",
    "settings/level"  : "settings_level",
    "sign-in"         : "signin",
    "sign-out"        : "signout",
    "*splat"          : "defaultRoute"
  },
  test: function() {
    // Make sure we have level needed to test
    if (!App.currentUser.level()) {
      App.destination = ''; // come back after choosing level
      App.router.navigate('settings/level', {trigger: true});
      return;
    }
    App.canvasShow(new App.TesterView());
  },
  settings: function() {
    App.canvasShow(new App.UserSettingsView());
  },
  settings_level: function() {
    App.canvasShow(new App.UserJlptView());
  },
  signin: function() {
    // redirect to root if user is already logged in
    if (App.currentUser.isSignedIn()) this.navigate("", true);
    // otherwise show signin page
    else App.canvasShow(new App.UserSignInView());
  },
  signout: function() {
    App.currentUser.signOut();
  },
  defaultRoute: function(splat){
    // redirect all other paths to root
    this.navigate("", true);
  }
});

App.nextTest = function() {
  
  App.canvasShow(new App.TestView());
}

// Show new view on canvas
App.canvasShow = function(view) {
  App.$canvas.html(view.$el);
};

// Animation functions
App.a = {};

// Slide out old content/slide in new content
App.a.slide = function(container, content) {
  App.lock = true;
  App.a.hide(container, function(){
    container.html(content);
    setTimeout(function(){
      App.lock = false;
      App.a.show(container);
    }, App.options.speed);
  });
}

// hide animation
App.a.hide = function(object, callback) {
  object.css({position: 'relative'}).animate({opacity:0, left: '-100px'}, App.options.speed, 'swing', callback);
};

// show animation
App.a.show = function(object, callback) {
  object.css({position: 'relative', left: '100px'}).animate({opacity: 1, left: '0'}, App.options.speed, 'swing', callback);
};

// form helper
App.disableForm = function(form) {
  form.find('input').attr('disabled', 'disabled');
};

// form helper
App.resetForm = function(form) {
  form.find('input:disabled').removeAttr('disabled');
  form.removeClass('error');
  form.find('.error').remove();
};




