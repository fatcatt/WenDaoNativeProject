import type {default as PagerView} from 'react-native-pager-view';
import React, {useRef, useCallback, useState} from 'react';

export default function usePagerView() {
    const pagerRef = useRef<PagerView>(null);
    const [page, setCurrentPage] = useState(0);

    const setPage = useCallback((page: number, animated = true) => {
        if (animated) {
            pagerRef.current?.setPage(page);
        } else {
            pagerRef.current?.setPageWithoutAnimation(page);
        }
        setCurrentPage(page);
    }, []);

    return {
        pagerRef,
        setPage,
        page
    };
}
