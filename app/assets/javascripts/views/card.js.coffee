App.Views.Card = Backbone.View.extend(

  className: "card clearfix"

  events:
    'click': 'click'
  
  initialize: ->
    @render()

  render: -> 
    # prepare variables
    kanji = @model.kanji

    kunyomi = kanji.kunyomi.split(", ")
    for k, i in kunyomi
      if k.search(/\./) > 0
        pieces = k.split(".")
        kunyomi[i] = pieces[0] + "<span class=\"suffix\">" + pieces[1] + "</span>"

    meanings = kanji.meaning.split(", ")
    for m, i in meanings
      comma = if i + 1 == meanings.length then '' else ', '
      meanings[i] = '<span class="word">' + m + comma + '</span>'

    variables =
      literal: kanji.literal
      meaning: meanings.join('')
      onyomi: kanji.onyomi
      kunyomi: kunyomi.join(', ')
      i: if @options.i? then @options.i + 1 else false

    @$el.html HandlebarsTemplates['card'](variables)

  show: (c) ->
    all = "literal meaning reading"
    c = all  if c is "all"
    @$el.removeClass(all).addClass c
    @ # for chaining

  click: ->
    # Trigger backbone events
    @trigger 'click', @
)