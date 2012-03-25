// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

var App = App || {};
App.speed = 150;
App.Kanji = {
  list: {},
  get: function(kanji, callback) {
    K = this;
    $.ajax({
      url:'/kanjis/' + kanji + '.json',
      type:'GET',
      success: function(data) {
        for (i=0; i<data.length; i++) {
          K.list[data[i]['literal']] = data[i];
        }
        if (callback && typeof(callback) === 'function')
          callback();
      }
    });
  }
};

App.Tester = {
  toLearn: [],
  previous: [],
  wait: false,
  types:[
    {question: 'kanji',   answer: 'meaning'}, 
    {question: 'meaning', answer: 'kanji'}, 
    {question: 'kanji',   answer: 'reading'}, 
    {question: 'reading', answer: 'kanji'}
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
    
    // load kanji to learn
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
    // once toLearn is filled, start testing
    T = this;
    T.load(T.next);    
  },
  load: function(callback) {
    $.ajax({
      url: '/kanjis.json',
      type: 'GET',
      data: App.User.settings,
      success: function(data) {
        T.toLearn = data;
        if (callback && typeof(callback) === "function") callback();
      }
    });
  },
  next: function() {
    T = App.Tester;
    
    if (T.current) T.previous.push(T.current);
    
    // Create new test (t)
    T.current = {};
    t = T.current;
    t.options = T.rand(T.toLearn, 4);
    t.testing = T.rand(t.options);
    // don't test twice
    if (T.previous.length) {
      while (t.testing == T.previous[T.previous.length - 1].testing) { 
        t.testing = T.rand(t.options);
      }
    }
    t.type = T.rand(T.types);
    t.result = null;
    
    // empty jquery object to hold content we will eventually display on the canvas
    c = $('<div class="test" />');

    c.append(App.Theme.kanji(t.testing, 'question', t.type));
    
    options = $('<div class="options" />');
    for (i=0; i<t.options.length; i++) {
      option = $(App.Theme.kanji(t.options[i], 'answer', t.type)).click(function() {
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
    
    // keyboard
    if (typeof(answer) == 'number') {
      answer = App.Canvas.canvas.find('.answer')[answer - 1];
    }
    
    answer = $(answer);
    
    // if no answer quietly fail
    if (!answer.length) return false;
    
    // if correct
    if (answer.data('kanji') == T.current.testing) {
      answer.addClass('correct');
      if (T.current.result === null) T.current.result = 'correct';
      if (!T.wait) {
        // record resultnext test
        
        // wait prevents double action
        T.wait = true;        
        // animate to next test
        setTimeout(T.next, App.speed);
      }
    }
    // if incorrect
    else {
      answer.addClass('incorrect');
      if (T.current.result === null) T.current.result = 'incorrect';
      // toggle wrong cards display
      if (answer.hasClass(T.current.type.answer)) answer.removeClass(T.current.type.answer).addClass(T.current.type.question);
      else answer.removeClass(T.current.type.question).addClass(T.current.type.answer);
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
  kanji: function(kanji, qa, type) {
    // make verb stem bold
    kunyomi = kanji.kunyomi.split(', ');
    for (var i = 0; i < kunyomi.length; i++) {
      if (kunyomi[i].search(/\./) > 0) {
        pieces = kunyomi[i].split('.');
        kunyomi[i] =  pieces[0] + '<span class="not-reading">' + pieces[1] + '</span>';
      }
    }
    html = '<div class="kanji">' + kanji.literal + '</div>'
      + '<div class="meaning">' + kanji.meaning + '</div>'
      + '<div class="onyomi">' + kanji.onyomi + '</div>'
      + '<div class="kunyomi">' + (kunyomi.join(', ') || '') + '</div>';
    return App.Theme.box(html, [qa, type[qa]]).data('kanji', kanji);
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
