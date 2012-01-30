class KanjisController < ApplicationController
  # GET /kanjis
  # GET /kanjis.json
  def index
    @kanjis = Kanji.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @kanjis }
    end
  end

  # GET /kanjis/1
  # GET /kanjis/1.json
  def show
    @kanji = Kanji.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @kanji }
    end
  end

  # GET /kanjis/new
  # GET /kanjis/new.json
  def new
    @kanji = Kanji.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @kanji }
    end
  end

  # GET /kanjis/1/edit
  def edit
    @kanji = Kanji.find(params[:id])
  end

  # POST /kanjis
  # POST /kanjis.json
  def create
    @kanji = Kanji.new(params[:kanji])

    respond_to do |format|
      if @kanji.save
        format.html { redirect_to @kanji, notice: 'Kanji was successfully created.' }
        format.json { render json: @kanji, status: :created, location: @kanji }
      else
        format.html { render action: "new" }
        format.json { render json: @kanji.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /kanjis/1
  # PUT /kanjis/1.json
  def update
    @kanji = Kanji.find(params[:id])

    respond_to do |format|
      if @kanji.update_attributes(params[:kanji])
        format.html { redirect_to @kanji, notice: 'Kanji was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @kanji.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /kanjis/1
  # DELETE /kanjis/1.json
  def destroy
    @kanji = Kanji.find(params[:id])
    @kanji.destroy

    respond_to do |format|
      format.html { redirect_to kanjis_url }
      format.json { head :no_content }
    end
  end
end
