import { HamburgerIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Show,
  Spacer,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import React from 'react';

import Logo from './logo';

import { Link, Outlet, useLocation } from 'react-router-dom';
import { pagesContent, SOCKET, SOCKET_STATUS, tabs } from '../constants';
import { io } from 'socket.io-client';
import { GlobalContext } from '../State/Provider';
import { setOnGameUsers, setOnlineUsers } from '../State/Action';
import GameInvite from './GameInvite';
import { getJwtToken } from '../utils/token';

export default function Navbar() {
  // const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [size, setSize] = React.useState<String>('md');
  const [invite, setInvite] = React.useState(false);
  const [inviteData, setInviteData] = React.useState<any>();

  // CONTEXT
  const { data, dispatch } = React.useContext<any>(GlobalContext);

  // state
  const { user_id } = data;

  const handleSizeClick = (newSize: String) => {
    setSize(newSize);
    onOpen();
  };
  const location = useLocation();

  React.useEffect(() => {
    const token = getJwtToken();
    if (!token) {
      console.warn('No valid JWT token found');
      return;
    }

    const socket = io(`${SOCKET_STATUS}/userstate`, {
      query: {
        user_id: user_id,
      },
      extraHeaders: {
        Authorization: token,
      },
    });

    if (user_id) {
      const updateOnGame = (users: any) => {
        dispatch(setOnlineUsers(users));
      };

      socket.on('online', updateOnGame);
      socket.emit('onlinePing', updateOnGame);

      return () => {
        socket.off('online', updateOnGame);
        socket.disconnect();
      };
    }
  }, [user_id]);

  React.useEffect(() => {
    const token = getJwtToken();
    if (!token) {
      console.warn('No valid JWT token found');
      return;
    }

    const socket = io(`${SOCKET}/game`, {
      extraHeaders: {
        Authorization: token,
      },
    });

    socket.on('acceptGame', (data: any) => {
      if (user_id === data.opponent_id) {
        setInviteData(data);
        setInvite(true);
      }
    });

    const updatenline = (users: any) => {
      dispatch(setOnGameUsers(users));
    };

    socket.on('onGame', updatenline);
    socket.emit('getOnGame', updatenline);

    return () => {
      socket.off('onGame', updatenline);
      socket.disconnect();
    };
  }, [user_id]);

  return (
    <Stack spacing={5} h="100%">
      {invite && (
        <GameInvite
          name={inviteData?.user_name}
          avatar={inviteData?.user_avatar}
          user_id={inviteData?.user_id}
          opponent_id={inviteData?.opponent_id}
          room_name={inviteData?.room_name}
          setInvite={setInvite}
        />
      )}
      <Flex mb={5} px={10} justifyContent={'right'} alignItems={'center'} overflow={'hideen'}>
        {/*<Show above="md">*/}
        {/*    <Link to={pagesContent.home.url}>*/}
        {/*        <Logo />*/}
        {/*    </Link>*/}
        {/*</Show>*/}
        <Show below="md">
          <Button _hover={{ bg: 'green' }} onClick={() => handleSizeClick(size)}>
            <HamburgerIcon />
          </Button>
        </Show>
        <Modal onClose={onClose} size={'full'} isOpen={isOpen}>
          <ModalContent _light={{ bg: 'white' }} _dark={{ bg: 'black' }}>
            <ModalHeader>
              <Link to={pagesContent.home.url}>
                <Box onClick={onClose}>
                  <Logo />
                </Box>
              </Link>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex justifyContent={'center'} alignItems={'center'} w={'100%'} h={'100%'}>
                <Flex justifyContent={'center'} alignItems={'center'} display={'row'}>
                  {tabs.map((tab, i) => (
                    <Link to={tab.url} key={i.toString()}>
                      <Text
                        onClick={onClose}
                        fontSize={'30px'}
                        p={'10px'}
                        color={location.pathname === tab.url ? 'yellow' : 'none'}
                      >
                        {tab.title}
                      </Text>
                    </Link>
                  ))}
                </Flex>
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
        <Spacer />
        <Show above="md">
          <Show above="sm">
            <Flex
              _dark={{ boxShadow: 'dark-lg' }}
              _light={{ boxShadow: 'md' }}
              borderRadius="xl"
              bg={'black'}
              justifyContent={'center'}
              alignItems={'center'}
              px={'20px'}
            >
              {tabs.map((tab, i) => (
                <Link to={tab.url} key={i.toString()}>
                  <Text
                    px={['10px', '20px', '20px', '30px']}
                    fontSize={'30px'}
                    color={location.pathname === tab.url ? 'yellow' : 'none'}
                    textTransform="uppercase"
                  >
                    {tab.title}
                  </Text>
                </Link>
              ))}
            </Flex>
          </Show>
        </Show>
        <Spacer />
      </Flex>
      <Flex mb={0} px={10} alignItems="center" justifyContent="center" overflow={'hideen'}>
        <Logo />
      </Flex>
      <Outlet />
    </Stack>
  );
}
