/* Author: Liam Mitchell <mail@liam.geek.nz> */

$(document).ready(function() {

  // Set ajax defaults
  $.ajaxSetup({
    data: {
      authenticity_token: $('meta[name=csrf-token]').attr("content")
    },
    dataType: "json"
  });

  // Container for App
  var App = (function() {

    // don't start app if not on home page
    if (window.location.pathname !== '/') return false;

    // set and localise variables
    var debug = true;                  // for development
    var state = '';                    // keeps track of what screen we are on
    var speed = 150;                   // base unit for animation and pause speed
    var testingCardsSize = 7;          // number of cards that will be tested at the same time
    var wait = false;                  // lock
    var $canvas = $('#canvas');        // container for app
    var $register = $('#register').detach();// register form
    var $signIn = $('#signin').detach(); // sign in form
    var $userName = $('#user-name');   // link with users name
    var cards = new CardSet;           // holder for all cards used
    var testingCards = new CardSet;    // cards currently being tested
    var learntCards = new CardSet;     // cards tested and learnt
    var currentTest = null;
    var previousTests = [];
    var testTypes = [
      {id: 1, question: 'literal', answer: 'meaning', times: 1},
      {id: 2, question: 'meaning', answer: 'literal', times: 1},
      {id: 3, question: 'literal', answer: 'reading', times: 1},
      {id: 4, question: 'reading', answer: 'literal', times: 1}
    ];
    var currentUser = new User();

    // submit handlers
    $signIn.submit(function(){ signInSubmit($(this)); return false; });
    $register.submit(function(){ /*registerSubmit(this); return false;*/ });;

    // set up keyboard listeners
    $(document).bind('keydown.1', function(){ select(1); });
    $(document).bind('keydown.2', function(){ select(2); });
    $(document).bind('keydown.3', function(){ select(3); });
    $(document).bind('keydown.4', function(){ select(4); });

    // on user signout
    currentUser.on('signed-out', function(){
      // clear all saved data
      cards.reset();
      testingCards.reset();
      learntCards.reset();
      currentTest = null;
      previousTests = [];
      // back to start
      start();
    });

    // on user change
    currentUser.on('change', function(){
      // render user name
      if (currentUser.isSignedIn()) {
        $userName.html(currentUser.get('name'));
      }
      else {
        $userName.html('Sign in or create account');
      }
    });

    // click handler
    $userName.click(function(){ return settingsDialogue(); return false; })

    // settings dialogue
    function settingsDialogue() {
      if (state == 'settings') return false;
      if (!currentUser.isSignedIn()) {
        signInDialogue();
        return false;
      }
      state = 'settings';
      d = $('<div class="dialogue" />');
      d.append(themeTitle('Settings'));
      d.append(themeBox('Multiple settings available here'));
      d.append(themeBox('Sign out', ['button']).click(function(){ currentUser.signOut(); }));
      d.append(themeBox('Back to learning!', ['button']).click(function(){ start(); }));
      canvasShow(d);
    }

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
      $.ajax({
        url: '/cards/update',
        type: 'POST',
        data: {
          jlpt: jlptLevel(),
          limit: testingCardsSize - testingCards.length,
          card_not_in: testingCards.pluck('id'),
          kanji_not_in: cards.pluck('kanji_id')
        }
      }).done(function(data) {
        testingCards.add(data);
        if (typeof(callback) === "function") callback();
      }).fail(function(){
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
      var t = {};
      t.options = testingCards.random(4);
      t.card = t.options.random().at(0);
      // choose a new card to test if it has just been tested
      if (previousTests.length && t.options.length > 1) {
        while (t.card == previousTests[previousTests.length - 1].card) {
          t.card = t.options.random().at(0);
        }
      }
      t.type = t.card.chooseTest(testTypes);
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
        option = $(themeCard(test.options.at(i), 'answer', test.type)).click(function() {
          select($(this));
        });
        options.append(option);
      }
      d.append(options);

      return d;
    };

    // handler for answer selection
    function select($answer) {
      t = currentTest;

      // handle keyboard selection
      if (typeof($answer) == 'number') $answer = $canvas.find('.answer').eq($answer - 1);

      // if wait lock or no answer quietly fail
      if (wait || !$answer.length) return false;

      var results = t.card.get('results');

      // if correct card was selected (may not be 1st guess)
      if ($answer.data('card') == t.card) {

        $answer.addClass('correct');

        // lock prevents further action once correct answer is selected
        wait = true;

        // if correct card was selected first
        if (t.result === null) {

          // mark success
          t.result = 'correct';
          t.card.correctTest(t.type);

          // if card has passed requirements
          if (t.card.completedTests(testTypes)) {

            testingCards.remove(t.card);
            learntCards.add(t.card);

            // show user kanji that has been learnt
            $('#learnt').append(t.card.kanji.literal).show();

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
        t.card.failTest(t.test);

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
      var kanji = card.kanji;
      var kunyomi = kanji.kunyomi.split(', ');
      for (var i = 0; i < kunyomi.length; i++) {
        if (kunyomi[i].search(/\./) > 0) {
          pieces = kunyomi[i].split('.');
          kunyomi[i] =  pieces[0] + '<span class="not-reading">' + pieces[1] + '</span>';
        }
      }
      html = '<div class="literal">' + kanji.literal + '</div>'
        + '<div class="meaning">' + kanji.meaning + '</div>'
        + '<div class="onyomi">' + kanji.onyomi + '</div>'
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

    // begin once everything is loaded
    currentUser.set(USER);
    currentUser.trigger('change');
    start();

  })();


});
