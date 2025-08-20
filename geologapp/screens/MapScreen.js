// screens/MapScreen.js
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
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import styles from "../styles/MapScreenStyles";

// 画面の高さとボトムシートの展開/収納時の高さを定義
const screenHeight = Dimensions.get("window").height;
// MIN_SHEET_HEIGHTは、フィルターバーとハンドルインジケーターが収まる高さに調整
const MIN_SHEET_HEIGHT = 100; // ボトムシート収納時の高さ (フィルターバー+ハンドル)
const MAX_SHEET_HEIGHT = screenHeight * 0.6; // ボトムシート展開時の最大高さ (画面の60%)

// タグの定義
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
  // ボトムシートが展開されているかどうかの状態
  const [isSheetExpanded, setIsSheetExpanded] = useState(false); // 初期値をfalseに変更 (フィルターバーのみ表示)
  // ボトムシートの高さのアニメーション値を管理
  const sheetHeightAnim = useRef(new Animated.Value(MIN_SHEET_HEIGHT)).current; // 初期値をMIN_SHEET_HEIGHTに変更

  // PanResponder の状態を管理する ref
  // アニメーション中の現在の高さを追跡するために使用
  const currentSheetHeight = useRef(MIN_SHEET_HEIGHT);

  // ダミーデータ：マップ上のGeoLog投稿（実際の緯度経度を持つ）
  const [mapGeoLogs, setMapGeoLogs] = useState([
    {
      id: "m1",
      location: "福岡タワー",
      feeling: "絶景に感動！",
      tag: "#絶景",
      latitude: 33.5935,
      longitude: 130.3508,
      color: "#2196F3",
    },
    {
      id: "m2",
      location: "キャナルシティ",
      feeling: "ショッピング楽しい！",
      tag: "#楽しい",
      latitude: 33.5904,
      longitude: 130.4026,
      color: "#FFC107",
    },
    {
      id: "m3",
      location: "櫛田神社",
      feeling: "歴史を感じる",
      tag: "#歴史",
      latitude: 33.5947,
      longitude: 130.4035,
      color: "#8BC34A",
    },
    {
      id: "m4",
      location: "中洲屋台",
      feeling: "活気があって最高！",
      tag: "#活気",
      latitude: 33.593,
      longitude: 130.402,
      color: "#F44336",
    },
    {
      id: "m5",
      location: "大濠公園",
      feeling: "心が洗われるような景色でした！",
      tag: "#癒し",
      latitude: 33.5878,
      longitude: 130.3792,
      color: "#4CAF50",
    },
    {
      id: "m6",
      location: "福岡市動植物園",
      feeling: "動物たちに癒された！",
      tag: "#動物",
      latitude: 33.5779,
      longitude: 130.3951,
      color: "#9C27B0",
    },
    {
      id: "m7",
      location: "マリノアシティ福岡",
      feeling: "アウトレットで爆買い！",
      tag: "#買い物",
      latitude: 33.589,
      longitude: 130.324,
      color: "#00BCD4",
    },
  ]);

  // コンポーネントがマウントされたときに現在地を取得
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

  // PanResponder の設定
  const panResponder = useRef(
    PanResponder.create({
      // ジェスチャーが開始されるときにレスポンダーになるべきか
      onStartShouldSetPanResponder: () => true,
      // ジェスチャーが移動するときにレスポンダーになるべきか
      onMoveShouldSetPanResponder: () => true,
      // ジェスチャーが開始されたとき
      onPanResponderGrant: () => {
        // 現在のアニメーションを停止し、現在の高さをオフセットとして設定
        sheetHeightAnim.stopAnimation();
        // currentSheetHeight.current にはリスナーで更新された実際の値が入っている
      },
      // ジェスチャーが移動しているとき
      onPanResponderMove: (evt, gestureState) => {
        // Y方向の移動量 (gestureState.dy) に応じて高さを更新
        // 下にドラッグすると dy は正の値、上にドラッグすると負の値
        // 新しい高さ = ドラッグ開始時の高さ - 移動量
        const newHeight = currentSheetHeight.current - gestureState.dy;

        // 高さは MIN_SHEET_HEIGHT と MAX_SHEET_HEIGHT の間に制限
        const clampedHeight = Math.max(
          MIN_SHEET_HEIGHT,
          Math.min(MAX_SHEET_HEIGHT, newHeight)
        );
        sheetHeightAnim.setValue(clampedHeight); // 直接アニメーション値を設定
      },
      // ジェスチャーが終了したとき (指を離したとき)
      onPanResponderRelease: (evt, gestureState) => {
        // 最終的な高さと速度に基づいて、展開または収納を決定
        const finalHeight = currentSheetHeight.current; // 指を離した時点の高さ
        const velocity = gestureState.vy; // Y方向の速度

        let targetHeight;
        let newIsExpanded;

        // 上に素早くスワイプした場合、展開
        if (velocity < -0.5) {
          targetHeight = MAX_SHEET_HEIGHT;
          newIsExpanded = true;
        }
        // 下に素早くスワイプした場合、収納
        else if (velocity > 0.5) {
          targetHeight = MIN_SHEET_HEIGHT;
          newIsExpanded = false;
        }
        // 速度が遅い場合、中間地点で判断
        else {
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
          // アニメーション完了後に現在の高さを更新し、展開状態を更新
          currentSheetHeight.current = targetHeight;
          setIsSheetExpanded(newIsExpanded);
        });
      },
    })
  ).current;

  // sheetHeightAnim の値が変更されたときに currentSheetHeight.current をリアルタイムで更新
  // これがドラッグ中の振動を防ぐために非常に重要
  useEffect(() => {
    const listenerId = sheetHeightAnim.addListener(({ value }) => {
      currentSheetHeight.current = value;
    });
    return () => {
      sheetHeightAnim.removeListener(listenerId);
    };
  }, [sheetHeightAnim]);

  // マップの初期表示リージョンを定義（デフォルトは福岡の中心）
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

  const mapRef = useRef(null); // 追加

  // 投稿フィールドの表示状態
  const [showPostField, setShowPostField] = useState(false);
  const [postText, setPostText] = useState("");
  const [photo, setPhoto] = useState(null);
  // ★追加：ユーザーが入力する場所の名前
  const [locationNameInput, setLocationNameInput] = useState(""); 

  // 投稿フィールドの状態
  const [selectedTag, setSelectedTag] = useState(TAGS[0].value);

  // 画面遷移時のパラメータで投稿フィールドを開く
  useEffect(() => {
    if (route?.params?.openPost) {
      setShowPostField(true);
    }
  }, [route?.params]);

  // --- 投稿処理 (ユーザーが入力した場所名をそのまま使用) ---
  const handlePostGeoLog = async () => {
    if (!postText.trim() || !location || !locationNameInput.trim()) { // locationNameInputの入力チェックを追加
      Alert.alert("エラー", "場所名、投稿内容、および位置情報が必要です。");
      return;
    }

    const tagObj = TAGS.find((t) => t.value === selectedTag);

    setMapGeoLogs([
      ...mapGeoLogs,
      {
        id: `user-${Date.now()}`,
        location: locationNameInput.trim(), // ★変更：ユーザーが入力した場所名を使用
        feeling: postText,
        tag: `#${tagObj.label}`,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        color: tagObj.color,
      },
    ]);

    setShowPostField(false);
    setPostText("");
    setLocationNameInput(""); // ★追加：投稿後に場所名入力をクリア
    setSelectedTag(TAGS[0].value);
  };
  // --- 投稿処理ここまで ---

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
            initialRegion={initialRegion}
            showsUserLocation={true}
          >
            {mapGeoLogs.map((item) => (
              <Marker
                key={item.id}
                coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                }}
                title={item.location}
                description={item.feeling}
              >
                <View style={[styles.customMarker, { backgroundColor: item.color }]}>
                  <Ionicons name="location-sharp" size={16} color="#fff" />
                  <Text style={styles.customMarkerText}>{item.tag}</Text>
                </View>
              </Marker>
            ))}
          </MapView>
        ) : (
          <Text style={styles.loadingText}>現在地を取得中...</Text>
        )}
      </View>

      {/* 現在地ボタン（右下・ボトムシートに追従） */}
      <Animated.View
        style={[
          styles.currentLocationButton,
          {
            bottom: Animated.add(sheetHeightAnim, 20), // 20px余白
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

      {/* 投稿ボタン（左下・ボトムシートに追従） */}
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

      {/* 投稿フィールド（簡易版） */}
      {showPostField && (
        <>
          {/* 背面タップで閉じるエリア */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.2)", // 半透明のグレー
              zIndex: 99,
            }}
            activeOpacity={1}
            onPress={() => setShowPostField(false)}
          />
          {/* 投稿フィールド本体 */}
          <View style={styles.postFieldContainer}>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
              GeoLogを投稿
            </Text>
            {/* ★追加：場所名入力フィールド */}
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
            {/* タグ選択UI */}
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
            {/* 写真投稿フィールド（ダミー） */}
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() =>
                Alert.alert("写真投稿", "ここで写真を選択できます（実装例）")
              }
            >
              <Ionicons name="image-outline" size={24} color="#4CAF50" />
              <Text style={{ marginLeft: 8, color: "#4CAF50" }}>写真を追加</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <TouchableOpacity
                style={[
                  styles.postActionButton,
                  { backgroundColor: "#ccc" }, // キャンセル（グレー）
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
                // handlePostGeoLog を呼び出す
                onPress={handlePostGeoLog}
              >
                <Text style={{ color: "#fff" }}>投稿</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* ボトムシート */}
      <Animated.View style={[styles.bottomSheet, { height: sheetHeightAnim }]}>
        {/* ...既存のボトムシート内容... */}
        <View {...panResponder.panHandlers} style={styles.sheetHeader}>
          <View style={styles.handleIndicator} /><Text>{" "}</Text>
          {/* ドラッグ可能なことを示すインジケーター */}
          <View style={styles.filterBar}>
            <Text>{" "}</Text>
            {/* フィルターバーの内容 */}
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

        {/* リストコンテンツは、isSheetExpanded が true の場合に表示 */}
        {isSheetExpanded && (
          <ScrollView style={styles.listContent}>
            <Text style={styles.nearbyTitle}>現在地周辺のGeoLog</Text>
            {mapGeoLogs.map((item) => (
              <TouchableOpacity
                key={item.id}
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
                      500 // アニメーション時間(ms)
                    );
                  }
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="pin" size={20} color={item.color} />
                <View style={styles.nearbyGeoLogContent}>
                  <Text style={styles.nearbyGeoLogLocation}>
                    {item.location}
                  </Text>
                  <Text style={styles.nearbyGeoLogFeeling}>{item.feeling}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}