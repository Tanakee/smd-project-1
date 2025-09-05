// screens/HomeScreen.js
import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from "../styles/HomeScreenStyles";

export default function HomeScreen({ navigation }) {
  const currentFeeling = {
    location: '博多駅',
    summary: '活気と少しの苛立ち',
    mainTag: '#通勤',
    icon: 'train-outline',
  };

  const featuredTopic = {
    title: '今日のGeoLogミッション',
    description: '博多のパワースポットを探して #平穏 を投稿しよう',
    imageUrl: 'https://placehold.co/300x150/9E9E9E/000?text=博多の神社仏閣',
  };

  const recommendedPosts = [
    {
      id: '1',
      user: 'GeoLog太郎',
      location: 'キャナルシティ',
      feeling: '噴水ショーが綺麗！心が踊るような #喜び',
      tags: ['#楽しい', '#感動'],
      imageUrl: 'https://placehold.co/300x200/FFD600/000?text=キャナルシティ博多',
      likes: 120,
    },
    {
      id: '2',
      user: 'GeoLog花子',
      location: '中洲屋台',
      feeling: '屋台の雰囲気に圧倒されて #驚き',
      tags: ['#グルメ', '#発見'],
      imageUrl: 'https://placehold.co/300x200/00B8D4/000?text=中洲屋台',
      likes: 85,
    },
    {
      id: '3',
      user: 'GeoLog次郎',
      location: '博多駅',
      feeling: '雨でびしょ濡れ、最悪... #悲しみ',
      tags: ['#憂鬱', '#雨'],
      imageUrl: 'https://placehold.co/300x200/7986CB/000?text=博多駅',
      likes: 95,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.currentFeelingCard}>
        <Text style={styles.currentLocationText}>{currentFeeling.location}</Text>
        <View style={styles.feelingSummary}>
          <Ionicons name={currentFeeling.icon} size={40} color="#4CAF50" />
          <Text style={styles.summaryText}>{currentFeeling.summary}</Text>
        </View>
        <Text style={styles.mainTagText}>{currentFeeling.mainTag}</Text>
        <TouchableOpacity
          style={styles.postButton}
          onPress={() => navigation.navigate('マップ', { openPost: true })}
        >
          <Text style={styles.postButtonText}>今、あなたは何を感じる？ GeoLogを投稿</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>注目のお題</Text>
        <View style={styles.featuredTopicCard}>
          <Image source={{ uri: featuredTopic.imageUrl }} style={styles.featuredTopicImage} />
          <View style={styles.featuredTopicTextContainer}>
            <Text style={styles.featuredTopicTitle}>{featuredTopic.title}</Text>
            <Text style={styles.featuredTopicDescription}>{featuredTopic.description}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>あなたへのおすすめGeoLog</Text>
        {recommendedPosts.map(post => (
          <View key={post.id} style={styles.postCard}>
            <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
            <View style={styles.postContent}>
              <Text style={styles.postUser}>{post.user} @ {post.location}</Text>
              <Text style={styles.postFeeling}>{post.feeling}</Text>
              <View style={styles.postTags}>
                {post.tags.map((tag, index) => (
                  <Text key={index} style={styles.tagText}>{tag}</Text>
                ))}
              </View>
              <View style={styles.postActions}>
                <Ionicons name="heart-outline" size={20} color="gray" />
                <Text style={styles.likesText}>{post.likes}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}