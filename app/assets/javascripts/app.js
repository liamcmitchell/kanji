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
  App.cards           = new App.CardSet;
  App.testingCardSet  = new App.CardSet;
  App.learntCardSet   = new App.CardSet;
  App.previousTests   = new App.Tests;
  App.messages        = new App.Messages;

  App.testTypes = [
    {id: 1, question: 'literal', answer: 'meaning', times: 1},
    {id: 2, question: 'meaning', answer: 'literal', times: 1},
    {id: 3, question: 'literal', answer: 'reading', times: 1},
    {id: 4, question: 'reading', answer: 'literal', times: 1}
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
App.reset = function() {
  App.currentUser.clear();
  App.currentTest = null;
  App.cards.reset();
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
    "": "test",
    "settings": "settings",
    "sign-in": "signIn",
    "*splat": "defaultRoute"
  },
  test: function() {
    App.test();
  },
  settings: function() {
    App.settings();
  },
  signIn: function() {
    App.canvasShow(new App.UserSignInView());
  },
  defaultRoute: function(splat){
    // redirect to root
    this.navigate("", true);
  }
});

// test state
App.test = function() {

  // show current test
  if (App.currentTest) {
    App.canvasShow(new App.TestView({model: App.currentTest}));
  }
  else {
    // if there are cards, make a new test and try again
    if (App.testingCardSet.length) {
      App.currentTest = new App.Test;
      App.test();
    }
    else {
      // if we have jlpt level, get new cards and try again
      if (App.currentUser.jlpt()) {
        App.testingCardSet.update(function(){ App.test(); });
      }
      else {
        // prompt for level and try again
        App.canvasShow(new App.UserJlptView({callback: App.test}));
      }
    }
  }

};

// settings state
App.settings = function() {
  App.canvasShow(new App.UserSettingsView());
};

// show new view on canvas
App.canvasShow = function(view) {
  App.lock = true;
  App.hide(App.$canvas, function(){
    App.$canvas.empty().html(view.$el);
    setTimeout(function(){
      App.lock = false;
      App.show(App.$canvas);
    }, App.options.speed);
  });
};

// hide animation
App.hide = function(object, callback) {
  object.css({position: 'relative'}).animate({opacity:0, left: '-100px'}, App.options.speed, 'swing', callback);
};

// show animation
App.show = function(object, callback) {
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




