import React, { useState, createContext, useContext, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, ActivityIndicator, View, Image, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { Provider, useDispatch } from "react-redux";

import Ionic from "react-native-vector-icons/Ionicons";

import { PaperProvider } from "react-native-paper";

//import { Provider } from "react-native-paper";

import CategoriesScreen from "./screens/CategoriesScreen";
import ProductsOverviewScreen2 from "./screens/ProductsOverviewScreen2";
import ProductsOverviewScreen3 from "./screens/ProductsOverviewScreen3";
import ProductDetailScreen from "./screens/ProductDetailScreen";
import FavoritesScreen from "./screens/FavoritesScreen";

import UserPostDetailScreen from "./screens/UserPostDetailScreen";

// import FavoritesContextProvider from "./store/context/favorites-context";
import { store } from "./store/redux/store";
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

import Login from "./screens/Login";
import Signup from "./screens/Signup";

import ChatList from "./screens/ChatList";
import Chat from "./screens/Chat";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import InfoScreen from "./screens/InfoScreen";

import { useProductsListener, useLoadFavorites, useUserEmail } from "./config/firebase";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AddProducts from "./screens/AddProducts";
import AddProducts2 from "./screens/AddProducts2";

import UserProfileScreen from "./screens/UserProfileScreen";

const Tab = createBottomTabNavigator();

const AuthenticatedUserContext = createContext({});

const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};
{/** 
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#ef9b47" },
        headerTintColor: "white",
        sceneContainerStyle: { backgroundColor: "#fdf5ed" },
        drawerContentStyle: { backgroundColor: "#ef9b47" },
        drawerInactiveTintColor: "white",
        drawerActiveTintColor: "#351401",
        drawerActiveBackgroundColor: "#e4baa1",
      }}
    >
      <Drawer.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          title: "All Categories",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="list" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="star" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="AddProduct"
        component={AddProducts2}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="star" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}*/}

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#ef9b47" },
        headerTintColor: "#e2eae3",
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="HomeCategories" component={CategoriesScreen} />
      <Stack.Screen
        name="ProductsOverview"
        component={ProductsOverviewScreen2}
      />
      <Stack.Screen
        name="ProductDetail"
        component={InfoScreen}
        options={{
          title: "About the Product",
        }}
      />
    </Stack.Navigator>
  );
}

function FavoritesStack() {
  const userEmail = useUserEmail();
  const dispatch = useDispatch();

  useLoadFavorites(userEmail, dispatch);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#ef9b47" },
        headerTintColor: "#e2eae3",
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
    </Stack.Navigator>
  );
}

function AddProductStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#ef9b47" },
        headerTintColor: "#e2eae3",
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="AddProduct" component={AddProducts2} />
      <Stack.Screen name="AddedProductDetail" component={UserPostDetailScreen}/>
    </Stack.Navigator>
  );
}

function MessagesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#ef9b47" },
        headerTintColor: "#e2eae3",
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="Messages" component={ChatList} />
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  );
}

function UserProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#ef9b47" },
        headerTintColor: "#e2eae3",
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen
        name="UserProductDetail"
        component={UserPostDetailScreen}
        options={{
          title: "About the Product",
        }}
      />
      <Stack.Screen name="BackToLogin" component={Login}/>
    </Stack.Navigator>
  );
}

function TabNav() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Hide the TabNavigator header
        tabBarIcon: ({ focused, size, color }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
            size = focused ? size + 8 : size + 5;
          } else if (route.name === "FavoritesTab") {
            iconName = focused ? "star" : "star-outline";
            size = focused ? size + 8 : size + 5;
          } else if (route.name === "AddProductTab") {
            iconName = focused ? "add-circle" : "add-circle-outline";
            size = focused ? size + 8 : size + 5;
          } else if (route.name === "MessagesTab") {
            iconName = focused ? "mail" : "mail-outline";
            size = focused ? size + 8 : size + 5;
          } else if (route.name === "UserProfileTab") {
            iconName = focused
              ? "person-circle-sharp"
              : "person-circle-outline";
            size = focused ? size + 8 : size + 5;
          }
          return <Ionic name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          padding: 10,
          backgroundColor: "black",
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="FavoritesTab" component={FavoritesStack} />
      <Tab.Screen name="AddProductTab" component={AddProductStack} />
      <Tab.Screen name="MessagesTab" component={MessagesStack} />
      <Tab.Screen name="UserProfileTab" component={UserProfileStack} />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <>
      <StatusBar style="light" />
      <Provider store={store}>
        <TabNav />
      </Provider>
    </>
  );
}


function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // onAuthStateChanged returns an unsubscriber
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (authenticatedUser) => {
        authenticatedUser ? setUser(authenticatedUser) : setUser(null);
        setIsLoading(false);
      }
    );
    // unsubscribe auth listener on unmount
    return unsubscribeAuth;
  }, [user]);
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <PaperProvider>{user ? <AppStack /> : <AuthStack />}</PaperProvider>
    </NavigationContainer>
  );
}

export default function App() {
  useProductsListener();
  return (
    <AuthenticatedUserProvider>
      <RootNavigator />
    </AuthenticatedUserProvider>
  );
}

const styles = StyleSheet.create({
  container: {},
  footerIcon: {
    width: 25,
  },
});
