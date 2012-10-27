class CardsController < ApplicationController
  # GET /cards
  # GET /cards.json
  def index
    if current_user then
      @cards = current_user.cards
    end

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @cards }
    end
  end

  # POST /cards/next
  def next

    @cards = []

    # no of cards to return (max 20)
    limit = [params[:limit].to_i, 20].min
    # jlpt level must be 1-4
    jlpt = (1..4) === params[:level].to_i ? params[:level].to_i : 4
    # cards to filter out
    card_not_in = params[:card_not_in].to_a.collect {|v| v.to_i }
    # kanji to filter out
    kanji_not_in = params[:kanji_not_in].to_a.push(0).collect {|v| v.to_i }

    if current_user then
      @cards = current_user.cards_next(limit, jlpt, card_not_in)
    else
      Kanji.order("RANDOM()")
       .where(:jlpt => jlpt)
       .where('id not in (?)', kanji_not_in)
       .limit(limit - @cards.length)
       .each { |kanji|

        # make dummy cards (without an id)
        @cards << {:revisions => 0, :kanji => kanji}
        
      }
    end

    respond_to do |format|
      format.html { render :index }
      format.json { render :json => @cards }
    end
  end
  
  # PUT /cards/1
  # PUT /cards/1.json
  def update
    @card = Card.find(params[:id])

    respond_to do |format|
      if @card.update_attributes(:revisions => params[:revisions].to_i)
        format.html { redirect_to @card, notice: 'Card was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @card.errors, status: :unprocessable_entity }
      end
    end
  end

end
