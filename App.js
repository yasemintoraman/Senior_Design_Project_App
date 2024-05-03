import React, { useState, createContext, useContext, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, ActivityIndicator, View, Image, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { Provider } from "react-redux";

import { PaperProvider } from "react-native-paper";

//import { Provider } from "react-native-paper";

import CategoriesScreen from "./screens/CategoriesScreen";
import ProductsOverviewScreen2 from "./screens/ProductsOverviewScreen2";
import ProductsOverviewScreen3 from "./screens/ProductsOverviewScreen3";
import ProductDetailScreen from "./screens/ProductDetailScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
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

import { useProductsListener } from "./config/firebase";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AddProducts from "./screens/AddProducts";
import AddProducts2 from "./screens/AddProducts2";

const homeIcon_active = require("./assets/icons/home-active.png");
const homeIcon = require("./assets/icons/home.png");
const compass_active = require("./assets/icons/compass-active.png");
const compass = require("./assets/icons/compass.png");
const savedIcon_active = require("./assets/icons/saved-active.png");
const savedIcon = require("./assets/icons/saved.png");
const settingsIcon_active = require("./assets/icons/settings-active.png");
const settingsIcon = require("./assets/icons/settings.png");
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
}

function TabNav() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? homeIcon_active : homeIcon;
          } else if (route.name === "Map") {
            iconName = focused ? compass_active : compass;
          } else if (route.name === "Saved") {
            iconName = focused ? savedIcon_active : savedIcon;
          } else if (route.name === "Settings") {
            iconName = focused ? settingsIcon_active : settingsIcon;
          }

          return (
            <Image
              source={iconName}
              resizeMode="contain"
              style={styles.footerIcon}
            />
          );
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          padding: 10,
          backgroundColor: "black",
        },
      })}
    >
      <Tab.Screen name="Home" component={CategoriesScreen} />
      <Tab.Screen name="Map" component={AddProducts2} />
      <Tab.Screen name="Saved" component={FavoritesScreen} />
      <Tab.Screen name="Settings" component={ChatList} />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    //fragment tags
    <>
      <StatusBar style="light" />
      {/*<FavoritesContextProvider> */}
      <Provider store={store}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#ef9b47" },
            headerTintColor: "white",
            contentStyle: { backgroundColor: "white" },
          }}
        >
          <Stack.Screen
            name="Drawer"
            component={TabNav}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Chat"
            component={Chat}
          />

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
      </Provider>
      {/* </FavoritesContextProvider> */}
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
      <PaperProvider>
      {user ? <AppStack /> : <AuthStack />}
      </PaperProvider>
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
    width: 25
  }
});
