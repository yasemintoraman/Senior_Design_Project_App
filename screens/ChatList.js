import React, { useState, useEffect } from "react";
import { Text, View } from "react-native";
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

import { onSnapshot, addDoc, query, where} from "firebase/firestore";

import { chatsRef, useUserEmail } from "../config/firebase";
import Chat from "./Chat";



const ChatList = () => {
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const email = useUserEmail();
  const [userEmail, setUserEmail] = useState("");


  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const createChat = async () => {
    if (!email || !userEmail) return;
    setIsLoading(true);
    try {
      const response = await addDoc(chatsRef, {
        users: [email, userEmail],
      });
      setIsLoading(false);
      setIsDialogVisible(false);
      navigation.navigate("Chat", { chatId: response.id });
    } catch (error) {
      console.error("Sohbet oluşturulurken bir hata oluştu:", error);
      setIsLoading(false);
    }
  };

  const [chats, setChats] = useState([]);
  useEffect(() => {
    const q = query(chatsRef, where("users", "array-contains", email));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userChats = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(userChats);
    });
    return () => unsubscribe();
  }, [email]);

  return (
    <View style={{ flex: 1 }}>
      {chats.map((chat) => (
        <React.Fragment>
          <List.Item
            title={chat.users.find((x) => x !== email)}
            description={(chat.messages ?? [])[0]?.text ?? undefined}
            left={() => (
              <Avatar.Text
                label={chat
                  .users.find((x) => x !== email)
                  .split(" ")
                  .reduce((prev, current) => prev + current[0], "")}
                size={56}
              />
            )}
            onPress={() => navigation.navigate("Chat", { chatId: chat.id })}
          />
          <Divider inset />
        </React.Fragment>
      ))}

      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={() => setIsDialogVisible(false)}
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
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={() => createChat()} loading={isLoading}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB //yeni mesaj eklemek icin kullaniyoruz
        icon="plus"
        style={{ position: "absolute", bottom: 16, right: 16 }}
        onPress={() => setIsDialogVisible(true)}
      />
    </View>
  );
};

export default ChatList;
