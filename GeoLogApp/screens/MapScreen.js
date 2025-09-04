// screens/MapScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  TextInput,
  Keyboard,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import styles from "../styles/MapScreenStyles";

const screenHeight = Dimensions.get("window").height;
const MIN_SHEET_HEIGHT = 100;
const MAX_SHEET_HEIGHT = screenHeight * 0.6;

const TAGS = [
  { label: "楽しい", value: "fun", color: "#FFD600" },
  { label: "悲しい", value: "sad", color: "#90A4AE" },
  { label: "面白い", value: "interesting", color: "#00B8D4" },
  { label: "歴史", value: "history", color: "#8BC34A" },
  { label: "動物", value: "animal", color: "#FF7043" },
  { label: "寒い", value: "cold", color: "#1976D2" },
  { label: "熱い", value: "hot", color: "#D32F2F" },
];

export default function MapScreen({ route }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mapGeoLogs, setMapGeoLogs] = useState([]); // <- ここを空配列に変更
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const sheetHeightAnim = useRef(new Animated.Value(MIN_SHEET_HEIGHT)).current;
  const currentSheetHeight = useRef(MIN_SHEET_HEIGHT);
  const [showPostField, setShowPostField] = useState(false);
  const [postText, setPostText] = useState("");
  const [locationNameInput, setLocationNameInput] = useState("");
  const [selectedTag, setSelectedTag] = useState(TAGS[0].value);

  const mapRef = useRef(null);
  
  // --- 現在地取得 ---
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

  // --- バックエンドから投稿データを取得 ---
  useEffect(() => {
    fetch("http://192.168.2.181:3000/api/posts") // <- 自分のPCのIPに変更
      .then(res => res.json())
      .then(data => setMapGeoLogs(data))
      .catch(err => console.error("API取得エラー:", err));
  }, []);

  // 画面遷移で投稿フィールド開く
  useEffect(() => {
    if (route?.params?.openPost) setShowPostField(true);
  }, [route?.params]);

  const handlePostGeoLog = async () => {
  if (!postText.trim() || !location || !locationNameInput.trim()) {
    Alert.alert("エラー", "場所名、投稿内容、および位置情報が必要です。");
    return;
  }
  const tagObj = TAGS.find(t => t.value === selectedTag);

  try {
    const response = await fetch("http://192.168.2.181:3000/api/geolog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: locationNameInput.trim(),
        feeling: postText,
        tag: `#${tagObj.label}`,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }),
    });
    if (!response.ok) throw new Error("サーバーエラー");
    const newPost = await response.json();

    // 成功したらマップに追加
    setMapGeoLogs([...mapGeoLogs, newPost]);

    setShowPostField(false);
    setPostText("");
    setLocationNameInput("");
    setSelectedTag(TAGS[0].value);
  } catch (error) {
    console.error(error);
    Alert.alert("投稿に失敗しました", "通信エラーまたはサーバーエラーです。");
  }
};
  // --- PanResponder は省略（既存のまま利用） ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => sheetHeightAnim.stopAnimation(),
      onPanResponderMove: (evt, gestureState) => {
        const newHeight = currentSheetHeight.current - gestureState.dy;
        const clampedHeight = Math.max(MIN_SHEET_HEIGHT, Math.min(MAX_SHEET_HEIGHT, newHeight));
        sheetHeightAnim.setValue(clampedHeight);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const finalHeight = currentSheetHeight.current;
        const velocity = gestureState.vy;
        let targetHeight, newIsExpanded;
        if (velocity < -0.5) { targetHeight = MAX_SHEET_HEIGHT; newIsExpanded = true; }
        else if (velocity > 0.5) { targetHeight = MIN_SHEET_HEIGHT; newIsExpanded = false; }
        else {
          if (finalHeight > (MIN_SHEET_HEIGHT + MAX_SHEET_HEIGHT)/2) {
            targetHeight = MAX_SHEET_HEIGHT; newIsExpanded = true;
          } else {
            targetHeight = MIN_SHEET_HEIGHT; newIsExpanded = false;
          }
        }
        Animated.timing(sheetHeightAnim, { toValue: targetHeight, duration: 300, useNativeDriver: false })
          .start(() => { currentSheetHeight.current = targetHeight; setIsSheetExpanded(newIsExpanded); });
      },
    })
  ).current;

  useEffect(() => {
    const listenerId = sheetHeightAnim.addListener(({ value }) => currentSheetHeight.current = value);
    return () => sheetHeightAnim.removeListener(listenerId);
  }, [sheetHeightAnim]);

  const initialRegion = location
    ? { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }
    : { latitude: 33.59035, longitude: 130.40171, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };

  return (
    <View style={styles.container}>
      {/* マップ */}
      <View style={styles.mapContainer}>
        {errorMsg ? <Text>{errorMsg}</Text> : location ? (
          <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion} showsUserLocation={true}>
            {mapGeoLogs.map(item => (
              <Marker key={item.id} coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                title={item.location} description={item.feeling}>
                <View style={[styles.customMarker, { backgroundColor: item.color }]}>
                  <Ionicons name="location-sharp" size={16} color="#fff" />
                  <Text style={styles.customMarkerText}>{item.tag}</Text>
                </View>
              </Marker>
            ))}
          </MapView>
        ) : <Text>現在地を取得中...</Text>}
      </View>

      {/* 投稿ボタンなど省略、既存のコードをそのまま利用 */}

    </View>
  );
}
