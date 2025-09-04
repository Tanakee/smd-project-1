// screens/MapScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
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
  const [mapGeoLogs, setMapGeoLogs] = useState([]);
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
    fetch("http://192.168.2.181:3000/api/posts")
      .then((res) => res.json())
      .then((data) => setMapGeoLogs(data))
      .catch((err) => console.error("API取得エラー:", err));
  }, []);

  // --- 投稿処理 ---
  const handlePostGeoLog = async () => {
    if (!postText.trim() || !location || !locationNameInput.trim()) {
      Alert.alert("エラー", "場所名、投稿内容、および位置情報が必要です。");
      return;
    }
    const tagObj = TAGS.find((t) => t.value === selectedTag);

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

  // --- 初期位置 ---
  const initialRegion = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    : {
        latitude: 33.59035,
        longitude: 130.40171,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

  return (
    <View style={styles.container}>
      {/* マップ */}
      <View style={styles.mapContainer}>
        {errorMsg ? (
          <Text>{errorMsg}</Text>
        ) : location ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={true}
          >
            {mapGeoLogs.map((item) => (
              <Marker
                key={item.id}
                coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                title={item.location}
                description={item.feeling}
              >
                <View
                  style={[styles.customMarker, { backgroundColor: item.color }]}
                >
                  <Ionicons name="location-sharp" size={16} color="#fff" />
                  <Text style={styles.customMarkerText}>{item.tag}</Text>
                </View>
              </Marker>
            ))}
          </MapView>
        ) : (
          <Text>現在地を取得中...</Text>
        )}
      </View>

      {/* 左下のGeoLog投稿ボタン */}
      <TouchableOpacity
        style={styles.postGeoLogButtonLeft}
        onPress={() => {
          if (!location) {
            Alert.alert("エラー", "位置情報が取得できていません。");
            return;
          }
          setShowPostField(true);
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
        <Text style={styles.postGeoLogButtonText}>投稿</Text>
      </TouchableOpacity>

      {/* 投稿モーダル */}
      <Modal visible={showPostField} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>GeoLogを投稿</Text>

            <TextInput
              style={styles.input}
              placeholder="場所の名前を入力（例: 福岡タワー）"
              value={locationNameInput}
              onChangeText={setLocationNameInput}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="感じたことを入力..."
              multiline
              value={postText}
              onChangeText={setPostText}
            />

            {/* タグ選択 */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag.value}
                  style={[
                    styles.tag,
                    selectedTag === tag.value && styles.tagSelected,
                  ]}
                  onPress={() => setSelectedTag(tag.value)}
                >
                  <Text
                    style={{
                      color: selectedTag === tag.value ? "white" : "#333",
                    }}
                  >
                    #{tag.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ボタン */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setShowPostField(false)}
              >
                <Text>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#2e7d32" }]}
                onPress={handlePostGeoLog}
              >
                <Text style={{ color: "white" }}>投稿</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
