const fs = require('fs')
const DOMParser = require('xmldom').DOMParser
const xpath = require('xpath')

const doc = new DOMParser().parseFromString(fs.readFileSync('kanjidic2.xml', 'utf8') ,'text/xml')

const textContent = (node) => node.textContent

const frequency = (node) => {
  const freq = xpath.select1('freq', node)
  return freq ? parseInt(freq.textContent) : Infinity
}

const kanji = xpath.select('/kanjidic2/character', doc)
  .filter((node) => xpath.select1('misc/jlpt', node))
  .sort((a, b) => frequency(a) > frequency(b))
  .map((node) => {
    return {
      literal: xpath.select1('literal', node).textContent,
      onyomi: xpath.select('reading_meaning/rmgroup/reading[@r_type="ja_on"]', node)
        .map(textContent)
        .join(', '),
      kunyomi: xpath.select('reading_meaning/rmgroup/reading[@r_type="ja_kun"]', node)
        .map(textContent)
        .join(', '),
      nanori: xpath.select('reading_meaning/nanori', node)
        .map(textContent)
        .join(', '),
      meaning: xpath.select('reading_meaning/rmgroup/meaning', node)
        .filter((node) => !node.hasAttribute('m_lang'))
        .map(textContent)
        .join(', '),
      jlpt: parseInt(xpath.select1('misc/jlpt', node).textContent),
      // stroke: parseInt(xpath.select1('misc/stroke_count', node).textContent),
    }
  })

fs.writeFileSync('js/kanji.js', '/* See build.js */ KANJI = ' + JSON.stringify(kanji))
