import { Flex } from '@chakra-ui/react';
import SearchBar from './SearchBar';
import { AnimatePresence } from 'framer-motion';
import React, { useContext, useEffect } from 'react';
import Tabs from './Tabs';
import Messaging from './Messaging';
import { ChatContext } from '../State/ChatProvider';
import NewChannel from './NewChannel';
import { FRIENDS_URL, GROUP, USER_URL, MY_GROUPS, ALL_GROUPS } from '../constants';
import axios from 'axios';
import { GlobalContext } from '../State/Provider';
import { newNotification } from '../State/Action';

const ChatTabs = () => {
    const { isSearch, toggleSearch } = useContext<any>(ChatContext);
    const { setChatDetails } = useContext<any>(ChatContext);

    useEffect(() => {
        setChatDetails(false);
        const keyDownHandler = (event: any) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                toggleSearch();
            }
        };
        document.addEventListener('keydown', keyDownHandler);
        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        };
    });
    return (
        <>
            {/*<SearchBar />*/}
            <AnimatePresence>{!isSearch ? <Tabs /> : undefined}</AnimatePresence>
        </>
    );
};

const SideBar = () => {
    const { selectedChat } = useContext<any>(ChatContext);
    const { newChannel } = useContext<any>(ChatContext);
    const { dispatch, state, socket, setSelectedChat } = useContext<any>(ChatContext);
    const globalDispatch = useContext<any>(GlobalContext).dispatch;
    const { data } = React.useContext<any>(GlobalContext);
    const { userInfo } = data;

    React.useEffect(() => {
        if (userInfo)
            socket.on('blockMe', (data: any) => {
                if (data.chat === 'G') {
                    if (data.user_id === userInfo.user_id) {
                        if (data.room_id == selectedChat.id) {
                            setSelectedChat(null);
                            globalDispatch(newNotification({ type: 'Info', message: 'You are blocked from this Channel' }));
                        }
                        dispatch({
                            type: 'REMOVE_GROUP',
                            data: data.room_id,
                        });
                    }
                }
                else {
                    if (data.user_id === userInfo.user_id) {
                        if (data.other_id == selectedChat.id) {
                            setSelectedChat(null);
                            globalDispatch(newNotification({ type: 'Info', message: 'You are blocked from this Chat' }));
                        }
                        dispatch({
                            type: 'REMOVE_FRIEND',
                            data: data.other_id,
                        });
                    }
                }
            });
    });
    React.useEffect(() => {
        axios.get(FRIENDS_URL).then((response: any) => {
            for (var i = 0; i < response.data.length; i++) {
                axios.get(USER_URL + response.data[i]).then((res: any) => {
                    const user = {
                        id: res.data.user_id,
                        name: res.data.user_name,
                        avatar: res.data.user_avatar,
                    };
                    dispatch({
                        type: 'ADD_FRIEND',
                        data: user,
                    });
                });
            }
        });
    }, []);

    useEffect(() => {
        axios
            .get(MY_GROUPS)
            .then((res: any) => {
                for (var i = 0; i < res.data.length; i++) {
                    axios.get(GROUP + res.data[i].roomId).then((res: any) => {
                        const group = {
                            id: res.data.room_id,
                            name: res.data.room_name,
                            avatar: res.data.room_avatar,
                            type: res.data.room_type,
                            password: res.data.password,
                        };
                        if (group.type != 'DM')
                            dispatch({
                                type: 'ADD_GROUP',
                                data: group,
                            });
                    });
                }
            })
            .catch((err) => {
            });
    }, []);

    React.useEffect(() => {
        axios.get(ALL_GROUPS).then((response: any) => {
            for (var i = 0; i != response.data.length; i++) {
                const room = {
                    id: response.data[i].room_id,
                    name: response.data[i].room_name,
                    avatar: response.data[i].room_avatar,
                    password: response.data[i].password,
                    type: response.data[i].room_type,
                };
                dispatch({
                    type: 'ADD_ALL_GROUPS',
                    data: room,
                });
            }
        });
    }, []);

    return (
        <>
            <Flex
                w={['100%', '100%', '70%', '50%', '50%']}
                _light={{ boxShadow: 'md' }}
                _dark={{ boxShadow: 'dark-lg' }}
                rounded="30px"
                direction={'column'}
                alignItems={'center'}
                p={5}
                overflow={'auto'}
            >
                {newChannel ? <NewChannel /> : !selectedChat ? (
                    <ChatTabs />
                ) : (
                    <Messaging />
                )}
            </Flex>
        </>
    );
};

export default SideBar;
