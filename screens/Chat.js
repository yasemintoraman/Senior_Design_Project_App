import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";

import {
  onSnapshot,doc, setDoc
} from "firebase/firestore";

import { database } from "../config/firebase";

import { auth } from "../config/firebase";


const Chat = () => {

  const route = useRoute();

  const [messages, setMessages] = useState([]);

  const [uid, setUID] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUID(user?.uid);
      setName(user?.displayName);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const unsubscribeSnapshot = onSnapshot(
      doc(database, "chats", route.params.chatId),
      (snapshot) => {
        setMessages(snapshot.data()?.messages ?? []);
      }
    );
    return () => unsubscribeSnapshot();
  }, [route.params.chatId]);

  const onSend = async (newMessages = []) => {
    const updatedMessages = GiftedChat.append(messages, newMessages);
    await setDoc(
      doc(database, "chats", route.params.chatId),
      { messages: updatedMessages },
      { merge: true }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <GiftedChat
        messages={messages.map((x) => ({
          ...x,
          createdAt: x.createdAt?.toDate(),
        }))}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: uid,
          name: name,
        }}
      />
    </View>
  );
};

export default Chat;
