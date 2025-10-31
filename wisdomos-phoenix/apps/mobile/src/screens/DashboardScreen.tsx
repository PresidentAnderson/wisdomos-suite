import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { phoenixColors, wisdomColors } from '@wisdomos/ui';

const lifeAreas = [
  { id: '1', name: 'Work & Purpose', phoenix: 'Your Sacred Fire', status: 'green', score: 3 },
  { id: '2', name: 'Health & Recovery', phoenix: 'Your Inner Flame', status: 'yellow', score: 1 },
  { id: '3', name: 'Finance', phoenix: 'Your Golden Wings', status: 'green', score: 2 },
  { id: '4', name: 'Intimacy & Love', phoenix: 'Your Heart\'s Ember', status: 'red', score: -1 },
  { id: '5', name: 'Time & Energy', phoenix: 'Your Life Force', status: 'yellow', score: 0 },
  { id: '6', name: 'Spiritual Alignment', phoenix: 'Your Divine Spark', status: 'green', score: 4 },
];

export function DashboardScreen() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return wisdomColors.green;
      case 'yellow': return wisdomColors.yellow;
      case 'red': return wisdomColors.red;
      default: return wisdomColors.yellow;
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'green': return '🟢';
      case 'yellow': return '🟡';
      case 'red': return '🔴';
      default: return '🟡';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Life Areas Dashboard</Text>
        <Text style={styles.subtitle}>Your Phoenix Transformation</Text>
      </View>

      <View style={styles.grid}>
        {lifeAreas.map((area) => (
          <Pressable key={area.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.statusEmoji}>{getStatusEmoji(area.status)}</Text>
            </View>
            
            <Text style={styles.areaName}>{area.name}</Text>
            <Text style={styles.phoenixName}>{area.phoenix}</Text>
            
            <View style={styles.scoreContainer}>
              <Text style={[styles.score, { color: getStatusColor(area.status) }]}>
                {area.score > 0 ? '+' : ''}{area.score}
              </Text>
              <Text style={styles.scoreLabel}>Score</Text>
            </View>

            <View style={[styles.statusBar, { backgroundColor: getStatusColor(area.status) }]} />
          </Pressable>
        ))}
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
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: phoenixColors.gold,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  card: {
    width: '45%',
    backgroundColor: phoenixColors.ash,
    borderRadius: 16,
    padding: 15,
    margin: '2.5%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  statusEmoji: {
    fontSize: 20,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  phoenixName: {
    fontSize: 11,
    color: phoenixColors.flame,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#B0B0B0',
    marginTop: 2,
  },
  statusBar: {
    height: 3,
    borderRadius: 2,
    marginTop: 10,
  },
});