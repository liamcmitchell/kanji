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
        for(i=0; i<data.length; i++) {
          K.list[data[i]['literal']] = data[i];
        }
        if (callback && typeof(callback) === 'function')
          callback();
      }
    });
  }
};

App.Tester = {
  start: function() {
    $('#canvas').animate({opacity:1}, 200);
  }
};
