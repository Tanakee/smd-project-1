// screens/MapScreen.js

import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions,
  Animated, PanResponder, TextInput, Alert, Keyboard,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import styles from "../styles/MapScreenStyles";

const screenHeight = Dimensions.get("window").height;
const MIN_SHEET_HEIGHT = 100;
const MAX_SHEET_HEIGHT = screenHeight * 0.6;

// 感情の色と絵文字の定義
const EMOTION_DATA = [
  { emotion: "平穏", color: "#FFF9C4", emoji: "😌" },
  { emotion: "喜び", color: "#FFD600", emoji: "😊" },
  { emotion: "楽観", color: "#FFC107", emoji: "😄" },
  { emotion: "愛", color: "#FF8A80", emoji: "❤️" },
  { emotion: "容認", color: "#A8E6CF", emoji: "🤗" },
  { emotion: "信頼", color: "#4CAF50", emoji: "🤝" },
  { emotion: "服従", color: "#81C784", emoji: "🙏" },
  { emotion: "驚き", color: "#00B8D4", emoji: "😮" },
  { emotion: "畏怖", color: "#1E88E5", emoji: "😱" },
  { emotion: "恐怖", color: "#3F51B5", emoji: "😨" },
  { emotion: "不安", color: "#9575CD", emoji: "😟" },
  { emotion: "悲しみ", color: "#7986CB", emoji: "😢" },
  { emotion: "哀愁", color: "#B39DDB", emoji: "😔" },
  { emotion: "後悔", color: "#9E9E9E", emoji: "😥" },
  { emotion: "嫌悪", color: "#DDA0DD", emoji: "🤢" },
  { emotion: "退屈", color: "#9E9E9E", emoji: "🥱" },
  { emotion: "軽蔑", color: "#E57373", emoji: "😒" },
  { emotion: "怒り", color: "#F44336", emoji: "😡" },
  { emotion: "攻撃", color: "#D32F2F", emoji: "😠" },
  { emotion: "苛立ち", color: "#E57373", emoji: "😤" },
  { emotion: "警戒", color: "#FFECB3", emoji: "🤨" },
  { emotion: "関心", color: "#FFEB3B", emoji: "🤔" },
  { emotion: "期待", color: "#FFEB3B", emoji: "🤩" },
  { emotion: "疲労", color: "#616161", emoji: "😩" },
  { emotion: "安心", color: "#2196F3", emoji: "😌" },
];

// ヒートマップ用の色を定義（透明度を0.4に変更）
const emotionHeatmapColors = {
  "平穏": "rgba(255, 249, 196, 0.4)",
  "喜び": "rgba(255, 214, 0, 0.4)",
  "楽観": "rgba(255, 193, 7, 0.4)",
  "愛": "rgba(255, 138, 128, 0.4)",
  "容認": "rgba(168, 230, 207, 0.4)",
  "信頼": "rgba(76, 175, 80, 0.4)",
  "服従": "rgba(129, 199, 132, 0.4)",
  "驚き": "rgba(0, 184, 212, 0.4)",
  "畏怖": "rgba(30, 136, 229, 0.4)",
  "恐怖": "rgba(63, 81, 181, 0.4)",
  "不安": "rgba(149, 117, 205, 0.4)",
  "悲しみ": "rgba(121, 134, 203, 0.4)",
  "哀愁": "rgba(179, 157, 219, 0.4)",
  "後悔": "rgba(158, 158, 158, 0.4)",
  "嫌悪": "rgba(221, 192, 221, 0.4)",
  "退屈": "rgba(158, 158, 158, 0.4)",
  "軽蔑": "rgba(229, 115, 115, 0.4)",
  "怒り": "rgba(244, 67, 54, 0.4)",
  "攻撃": "rgba(211, 47, 47, 0.4)",
  "苛立ち": "rgba(229, 115, 115, 0.4)",
  "警戒": "rgba(255, 236, 179, 0.4)",
  "関心": "rgba(255, 235, 59, 0.4)",
  "期待": "rgba(255, 235, 59, 0.4)",
  "疲労": "rgba(97, 97, 97, 0.4)",
  "安心": "rgba(33, 150, 243, 0.4)",
};

const generateDummyGeoLogs = (num) => {
  const dummyLogs = [];
  const locations = [
    "博多駅", "天神", "中洲", "キャナルシティ博多", "福岡空港",
    "大濠公園", "ヤフオクドーム", "マリノアシティ福岡", "海の中道海浜公園",
    "志賀島", "福岡タワー", "櫛田神社", "太宰府天満宮"
  ];
  const emotions = EMOTION_DATA.map(e => e.emotion);
  const feelings = [
    "最高！", "ちょっと悲しい", "めちゃくちゃ怒ってる！", "平和だなぁ",
    "ワクワクする！", "イライラする", "落ち着く", "不安だ...",
    "感動した", "疲れた...", "楽しい！", "びっくりした！", "飽きた",
    "愛を感じる", "納得いかない", "期待してる", "退屈だ", "軽蔑する",
    "気分がいい！", "寂しい夜", "どうでもいい気分", "なんか楽しい"
  ];

  for (let i = 0; i < num; i++) {
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomFeeling = feelings[Math.floor(Math.random() * feelings.length)];

    let latitude, longitude;
    if (randomLocation.includes("空港")) {
      latitude = 33.584 + Math.random() * (33.587 - 33.584);
      longitude = 130.447 + Math.random() * (130.452 - 130.447);
    } else if (randomLocation.includes("大濠公園")) {
      latitude = 33.585 + Math.random() * (33.589 - 33.585);
      longitude = 130.380 + Math.random() * (130.385 - 130.380);
    } else if (randomLocation.includes("マリノア")) {
      latitude = 33.586 + Math.random() * (33.589 - 33.586);
      longitude = 130.320 + Math.random() * (130.325 - 130.320);
    } else if (randomLocation.includes("海の中道") || randomLocation.includes("志賀島")) {
      latitude = 33.660 + Math.random() * (33.680 - 33.660);
      longitude = 130.350 + Math.random() * (130.400 - 130.350);
    } else if (randomLocation.includes("太宰府")) {
      latitude = 33.520 + Math.random() * (33.525 - 33.520);
      longitude = 130.510 + Math.random() * (130.520 - 130.510);
    }
    else {
      latitude = 33.588 + Math.random() * (33.596 - 33.588);
      longitude = 130.395 + Math.random() * (130.425 - 130.395);
    }

    dummyLogs.push({
      id: `m${i + 1}`,
      location: randomLocation,
      feeling: randomFeeling,
      emotion: randomEmotion,
      latitude: latitude,
      longitude: longitude,
    });
  }
  return dummyLogs;
};

const initialMapGeoLogs = generateDummyGeoLogs(50);

export default function MapScreen({ route }) {
  // ダミーデータに関する状態管理
  const [mapGeoLogs, setMapGeoLogs] = useState(initialMapGeoLogs);

  // 位置情報に関する状態管理
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // UIに関する状態管理
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const sheetHeightAnim = useRef(new Animated.Value(MIN_SHEET_HEIGHT)).current;
  const currentSheetHeight = useRef(MIN_SHEET_HEIGHT);
  const [isHeatmapMode, setIsHeatmapMode] = useState(false);
  const mapRef = useRef(null);
  const [showPostField, setShowPostField] = useState(false);
  const [postText, setPostText] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("喜び");

  // 現在地取得
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("位置情報へのアクセスが拒否されました");
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  // ホーム画面からの遷移時に投稿画面を開く
  useEffect(() => {
    if (route?.params?.openPost) {
      setShowPostField(true);
    }
  }, [route?.params]);

  // ボトムシートのドラッグ操作
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        sheetHeightAnim.stopAnimation();
      },
      onPanResponderMove: (evt, gestureState) => {
        const newHeight = currentSheetHeight.current - gestureState.dy;
        const clampedHeight = Math.max(MIN_SHEET_HEIGHT, Math.min(MAX_SHEET_HEIGHT, newHeight));
        sheetHeightAnim.setValue(clampedHeight);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const finalHeight = currentSheetHeight.current;
        const velocity = gestureState.vy;
        let targetHeight;
        let newIsExpanded;
        if (velocity < -0.5) {
          targetHeight = MAX_SHEET_HEIGHT;
          newIsExpanded = true;
        } else if (velocity > 0.5) {
          targetHeight = MIN_SHEET_HEIGHT;
          newIsExpanded = false;
        } else {
          if (finalHeight > (MIN_SHEET_HEIGHT + MAX_SHEET_HEIGHT) / 2) {
            targetHeight = MAX_SHEET_HEIGHT;
            newIsExpanded = true;
          } else {
            targetHeight = MIN_SHEET_HEIGHT;
            newIsExpanded = false;
          }
        }
        Animated.timing(sheetHeightAnim, {
          toValue: targetHeight,
          duration: 300,
          useNativeDriver: false,
        }).start(() => {
          currentSheetHeight.current = targetHeight;
          setIsSheetExpanded(newIsExpanded);
        });
      },
    })
  ).current;

  // 新規GeoLog投稿処理
  const handlePostGeoLog = async () => {
    if (!postText.trim() || !location) {
      Alert.alert("エラー", "投稿内容と位置情報が必要です。");
      return;
    }
    const newLog = {
      id: `user-${Date.now()}`,
      location: "現在地",
      feeling: postText,
      emotion: selectedEmotion,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setMapGeoLogs([...mapGeoLogs, newLog]);
    setShowPostField(false);
    setPostText("");
  };

  return (
    <View style={styles.container}>
      {/* マップ表示エリア */}
      <View style={styles.mapContainer}>
        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : location ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={true}
          >
            {/* ヒートマップ表示 or ピン表示の切り替え */}
            {isHeatmapMode ? (
              mapGeoLogs.map((item) => {
                const fillColor = emotionHeatmapColors[item.emotion] || 'rgba(158, 158, 158, 0.4)';
                return (
                  <Circle
                    key={item.id}
                    center={{ latitude: item.latitude, longitude: item.longitude }}
                    radius={250}
                    fillColor={fillColor}
                    strokeWidth={0}
                    strokeColor="transparent"
                  />
                );
              })
            ) : (
              mapGeoLogs.map((item) => {
                const emotionData = EMOTION_DATA.find(e => e.emotion === item.emotion);
                const pinColor = emotionData ? emotionData.color : "#9E9E9E";
                const pinEmoji = emotionData ? emotionData.emoji : "📍";
                return (
                  <Marker
                    key={item.id}
                    coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                    title={item.location}
                    description={item.feeling}
                  >
                    <View style={[styles.emotionMarker, { backgroundColor: pinColor }]}>
                      <Text style={styles.emotionEmoji}>{pinEmoji}</Text>
                    </View>
                  </Marker>
                );
              })
            )}
          </MapView>
        ) : (
          <Text style={styles.loadingText}>現在地を取得中...</Text>
        )}
      </View>
      
      {/* マップ上のボタン類 */}
      <Animated.View style={[styles.postGeoLogButton, { bottom: Animated.add(sheetHeightAnim, 20) }]}>
        <TouchableOpacity onPress={() => setShowPostField(true)}>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.toggleHeatmapButton, { bottom: Animated.add(sheetHeightAnim, 20) }]}>
        <TouchableOpacity onPress={() => setIsHeatmapMode(!isHeatmapMode)}>
          <MaterialCommunityIcons 
            name={isHeatmapMode ? "pin" : "fire"} 
            size={24} 
            color="#fff"
          />
        </TouchableOpacity>
      </Animated.View>

      {/* 投稿機能（モーダル） */}
      {showPostField && (
        <>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => {
              setShowPostField(false);
              Keyboard.dismiss();
            }}
          />
          <View style={styles.postFieldContainer}>
            <Text style={styles.postFieldTitle}>今、あなたは何を感じる？</Text>
            <ScrollView horizontal style={styles.emotionSelector}>
              {EMOTION_DATA.map((item) => (
                <TouchableOpacity
                  key={item.emotion}
                  style={[
                    styles.emotionButton,
                    { backgroundColor: item.color },
                    selectedEmotion === item.emotion && styles.selectedEmotionButton,
                  ]}
                  onPress={() => setSelectedEmotion(item.emotion)}
                >
                  <Text style={styles.emotionButtonText}>{item.emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput
              style={styles.postTextInput}
              placeholder="場所での体験をメモ..."
              value={postText}
              onChangeText={setPostText}
              multiline
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <TouchableOpacity style={styles.photoButton} onPress={() => Alert.alert("写真撮影", "写真撮影機能はプロトタイプのためダミーです。")}>
              <Ionicons name="camera-outline" size={24} color="#4CAF50" />
              <Text style={styles.photoButtonText}>写真を撮る</Text>
            </TouchableOpacity>
            <View style={styles.postActionButtons}>
              <TouchableOpacity style={[styles.postActionButton, { backgroundColor: "#ccc" }]} onPress={() => setShowPostField(false)}>
                <Text>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.postActionButton, { backgroundColor: "#4CAF50", marginLeft: 10 }]} onPress={handlePostGeoLog}>
                <Text style={{ color: "#fff" }}>投稿</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* ボトムシート */}
      <Animated.View style={[styles.bottomSheet, { height: sheetHeightAnim }]}>
        <View {...panResponder.panHandlers} style={styles.sheetHeader}>
          <View style={styles.handleIndicator} />
        </View>
        {isSheetExpanded && (
          <ScrollView style={styles.listContent}>
            <Text style={styles.nearbyTitle}>現在地周辺のGeoLog</Text>
            {mapGeoLogs.map((item) => {
              const emotionData = EMOTION_DATA.find(e => e.emotion === item.emotion);
              const pinEmoji = emotionData ? emotionData.emoji : "📍";
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.nearbyGeoLogCard}
                  onPress={() => mapRef.current.animateToRegion({
                    latitude: item.latitude,
                    longitude: item.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }, 500)}
                >
                  <Text style={styles.nearbyGeoLogEmoji}>{pinEmoji}</Text>
                  <View style={styles.nearbyGeoLogContent}>
                    <Text style={styles.nearbyGeoLogLocation}>{item.location}</Text>
                    <Text style={styles.nearbyGeoLogFeeling}>{item.feeling}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}