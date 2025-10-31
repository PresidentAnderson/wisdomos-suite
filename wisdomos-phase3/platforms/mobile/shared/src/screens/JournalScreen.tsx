import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, phoenixColors } from '@wisdom/shared-ui';
import { useNavigation } from '@react-navigation/native';

export function JournalScreen() {
  const navigation = useNavigation();
  const [content, setContent] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  const lifeAreas = [
    'Work & Purpose',
    'Health & Recovery',
    'Finance',
    'Intimacy & Love',
    'Time & Energy',
    'Spiritual Alignment',
  ];

  const handleSave = () => {
    // TODO: Save journal entry via API
    console.log('Saving journal:', { content, selectedArea });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Journal Entry</Text>
          <Text style={styles.subtitle}>What's on your mind today?</Text>
        </View>

        <View style={styles.areaSelector}>
          <Text style={styles.label}>Life Area</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {lifeAreas.map((area) => (
              <Pressable
                key={area}
                style={[
                  styles.areaChip,
                  selectedArea === area && styles.areaChipSelected,
                ]}
                onPress={() => setSelectedArea(area)}
              >
                <Text style={[
                  styles.areaChipText,
                  selectedArea === area && styles.areaChipTextSelected,
                ]}>
                  {area}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Thoughts</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Write about your day, upsets, wins, or insights..."
            placeholderTextColor="#666"
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.aiContainer}>
          <Text style={styles.aiPrompt}>
            💡 AI will help detect upsets and offer reframing suggestions
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Save Entry"
            onPress={handleSave}
            variant="primary"
            size="lg"
            disabled={!content || !selectedArea}
          />
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="lg"
            style={{ marginTop: 10 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: phoenixColors.smoke,
  },
  scrollView: {
    flex: 1,
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
  areaSelector: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: phoenixColors.flame,
    marginBottom: 10,
  },
  areaChip: {
    backgroundColor: phoenixColors.ash,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  areaChipSelected: {
    backgroundColor: phoenixColors.indigo,
    borderColor: phoenixColors.gold,
  },
  areaChipText: {
    color: '#B0B0B0',
    fontSize: 14,
  },
  areaChipTextSelected: {
    color: phoenixColors.gold,
    fontWeight: '600',
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: phoenixColors.ash,
    borderRadius: 12,
    padding: 15,
    minHeight: 200,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  aiContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  aiPrompt: {
    fontSize: 14,
    color: phoenixColors.orange,
    fontStyle: 'italic',
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});