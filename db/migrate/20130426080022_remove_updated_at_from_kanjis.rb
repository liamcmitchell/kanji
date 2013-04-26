class RemoveUpdatedAtFromKanjis < ActiveRecord::Migration
  def up
    remove_column :kanjis, :updated_at
  end

  def down
    add_column :kanjis, :updated_at, :datetime
  end
end
