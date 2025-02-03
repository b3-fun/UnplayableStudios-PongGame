import React from 'react';
import { Button, Flex, Heading, Image, Spacer, Text } from '@chakra-ui/react';
import intra from '../assets/intra.png';
import Logo from '../component/logo';
import { API, pagesContent } from '../constants';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GlobalContext } from '../State/Provider';
import { usePageTitle } from '../hooks/usePageTitle';
import { getUserInfo } from '../State/Api';

export default function SignInPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const { dispatch } = React.useContext<any>(GlobalContext);

  const handleSignIn = async () => {
    try {
      const response = await fetch(`${API}/42/b3/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem('jwt', data.access_token);
        await getUserInfo(dispatch);
        navigate(pagesContent.home.url);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  React.useEffect(() => {
    if (token) {
      handleSignIn();
    }
  }, [token]);

  return (
    <>
      <Flex mb={5} px={10} justifyContent={'right'} alignItems={'center'} overflow={'hidden'}>
        <Spacer />
      </Flex>
      <Flex
        w={'100%'}
        h={'100%'}
        m={0}
        p={0}
        alignItems={'center'}
        justifyContent={'center'}
        flexDirection={'column'}
        gap={2}
      >
        <Logo />
        <Flex
          _dark={{ boxShadow: 'dark-lg' }}
          _light={{ boxShadow: 'md' }}
          backgroundColor={'black'}
          rounded="30px"
          w={{ base: '700px', md: '500px' }}
          h={'400px'}
          direction={'column'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Heading
            mb={'30px'}
            // fontSize={{base: 45,md:60}}
            fontSize={60}
            textTransform="uppercase"
          >
            Welcome To Pong
          </Heading>
          <form method={'POST'}>
            <Button
              onClick={handleSignIn}
              _hover={{ opacity: 0.8 }}
              _active={{}} // TIPS: on click keep the color green
              p={8}
              h={'50px'}
              mt={10}
              w={'300px'}
              color={'yellow'}
              bg={'black'}
            >
              {/*<Image w={10} mr={8} src={intra}></Image>*/}
              <Text fontSize={30}>PRESS TO CONTINUE</Text>
            </Button>
          </form>
        </Flex>
      </Flex>
    </>
  );
}
