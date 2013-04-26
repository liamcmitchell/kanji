class RemoveCreatedAtFromKanjis < ActiveRecord::Migration
  def up
    remove_column :kanjis, :created_at
  end

  def down
    add_column :kanjis, :created_at, :datetime
  end
end
