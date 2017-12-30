App.Views.Level = Backbone.View.extend({

  className: "level-select",

  initialize() {
    this.render();

    return this.on('show resize', function() {
      return this.center();
    });
  },

  render() {
    return this.$el.html(Handlebars.compile($('#level').html())({
      kanjis: {
        jlpt1: KANJI.filter((kanji) => kanji.jlpt === 1).map((kanji) => kanji.literal),
        jlpt2: KANJI.filter((kanji) => kanji.jlpt === 2).map((kanji) => kanji.literal),
        jlpt3: KANJI.filter((kanji) => kanji.jlpt === 3).map((kanji) => kanji.literal),
        jlpt4: KANJI.filter((kanji) => kanji.jlpt === 4).map((kanji) => kanji.literal),
      },
    })
    );
  },

  events: {
    "click .level"(event) {
      App.user.level($(event.currentTarget).attr('level'));
      return this.trigger("select");
    }
  }

});