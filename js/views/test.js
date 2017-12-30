App.Views.Test = Backbone.View.extend({

  className: "test row-fluid",

  initialize() {
    this.render();

    return this.on("show resize", function() {
      return this.center();
    });
  },

  render() {
    const t = this.model; // test

    // Add question card.
    const $question = $('<div class="question offset1 span3"></div>');
    const questionCard = new App.Views.Card({model: t.card}).show(t.type.question);
    $question.append(questionCard.$el);

    // Add option cards.
    const $options = $('<div class="options span8"></div>');
    _.each(t.options, (card, i) => {
      const option = new App.Views.Card({model: card, i});

      // Show answer part of card.
      option.show(t.type.answer);

      // Add listener for click.
      option.on("click", function() {
        // Check result and mark accordingly.
        if (t.check(card) === true) {
          return option.$el.addClass("correct");
        } else {
          option.$el.addClass("incorrect");
          return option.show(t.type.question);
        }
      });

      return $options.append(option.$el);
    });

    // Add to dom.
    return this.$el.append($question, $options);
  }

});