// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

var App = App || {};
App.Kanji = {
  list: {},
  get: function(kanji) {
    k = this;
    if (k.list[kanji] == null) {
      $.ajax({
        url:'/kanjis/' + kanji + '.json',
        type:'GET',
        success: function(data) {
          if (data[0] != null)
            k.list[data[0]['literal']] = data[0];
        }
      });
    }
    console.log(k.list);
    if (k.list.hasOwnProperty(kanji)) {
      console.log('whaaaaat');
      return k.list[kanji];
    }
  }
};
