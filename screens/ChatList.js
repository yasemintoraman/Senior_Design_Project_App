import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  List,
  Avatar,
  Divider,
  FAB,
  Portal,
  Dialog,
  Button,
  TextInput,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import {
  onSnapshot,
  addDoc,
  query,
  where,
  getDocs,
  collection,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { auth, database, chatsRef, useUserEmail } from "../config/firebase";

const ChatList = () => {
  const navigation = useNavigation();
  const email = useUserEmail();
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState({});

  useEffect(() => {
    const q = query(chatsRef, where("users", "array-contains", email));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const userChats = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const userEmails = [
        ...new Set(
          userChats.flatMap((chat) => chat.users.filter((user) => user !== email))
        ),
      ];

      const userProfiles = await fetchUserProfiles(userEmails);

      setChats(userChats);
      setUserProfiles(userProfiles);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [email]);

  useEffect(() => {
    if (selectedItems.length > 0) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity style={styles.trashBin} onPress={handleDeleteChat}>
            <View>
              <Ionicons name="trash" size={24} color={"black"} />
            </View>
          </TouchableOpacity>
        ),
        headerLeft: () => (
          <Text style={styles.itemCount}>{selectedItems.length}</Text>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => {},
        headerLeft: () => {},
      });
    }
  }, [selectedItems]);

  const fetchUserProfiles = async (emails) => {
    const profiles = {};
    const userQuery = query(
      collection(database, "users"),
      where("email", "in", emails)
    );
    const userSnapshot = await getDocs(userQuery);
    userSnapshot.forEach((doc) => {
      profiles[doc.data().email] = doc.data();
    });
    return profiles;
  };

  const handleChatName = (chat) => {
    if (chat.groupName) {
      return chat.groupName;
    } else {
      const otherUser = chat.users.find((x) => x !== email);
      return otherUser || "~ No Name ~";
    }
  };

  const handleOnPress = (chat) => {
    if (selectedItems.length) {
      return selectItems(chat);
    }
    navigation.navigate("Chat", {
      chatId: chat.id,
      chatName: handleChatName(chat),
      imageUrl:  userProfiles[chat.users.find((x) => x !== email)]?.imageUrl,
    });
  };

  const handleLongPress = (chat) => {
    selectItems(chat);
  };

  const selectItems = (chat) => {
    if (selectedItems.includes(chat.id)) {
      const newListItems = selectedItems.filter(
        (listItem) => listItem !== chat.id
      );
      return setSelectedItems([...newListItems]);
    }
    setSelectedItems([...selectedItems, chat.id]);
  };

  const getSelected = (chat) => {
    return selectedItems.includes(chat.id);
  };

  const deSelectItems = () => {
    setSelectedItems([]);
  };

  const handleDeleteChat = () => {
    Alert.alert(
      selectedItems.length > 1 ? "Delete selected chats?" : "Delete this chat?",
      "Messages will be removed from this device.",
      [
        {
          text: "Delete chat",
          onPress: () => {
            selectedItems.map((chatId) => {
              let willUpdatedUsers = [];
              chats.map((chat) => {
                if (chatId == chat.id) {
                  chat.users.map((user) => {
                    if (user === email) {
                      willUpdatedUsers.push({
                        email: user,
                        deletedFromChat: true,
                      });
                    } else {
                      willUpdatedUsers.push({
                        email: user,
                        deletedFromChat: false,
                      });
                    }
                  });
                }
              });
              setDoc(
                doc(database, "chats", chatId),
                {
                  users: willUpdatedUsers,
                },
                { merge: true }
              );
              let deletedFromChatUsers = willUpdatedUsers.filter(
                (user) => user.deletedFromChat
              ).length;
              if (willUpdatedUsers.length === deletedFromChatUsers) {
                deleteDoc(doc(database, "chats", chatId));
              }
            });
            deSelectItems();
          },
        },
        {
          text: "Cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  async function pressHandler() {
    if (!email || !userEmail) return;
    setIsLoading(true);

    if (email === userEmail) {
      Alert.alert(
        "Error",
        "The entered email cannot be the same as the logged-in email.",[
          
        ], { cancelable: true}
      );
      setIsLoading(false);
      return;
    }

    if (!validateEmail(userEmail)) {
      Alert.alert("Error", "The entered email is not in a valid format.",[
          
      ], { cancelable: true}
    );
      setIsLoading(false);
      return;
    }

    try {
      const userQuery = query(
        collection(database, "users"),
        where("email", "==", userEmail)
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {

        Alert.alert(
          "Error",
          "The entered email is not registered in the system.",[
          
          ], { cancelable: true}
        );
        setIsLoading(false);
        return;
      }

      const sortedUsers = [email, userEmail].sort().join(",");
      const chatQuery = query(
        chatsRef,
        where("users", "array-contains-any", [email, userEmail])
      );
      const chatSnapshot = await getDocs(chatQuery);

      let chatId = null;

      chatSnapshot.forEach((doc) => {
        const chatData = doc.data();
        const chatUsers = chatData.users;
        if (
          chatUsers.length === 2 &&
          chatUsers.includes(email) &&
          chatUsers.includes(userEmail)
        ) {
          chatId = doc.id;
          return;
        }
      });

      if (chatId) {
        setIsLoading(false);
        setIsDialogVisible(false);
        setUserEmail("");
        navigation.navigate("Chat", { chatId });
      } else {
        const response = await addDoc(chatsRef, {
          users: [email, userEmail],
        });
        setIsLoading(false);
        setIsDialogVisible(false);
        setUserEmail("");
        navigation.navigate("Chat", { chatId: response.id });
      }
    } catch (error) {
      console.error("An error occurred during the chat process:", error);
      setIsLoading(false);
    }
  }

  const ContactRow = ({
    name,
    subtitle,
    imageUrl,
    onPress,
    style,
    onLongPress,
    selected,
    showForwardIcon = true,
    subtitle2,
  }) => {
    return (
      <TouchableOpacity
        style={[styles.row, style]}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <View style={styles.avatar}>
          <Image source={{ uri: { imageUrl } }} />
        </View>

        <View style={styles.textsContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.textsContainer}>
          <Text style={styles.subtitle2}>{subtitle2}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fdf5ed" }}>
      {loading ? (
        <ActivityIndicator size="large" style={styles.loadingContainer} />
      ) : chats.length === 0 ? (
        <View style={styles.blankContainer}>
          <Text style={styles.textContainer}>No conversations yet</Text>
        </View>
      ) : (
        <ScrollView>
          {chats.map((chat) => (
            <React.Fragment key={chat.id}>
              <List.Item
                style={getSelected(chat) ? styles.selectedContactRow : ""}
                title={handleChatName(chat)}
                description={
                  chat.messages && chat.messages[0]
                    ? chat.messages[0].text
                    : "No messages yet"
                }
                left={() => (
                  <Avatar.Image
                    source={{ uri: userProfiles[chat.users.find((x) => x !== email)]?.imageUrl ||
                      "https://firebasestorage.googleapis.com/v0/b/sdpapp-5a06e.appspot.com/o/file_1716803139629?alt=media&token=c736ceb9-6d6c-4eea-bfe6-002c81b7ec7e",
                    }}
                    size={46}
                    style={{marginLeft: 5}}
                  />
                )}
                onPress={() => handleOnPress(chat)}
                onLongPress={() => handleLongPress(chat)}
                selected={getSelected(chat)}
                showForwardIcon={false}
              />
              <Divider inset />
            </React.Fragment>
          ))}

          <View style={styles.blankContainer}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: 400,
                marginRight: 15,
                marginLeft: -30,
                marginTop: 15,
                marginBottom: 90,
              }}
            >
              <Ionicons
                name="lock-open"
                size={12}
                style={{ color: "#565656" }}
              />{" "}
              Your personal messages are not{" "}
              <Text style={{ color: "purple" }}>end-to-end-encrypted</Text>
            </Text>
          </View>
        </ScrollView>
      )}

      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={() => {
            setIsDialogVisible(false);
            setUserEmail("");
          }}
        >
          <Dialog.Title>New Chat</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Enter user email"
              value={userEmail}
              onChangeText={(text) => setUserEmail(text)}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setIsDialogVisible(false);
                setUserEmail("");
              }}
            >
              Cancel
            </Button>
            <Button onPress={pressHandler} loading={isLoading}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setIsDialogVisible(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },
  selectedContactRow: {
    backgroundColor: "#E0E0E0",
  },
  trashBin: {
    right: 12,
  },
  itemCount: {
    left: 320,
    fontSize: 18,
    fontWeight: 400,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  blankContainer: {
    alignItems: "center",
    marginTop: 35,
    justifyContent: "center",
  },
  textContainer: {
    fontSize: 16,
    fontWeight: 500,
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  name: {
    fontSize: 16,
  },
  subtitle: {
    marginTop: 2,
    color: "#565656",
    width: 240,
  },
  subtitle2: {
    fontSize: 12,
    left: 96,
    color: "#565656",
  },
  textsContainer: {
    flex: 1,
    marginStart: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B39DDB",
  },
  avatarLabel: {
    fontSize: 20,
    color: "white",
  },
});

export default ChatList;
