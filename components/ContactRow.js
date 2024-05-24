import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons'

const ContactRow = ({ name, subtitle, onPress, style, onLongPress, selected, showForwardIcon = true, subtitle2 }) => {
    return (
        <TouchableOpacity style={[styles.row, style]} onPress={onPress} onLongPress={onLongPress}>
            <View style={styles.avatar}>
                <Text style={styles.avatarLabel}>
                    {name.trim().split(' ').reduce((prev, current) => `${prev}${current[0]}`, '')}
                </Text>
            </View>

            <View style={styles.textsContainer}>
                <Text style={styles.name}>
                    {name}
                </Text>
                <Text style={styles.subtitle}>
                    {subtitle}
                </Text>
            </View>

            <View style={styles.textsContainer}>
                <Text style={styles.subtitle2}>
                    {subtitle2}
                </Text>
            </View>



        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14
    },
    name: {
        fontSize: 16
    },
    subtitle: {
        marginTop: 2,
        color: '#565656',
        width: 240
    },
    subtitle2: {
        fontSize: 12,
        left: 96,
        color: '#565656',
    },
    textsContainer: {
        flex: 1,
        marginStart: 16
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "orange"
    },
    avatarLabel: {
        fontSize: 20,
        color: 'white'
    },
})

export default ContactRow;