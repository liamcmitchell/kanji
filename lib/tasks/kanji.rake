namespace :kanji do
  desc "Import kanji from XML"
  task :import => :environment do
    
    puts "Loading XML file..."
    doc = Nokogiri::XML( File.open( Rails.root.join('lib','assets') + 'kanjidic2.xml' ) )
    
    puts "Building inserts..."
    inserts = []
    
    doc.xpath( '//character' ).each do |node|
      
      insert = {}
      
      insert[:literal] = node.xpath( 'literal' ).first.content      
      
      onyomis = []
      node.xpath( "reading_meaning/rmgroup/reading[@r_type='ja_on']" ).each { |n| onyomis.push n.content }
      insert[:onyomi]  = onyomis.join( ', ' )

      kunyomis = []
      node.xpath( "reading_meaning/rmgroup/reading[@r_type='ja_kun']" ).each { |n| kunyomis.push n.content }
      insert[:kunyomi] = kunyomis.join( ', ' )
      
      nanoris = []
      node.xpath( "reading_meaning/nanori" ).each { |n| nanoris.push n.content }
      insert[:nanori]  = nanoris.join( ', ' )
      
      meanings = []
      node.xpath( "reading_meaning/rmgroup/meaning" ).each { |n| meanings.push n.content unless n.has_attribute? 'm_lang' }
      insert[:meaning] = meanings.join( ', ' )

      insert[:stroke]  = node.xpath( "misc/stroke_count" ).first.content.to_i

      jlpt = node.xpath( "misc/jlpt" )
      insert[:jlpt]    = jlpt.empty? ? "" : jlpt.first.content.to_i
      
      inserts.push '("' + insert.values.join('", "') + '")'

    end

    puts "Deleting previous data..."
    Kanji.delete_all

    puts "Inserting #{inserts.count} records into database..."
    sql = "INSERT INTO kanjis 
      (`literal`, `onyomi`, `kunyomi`, `nanori`, `meaning`, `stroke`, `jlpt`) 
      VALUES #{inserts.join(", ")}"
    ActiveRecord::Base.connection.execute sql
    
  end
end
