import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, phoenixColors } from '@wisdom/shared-ui';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export function OnboardingScreen() {
  const navigation = useNavigation<any>();

  return (
    <LinearGradient
      colors={[phoenixColors.smoke, phoenixColors.ash, phoenixColors.indigo]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🔥</Text>
          <Text style={styles.title}>WisdomOS</Text>
          <Text style={styles.tagline}>Rise into Fulfillment</Text>
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.message}>
            Transform your life through the Phoenix Cycle
          </Text>
          <Text style={styles.submessage}>
            Journal your journey, track your transformation, and rise from ashes to clarity
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Begin Your Journey"
            onPress={() => navigation.navigate('Home')}
            variant="primary"
            size="lg"
            style={styles.button}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: height * 0.1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: phoenixColors.gold,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: phoenixColors.flame,
    fontStyle: 'italic',
  },
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
  },
  submessage: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  button: {
    width: '100%',
  },
});