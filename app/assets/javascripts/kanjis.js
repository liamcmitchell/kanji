// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

var App = function() {
  
  // cache app variable
  var A = this;
  
  // set and localise variables
  var debug = true;         // for development
  var state = '';           // keeps track of what screen we are on
  var speed = 150;          // base unit for animation and pause speed
  var testingCardsSize = 7; // number of cards that will be tested at the same time
  var timesToClear = 1;     // times each test type needs to be correct before card is learnt
  var wait = false;         // lock
  var $canvas = null;       // container for app
  var $login = null;        // login form
  var $register = null;     // register form
  var cards = {};           // holder for all cards used
  var testingCards = [];    // cards currently being tested
  var learntCards = [];     // cards tested and learnt
  var currentTest = null;
  var previousTests = [];
  var testTypes = [
    {id: 1, question: 'literal', answer: 'meaning'}, 
    {id: 2, question: 'meaning', answer: 'literal'}, 
    {id: 3, question: 'literal', answer: 'reading'}, 
    {id: 4, question: 'reading', answer: 'literal'}
  ];
  // User set elsewhere
  //var currentUser = new User(USER);

  // init
  function init() {
    // don't start tester if not on home page
    if (window.location.pathname !== '/') return false;
    
    // cache dom
    $canvas = $('#canvas');
    $signin = $('#signin').detach().submit(function(){ signInSubmit($(this)); return false; });
    $register = $('#register').detach().submit(function(){ /*registerSubmit(this); return false;*/ });;
    
    // set up keyboard listeners
    $(document).bind('keydown.1', function(){ select(1); });
    $(document).bind('keydown.2', function(){ select(2); });
    $(document).bind('keydown.3', function(){ select(3); });
    $(document).bind('keydown.4', function(){ select(4); });
    
    initUser();
    
    start();

  };
  
  // save given user object and update related objects
  function initUser() {
    if (currentUser.isSignedIn()) {
      $('#user').html('<a href="#">' + currentUser.get('name') + '</a>').click(function(){ return settingsDialogue(); return false; });
    }
    else {
      $('#user').html('<a href="#">Sign in or create account</a>').click(function(){ signInDialogue(); return false; });
    }
  }
  
  // settings dialogue
  function settingsDialogue() {
    if (state == 'settings') return false;
    state = 'settings';
    d = $('<div class="dialogue" />');
    d.append(themeTitle('Settings'));
    d.append(themeBox('Multiple settings available here'));
    d.append(themeBox('Sign out', ['button']).click(function(){ currentUser.signOut(); }));
    d.append(themeBox('Back to learning!', ['button']).click(function(){ start(); }));
    canvasShow(d);
  }
  
  // sign out
  function signOut() {
    $.ajax({
      url: '/signout.json',
      type: 'GET',
      success: function(data) {
        if (data === true) {
          // clear all saved data
          cards = {};
          testingCards = [];
          learntCards = [];
          currentTest = null;
          previousTests = [];
          // replace user with empty object
          initUser({});
          // back to start
          start();
        }
        if (typeof(callback) === "function") callback();
      }
    });
  }
  
  // sign-out trigger
  currentUser.on('signed-out', function(data) {
    // clear all saved data
    cards = {};
    testingCards = [];
    learntCards = [];
    currentTest = null;
    previousTests = [];
    // reset user elements
    initUser();
    // back to start
    start();
  });
  
  // sign in/create account form
  function signInDialogue() {
    if (state == 'signin') return false;
    state = 'signin';
    
    // make sure forms are reset
    $('input', $signin).removeAttr('disabled')
    $('[type=text], [type=password]', $signin).val('');
    $('input', $register).removeAttr('disabled')
    $('[type=text], [type=password]', $register).val('');
    
    d = $('<div class="dialogue" />');
    d.append(themeTitle('Sign in'));
    d.append(themeBox($signin));
    d.append(themeTitle('or create an account'));
    d.append(themeBox($register));
    d.append(themeBox('Actually, no thanks...', ['button']).click(function(){ start(); }));
    canvasShow(d);
  };
  
  // sign in submit handler
  function signInSubmit($form) {
    // remove errors from previous attempts
    $('.error', $form).remove();
    // submit form via ajax
    currentUser.signIn(
      $form.find('input[name=auth_key]').val(),
      $form.find('input[name=password]').val(),
      log,
      function(data, textStatus) {
        // if signed in
        if (data.uid) {
          currentUser.set(data);
          initUser();
          start();
        }
        // if sign in error
        else if (data === false) {
          log(arguments);
          $('#password', $form).val('');
          $('.actions', $form).append('<span class="error">Sign in failed</span>');
          $('input', $form).removeAttr('disabled');
        }
        else {
          log(arguments);
        }
      }
    );
    // disable so it can't be submitted twice
    $('input', $form).attr('disabled', 'disabled');
  };
  
  // start
  function start() {
    state = 'testing';
    // reshow test if testing has already started
    if (currentTest) {
      canvasShow(buildTest(currentTest));
    }
    // start if enough info is available
    else if (jlptLevel()) {
      updateCards(function(){ next(); });
    }
    // otherwise get info needed to start
    else {
      d = $('<div class="dialogue" />');
      d.append(themeTitle('Select a JLPT level to start with or sign in'));
      d.append(themeBox('Level 1 (hardest)', ['button']).click(function(){ jlptLevel(1); start(); }));
      d.append(themeBox('Level 2', ['button']).click(function(){ jlptLevel(2); start(); }));
      d.append(themeBox('Level 3', ['button']).click(function(){ jlptLevel(3); start(); }));
      d.append(themeBox('Level 4 (easiest)', ['button']).click(function(){ jlptLevel(4); start(); }));
      canvasShow(d);
    }
  }
  
  // fill up testingCards
  function updateCards(callback) {
    revised = cardsToUpdate();
    $.ajax({
      url: '/cards/update',
      type: 'POST',
      data: {
        revised: revised,
        jlpt: jlptLevel(),
        limit: testingCardsSize - testingCards.length,
        card_not_in: cardIds(testingCards),
        kanji_not_in: kanjiIds([].concat(testingCards, learntCards))
      }
    }).done(function(data) {
      testingCards = testingCards.concat(data);
      cardsUpdated(revised);
      if (typeof(callback) === "function") callback();
    }).fail(function(){
      cardsNotUpdated(revised);
      log(arguments);
    });
  };
  
  // next test
  function next() {
    
    if (currentTest) previousTests.push(currentTest);
    
    currentTest = newTest();
    
    canvasShow(buildTest(currentTest));
  };
  
  // make new test
  function newTest() {
    t = {};
    t.options = random(testingCards, 4);
    t.card = random(t.options);
    // don't test twice
    if (previousTests.length) {
      while (t.card == previousTests[previousTests.length - 1].card) { 
        t.card = random(t.options);
      }
    }
    // choose test type from remaining choices
    if (!t.card.hasOwnProperty('results')) t.card.results = {};
    choices = [];
    $.each(testTypes, function(index, value){
      if (!t.card.results.hasOwnProperty(value.id)) t.card.results[value.id] = 0;
      if (t.card.results[value.id] < timesToClear) choices.push(value);
    });
    t.type = random(choices);
    t.result = null;
    
    return t;
  };
  
  // build test dom
  function buildTest(test) {
    // empty jquery object to hold content we will eventually display on the canvas
    d = $('<div class="test" />');
    // add question card
    d.append(themeCard(test.card, 'question', test.type));
    // add options to choose from
    options = $('<div class="options" />');
    for (i=0; i<test.options.length; i++) {
      option = $(themeCard(test.options[i], 'answer', test.type)).click(function() {
        select($(this));
      });
      options.append(option);
    }
    d.append(options);
    
    return d;
  };
  
  // returns random pieces from array
  function random(array, number) {
    if (!number) number = 1;
    if (number > array.length) number = array.length;
    if (number == 1) return array[Math.floor(Math.random() * array.length)];
    else return shuffle(array).slice(0, number);
  };
  
  // shuffles array, taken from SO
  function shuffle(array) {
    var tmp, current, top = array.length;
    if (top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }
    return array;
  };
  
  // return array of literals from given cards
  function kanjiLiterals(array) {
    out = [];
    $.each(array, function(index, value){
      if (value && value.kanji) out.push(value.kanji.literal);
    });
    return out;
  }
  
  // return array of ids
  function kanjiIds(array) {
    out = [];
    $.each(array, function(index, card){
      if (card && card.kanji) out.push(card.kanji.id);
    });
    return out;
  }
  
  // return array of ids
  function cardIds(array) {
    out = [];
    $.each(array, function(index, card){
      if (card && card.id) out.push(card.id);
    });
    return out;
  }
  
  // find cards that need updating
  function cardsToUpdate() {
    out = [];
    // only update cards if user is signed in
    if (currentUser.isSignedIn()) {
      $.each(learntCards, function(index, card){
        if (card && !card.update) {
          card.update = 'updating';
          out.push(card.id);
        }
      });
    }
    return out;
  }
  
  // mark cards as updated
  function cardsUpdated(array) {
    $.each(array, function(index, card){
      if (card) {
        card.update = 'updated';
      }
    });
  }
  
  // unmark cards
  function cardsNotUpdated(array) {
    $.each(array, function(index, card){
      if (card) {
        card.update = '';
      }
    });
  }
  
  // handler for answer selection
  function select($answer) {
    t = currentTest;
    
    // handle keyboard selection 
    if (typeof($answer) == 'number') $answer = $canvas.find('.answer').eq($answer - 1);
    
    // if wait lock or no answer quietly fail
    if (wait || !$answer.length) return false;
    
    // if correct card was selected (may not be 1st guess)
    if ($answer.data('card') == t.card) {
      $answer.addClass('correct');
      
      // lock prevents further action once correct answer is selected
      wait = true;
      
      // if correct card was selected first
      if (t.result === null) {
        // mark success
        t.result = 'correct';
        t.card.results[t.type.id] += 1;
        
        // if card has passed requirements, record card as learnt
        learnt = true;
        $.each(testTypes, function(index, value){
          if (t.card.results[value.id] < timesToClear) learnt = false;
        });
        if (learnt) {
          // remove from testingCards
          testingCards.splice(testingCards.indexOf(t.card), 1);
          learntCards.push(t.card);
          // post to server
          
          // show user kanji that has been learnt
          $('#learnt').append(t.card.literal).show();
          // get new cards
          updateCards();
        }
      }
      
      // continue to next test
      setTimeout(function(){ next(); }, speed);
    }
    
    // if incorrect
    else {
      if (t.result === null) t.result = 'incorrect';
      $answer.addClass('incorrect');
      
      // reset results counter
      t.card.results = {};
      
      // toggle wrong cards display
      if ($answer.hasClass(t.type.answer)) $answer.removeClass(t.type.answer).addClass(t.type.question);
      else $answer.removeClass(t.type.question).addClass(t.type.answer);
      
    }
  };
  
  // theme a box div
  function themeBox(content, classes) {
    if (classes) classes = classes.join(' ');
    else classes = '';
    return $('<div class="box ' + classes + '"></div>').append(content);
  };
  
  // theme a title
  function themeTitle(content, classes) {
    if (classes) classes = classes.join(' ');
    else classes = '';
    return $('<h2 class="' + classes + '"></h2>').append(content);
  };
  
  // theme a card
  function themeCard(card, qa, type) {
    // make verb stem bold
    kunyomi = card.kanji.kunyomi.split(', ');
    for (var i = 0; i < kunyomi.length; i++) {
      if (kunyomi[i].search(/\./) > 0) {
        pieces = kunyomi[i].split('.');
        kunyomi[i] =  pieces[0] + '<span class="not-reading">' + pieces[1] + '</span>';
      }
    }
    html = '<div class="literal">' + card.kanji.literal + '</div>'
      + '<div class="meaning">' + card.kanji.meaning + '</div>'
      + '<div class="onyomi">' + card.kanji.onyomi + '</div>'
      + '<div class="kunyomi">' + (kunyomi.join(', ') || '') + '</div>';
    return themeBox(html, [qa, type[qa]]).data('card', card);
  };
  
  // show new content on canvas
  function canvasShow(content) {
    wait = true;
    hide($canvas, function(){
      $canvas.empty().append(content);
      setTimeout(function(){
        wait = false;
        show($canvas);  
      }, speed);
    });
  };
  
  // hide animation
  function hide(object, callback) {
    object.css({position: 'relative'}).animate({opacity:0, left: '-100px'}, speed, 'swing', callback);
  };
  
  // show animation
  function show(object, callback) {
    object.css({position: 'relative', left: '100px'}).animate({opacity: 1, left: '0'}, speed, 'swing', callback);
  };
  
  // return array of levels or nil if none, set levels if argument provided
  function jlptLevel(level) {
    settings = currentUser.get('settings');
    
    if (!settings) settings = {};
    if (!settings.jlpt) settings.jlpt = null;
    
    if (level) {
      settings.jlpt = level;
      currentUser.set('settings', settings);
    }
    
    return settings.jlpt;
  }
  
  // debugging function
  function log(data) {
    if (debug) {
      $.each(arguments, function(k, v){
        console.log(v);
      });
    }
  }
  
  init();
  
  
  // return object
  return this;
};
