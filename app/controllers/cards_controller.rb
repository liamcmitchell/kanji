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
    
    respond_to do |format|
      format.html { render :update }
    end
  end
  
  # POST /cards/update
  # POST /cards/update.json
  def update
  
    # return set of cards to revise
    @cards = []

    # cards that have been revised
    revised = params[:revised]
    # jlpt level
    jlpt = (1..4) === params[:jlpt].to_i ? params[:jlpt].to_i : 4
    debugger
    # max cards to return (20)
    limit = [params[:limit].to_i, 20].min
    # filter out cards - used to stop results that are currently being tested
    card_not_in = params[:card_not_in].nil? || params[:card_not_in].empty? ? [0] : params[:card_not_in].split(/\+/)
    # filter out kanji
    kanji_not_in = params[:kanji_not_in].nil? || params[:kanji_not_in].empty? ? [0] : params[:kanji_not_in].split(/\+/)
    
    # update revised cards
    # TODO: prevent double counting on async updates
    if current_user && revised then
      ActiveRecord::Base.transaction do
        current_user.cards.find(revised).each do |card|
          card.revisions += 1
          card.save
        end
      end
    end

    # get all users cards
    if current_user then
      current_user.cards.order("revisions").each do |card|
      
        # build a list of cards to revise
        if (card.revisions == 0 || card.revisions == 1 && card.updated_at < 12.hours.ago) then
          @cards << card
        end
        
        # add kanji to list so we don't search for it later
        kanji_not_in << card.kanji_id
      
      end
    end

    # if there are not enough then generate new cards
    if (@cards.length < limit) then
      
      ActiveRecord::Base.transaction do
        Kanji.order("RANDOM()")
             .where(:jlpt => jlpt)
             .where('id not in (?)', kanji_not_in)
             .limit(limit - @cards.length)
             .each do |kanji|
             
          if current_user then
            # save for user
            @cards << current_user.cards.create(kanji_id: kanji.id, revisions: 0);
          else
            # give a dummy card
            @cards << {:id => 0, :revisions => 0, :kanji => kanji}
          end
          
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
      format.json { render :json => @cards }
    end
  end

end
