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

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create kanji" do
    assert_difference('Kanji.count') do
      post :create, kanji: @kanji.attributes
    end

    assert_redirected_to kanji_path(assigns(:kanji))
  end

  test "should show kanji" do
    get :show, id: @kanji
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @kanji
    assert_response :success
  end

  test "should update kanji" do
    put :update, id: @kanji, kanji: @kanji.attributes
    assert_redirected_to kanji_path(assigns(:kanji))
  end

  test "should destroy kanji" do
    assert_difference('Kanji.count', -1) do
      delete :destroy, id: @kanji
    end

    assert_redirected_to kanjis_path
  end
end
