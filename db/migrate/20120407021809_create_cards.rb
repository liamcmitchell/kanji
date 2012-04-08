class CreateCards < ActiveRecord::Migration
  def change
    create_table :cards do |t|
      t.integer :user_id
      t.integer :kanji_id
      t.integer :revisions

      t.timestamps
    end
  end
end
