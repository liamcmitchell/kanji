class KanjisController < ApplicationController
  # GET /kanjis
  # GET /kanjis.json
  def index
    not_in = params[:not_in].nil? || params[:not_in].empty? ? '' : params[:not_in].scan(/./)
    limit = params[:limit].nil? ? 50 : [params[:limit].to_i, 50].min
    random = params[:sort] == 'random' ? 'RANDOM()' : ''
    @kanjis = Kanji.order(random).where({:jlpt => params[:jlpt]}).where('literal not in (?)', not_in).limit(limit)
    #@var = params[:sort] # for debugging
    
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @kanjis }
    end
  end

  # GET /kanjis/1
  # GET /kanjis/1.json
  def show
    if params[:id].to_i > 0 then
      @kanji = Kanji.find(params[:id])
    else
      @kanji = Kanji.find_by_literal(params[:id].scan(/./))
    end

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @kanji }
    end
  end
end
