// App namespace
window.App = {};

App.options = {
  debug: true,                  // for development
  speed: 150,                   // base unit for animation and pause speed
  testingCardSetSize: 7         // number of cards that will be tested at the same time
};

App.init = function() {

  // Set ajax defaults
  $.ajaxSetup({
    data: {
      authenticity_token: $('meta[name=csrf-token]').attr("content")
    },
    dataType: "json"
  });

  // log all ajax errors
  $(document).ajaxError(function(event, request, settings){
    App.log(event, request, settings);
  });

  // use alternate template settings so it will play nice in erb
  _.templateSettings = {
    interpolate: /\<\@\=(.+?)\@\>/gim,
    evaluate: /\<\@(.+?)\@\>/gim
  };

  App.currentUser     = new App.User(USER);
  App.router          = new App.Router;
  App.wait            = false;                    // lock
  App.$canvas         = $('#canvas');             // container for app
  App.$register       = $('#register').detach();  // register form
  App.$signIn         = $('#signin').detach();    // sign in form
  App.$userName       = $('#user-name');          // link with users name
  App.cards           = new App.CardSet;          // holder for all cards used
  App.testingCardSet  = new App.CardSet;          // cards currently being tested
  App.learntCardSet   = new App.CardSet;          // cards tested and learnt
  App.previousTests   = new App.Tests;
  App.testTypes = [
    {id: 1, question: 'literal', answer: 'meaning', times: 1},
    {id: 2, question: 'meaning', answer: 'literal', times: 1},
    {id: 3, question: 'literal', answer: 'reading', times: 1},
    {id: 4, question: 'reading', answer: 'literal', times: 1}
  ];

  // submit handlers
  App.$signIn.submit(function(){ signInSubmit($(this)); return false; });
  App.$register.submit(function(){ /*registerSubmit(this); return false;*/ });

  // set up keyboard listeners
  $(document).bind('keydown.1', function(){ App.$canvas.find('.options > div:eq(0)').trigger('click'); });
  $(document).bind('keydown.2', function(){ App.$canvas.find('.options > div:eq(1)').trigger('click'); });
  $(document).bind('keydown.3', function(){ App.$canvas.find('.options > div:eq(2)').trigger('click'); });
  $(document).bind('keydown.4', function(){ App.$canvas.find('.options > div:eq(3)').trigger('click'); });

  // on user change
  App.currentUser.on('change', function(){
    // render user name TODO change to view
    if (App.currentUser.isSignedIn()) {
      App.$userName.html(App.currentUser.get('name'));
    }
    else {
      App.$userName.html('Sign in or create account');
    }
  });
  App.currentUser.trigger('change');

  // click handler
  App.$userName.click(function(){ return settingsDialogue(); return false; });

}

App.log = function() {
  if (App.options.debug) {
    _.each(arguments, function(v){
      console.log(v);
    });
  }
};

// app router
App.Router = Backbone.Router.extend({
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
    App.signIn();
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
        App.canvasShow(new App.JlptDialogueView());
      }
    }
  }

};

// settings state
App.settings = function() {
  if (App.currentUser.isSignedIn()) {
    App.router.navigate("sign-in", true);
    return false;
  }
  alert('TODO');
}

// prompts for jlpt level
App.JlptDialogueView = Backbone.View.extend({
  className: 'dialogue',
  initialize: function(){
    this.render();
  },
  render: function(){
    this.$el.html( _.template( $('#jlpt-dialogue-template').html() ) );
  },
  events: {
    "click .button:eq(0)": function(){ App.currentUser.jlpt(1); App.test(); },
    "click .button:eq(1)": function(){ App.currentUser.jlpt(2); App.test(); },
    "click .button:eq(2)": function(){ App.currentUser.jlpt(3); App.test(); },
    "click .button:eq(3)": function(){ App.currentUser.jlpt(4); App.test(); }
  }
});
