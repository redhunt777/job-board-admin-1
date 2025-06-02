import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebar: {
    collapsed: boolean;
  };
  layout: {
    hideBottomNav: boolean;
    isAuthPage: boolean;
  };
}

const initialState: UIState = {
  sidebar: {
    collapsed: false,
  },
  layout: {
    hideBottomNav: false,
    isAuthPage: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebar.collapsed = !state.sidebar.collapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebar.collapsed = action.payload;
    },
    setHideBottomNav: (state, action: PayloadAction<boolean>) => {
      state.layout.hideBottomNav = action.payload;
    },
    setIsAuthPage: (state, action: PayloadAction<boolean>) => {
      state.layout.isAuthPage = action.payload;
    },
  },
});

export const { 
  toggleSidebar, 
  setSidebarCollapsed, 
  setHideBottomNav, 
  setIsAuthPage 
} = uiSlice.actions;

export default uiSlice.reducer; 