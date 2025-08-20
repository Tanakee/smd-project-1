// screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // アイコン表示のために利用
import styles from "../styles/HomeScreenStyles";

export default function HomeScreen({ navigation }) {
  // ダミーデータ：現在の場所の感情サマリー
  const currentFeeling = {
    location: '福岡市中央区',
    summary: '穏やかな午後',
    mainTag: '#癒し',
    icon: 'leaf-outline', // 癒しをイメージするアイコン
  };

  // ダミーデータ：注目のお題
  const featuredTopic = {
    title: '今日のGeoLogミッション',
    description: '#心惹かれる風景 を見つけよう',
    imageUrl: 'https://placehold.co/300x150/A0D9B1/000?text=今日のテーマ', // プレースホルダー画像
  };

  // ダミーデータ：おすすめGeoLog投稿
  const recommendedPosts = [
    {
      id: '1',
      user: 'GeoLog太郎',
      location: '大濠公園',
      feeling: '心が洗われるような景色でした！',
      tags: ['#感動', '#自然'],
      imageUrl: 'https://placehold.co/300x200/B0E0E6/000?text=大濠公園', // プレースホルダー画像
      likes: 120,
    },
    {
      id: '2',
      user: 'GeoLog花子',
      location: '天神地下街',
      feeling: '雨の日でも楽しめる隠れ家カフェ発見☕️',
      tags: ['#カフェ', '#発見'],
      imageUrl: 'https://placehold.co/300x200/F0E68C/000?text=カフェ', // プレースホルダー画像
      likes: 85,
    },
    {
      id: '3',
      user: 'GeoLog次郎',
      location: '博多駅',
      feeling: '新幹線を見るだけでワクワクする！',
      tags: ['#ワクワク', '#乗り物'],
      imageUrl: 'https://placehold.co/300x200/DDA0DD/000?text=博多駅', // プレースホルダー画像
      likes: 95,
    },
  ];

  return (
    // 全体をスクロール可能にするScrollView
    <ScrollView style={styles.container}>
      {/* 現在の場所の感情サマリーセクション */}
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

      {/* 注目のお題セクション */}
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

      {/* おすすめGeoLog投稿セクション */}
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