/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
import {View} from 'react-native';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {rootNavigationRef} from './src/navigationRef';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './src/pages/Home/index';
import RecordListScreen from './src/pages/RecordList/index';
import SettingsScreen from './src/pages/Setting/index';
import BaziPanScreen from './src/pages/BaziPan/index';
import styles from './globalStyle.js';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 与首页同色系，头部/Tab 用偏灰棕降低抢眼度
const tabColors = {
    active: '#5c4a3a',
    inactive: '#7a6f64',
    barBg: '#ffffff',
};

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({route}) => ({
                tabBarIcon: ({focused}) => {
                    const iconName =
                        route.name === '星垣水镜' ? 'yin-yang'
                        : route.name === '记录' ? 'list-alt'
                        : 'user-circle';
                    return (
                        <FontAwesome5
                            name={iconName}
                            size={20}
                            solid={false}
                            style={{color: focused ? tabColors.active : tabColors.inactive}}
                        />
                    );
                },
                tabBarActiveTintColor: tabColors.active,
                tabBarInactiveTintColor: tabColors.inactive,
                tabBarLabelStyle: {fontSize: 13, fontWeight: '500'},
                tabBarStyle: {
                    height: 60,
                    backgroundColor: tabColors.barBg,
                    borderTopColor: '#e8e4dc',
                    borderTopWidth: 1,
                },
            })}>
            <Tab.Screen name="星垣水镜" component={HomeScreen} options={{headerShown: false}} />
            <Tab.Screen name="记录" component={RecordListScreen} options={{headerShown: false}} />
            <Tab.Screen name="我的" component={SettingsScreen} options={{headerShown: false}} />
        </Tab.Navigator>
    );
};

/** 底部安全区：仅用一块与导航栏同色的白条垫底，比系统值少 8px（全局生效） */
function AppContent() {
    const insets = useSafeAreaInsets();
    const bottomInset = Math.max(0, insets.bottom - 8);
    return (
        <View style={styles.body}>
            <View style={{flex: 1}}>
                <NavigationContainer ref={rootNavigationRef}>
                    <Stack.Navigator screenOptions={{headerShown: false}}>
                        <Stack.Screen name="back" component={TabNavigator} options={{headerShown: false}}></Stack.Screen>
                        <Stack.Screen name="八字盘" component={BaziPanScreen} options={{headerShown: false}} />
                    </Stack.Navigator>
                </NavigationContainer>
            </View>
            {bottomInset > 0 ? (
                <View
                    style={{
                        height: bottomInset,
                        backgroundColor: tabColors.barBg,
                    }}
                />
            ) : null}
        </View>
    );
}

function App() {
    return (
        <SafeAreaProvider>
            <AppContent />
        </SafeAreaProvider>
    );
}

export default App;
