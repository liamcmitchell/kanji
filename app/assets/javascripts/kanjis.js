// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

var App = App || {};

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
  init: function() {
    T = this;
    
    // load kanji to learn
    
    // set up keyboard listeners
    $(document).bind('keydown.1', function(){ T.select(1); });
    $(document).bind('keydown.2', function(){ T.select(2); });
    $(document).bind('keydown.3', function(){ T.select(3); });
    $(document).bind('keydown.4', function(){ T.select(4); });
    
    $.ajax({
      url:'/kanjis.json',
      type:'GET',
      success: function(data) {
        T.toLearn = data;
        T.next();
      }
    });
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
    t.type = 'kanji-meaning';
    t.result = null;
    
    T.canvas = $('#canvas');
    c = T.canvas;
    c.empty();

    c.append(T.theme(t.testing, 'question', t.type));
    
    options = $('<div class="options" />');
    for (i=0; i<t.options.length; i++) {
      option = $(T.theme(t.options[i], 'option', t.type)).click(function() {
        T.select(this);
      });
      options.append(option);
    }
    c.append(options);
    
    c.delay(200).animate({opacity: 1}, 200);
    
    // ready
    T.wait = false;
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
    html = '<div class="box ' + qa + '">';
    if ((qa == 'question' && type == 'kanji-meaning') || (qa == 'answer' && type == 'meaning-kanji')) {
      html = html + '<div class="kanji">' + kanji.literal + '</div>';
    }
    else {
      html = html + kanji.meaning;
      
    }
    html = html + '</div>';
    return $(html).data('kanji', kanji);
  },
  
  // handler for answer selection
  select: function(option) {
    T = this;
    // keyboard
    if (typeof(option) == 'number') {
      option = T.canvas.find('.option')[option - 1];
    }
    option = $(option);
    if (option.data('kanji') == T.current.testing) {
      option.addClass('correct');
      if (T.current.result === null) T.current.result = 'correct';
      if (!T.wait) {
        // wait prevents double action
        T.wait = true;
        // record resultnext test
        
        // fade out to next test
        T.canvas.animate({opacity:0}, 200, function(){ T.next(); });
      }
    }
    else {
      option.addClass('incorrect');
      if (T.current.result === null) T.current.result = 'incorrect';
    }
  }
};
