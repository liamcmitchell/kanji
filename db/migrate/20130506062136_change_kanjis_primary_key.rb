class ChangeKanjisPrimaryKey < ActiveRecord::Migration
  def up
  	Card.delete_all

  	drop_table :kanjis

  	create_table :kanjis, :id => false do |t|
		  t.string  :literal, :primary => true
		  t.string  :onyomi
		  t.string  :kunyomi
		  t.string  :nanori
		  t.string  :meaning
		  t.integer :stroke
		  t.integer :jlpt
		end

		remove_column :cards, :kanji_id
		add_column :cards, :kanji_literal, :string
  end

  def down
  	raise ActiveRecord::IrreversibleMigration, "Migration was destructive, can't recover."
  end
end
