require 'test_helper'

class KanjisControllerTest < ActionController::TestCase
  setup do
    @kanji = kanjis(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:kanjis)
  end

  test "should show kanji" do
    get :show, id: @kanji
    assert_response :success
  end

end
