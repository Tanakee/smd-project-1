import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Dimensions,
  Animated,
  PanResponder,
  TextInput,
  Image,
  Keyboard,
  ActivityIndicator, // 追加
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import styles from "../styles/MapScreenStyles";

const API_URL = 'https://geolog-xi.vercel.app/api'; 
const DUMMY_AUTH_TOKEN = 'your-jwt-token-here'; 

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
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const sheetHeightAnim = useRef(new Animated.Value(MIN_SHEET_HEIGHT)).current;
  const currentSheetHeight = useRef(MIN_SHEET_HEIGHT);

  const [mapGeoLogs, setMapGeoLogs] = useState([]);
  const [loading, setLoading] = useState(true); // 追加

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("位置情報へのアクセスが拒否されました");
          setLoading(false);
          return;
        }
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        await fetchGeoLogs(currentLocation.coords.latitude, currentLocation.coords.longitude);
      } catch (e) {
        setErrorMsg("位置情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchGeoLogs = async (latitude, longitude) => {
    try {
      const response = await fetch(`${API_URL}/geologs?latitude=${latitude}&longitude=${longitude}&radius=0.1`);
      const data = await response.json();
      setMapGeoLogs(data);
    } catch (error) {
      console.error("Failed to fetch geo logs:", error);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        sheetHeightAnim.stopAnimation();
      },
      onPanResponderMove: (evt, gestureState) => {
        const newHeight = currentSheetHeight.current - gestureState.dy;
        const clampedHeight = Math.max(
          MIN_SHEET_HEIGHT,
          Math.min(MAX_SHEET_HEIGHT, newHeight)
        );
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

  useEffect(() => {
    const listenerId = sheetHeightAnim.addListener(({ value }) => {
      currentSheetHeight.current = value;
    });
    return () => {
      sheetHeightAnim.removeListener(listenerId);
    };
  }, [sheetHeightAnim]);

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

  const mapRef = useRef(null);
  const [showPostField, setShowPostField] = useState(false);
  const [postText, setPostText] = useState("");
  const [locationNameInput, setLocationNameInput] = useState("");
  const [selectedTag, setSelectedTag] = useState(TAGS[0].value);

  useEffect(() => {
    if (route?.params?.openPost) {
      setShowPostField(true);
    }
  }, [route?.params]);

  const handlePostGeoLog = async () => {
    if (!postText.trim() || !location || !locationNameInput.trim()) {
      Alert.alert("エラー", "場所名、投稿内容、および位置情報が必要です。");
      return;
    }

    const tagObj = TAGS.find((t) => t.value === selectedTag);

    const postData = {
      locationName: locationNameInput.trim(),
      feelingText: postText,
      feelingTag: tagObj.label,
      color: tagObj.color,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    try {
      const response = await fetch(`${API_URL}/geologs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DUMMY_AUTH_TOKEN}`,
        },
        body: JSON.stringify(postData),
      });

      if (response.status === 201) {
        Alert.alert('成功', 'GeoLogが投稿されました！');
        await fetchGeoLogs(location.coords.latitude, location.coords.longitude);
        setShowPostField(false);
        setPostText("");
        setLocationNameInput("");
        setSelectedTag(TAGS[0].value);
      } else {
        const errorData = await response.json();
        Alert.alert('エラー', `投稿に失敗しました: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Post failed:", error);
      Alert.alert('エラー', '投稿中に問題が発生しました。');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>位置情報を取得中...</Text>
          </View>
        ) : errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : location ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={true}
          >
            {mapGeoLogs.map((item, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                }}
                title={item.locationName}
                description={item.feelingText}
              >
                <View style={[styles.customMarker, { backgroundColor: item.color }]}>
                  <Ionicons name="location-sharp" size={16} color="#fff" />
                  <Text style={styles.customMarkerText}>#{item.feelingTag}</Text>
                </View>
              </Marker>
            ))}
          </MapView>
        ) : (
          <Text style={styles.loadingText}>現在地を取得できませんでした</Text>
        )}
      </View>

      <Animated.View
        style={[
          styles.currentLocationButton,
          {
            bottom: Animated.add(sheetHeightAnim, 20),
          },
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={() => {
            if (location && mapRef.current) {
              mapRef.current.animateToRegion(
                {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                500
              );
            }
          }}
        >
          <Ionicons name="locate" size={28} color="#333" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.postGeoLogButtonLeft,
          {
            bottom: Animated.add(sheetHeightAnim, 20),
          },
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity onPress={() => setShowPostField(true)}>
          <View style={{ alignItems: "center" }}>
            <Ionicons name="add" size={30} color="#fff" />
            <Text style={styles.postGeoLogButtonText}>GeoLogを投稿</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {showPostField && (
        <>
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.2)",
              zIndex: 99,
            }}
            activeOpacity={1}
            onPress={() => setShowPostField(false)}
          />
          <View style={styles.postFieldContainer}>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
              GeoLogを投稿
            </Text>
            <TextInput
              style={styles.postTextInput}
              placeholder="場所の名前を入力（例: 福岡タワー）"
              value={locationNameInput}
              onChangeText={setLocationNameInput}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <TextInput
              style={styles.postTextInput}
              placeholder="感じたことを入力..."
              value={postText}
              onChangeText={setPostText}
              multiline
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: 10,
              }}
            >
              {TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag.value}
                  style={{
                    backgroundColor:
                      selectedTag === tag.value ? tag.color : "#eee",
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                  onPress={() => setSelectedTag(tag.value)}
                >
                  <Text
                    style={{
                      color: selectedTag === tag.value ? "#fff" : "#333",
                    }}
                  >
                    #{tag.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <TouchableOpacity
                style={[
                  styles.postActionButton,
                  { backgroundColor: "#ccc" },
                ]}
                onPress={() => setShowPostField(false)}
              >
                <Text>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.postActionButton,
                  { backgroundColor: "#4CAF50", marginLeft: 10 },
                ]}
                onPress={handlePostGeoLog}
              >
                <Text style={{ color: "#fff" }}>投稿</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      <Animated.View style={[styles.bottomSheet, { height: sheetHeightAnim }]}>
        <View {...panResponder.panHandlers} style={styles.sheetHeader}>
          <View style={styles.handleIndicator} /><Text>{" "}</Text>
          <View style={styles.filterBar}>
            <Text>{" "}</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={24} color="#333" />
              <Text style={styles.filterButtonText}>フィルター</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="search-outline" size={24} color="#333" />
              <Text style={styles.filterButtonText}>検索</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isSheetExpanded && (
          <ScrollView style={styles.listContent}>
            <Text style={styles.nearbyTitle}>現在地周辺のGeoLog</Text>
            {mapGeoLogs.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.nearbyGeoLogCard}
                onPress={() => {
                  if (mapRef.current) {
                    mapRef.current.animateToRegion(
                      {
                        latitude: item.latitude,
                        longitude: item.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      },
                      500
                    );
                  }
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="pin" size={20} color={item.color} />
                <View style={styles.nearbyGeoLogContent}>
                  <Text style={styles.nearbyGeoLogLocation}>
                    {item.locationName}
                  </Text>
                  <Text style={styles.nearbyGeoLogFeeling}>{item.feelingText}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  )
};