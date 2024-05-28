import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { GiftedChat, InputToolbar } from "react-native-gifted-chat";
import { onSnapshot, doc, setDoc, query, where, getDocs, collection } from "firebase/firestore";
import { database, auth } from "../config/firebase";
import { Avatar } from "react-native-paper";

const Chat = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const [uid, setUID] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userProfiles, setUserProfiles] = useState({});
  const { chatId, imageUrl } = route.params;

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUID(user?.uid);
      setName(user?.displayName);
      setEmail(user?.email);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const unsubscribeSnapshot = onSnapshot(
      doc(database, "chats", chatId),
      async (snapshot) => {
        const chatData = snapshot.data();
        setMessages(chatData?.messages ?? []);

        const userEmails = chatData?.users ?? [];
        const profiles = await fetchUserProfiles(userEmails);
        setUserProfiles(profiles);
      }
    );
    return () => unsubscribeSnapshot();
  }, [chatId]);

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

  const onSend = async (newMessages = []) => {
    const updatedMessages = GiftedChat.append(messages, newMessages.map((msg) => ({
      ...msg,
      user: {
        ...msg.user,
        email: email,
      },
    })));
    await setDoc(
      doc(database, "chats", chatId),
      { messages: updatedMessages },
      { merge: true }
    );
  };

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{ backgroundColor: "#fdf5ed" }}
      />
    );
  };

  const renderAvatar = (props) => {
    return (
      <Avatar.Image
        source={{
          uri: imageUrl || "https://firebasestorage.googleapis.com/v0/b/sdpapp-5a06e.appspot.com/o/file_1716803139629?alt=media&token=c736ceb9-6d6c-4eea-bfe6-002c81b7ec7e",
        }}
        size={40}
        style={{ marginRight: 8 }}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fdf5ed" }}>
      <GiftedChat
        messages={messages.map((x) => ({
          ...x,
          createdAt: x.createdAt?.toDate(),
        }))}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: uid,
          name: name,
          email: email,
        }}
        renderInputToolbar={renderInputToolbar}
        renderAvatar={renderAvatar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B39DDB",
  },
});

export default Chat;
