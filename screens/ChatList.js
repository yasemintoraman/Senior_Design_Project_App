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

import { onSnapshot, addDoc, query, where, getDocs} from "firebase/firestore";

import { chatsRef, useUserEmail } from "../config/firebase";



const ChatList = () => {
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const email = useUserEmail();
  const [userEmail, setUserEmail] = useState("");


  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();


  async function pressHandler() {
    if (!email || !userEmail) return;
    setIsLoading(true);

    if (email === userEmail) {
      console.error("Hata: Giriş yaptığınız e-posta ile alıcı e-posta aynı olamaz."); //bunu window haline getir!
      return;
    }
  
    try {
      // Kullanıcıları sıralayarak sorguyu oluştur
      const sortedUsers = [email, userEmail].sort().join(',');
      const chatQuery = query(
        chatsRef,
        where("users", "array-contains-any", [email, userEmail])
      );
      const chatSnapshot = await getDocs(chatQuery);
  
      let chatId = null;
  
      chatSnapshot.forEach(doc => {
        const chatData = doc.data();
        const chatUsers = chatData.users;
        if (chatUsers.length === 2 && chatUsers.includes(email) && chatUsers.includes(userEmail)) {
          // Tüm üyeler bu iki kullanıcıysa, chatId'yi güncelle ve döngüyü sonlandır
          chatId = doc.id;
          return;
        }
      });
  
      if (chatId) {
        // Mevcut bir sohbet bulundu, Chat ekranını aç
        setIsLoading(false);
        setIsDialogVisible(false);
        navigation.navigate("Chat", { chatId });
      } else {
        // Mevcut bir sohbet yoksa yeni bir sohbet oluştur
        const response = await addDoc(chatsRef, {
          users: [email, userEmail], // Diziyi kullanıcıların e-postalarıyla oluştur
        });
        setIsLoading(false);
        setIsDialogVisible(false);
        navigation.navigate("Chat", { chatId: response.id });
      }
    } catch (error) {
      console.error("Sohbet işlemi sırasında bir hata oluştu:", error);
      setIsLoading(false);
    }
  }

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
        <React.Fragment key={chat.id}>
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
            <Button onPress={pressHandler} loading={isLoading}>
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
