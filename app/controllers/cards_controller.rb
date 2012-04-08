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
  
  # GET /cards/update
  def update_form

    # logic for returning set of cards to revise
    @cards = []
    
    jlpt = params[:jlpt] == 1..4 ? params[:jlpt] : nil
    limit = [params[:limit].to_i, 20].min # max 20
    jlpt = 2 # for dev
    limit = 4 # for dev
    
    # used to stop results that are currently being tested
    card_not_in = params[:card_not_in].nil? || params[:card_not_in].empty? ? [0] : params[:card_not_in].split(/\+/)
    kanji_not_in = params[:kanji_not_in].nil? || params[:kanji_not_in].empty? ? [0] : params[:kanji_not_in].split(/\+/)
    
    kanji_in_cards = []
    # get all users cards
    if current_user then
      current_user.cards.order("revisions").each do |card|
      
        # build a list of cards to revise
        if (card.revisions == 0 || card.revisions == 1 && card.updated_at < 12.hours.ago)
        then
          @cards << card
        end
        
        kanji_in_cards << card.kanji_id
        
      end
    end

    # if there are not enough then generate new cards
    if (@cards.length < limit) then
    
      @kanjis = Kanji.order("RANDOM()").where(jlpt: jlpt).where('id not in (?)', kanji_not_in + kanji_in_cards).limit(limit - @cards.length)
      
      # save for user
      if current_user then
        @kanjis.each do |kanji|
          @cards << current_user.cards.create(kanji_id: kanji.id, revisions: 0);
        end
      end
      
    end
    
    # if there still aren't enough cards then return info message
    if (@cards.length < limit) then
      # TODO: message to say change jlpt level or something
    end
    
    # make sure there are no more than required number of cards
    @cards = @cards.slice(0, limit)
    
    respond_to do |format|
      format.html { render :update }
    end
  end
  
  # POST /cards/update
  # POST /cards/update.json
  def update
    @var = params
    respond_to do |format|
      format.html { render :update }
      format.json { render json: @cards }
    end
  end

end
