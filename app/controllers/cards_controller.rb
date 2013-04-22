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

  # POST /cards/current
  # Return set of cards for testing now.
  def current

    # Set maximum
    limit = 20
    if params[:limit] then
      limit = [params[:limit].to_i, limit].min
    end

    if current_user then

      # Get cards to revise
      @cards = current_user.cards.to_revise.limit(limit)
      # Filter out cards
      if params[:card_not_in].kind_of? Array then
        @cards = @cards.excluding(params[:cards_not_in])
      end

      # And when there are no more cards to revise
      if @cards.length < limit then
        # Make more cards
        kanjis = Kanji.where_level(params[:level]).excluding(current_user.kanjis).limit(limit - @cards.length)
        new_cards = kanjis.collect do |kanji|
          current_user.cards.create(:kanji_id => kanji.id, :revisions => 0)
        end
        @cards.concat(new_cards)
      end

    else
      # For anonymous users we make cards but don't save them

      kanjis = Kanji.where_level(params[:level]).limit(limit)

      # Filter out kanji
      if params[:kanji_not_in].kind_of? Array then
        kanjis = kanjis.excluding(params[:kanji_not_in])
      end
      
      @cards = kanjis.collect do |kanji|
        Card.new(:kanji => kanji, :kanji_id => kanji.id, :revisions => 0)
      end

    end
    
    respond_to do |format|
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
