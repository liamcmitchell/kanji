class Kanji < ActiveRecord::Base
	has_many :cards
	has_many :users, :through => :cards
  
  def as_json(options={})
    super(:except => [:created_at, :updated_at])
  end

  def self.where_level(level)
  	case level
  	when 'jlpt1'
  		where(:jlpt => 1)
		when 'jlpt2'
  		where(:jlpt => 2)
		when 'jlpt3'
  		where(:jlpt => 3)
		when 'jlpt4'
  		where(:jlpt => 4)
  	end
  end

  def self.excluding(ids)
    if ids.any?
      where("id NOT IN (?)", ids)
    else
      scoped
    end
  end
end
