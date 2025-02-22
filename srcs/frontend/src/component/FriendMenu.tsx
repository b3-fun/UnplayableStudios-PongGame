import React, { useContext } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react';

import {
    Button,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Modal,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Text,
    useDisclosure,
    useColorModeValue,
} from '@chakra-ui/react';
import { MdDelete } from 'react-icons/md';
import { ChatContext } from '../State/ChatProvider';
import { RiPingPongFill } from 'react-icons/ri';
import { AiOutlineUser } from 'react-icons/ai';
import axios from 'axios';
import { BLOCK_DM, pagesContent, SOCKET } from '../constants';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalContext } from '../State/Provider';
import { io } from 'socket.io-client';
import { setOpponentId } from '../State/Action';

const FriendMenu = () => {
    const { selectedChat, setSelectedChat } = useContext<any>(ChatContext);
    const value = useColorModeValue('white', 'lightBlack');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { setFriends, socket } = useContext<any>(ChatContext);
    const { dispatch } = useContext<any>(ChatContext);
    const navigate = useNavigate();
    const { data } = React.useContext<any>(GlobalContext);
    const globalDispatch = useContext<any>(GlobalContext).dispatch;
    const { userInfo, online, on_game } = data;

    const blockUserHandler = () => {
        const payload = {
            user_id: selectedChat.id,
            room_id: '',
            chat: 'F',
            other_id: userInfo.user_id,
        };
        socket.emit('blockUser', payload);
        dispatch({ type: 'REMOVE_FRIEND', data: selectedChat.id });
        setSelectedChat(null);
        axios
            .post(BLOCK_DM + selectedChat.id)
            .then((response) => {})
            .catch(() => {
                // navigate(pagesContent.chat.url);
                // setSelectedChat(null)
            });
    };

    const isOnline = (user_id: string) => {
        if(user_id) {
            for (let i = 0; i < online.length; i++) {
                const user = online[i];
                if (user && user.user_id && user.user_id.toString() === user_id.toString()) return true;
            }
        }
        return false;
    };

    const isOnGame = (user_id: string) => {
        if(user_id) {
            for (let i = 0; i < on_game.length; i++) {
                const user = on_game[i];
                if (user && user.toString() === user_id.toString()) return true;
            }
        }
        return false;
    };

    const inviteToGameHandler = () => {
        globalDispatch(setOpponentId(selectedChat.id));
        navigate(`${pagesContent.play.url}/f`);
    };

    const viewProfileHandler = () => {
        navigate(pagesContent.profile.url + '/' + selectedChat.id);
    };

    return (
        <>
            <Menu>
                <MenuButton as={IconButton} icon={<BsThreeDotsVertical />} variant="ghost" />
                <MenuList>
                    {!isOnGame(selectedChat.id) && isOnline(selectedChat.id) && (
                        <MenuItem icon={<RiPingPongFill size={20} color={'yellow'} />} onClick={inviteToGameHandler}>
                            <Text> Invite To Game</Text>
                        </MenuItem>
                    )}
                    <MenuItem icon={<AiOutlineUser size={20} color={'green'} />} onClick={viewProfileHandler}>
                        <Text> View Profile </Text>
                    </MenuItem>
                    <MenuItem icon={<MdDelete size={20} color={'#FF5C5C'} />} onClick={() => onOpen()}>
                        <Text color={'customRed'}> Block User </Text>
                    </MenuItem>
                </MenuList>
            </Menu>
            <Modal onClose={onClose} size="md" isOpen={isOpen} isCentered>
                <ModalContent w={'20em'} h={'10em'} bg={value}>
                    <ModalHeader>Block User</ModalHeader>
                    <ModalCloseButton />
                    <ModalFooter pb={6}>
                        <Button variant={'ghost'} colorScheme="purple" mr={3} onClick={onClose}>
                            CANCEL
                        </Button>
                        <Button variant={'ghost'} color="customRed" mr={3} onClick={blockUserHandler}>
                            BLOCK USER
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default FriendMenu;
