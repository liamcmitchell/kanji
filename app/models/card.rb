class Card < ActiveRecord::Base
  belongs_to :kanji
  
  def as_json(options={})
    super(:include => {:kanji => {:except => [:created_at, :updated_at]}}, :except => [:created_at, :updated_at, :user_id, :kanji_id])
  end
  
  def revise?
    revisions == 0 ||
    revisions == 1 && updated_at < 12.hours.ago ||
    revisions == 2 && updated_at < 36.hours.ago ||
    revisions == 3 && updated_at < 1.week.ago ||
    revisions == 4 && updated_at < 1.months.ago ||
    revisions >= 5 && updated_at < 4.months.ago
  end  
end
