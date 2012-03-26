// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

var App = App || {};
App.speed = 150;
App.testingCardsSize = 7;
App.timesToClear = 1;
App.Card = {
  list: {},
  // return references to master list
  load: function(list) {
    K = this;
    out = [];
    for (i=0; i<list.length; i++) {
      K.list[list[i]['literal']] = list[i];
      out.push(K.list[list[i]['literal']]);
    }
    return out;
  },
  literals: function(list) {
    out = [];
    $.each(list, function(index, value){
      if (value && value.literal) out.push(value.literal);
    });
    return out;
  }
};

App.Tester = {
  testingCards: [],
  learntCards: [],
  previousTests: [],
  wait: false,
  testTypes:[
    {id: 1, question: 'literal',   answer: 'meaning'}, 
    {id: 2, question: 'meaning', answer: 'literal'}, 
    {id: 3, question: 'literal',   answer: 'reading'}, 
    {id: 4, question: 'reading', answer: 'literal'}
  ],
  init: function() {
    // don't start tester if not on home page
    if (window.location.pathname !== '/') return false;
    
    T = this;
    
    // set canvas
    App.Canvas.canvas = $('#canvas');
    
    // set up keyboard listeners
    $(document).bind('keydown.1', function(){ T.select(1); });
    $(document).bind('keydown.2', function(){ T.select(2); });
    $(document).bind('keydown.3', function(){ T.select(3); });
    $(document).bind('keydown.4', function(){ T.select(4); });
    
    // load card to learn
    if (App.User.loggedIn) {
      T.start();
    }
    else {
      // offer choices of level to start with
      d = $('<div class="dialogue" />');
      d.append(App.Theme.title('Select a JLPT level to start with or sign in'));
      d.append(App.Theme.box('Level 1 (hardest)', ['button']).click(function(){ App.User.settings.jlpt.push(1); T.start(); }));
      d.append(App.Theme.box('Level 2', ['button']).click(function(){ App.User.settings.jlpt.push(2); T.start(); }));
      d.append(App.Theme.box('Level 3', ['button']).click(function(){ App.User.settings.jlpt.push(3); T.start(); }));
      d.append(App.Theme.box('Level 4 (easiest)', ['button']).click(function(){ App.User.settings.jlpt.push(4); T.start(); }));
      App.Canvas.show(d);
    }

  },
  start: function() {
    // once testingCards is filled, start testing
    T = this;
    T.load(T.next);    
  },
  load: function(callback) {
    T = this;
    $.ajax({
      url: '/kanjis.json',
      type: 'GET',
      data: {
        jlpt: App.User.settings.jlpt,
        not_in: App.Card.literals(T.testingCards).join('') + App.Card.literals(T.learntCards).join(''),
        limit: App.testingCardsSize - T.testingCards.length,
        sort: 'random',
        },
      success: function(data) {
        T.testingCards = T.testingCards.concat(App.Card.load(data));
        if (callback && typeof(callback) === "function") callback();
      }
    });
  },
  next: function() {
    T = App.Tester;
    
    if (T.testing) T.previousTests.push(T.testing);
    
    // Create new test (t)
    T.testing = {};
    t = T.testing;
    t.options = T.rand(T.testingCards, 4);
    t.card = T.rand(t.options);
    // don't test twice
    if (T.previousTests.length) {
      while (t.card == T.previousTests[T.previousTests.length - 1].testing) { 
        t.card = T.rand(t.options);
      }
    }
    // choose test type from remaining choices
    if (!t.card.hasOwnProperty('results')) t.card.results = {};
    choices = [];
    $.each(T.testTypes, function(index, value){
      if (!t.card.results.hasOwnProperty(value.id)) t.card.results[value.id] = 0;
      if (t.card.results[value.id] < App.timesToClear) choices.push(value);
    });
    t.type = T.rand(choices);
    t.result = null;
    
    // empty jquery object to hold content we will eventually display on the canvas
    c = $('<div class="test" />');

    c.append(App.Theme.card(t.card, 'question', t.type));
    
    options = $('<div class="options" />');
    for (i=0; i<t.options.length; i++) {
      option = $(App.Theme.card(t.options[i], 'answer', t.type)).click(function() {
        T.select(this);
      });
      options.append(option);
    }
    c.append(options);
    
    App.Canvas.show(c);
    
  },
  
  // returns random pieces from array
  rand: function(array, number) {
    if (!number) number = 1;
    if (number > array.length) number = array.length;
    if (number == 1) return array[Math.floor(Math.random() * array.length)];
    else return this.shuffle(array).slice(0, number);
  },
  
  // shuffles array, taken from SO
  shuffle: function (array) {
    var tmp, current, top = array.length;

    if (top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }

    return array;
  },
  
  // handler for answer selection
  select: function(answer) {
    T = App.Tester;
    t = T.testing;
    
    // keyboard
    if (typeof(answer) == 'number') {
      answer = App.Canvas.canvas.find('.answer')[answer - 1];
    }
    
    answer = $(answer);
    
    // if no answer quietly fail
    if (!answer.length) return false;
    
    // if correct card selected (may not be 1st guess)
    if (answer.data('card') == t.card) {
      answer.addClass('correct');
      
      // wait prevents double action while in transition
      if (!T.wait) {
        T.wait = true;
        
        // if correct card was selected first
        if (t.result === null) {
          // mark success
          t.result = 'correct';
          t.card.results[t.type.id] += 1;
          
          // if card has passed requirements, record card as learnt
          learnt = true;
          console.log(T.testTypes);
          console.log(t.card.results);
          $.each(T.testTypes, function(index, value){
            if (t.card.results[value.id] < App.timesToClear) learnt = false;
          });
          if (learnt) {
            // remove from testingCards
            T.testingCards.splice(T.testingCards.indexOf(t.card), 1);
            T.learntCards.push(t.card);
            // post to server
            
            // show user
            $('#learnt').append(t.card.literal).show();
            // get new cards
            T.load();
          }
        }
        
        // continue to next test
        setTimeout(T.next, App.speed);
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
  }
};
App.Theme = {
  box: function(content, classes) {
    if (classes) classes = classes.join(' ');
    else classes = '';
    return $('<div class="box ' + classes + '"></div>').append(content);
  },
  title: function(content, classes) {
    if (classes) classes = classes.join(' ');
    else classes = '';
    return $('<h2 class="' + classes + '"></h2>').append(content);
  },
  card: function(card, qa, type) {
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
    return App.Theme.box(html, [qa, type[qa]]).data('card', card);
  },
};
App.Canvas = {
  canvas: null, // set on init
  show: function(content) {
    c = this.canvas;
    App.Tester.wait = true;
    App.Animate.hide(c, function(){
      c.empty().append(content);
      setTimeout(function(){
        App.Tester.wait = false;
        App.Animate.show(c);  
      }, App.speed);
    });
  }
};
// remove animate later if only used for canvas transition
App.Animate = {
  hide: function(object, callback) {
    object = $(object);
    object.css({position: 'relative'}).animate({opacity:0, left: '-100px'}, App.speed, 'swing', callback);
  },
  show: function(object, callback) {
    object = $(object);
    object.css({position: 'relative', left: '100px'}).animate({opacity: 1, left: '0'}, App.speed, 'swing', callback);
  }
};
App.User = {
  loggedIn: false,
  settings: {
    jlpt: []
  }
};
