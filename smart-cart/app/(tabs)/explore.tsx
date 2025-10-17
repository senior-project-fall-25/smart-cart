import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ExploreScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Explore</Text>
            <Text style={styles.subtitle}>Discover new products and deals!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
    },
});

export default ExploreScreen;