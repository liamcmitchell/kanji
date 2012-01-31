namespace :kanji do
  desc "Import kanji from XML"
  task :import => :environment do
    
    # Loads Kanji from XML and saves in one transaction to save time
    
    doc = Nokogiri::XML( File.open( Rails.root.join('lib','assets') + 'kanjidic2.xml' ) )
    
    kanjis = []
    
    doc.xpath( '//character' ).each do |node|
    
      literal = node.xpath( 'literal' ).first.content
      k = Kanji.find_or_initialize_by_literal( literal )
      
      k.literal = literal
      onyomis = []
      node.xpath( "reading_meaning/rmgroup/reading[@r_type='ja_on']" ).each { |n| onyomis.push n.content }
      k.onyomi  = onyomis.join( ', ' )
      kunyomis = []
      node.xpath( "reading_meaning/rmgroup/reading[@r_type='ja_kun']" ).each { |n| kunyomis.push n.content }
      k.kunyomi = kunyomis.join( ', ' )
      nanoris = []
      node.xpath( "reading_meaning/nanori" ).each { |n| nanoris.push n.content }
      k.nanori  = nanoris.join( ', ' )
      meanings = []
      node.xpath( "reading_meaning/rmgroup/meaning" ).each { |n| meanings.push n.content unless n.has_attribute? 'm_lang' }
      k.meaning = meanings.join( ', ' )
      k.stroke  = node.xpath( "misc/stroke_count" ).first.content.to_i
      k.jlpt    = node.xpath( "misc/jlpt" ).first.content.to_i unless node.xpath( "misc/jlpt" ).empty?
      
      kanjis.push k
      
    end
    
    ActiveRecord::Base.transaction { kanjis.each { |k| k.save } }
    
  end
end
