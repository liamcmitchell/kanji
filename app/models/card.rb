class Card < ActiveRecord::Base
  belongs_to :kanji
  
  def as_json(options={})
    super(:include => {:kanji => {:except => [:created_at, :updated_at]}}, :except => [:created_at, :updated_at, :user_id, :kanji_id])
  end
end
