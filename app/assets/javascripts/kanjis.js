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
    T = this;
    
    // load kanji to learn
    if (App.User.loggedIn) {
      
    }
    else {
      // get basic set to play with
      $.ajax({
        url:'/kanjis.json',
        type:'GET',
        success: function(data) {
          T.toLearn = data;
          T.next();
        }
      });
    }
    console.log('ready');
    // set up keyboard listeners
    $(document).bind('keydown.1', function(){ T.select(1); });
    $(document).bind('keydown.2', function(){ T.select(2); });
    $(document).bind('keydown.3', function(){ T.select(3); });
    $(document).bind('keydown.4', function(){ T.select(4); });
    
  },
  next: function() {
    T = this;
    
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
    
    T.canvas = $('#canvas');
    c = T.canvas;
    c.empty();

    c.append(T.theme(t.testing, 'question', t.type));
    
    options = $('<div class="options" />');
    for (i=0; i<t.options.length; i++) {
      option = $(T.theme(t.options[i], 'answer', t.type)).click(function() {
        T.select(this);
      });
      options.append(option);
    }
    c.append(options);
    
    setTimeout(function(){ 
      App.Animate.show(c);
      T.wait = false;
    }, App.speed);
    
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
  
  // print in proper format
  theme: function(kanji, qa, type) {
    html = '<div class="box ' + qa + ' ' + type[qa] + '">'
      + '<div class="kanji">' + kanji.literal + '</div>'
      + '<div class="meaning">' + kanji.meaning + '</div>'
      + '<div class="onyomi">' + kanji.onyomi + '</div>'
      + '<div class="kunyomi">' + kanji.kunyomi + '</div>'
      + '</div>';
    return $(html).data('kanji', kanji);
  },
  
  // handler for answer selection
  select: function(answer) {
    T = this;
    // keyboard
    if (typeof(answer) == 'number') {
      answer = T.canvas.find('.answer')[answer - 1];
    }
    answer = $(answer);
    // if correct
    if (answer.data('kanji') == T.current.testing) {
      answer.addClass('correct');
      if (T.current.result === null) T.current.result = 'correct';
      if (!T.wait) {
        // record resultnext test
        
        // wait prevents double action
        T.wait = true;        
        // animate to next test
        setTimeout(function(){ 
          App.Animate.hide(T.canvas, function(){ T.next(); 
        }); }, App.speed);
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
App.Animate = {
  hide: function(object, callback) {
    object = $(object);
    object.css({position: 'relative'}).animate({opacity:0, left: '-100px'}, App.speed, 'swing', callback);
  },
  show: function(object, callback) {
    object = $(object);
    object.css({position: 'relative', left: '100px'}).animate({opacity: 1, left: '0'}, App.speed, 'linear', callback);
  }
};
App.User = {};
