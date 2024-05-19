import { createSlice } from '@reduxjs/toolkit';

const favoritesSlice = createSlice({
  name: 'favoriteProducts',
  initialState: {
    ids: []
  },
  reducers: {
    setFavorites(state, action) {
      state.ids = action.payload.ids;
    },
    addFavorite: (state, action) => {
      state.ids.push(action.payload.id);
    },
    removeFavorite: (state, action) => {
      state.ids.splice(state.ids.indexOf(action.payload.id), 1);
    }
  }
});

export const addFavorite = favoritesSlice.actions.addFavorite;
export const removeFavorite = favoritesSlice.actions.removeFavorite;
export const setFavorites = favoritesSlice.actions.setFavorites;

export default favoritesSlice.reducer;