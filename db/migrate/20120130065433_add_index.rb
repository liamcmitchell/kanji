class AddIndex < ActiveRecord::Migration
  def up
    add_index :kanjis, :literal
  end

  def down
    remove_index :kanjis, :literal
  end
end
