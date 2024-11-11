//import liraries 
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { Path, Svg } from "react-native-svg";
import Button from "./lib/Button";
import TagItem from "./lib/TagItem";
import utilities from "./lib/utilities";

const { height } = Dimensions.get("window");
const INIT_HEIGHT = height * 0.6;
// create a component 
class Select2 extends Component {
  static defaultProps = {
    cancelButtonText: "Hủy",
    selectButtonText: "Chọn",
    searchPlaceHolderText: "Nhập từ khóa tìm kiếm",
    listEmptyTitle: "Không có giá trị",
    colorTheme: "#16a45f",
    buttonTextStyle: {},
    buttonStyle: {},
    showSearchBox: true,
    searchBoxTextChanged: () => { },
  };

  state = {
    show: false,
    preSelectedItem: [],
    selectedItem: [],
    data: [],
    keyword: "",
  };
  animatedHeight = new Animated.Value(INIT_HEIGHT);

  componentDidMount() {
    this.init();
  }
  UNSAFE_componentWillReceiveProps(newProps) {
    this.init(newProps);
  }

  init(newProps) {
    let preSelectedItem = [];
    let { data } = newProps || this.props;
    data.map((item) => {
      if (item.checked) {
        preSelectedItem.push(item);
      }
    });
    this.setState({ data, preSelectedItem });
  }

  get dataRender() {
    let { data, keyword } = this.state;
    let listMappingKeyword = [];
    data.map((item) => {
      if (
        utilities
          .changeAlias(item.name)
          .includes(utilities.changeAlias(keyword))
      ) {
        listMappingKeyword.push(item);
      }
    });
    return listMappingKeyword;
  }

  get defaultFont() {
    let { defaultFontName } = this.props;
    return defaultFontName ? { fontFamily: defaultFontName } : {};
  }

  cancelSelection() {
    let { data, preSelectedItem } = this.state;
    data.map((item) => {
      item.checked = false;
      for (let _selectedItem of preSelectedItem) {
        if (item.id === _selectedItem.id) {
          item.checked = true;
          break;
        }
      }
    });
    this.setState({
      data,
      show: false,
      keyword: "",
      selectedItem: preSelectedItem,
    });
  }

  keyExtractor = (item, idx) => idx.toString();
  renderItem = ({ item, idx }) => {
    let { colorTheme, isSelectSingle } = this.props;
    return (
      <TouchableOpacity
        key={idx}
        onPress={() => this.onItemSelected(item, isSelectSingle)}
        activeOpacity={0.7}
        style={styles.itemWrapper}
      >
        <Text style={[styles.itemText, this.defaultFont]}>{item.name}</Text>
        {!isSelectSingle && (
          item.checked ?
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none" >
              <Path id="Vector" d="M8.85401 11.645L6.95801 9.74903C6.83334 9.6237 6.68067 9.56103 6.50001 9.56103C6.31934 9.56103 6.16667 9.6237 6.04201 9.74903C5.88867 9.9017 5.81201 10.065 5.81201 10.239C5.81201 10.4124 5.88167 10.5684 6.02101 10.707L8.27101 12.957C8.43767 13.1237 8.62501 13.207 8.83301 13.207C9.04167 13.207 9.23634 13.1237 9.41701 12.957L13.979 8.37403C14.0903 8.2627 14.1077 8.12736 14.031 7.96803C13.955 7.80803 13.9377 7.6377 13.979 7.45703C13.8403 7.31836 13.684 7.24903 13.51 7.24903C13.3367 7.24903 13.1807 7.31836 13.042 7.45703L8.85401 11.645ZM10 17.916C8.90267 17.916 7.87134 17.7077 6.90601 17.291C5.94067 16.8744 5.10401 16.3117 4.39601 15.603C3.68734 14.895 3.12467 14.0584 2.70801 13.093C2.29134 12.1277 2.08301 11.0964 2.08301 9.99903C2.08301 8.9017 2.29134 7.87036 2.70801 6.90503C3.12467 5.9397 3.68734 5.10303 4.39601 4.39503C5.10401 3.68636 5.94067 3.1237 6.90601 2.70703C7.87134 2.29036 8.90267 2.08203 10 2.08203C11.0973 2.08203 12.1287 2.29036 13.094 2.70703C14.0593 3.1237 14.896 3.68636 15.604 4.39503C16.3127 5.10303 16.8753 5.9397 17.292 6.90503C17.7087 7.87036 17.917 8.9017 17.917 9.99903C17.917 11.0964 17.7087 12.1277 17.292 13.093C16.8753 14.0584 16.3127 14.895 15.604 15.603C14.896 16.3117 14.0593 16.8744 13.094 17.291C12.1287 17.7077 11.0973 17.916 10 17.916Z" fill="#48BB78" />
            </Svg>
            :
            null
        )}
      </TouchableOpacity>
    );
  };
  renderEmpty = () => {
    let { listEmptyTitle } = this.props;
    return (
      <Text style={[styles.empty, this.defaultFont]}>{listEmptyTitle}</Text>
    );
  };
  closeModal = () => this.setState({ show: false });
  showModal = () => this.setState({ show: true });

  renderSinglePreselectedItem = () => {
    const { selectedTitleStyle } = this.props;
    let { preSelectedItem } = this.state;
    return (
      <Text
        style={[
          styles.selectedTitlte,
          this.defaultFont,
          selectedTitleStyle,
          { color: "#333" },
        ]}
      >
        {preSelectedItem[0].name}
      </Text>
    );
  };

  renderMultiplePreselectedItems = () => {
    const { onRemoveItem } = this.props;
    let { preSelectedItem } = this.state;
    return (
      <View style={styles.tagWrapper}>
        {preSelectedItem.map((tag, index) => {
          return (
            (
              <TagItem
                key={index}
                onRemoveTag={() => {
                  let preSelectedItem = [];
                  let selectedIds = [],
                    selectedObjectItems = [];
                  let { data } = this.state;
                  data.map((item) => {
                    if (item.id === tag.id) {
                      item.checked = false;
                    }
                    if (item.checked) {
                      preSelectedItem.push(item);
                      selectedIds.push(item.id);
                      selectedObjectItems.push(item);
                    }
                  });
                  this.setState({ data, preSelectedItem });
                  onRemoveItem && onRemoveItem(selectedIds, selectedObjectItems);
                }}
                tagName={tag.name}
              />
            ));
        })}
      </View>
    );
  };

  renderPreselectedItem = () => {
    const { isSelectSingle } = this.props;
    return isSelectSingle
      ? this.renderSinglePreselectedItem()
      : this.renderMultiplePreselectedItems();
  };

  renderEmptyField = () => {
    const { selectedTitleStyle, title } = this.props;
    return (
      <Text
        style={[styles.selectedTitlte, this.defaultFont, selectedTitleStyle]}
      >
        {title}
      </Text>
    );
  };

  renderSingleSelectedItem = () => {
    const { value, data, selectedTitleStyle } = this.props;
    const selectedItem = data.find((i) => i.id === value[0]);
    if (!selectedItem) return this.renderEmptyField();
    return (
      <Text
        style={[
          styles.selectedTitlte,
          this.defaultFont,
          selectedTitleStyle,
          { color: "black" },
        ]}
      >
        {selectedItem.name}
      </Text>
    );
  };

  renderTextInput = () => {
    const { isSelectSingle, value } = this.props;
    const { preSelectedItem } = this.state;
    if (value && value.length == 1 && isSelectSingle) {
      return this.renderSingleSelectedItem();
    }
    if (preSelectedItem.length > 0) {
      return this.renderPreselectedItem();
    }
    return this.renderEmptyField();
  };

  onItemSelected = (item, isSelectSingle) => {
    let selectedItem = [];
    let { data } = this.state;
    item.checked = !item.checked;
    for (let index in data) {
      if (data[index].id === item.id) {
        data[index] = item;
      } else if (isSelectSingle) {
        data[index].checked = false;
        // ban dau là item.check o day = false, set lai bang true thi no se cho phep chon lai gia tri do ma ko phai an 2 lan
        item.checked = true;
      }
    }
    data.map((item) => {
      if (item.checked) selectedItem.push(item);
    });
    this.setState({ data, selectedItem });
    if (isSelectSingle) {
      this.selectItems(selectedItem);
    }
  };

  onSelectPressed = () => {
    const { selectedItem } = this.state;
    this.selectItems(selectedItem);
  };

  selectItems = (selectedItem) => {
    const { onSelect } = this.props;
    let selectedIds = [],
      selectedObjectItems = [];
    selectedItem.map((item) => {
      selectedIds.push(item.id);
      selectedObjectItems.push(item);
    });
    onSelect && onSelect(selectedIds, selectedObjectItems);
    this.setState({
      show: false,
      keyword: "",
      preSelectedItem: selectedItem,
    });
  };

  searchBoxChanged = (keyword) => {
    const { searchBoxTextChanged } = this.props;
    this.setState({ keyword });
    if (searchBoxTextChanged) searchBoxTextChanged(keyword);
  };

  render() {
    let {
      style,
      modalStyle,
      title,
      popupTitle,
      colorTheme,
      cancelButtonText,
      selectButtonText,
      searchPlaceHolderText,
      buttonTextStyle,
      buttonStyle,
      showSearchBox,
      isSelectSingle,
      value,

    } = this.props;
    let { show, keyword } = this.state;
    return (
      <TouchableOpacity
        onPress={this.showModal}
        activeOpacity={0.7}
        style={[styles.container, style]}
      >
        <Modal
          onBackdropPress={this.closeModal}
          style={{
            justifyContent: "flex-end",
            margin: 0,
          }}
          useNativeDriver={true}
          animationInTiming={300}
          animationOutTiming={300}
          hideModalContentWhileAnimating
          isVisible={show}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              modalStyle,
              { height: this.animatedHeight, useNativeDriver: false },
            ]}
          >
            <View style={{
              backgroundColor: "#E7F2FF", borderTopLeftRadius: 8,
              borderTopRightRadius: 8, paddingTop: 16,
            }}>
              <Text
                style={[styles.title, this.defaultFont, { color: '#003350' }]}
              >
                {popupTitle || title}
              </Text>
            </View>
            {/* <View style={styles.line} /> */}
            {showSearchBox ? (
              <TextInput
                value={keyword}
                underlineColorAndroid="transparent"
                returnKeyType="done"
                style={[styles.inputKeyword, this.defaultFont]}
                placeholder={searchPlaceHolderText}
                placeholderTextColor='#AAABAE'
                selectionColor={colorTheme}
                onChangeText={this.searchBoxChanged}
                onFocus={() => {
                  Animated.spring(this.animatedHeight, {
                    toValue:
                      INIT_HEIGHT + (Platform.OS === "ios" ? height * 0.2 : 0),
                    friction: 7,
                    useNativeDriver: false,
                  }).start();
                }}
                onBlur={() => {
                  Animated.spring(this.animatedHeight, {
                    toValue: INIT_HEIGHT,
                    friction: 7,
                    useNativeDriver: false,
                  }).start();
                }}
              />
            ) : null}
            <FlatList
              style={styles.listOption}
              data={this.dataRender || []}
              initialNumToRender={10}
              keyExtractor={this.keyExtractor}
              renderItem={this.renderItem}
              ListEmptyComponent={this.renderEmpty}
            />

            <View style={styles.buttonWrapper}>
              {!isSelectSingle && (
                <>
                  <Button
                    defaultFont={this.defaultFont}
                    onPress={() => {
                      this.cancelSelection();
                    }}
                    title={cancelButtonText}
                    textColor={'#006496'}
                    backgroundColor="#FFFFFF"
                    textStyle={{
                      color: '#006496',
                      fontFamily: 'Mulish-SemiBold',
                      fontWeight: '400'
                    }}
                    style={{
                      marginRight: 5,
                      marginLeft: 10,
                      height: 36,
                      flex: 1,
                      borderWidth: 1,
                      borderColor: '#137DB9'

                    }}
                  />
                  <Button
                    defaultFont={this.defaultFont}
                    onPress={this.selectItems}
                    title={selectButtonText}
                    backgroundColor="#004B72"
                    textStyle={{
                      color: '#FFFFFF',
                      fontFamily: 'Mulish-SemiBold',
                      fontWeight: '400'
                    }}
                    style={{
                      marginRight: 5,
                      marginLeft: 10,
                      height: 36,
                      flex: 1,

                    }}
                  />
                </>
              )}
            </View>
          </Animated.View>
        </Modal>
        {this.renderTextInput()}
      </TouchableOpacity>
    );
  }
}

// define your styles 
const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 45,
    borderRadius: 2,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#cacaca",
    paddingVertical: 4,
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: {
    fontSize: 16,
    marginBottom: 16,
    width: "100%",
    backgroundColor: '#E7F2FF',
    paddingLeft: 22,
    fontFamily: 'Mulish-Bold',
  },
  line: {
    height: 1,
    width: "100%",
    backgroundColor: "#cacaca",
  },
  inputKeyword: {
    height: 40,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#cacaca",
    color: '#000000',
    paddingLeft: 8,
    marginHorizontal: 24,
    marginTop: 16,
    fontFamily: 'Mulish-Bold',
  },
  buttonWrapper: {
    marginVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    height: 36,
    flex: 1,
  },
  selectedTitlte: {
    color: '#AAABAE',
    flex: 1,
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
  },
  tagWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  listOption: {
    paddingHorizontal: 24,
    paddingTop: 1,
    marginTop: 16,
  },
  itemWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    fontStyle: 'normal',
    fontWeight: '400',
    fontFamily: 'Mulish-SemiBold',
  },
  itemIcon: {
    width: 30,
    textAlign: "right",
  },
  empty: {
    fontSize: 16,
    color: "gray",
    alignSelf: "center",
    textAlign: "center",
    paddingTop: 16,
  },
});

Select2.propTypes = {
  data: PropTypes.array.isRequired,
  style: PropTypes.object,
  defaultFontName: PropTypes.string,
  selectedTitleStyle: PropTypes.object,
  buttonTextStyle: PropTypes.object,
  buttonStyle: PropTypes.object,
  title: PropTypes.string,
  onSelect: PropTypes.func,
  onRemoveItem: PropTypes.func,
  popupTitle: PropTypes.string,
  colorTheme: PropTypes.string,
  isSelectSingle: PropTypes.bool,
  showSearchBox: PropTypes.bool,
  cancelButtonText: PropTypes.string,
  selectButtonText: PropTypes.string,
};

//make this component available to the app 
export default Select2;