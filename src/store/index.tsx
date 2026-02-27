import {create} from 'zustand';

const useUserStore = create(set => ({
    userid: '',
    userInfo: { nickname: '', headimg_url: '' },
    setUserId: userid => set({userid}),
    setUserInfo: userInfo => set({userInfo: userInfo || { nickname: '', headimg_url: '' }}),
}));

export {useUserStore};
