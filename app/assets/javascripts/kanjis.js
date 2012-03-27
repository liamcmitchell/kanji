// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

var App = function() {
  
  // cache app variable
  var A = this;
  
  // set and localise variables
  var speed = 150;          // base unit for animation and pause speed
  var testingCardsSize = 7; // number of cards that will be tested at the same time
  var timesToClear = 1;     // times each test type needs to be correct before card is learnt
  var wait = false;         // lock
  var canvas = null;        // container for app
  var cards = {};           // holder for all cards used
  var testingCards = [];    // cards currently being tested
  var learntCards = [];     // cards tested and learnt
  var currentTest = null;
  var previousTests = [];
  var testTypes = [
    {id: 1, question: 'literal',   answer: 'meaning'}, 
    {id: 2, question: 'meaning', answer: 'literal'}, 
    {id: 3, question: 'literal',   answer: 'reading'}, 
    {id: 4, question: 'reading', answer: 'literal'}
  ];
  var user = {
    loggedIn: false,
    settings: {
      jlpt: []
    }
  }
  
  // init
  function init() {
    // don't start tester if not on home page
    if (window.location.pathname !== '/') return false;
    
    // set canvas
    canvas = $('#canvas');
    
    // set up keyboard listeners
    $(document).bind('keydown.1', function(){ select(1); });
    $(document).bind('keydown.2', function(){ select(2); });
    $(document).bind('keydown.3', function(){ select(3); });
    $(document).bind('keydown.4', function(){ select(4); });
    
    // load card to learn
    if (user.loggedIn) {
      start();
    }
    else {
      // offer choices of level to start with
      d = $('<div class="dialogue" />');
      d.append(themeTitle('Select a JLPT level to start with or sign in'));
      d.append(themeBox('Level 1 (hardest)', ['button']).click(function(){ user.settings.jlpt.push(1); start(); }));
      d.append(themeBox('Level 2', ['button']).click(function(){ user.settings.jlpt.push(2); start(); }));
      d.append(themeBox('Level 3', ['button']).click(function(){ user.settings.jlpt.push(3); start(); }));
      d.append(themeBox('Level 4 (easiest)', ['button']).click(function(){ user.settings.jlpt.push(4); start(); }));
      canvasShow(d);
    }

  };
  
  // start
  function start() {
    load(function(){ next(); });
  }
  
  // fill up testingCards
  function load(callback) {
    $.ajax({
      url: '/kanjis.json',
      type: 'GET',
      data: {
        jlpt: user.settings.jlpt,
        not_in: literals(testingCards).join('') + literals(learntCards).join(''),
        limit: testingCardsSize - testingCards.length,
        sort: 'random',
        },
      success: function(data) {
        testingCards = testingCards.concat(storeCards(data));
        if (callback && typeof(callback) === "function") callback();
      }
    });
  };
  
  // return references to master list (is this needed?)
  function storeCards(array) {
    out = [];
    for (i=0; i<array.length; i++) {
      cards[array[i]['literal']] = array[i];
      out.push(cards[array[i]['literal']]);
    }
    return out;
  };
  
  // next test
  function next() {
    
    if (currentTest) previousTests.push(currentTest);
    
    // Create new test (t)
    currentTest = {};
    t = currentTest;
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
    
    // empty jquery object to hold content we will eventually display on the canvas
    c = $('<div class="test" />');
    // add question card
    c.append(themeCard(t.card, 'question', t.type));
    // add options to choose from
    options = $('<div class="options" />');
    for (i=0; i<t.options.length; i++) {
      option = $(themeCard(t.options[i], 'answer', t.type)).click(function() {
        select($(this));
      });
      options.append(option);
    }
    c.append(options);
    
    // finally show new test on the canvas
    canvasShow(c);
    
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
  function literals(set) {
    out = [];
    $.each(set, function(index, value){
      if (value && value.literal) out.push(value.literal);
    });
    return out;
  }
  
  // handler for answer selection
  function select(answer) {
    t = currentTest;
    
    // handle keyboard selection 
    if (typeof(answer) == 'number') answer = canvas.find('.answer').eq(answer - 1);
    
    // if no answer quietly fail
    if (!answer.length) return false;
    
    // if correct card was selected (may not be 1st guess)
    if (answer.data('card') == t.card) {
      answer.addClass('correct');
      
      // lock prevents double action while in transition
      if (!wait) {
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
            
            // show user
            $('#learnt').append(t.card.literal).show();
            // get new cards
            load();
          }
        }
        
        // continue to next test
        setTimeout(function(){ next(); }, speed);
      }
    }
    
    // if incorrect
    else {
      if (t.result === null) t.result = 'incorrect';
      answer.addClass('incorrect');
      
      // reset results counter
      t.card.results = {};
      
      // toggle wrong cards display
      if (answer.hasClass(t.type.answer)) answer.removeClass(t.type.answer).addClass(t.type.question);
      else answer.removeClass(t.type.question).addClass(t.type.answer);
      
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
    kunyomi = card.kunyomi.split(', ');
    for (var i = 0; i < kunyomi.length; i++) {
      if (kunyomi[i].search(/\./) > 0) {
        pieces = kunyomi[i].split('.');
        kunyomi[i] =  pieces[0] + '<span class="not-reading">' + pieces[1] + '</span>';
      }
    }
    html = '<div class="literal">' + card.literal + '</div>'
      + '<div class="meaning">' + card.meaning + '</div>'
      + '<div class="onyomi">' + card.onyomi + '</div>'
      + '<div class="kunyomi">' + (kunyomi.join(', ') || '') + '</div>';
    return themeBox(html, [qa, type[qa]]).data('card', card);
  };
  
  // show new content on canvas
  function canvasShow(content) {
    wait = true;
    hide(canvas, function(){
      canvas.empty().append(content);
      setTimeout(function(){
        wait = false;
        show(canvas);  
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
  
  init();
  
  // return object
  return this;
};
