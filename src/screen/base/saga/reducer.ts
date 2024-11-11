import { SpinnerActions, SET_SPINNER_REDUCER, IMenu, IActionMenu } from '../typeBase/type';
interface baseState {
    isSpinner: boolean | false,
    textSpinner: string | '',
    listMenu: IMenu[] | [],
    listActionMenu: IActionMenu[] | [],
    menuSelected: IMenu | undefined,
    listMenuChild: IMenu[] | [],
    listActionForMenuSelected: IActionMenu[] | [],

}
const initState: baseState = {
    isSpinner: false,
    textSpinner: '',
    listMenu: [],
    listActionMenu: [],
    menuSelected: undefined,
    listActionForMenuSelected: [],
    listMenuChild: []
};

const baseReducer = (state = initState, action: SpinnerActions) => {
    switch (action.type) {
        case SET_SPINNER_REDUCER:
            state.isSpinner = action.payload.isSpinner;
            state.textSpinner = action.payload.textSpinner;
            return {
                ...state,
            };
        case "SET_PERMISSION_REDUCER":
            state.listMenu = action.payload.listMenu;
            state.listActionMenu = action.payload.listActionMenu;
            return {
                ...state,
            };

        case "ONPRESS_MENU_PERMISSION":


            state.menuSelected = state.listMenu.find(x => x.MenuTitle == action.payload.ScreenName);
            if (state.menuSelected != undefined) {
                let listMenuChild = state.listMenu.filter(x => x.Parent == state.menuSelected?.MenuId);
                if (listMenuChild.length > 0) {
                    state.listMenuChild = listMenuChild;
                }
                if (state.menuSelected.IsMenuAction == true) {
                    let listActionForMenuSelected = state.listActionMenu.filter(x => x.MenuId == state.menuSelected?.MenuId);
                    if (listActionForMenuSelected.length > 0) {
                        state.listActionForMenuSelected = state.listActionMenu.filter(x => x.MenuId == state.menuSelected?.MenuId);
                    }
                }
            }

            return {
                ...state,
            };

        default:
            return {
                ...state,
            };
    }
};

export default baseReducer;
