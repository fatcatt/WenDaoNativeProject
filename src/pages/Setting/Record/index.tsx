import React, {Component, useEffect, useState} from 'react';
import {ScrollView, View, FlatList, SafeAreaView, Text, TouchableOpacity} from 'react-native';
import moment from 'moment';
import {parse} from '../../../utils/js/tool';
import styles from './style.js';

const Item = ({title}) => (
    <View style={styles.item}>
        <Text style={styles.title}>{title}</Text>
    </View>
);

export default function Record({passingRecords, navigation}) {
    const [records, setRecords] = useState([]);
    useEffect(() => {
        const _passingRecords = parse(JSON.stringify(passingRecords));
        _passingRecords.forEach(item => {
            const _bazis = parse(item.bazi_summary);
            item.format_solar_datetime = moment
                .utc(item.solar_datetime) // 将时间解释为 UTC 时间
                .add(0, 'hours') // 手动加上 8 小时的偏移量，东八区
                .format('YYYY年MM月DD日 HH:mm'); // 使用 24 小时制
            item.bazi = [_bazis.bz_jn?.slice(0, 1) + _bazis.bz_jy?.slice(0, 1) + _bazis.bz_jr?.slice(0, 1) + _bazis.bz_js?.slice(0, 1), _bazis.bz_jn?.slice(-1) + _bazis.bz_jy?.slice(-1) + _bazis.bz_jr?.slice(-1) + _bazis.bz_js?.slice(-1)];
        });
        setRecords(_passingRecords);
    }, [passingRecords]);

    const handlePress = item => {
        navigation.navigate('八字盘', {
            navigationParams: {
                solarDate: moment
                    .utc(item.solar_datetime) // 将时间解释为 UTC 时间
                    .add(0, 'hours') // 手动加上 8 小时的偏移量，东八区
                    .format('YYYY-MM-DD HH:mm'),
                nickname: item.inputName,
                place: item.place,
                gender: item.gender,
                id: item.id
            }
        });
    };

    const renderItem = ({item}) => (
        <TouchableOpacity onPress={() => handlePress(item)}>
            <View style={styles.renderItem}>
                <View>
                    <View style={styles.renderItemLeftTitle}>
                        <Text style={styles.nickname}>{item.nickname}</Text>
                        <Text style={styles.gender}>{item.gender}</Text>
                    </View>
                    <Text style={styles.datetime}>{item?.format_solar_datetime}</Text>
                </View>
                <View>
                    <Text style={styles.baziGan}>{item.bazi[0]}</Text>
                    <Text>{item.bazi[1]}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
    return (
        <View style={styles.container}>
            <FlatList data={records} renderItem={renderItem} keyExtractor={item => item.id} />
        </View>
    );
}
