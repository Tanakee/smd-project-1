    // App.js
    import React from 'react';
    import { NavigationContainer } from '@react-navigation/native';
    import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
    import { Ionicons } from '@expo/vector-icons'; // アイコン表示のために利用
    import HomeScreen from './screens/HomeScreen'; // パスは './screens/HomeScreen' のままでOK
    import MapScreen from './screens/MapScreen';   // パスは './screens/MapScreen' のままでOK

    // BottomTabNavigatorを作成
    const Tab = createBottomTabNavigator();

    export default function App() {
      return (
        // NavigationContainerでアプリ全体のナビゲーションをラップ
        <NavigationContainer>
          {/* BottomTabNavigatorを設定 */}
          <Tab.Navigator
            screenOptions={({ route }) => ({
              // タブのアイコンを設定
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'ホーム') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'マップ') {
                  iconName = focused ? 'map' : 'map-outline';
                }
                // Ioniconsコンポーネントを使ってアイコンを表示
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              // アクティブなタブの色
              tabBarActiveTintColor: '#4CAF50', // 緑色
              // 非アクティブなタブの色
              tabBarInactiveTintColor: 'gray',
              // ヘッダーのスタイル
              headerStyle: {
                backgroundColor: '#4CAF50', // ヘッダーの背景色
              },
              // ヘッダーのタイトルの色
              headerTintColor: '#fff', // ヘッダーの文字色
              // ヘッダーのタイトルのフォントサイズ
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            })}
          >
            {/* ホーム画面のタブ */}
            <Tab.Screen name="ホーム" component={HomeScreen} />
            {/* マップ画面のタブ */}
            <Tab.Screen name="マップ" component={MapScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      );
    }
    