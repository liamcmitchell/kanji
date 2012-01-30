class CreateKanjis < ActiveRecord::Migration
  def change
    create_table :kanjis do |t|
      t.string :literal
      t.string :onyomi
      t.string :kunyomi
      t.string :nanori
      t.string :meaning
      t.integer :stroke
      t.integer :jlpt

      t.timestamps
    end
  end
end
