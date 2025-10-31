import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Button, phoenixColors } from '@wisdomos/ui';
import { useNavigation } from '@react-navigation/native';

export function HomeScreen() {
  const navigation = useNavigation<any>();

  const quickActions = [
    { title: '📝 Journal Entry', screen: 'Journal' },
    { title: '📊 Life Dashboard', screen: 'Dashboard' },
    { title: '🔄 Reset Ritual', screen: 'Reset' },
    { title: '🏆 Badges', screen: 'Badges' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.phoenixStage}>Phoenix Stage: 🔥 Fire</Text>
      </View>

      <View style={styles.pulseCard}>
        <Text style={styles.pulseTitle}>Today's Pulse</Text>
        <View style={styles.pulseEmojis}>
          <Pressable style={styles.pulseOption}>
            <Text style={styles.emoji}>😊</Text>
            <Text style={styles.emojiLabel}>Great</Text>
          </Pressable>
          <Pressable style={[styles.pulseOption, styles.pulseSelected]}>
            <Text style={styles.emoji}>😐</Text>
            <Text style={styles.emojiLabel}>Okay</Text>
          </Pressable>
          <Pressable style={styles.pulseOption}>
            <Text style={styles.emoji}>😔</Text>
            <Text style={styles.emojiLabel}>Challenging</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {quickActions.map((action, index) => (
          <Pressable
            key={index}
            style={styles.actionCard}
            onPress={() => navigation.navigate(action.screen)}
          >
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionArrow}>→</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>7</Text>
          <Text style={styles.statLabel}>Days Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Areas Thriving</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Badges Earned</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: phoenixColors.smoke,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  phoenixStage: {
    fontSize: 16,
    color: phoenixColors.orange,
  },
  pulseCard: {
    backgroundColor: phoenixColors.ash,
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  pulseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: phoenixColors.gold,
    marginBottom: 15,
  },
  pulseEmojis: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  pulseOption: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
  },
  pulseSelected: {
    backgroundColor: phoenixColors.indigo,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  emojiLabel: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  quickActions: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: phoenixColors.gold,
    marginBottom: 15,
  },
  actionCard: {
    backgroundColor: phoenixColors.ash,
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  actionArrow: {
    fontSize: 20,
    color: phoenixColors.orange,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingTop: 0,
  },
  statCard: {
    backgroundColor: phoenixColors.ash,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: phoenixColors.gold,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#B0B0B0',
  },
});