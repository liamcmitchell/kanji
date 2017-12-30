App.Views.Card = Backbone.View.extend({

  className: "card clearfix",

  events: {
    'click': 'click'
  },

  initialize() {
    return this.render();
  },

  render() { 
    // prepare variables
    let i;
    const {kanji} = this.model;

    const kunyomi = kanji.kunyomi.split(", ");
    for (i = 0; i < kunyomi.length; i++) {
      const k = kunyomi[i];
      if (k.search(/\./) > 0) {
        const pieces = k.split(".");
        kunyomi[i] = pieces[0] + "<span class=\"suffix\">" + pieces[1] + "</span>";
      }
    }

    const meanings = kanji.meaning.split(", ");
    for (i = 0; i < meanings.length; i++) {
      const m = meanings[i];
      const comma = (i + 1) === meanings.length ? '' : ', ';
      meanings[i] = `<span class="word">${m}${comma}</span>`;
    }

    const variables = {
      literal: kanji.literal,
      meaning: meanings.join(''),
      onyomi: kanji.onyomi,
      kunyomi: kunyomi.join(', '),
    };

    return this.$el.html(Handlebars.compile($('#card').html())(variables));
  },

  show(c) {
    const all = "literal meaning reading";
    if (c === "all") { c = all; }
    this.$el.removeClass(all).addClass(c);
    return this;
  }, // for chaining

  click() {
    // Trigger backbone events
    return this.trigger('click', this);
  }
});