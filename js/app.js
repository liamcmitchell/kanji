jQuery(() => App.init());

// App namespace
window.App = {

  Models: {},
  Collections: {},
  Routers: {},
  Views: {},

  options: {
    speed: 200, // base unit for animation and pause speed
    testingCardsSize: 7, // number of cards that will be tested at the same time
  },

  testTypes: [
    {id: 1, question: 'literal', answer: 'meaning', times: 1},
    // {id: 2, question: 'meaning', answer: 'literal', times: 1},
    // {id: 3, question: 'literal', answer: 'reading', times: 1},
    // {id: 4, question: 'reading', answer: 'literal', times: 1},
  ],

  levels: [
    {id: 'jlpt1', desc: 'JLPT 1'},
    {id: 'jlpt2', desc: 'JLPT 2'},
    {id: 'jlpt3', desc: 'JLPT 3'},
    {id: 'jlpt4', desc: 'JLPT 4'}
  ],

  init() {
    this.users = new this.Collections.Users
    this.user     = this.users.at(0) || this.users.create({});
    this.tests    = new this.Collections.Tests;
    this.messages = new this.Collections.Messages;
    this.main     = new this.Views.Main;
    this.router   = new this.Routers.Main;

    return Backbone.history.start();
  },

  // Display a message
  message(message, type) {
    // Handle our json error objects
    if (type == null) { type = 'info'; }
    if (message.errors) {
      message = message.errors.join("<br>");
    }

    return App.messages.add({
      message,
      type
    });
  }
};

// Extend backbone objects

// Used in frame views to replace current content with new
Backbone.View.prototype.show = function(view) {
  this.newView = view;

  const replaceView = () => {
    // Only continue if @newView is the same when this function was made
    if (this.newView === view) {
      if (this.currentView) {
        this.currentView.trigger('remove');
        this.currentView.remove();
      }
      this.currentView = this.newView;
      this.newView = null;
      // Transition
      this.$el.css({opacity: 0}).html(this.currentView.$el).css({
        transition: `all ${App.options.speed}ms linear`,
        opacity: 1
      });
      // Turn off transitions when done
      window.setTimeout(() => this.$el.css({transition: ''}), App.options.speed);
      return this.currentView.trigger('show');
    }
  };

  if (this.currentView) {
    this.$el.css({
      transition: `all ${App.options.speed}ms linear`,
      opacity: 0
    });
    return window.setTimeout(replaceView, App.options.speed * 2);
  } else {
    return replaceView();
  }
};

// Center element vertically
Backbone.View.prototype.center = function() {
  if (!this.marginTop) {
    this.marginTop = 0;
  }

  let margin = (($(window).height() - this.$el.height()) / 2) - 40;
  if (margin < 0) {
    margin = 0;
  }

  if (margin !== this.marginTop) {
    this.$el.css({'margin-top': margin + 'px'});
    return this.marginTop = margin;
  }
};

// Form helper
Backbone.View.prototype.disable = $el => $el.find('input').attr('disabled', 'disabled');

// Form helper
Backbone.View.prototype.enable = function($el) {
  $el.find('input:disabled').removeAttr('disabled');
  $el.removeClass('error');
  return $el.find('.error').remove();
};
