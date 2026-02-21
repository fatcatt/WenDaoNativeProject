import {create} from 'zustand';

const useUserStore = create(set => ({
    userid: '',
    setUserId: userid => set({userid: userid})
}));

export {useUserStore};
