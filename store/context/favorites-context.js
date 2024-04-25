import { createContext } from 'react';

export const FavoritesContext = createContext({
  ids: [],
  addFavorite: (id) => {},
  removeFavorite: (id) => {}
});

function FavoritesContextProvider({ children }) {
    const [favoriteProductIds, setFavoriteProductIds] = useState([]);
  
    function addFavorite(id) {
      setFavoriteProductIds((currentFavIds) => [...currentFavIds, id]);
    }
  
    function removeFavorite(id) {
      setFavoriteProductIds((currentFavIds) =>
        currentFavIds.filter((productId) => productId !== id)
      );
    }
  
    const value = {
      ids: favoriteProductIds,
      addFavorite: addFavorite,
      removeFavorite: removeFavorite,
    };
  
    return (
      <FavoritesContext.Provider value={value}>
        {children}
      </FavoritesContext.Provider>
    );
  }

export default FavoritesContextProvider;