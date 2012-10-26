class User < ActiveRecord::Base
  serialize :settings, Hash
  has_many :cards

  def self.from_omniauth(auth)
    find_by_provider_and_uid(auth["provider"], auth["uid"]) || create_with_omniauth(auth)
  end

  def self.create_with_omniauth(auth)
    create! do |user|
      user.provider = auth["provider"]
      user.uid = auth["uid"]
      user.name = auth["info"]["name"]
    end
  end
  
    
  def cards_next(limit, jlpt, card_not_in)
    
    # ignore kanji when making new cards
    kanji_not_in = []
    
    list = cards.order("revisions")
    
    # 0 is added in case there are no cards (NULL will cause SQL error)
    kanji_in_cards = list.map { |card| card.kanji_id }.push(0)
    
    # select only those ready for revision and not excluded
    list = list.select { |card| card.revise? && !card_not_in.include?(card.id) }
    
    if list.length < limit then # make some new cards
      Kanji.order("RANDOM()")
       .where(:jlpt => jlpt)
       .where('id not in (?)', kanji_in_cards)
       .limit(limit - list.length)
       .each { |kanji|
       
        # create card and add to the list
        list << cards.create(:kanji_id => kanji.id, :revisions => 0)
        
      }      
    end
    
    return list.slice(0, limit)
  end
end
