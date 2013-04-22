class Card < ActiveRecord::Base
  belongs_to :user
  belongs_to :kanji
  
  def as_json(options={})
    super(
      :include => {
        :kanji => {
          :except => [:created_at, :updated_at]
        }
      }, 
      :except => [:created_at, :updated_at, :user_id, :kanji_id]
    )
  end

  def self.to_revise
    where("revisions == 0
      OR (revisions == 1 AND updated_at < '#{12.hours.ago()}')
      OR (revisions == 2 AND updated_at < '#{36.hours.ago()}')
      OR (revisions == 3 AND updated_at < '#{1.week.ago()}')
      OR (revisions == 4 AND updated_at < '#{1.months.ago()}')
      OR (revisions == 5 AND updated_at < '#{4.months.ago()}')
    ")
  end

  def self.excluding(ids)
    if ids.any?
      where("id NOT IN (?)", ids)
    else
      scoped
    end
  end
end