import React, { createContext, useReducer } from 'react';
import { GlobalReducer } from './Reducer';

type ContextType = {
    data: {
        loader: boolean;
        notification: any;
        userInfo: any;
        matchHistory: any[];
        liveMatch: any[];
        online: any[];
        on_game: any[];
        user_id: any;
        opponent_id: any;
        playing_with_friend: any;
    };
    dispatch: React.Dispatch<any>;
};

// Create context with initial value
export const GlobalContext = createContext<ContextType>({
    data: {
        loader: false,
        notification: null,
        userInfo: null,
        matchHistory: [],
        liveMatch: [],
        online: [],
        on_game: [],
        user_id: null,
        opponent_id: null,
        playing_with_friend: null,
    },
    dispatch: () => null,
});

interface Props {
    children: React.ReactNode;
}

// Export as named export
export const GlobalContextProvider = ({ children }: Props) => {
    const initValue = {
        loader: false,
        notification: null,
        userInfo: null,
        matchHistory: [],
        liveMatch: [],
        online: [],
        on_game: [],
        user_id: null,
        opponent_id: null,
        playing_with_friend: null,
    };

    const [data, dispatch] = useReducer(GlobalReducer, initValue);

    return (
        <GlobalContext.Provider value={{ data, dispatch }}>
            {children}
        </GlobalContext.Provider>
    );
};
