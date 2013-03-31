App.Views.CardView = Backbone.View.extend(
  className: "card box"
  initialize: ->
    @render()

  render: ->
    
    # prepare variables
    kanji = @model.kanji
    kunyomi = kanji.kunyomi.split(", ")
    i = 0

    while i < kunyomi.length
      if kunyomi[i].search(/\./) > 0
        pieces = kunyomi[i].split(".")
        kunyomi[i] = pieces[0] + "<span class=\"not-reading\">" + pieces[1] + "</span>"
      i++

    variables =
      literal: kanji.literal
      meaning: kanji.meaning
      onyomi: kanji.onyomi
      kunyomi: kunyomi.join('')

    @$el.html HandlebarsTemplates['card'](variables)

  show: (c) ->
    all = "literal meaning reading"
    c = all  if c is "all"
    @$el.removeClass(all).addClass c
    this # for chaining
)