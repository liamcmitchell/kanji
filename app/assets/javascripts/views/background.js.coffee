App.Views.Background = Backbone.View.extend(

	className: 'background'

	initialize: ->
		@running = true
		@$transition = $('<div class="transition"></div>')
		@$wall = $('<div class="kanji-wall"></div>')
		@$el.append @$transition
		@$transition.append @$wall
		@state = 0

		# Different rendering on small devices because of stutter
		if $(window).width() < 768
			@lite = true
			@$el.addClass('lite')
		else
			@lite = false
			@interval = setInterval(
				=>
					@transit()
				, 1000
			)

		@render()
		@transit()

		$(window).resize => 
      @render() if @running

		@on "remove", ->
			@running = false
			clearInterval(@interval)
			@$wall.remove()
			@$transition.remove()

	render: ->
		# Enlarge if needed
		if (@$wall.width() < @$el.width() + 230)
			@$wall.width(@$el.width() + 200)
			
			# Fill with kanji
			until @full()
				content = ''
				for [1..100]
					level = 'jlpt' + Math.floor((Math.random() * 4) + 1)
					kanji = KANJIS[level][Math.floor((Math.random() * KANJIS[level].length))]
					if @lite
						content += kanji
					else
						content += '<span class="' + level + '">' + kanji + '</span>'
						
				@$wall.append content

	# Return true when wall is bigger than app
	full: ->
		if @$wall.height() > @$el.height() + 200
			true
		else
			false

	# Transition
	transit: ->
		@state = @state + 0.1
		x = Math.sin(@state) * 40
		y = Math.sin(@state * 1.6) * 60
		r = Math.sin(@state / 2.5) * 2
		transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + r + 'deg)'
		@$transition[0].style.transform = transform
		for prefix in ['webkit', 'moz', 'ms', 'o']
			@$transition[0].style[prefix + 'Transform'] = transform

	# Highlights kanji
	highlight: (level) ->
		@$wall.removeClass('jlpt1 jlpt2 jlpt3 jlpt4')
		if level
			@$wall.addClass(level)
)