import {
    Button,
    Grid,
    GridItem,
    Heading,
    HStack,
    IconButton,
    Link as ChakraLink,
    Spacer,
    Stack,
    useBreakpointValue,
    useMediaQuery,
    useTheme,
} from '@chakra-ui/react';
import React from 'react';

// ICONS
import { FaDiscord, FaFacebook, FaInstagram } from 'react-icons/fa';

// COMPONENTS
import { Card } from '../component/Card';
import EditProfile from '../component/EditProfile';
import { Line } from '../component/Line';
import { MatchesHistory } from '../component/MatchesHistory';
import { ProfileAvatar } from '../component/ProfileAvatar';
import { StatusProfile } from '../component/StatusProfile';
import { StatusTable } from '../component/StatusTable';

// HOOKS
import { usePageTitle } from '../hooks/usePageTitle';

// CONSTANTS
import { pagesContent } from '../constants';

// Context
import { useNavigate, useParams } from 'react-router-dom';
import { Achievement } from '../component/Achievement';
import TwofacAuth from '../component/TwofacAuth';
import { clearMatchHistory, clearUserInfo } from '../State/Action';
import { getFriendInfo, getMatchHistory, getUserInfo, signOut, updatedProfile } from '../State/Api';
import { GlobalContext } from '../State/Provider';

const ProfilePage = () => {
    // page title
    usePageTitle(pagesContent.profile.title);
    // vars
    const theme = useTheme();
    const navigate = useNavigate();
    // breakpoint
    const profileInfo = useBreakpointValue({ xl: 3, lg: 4, base: 12 });
    const statusInfo = useBreakpointValue({ xl: 9, lg: 8, base: 12 });
    const [isSmallScreen] = useMediaQuery(`(min-width: ${theme.breakpoints.xl})`);
    // signout
    const signoutHandler = () => {
        signOut(dispatch).then(() => {
            navigate(pagesContent.login.url);
        });
    };

    // which user
    const params = useParams();
    const [me, setMe] = React.useState(false);
    // context
    const { data, dispatch } = React.useContext<any>(GlobalContext);
    // ex
    const { userInfo, matchHistory, online, on_game } = data;
    const [updated, setUpdated] = React.useState(true);
    const [one, setOne] = React.useState(false);
    const [two, setTwo] = React.useState(false);
    const [three, setThree] = React.useState(false);

    const isOnline = (user_id: string) => {
        if(user_id) {
            for (let i = 0; i < online.length; i++) {
                const user = online[i];
                if (user && user?.user_id && user?.user_id.toString() === user_id?.toString()) return true;
            }
        }
        return false;
    };

    const isOnGame = (user_id: string) => {
        if(user_id) {
            for (let i = 0; i < on_game.length; i++) {
                const user = on_game[i];
                if (user && user.toString() === user_id?.toString()) return true;
            }
        }
        return false;
    };

    // useEffect
    React.useEffect(() => {
        getUserInfo(dispatch)
            .then((info: any) => {
                if (params?.user_id === 'me') {
                    setUpdated(info?.updated);
                    getMatchHistory(dispatch, info.user_id);
                    setMe(params?.user_id === 'me');
                    if (!info?.updated) {
                        setUpdated(false);
                        updatedProfile(dispatch).then(() => {
                            setUpdated(true);
                        });
                    }
                } else {
                    getFriendInfo(dispatch, params?.user_id)
                        .then((info: any) => {
                            getMatchHistory(dispatch, info.user_id);
                            setMe(params?.user_id === 'me');
                        })
                        .catch(() => {
                            navigate(pagesContent.home.url);
                        });
                }
            })
            .catch(() => {
                navigate(pagesContent.login.url);
            });

        return () => {
            dispatch(clearMatchHistory());
            dispatch(clearUserInfo());
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params?.user_id]);

    React.useEffect(() => {
        if (matchHistory && userInfo) {
            let wins_row = 0;
            matchHistory.forEach((match: any) => {
                const userScore = userInfo?.user_id === match.userId ? match.user_score : match.opponent_score;
                const opponentScore = userInfo?.user_id === match.userId ? match.opponent_score : match.user_score;

                if (userScore === 5 && opponentScore === 0) {
                    setOne(true);
                }

                // two
                if (userScore > opponentScore) wins_row++;
                else return;
            });

            if (wins_row >= 2) setTwo(true);
            if (wins_row >= 5) setThree(true);
        }
        return () => {
            setTwo(false);
            setThree(false);
            setOne(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchHistory, userInfo]);

    return (
        <>
            <Grid h="100%" templateColumns="repeat(12, 1fr)" gap={6}>
                <GridItem colSpan={profileInfo}>
                    <Card w="100%" h="100%" position="relative">
                        <>
                            {me && (
                                <EditProfile
                                    avatar={userInfo?.user_avatar}
                                    login={userInfo?.user_login}
                                    user_name={userInfo?.user_name}
                                    facebook={userInfo?.facebook}
                                    discord={userInfo?.discord}
                                    instagram={userInfo?.instagram}
                                    updateProfile={updated}
                                />
                            )}
                            <Stack spacing={5} alignItems="center" h="100%">
                                <ProfileAvatar
                                    name={userInfo?.user_name}
                                    avatar={userInfo?.user_avatar}
                                    isOnline={isOnline(userInfo?.user_id)}
                                    isOnGame={isOnGame(userInfo?.user_id)}
                                />

                                <Line maxW="10rem" />

                                <HStack spacing={5} justifyContent="center">
                                    <ChakraLink isExternal href={'https://www.facebook.com/' + userInfo?.facebook}>
                                        <IconButton
                                            size="lg"
                                            aria-label="Facebook"
                                            variant="ghost"
                                            borderRadius="2xl"
                                            fontSize="2xl"
                                            icon={<FaFacebook />}
                                        />
                                    </ChakraLink>
                                    <ChakraLink isExternal href={'https://www.discordapp.com/users/' + userInfo?.discord}>
                                        <IconButton
                                            size="lg"
                                            aria-label="Discord"
                                            variant="ghost"
                                            borderRadius="2xl"
                                            fontSize="2xl"
                                            icon={<FaDiscord />}
                                        />
                                    </ChakraLink>
                                    <ChakraLink isExternal href={'https://www.instagram.com/' + userInfo?.instagram}>
                                        <IconButton
                                            size="lg"
                                            aria-label="Instagram"
                                            variant="ghost"
                                            borderRadius="2xl"
                                            fontSize="2xl"
                                            icon={<FaInstagram />}
                                        />
                                    </ChakraLink>
                                </HStack>
                                {/*{me && <TwofacAuth />}*/}

                                <Line maxW="10rem" />
                                <Spacer />
                                {(one || two || three) && <Achievement one={one} two={two} three={three} />}
                                <StatusProfile
                                    rate={
                                        userInfo?.games_played === 0 ? 0 : Math.round((userInfo?.games_won / userInfo?.games_played) * 100)
                                    }
                                />
                                {/*<Spacer />*/}
                                {/*{me && (*/}
                                {/*    <>*/}
                                {/*        <Line maxW="10rem" />*/}
                                {/*        <Button*/}
                                {/*            bg="red"*/}
                                {/*            color="blackAlpha.900"*/}
                                {/*            borderRadius="3xl"*/}
                                {/*            fontSize="3xl"*/}
                                {/*            fontWeight="light"*/}
                                {/*            px={10}*/}
                                {/*            py={8}*/}
                                {/*            _focus={{*/}
                                {/*                bg: 'red',*/}
                                {/*            }}*/}
                                {/*            _hover={{*/}
                                {/*                bg: 'red',*/}
                                {/*            }}*/}
                                {/*            onClick={signoutHandler}*/}
                                {/*        >*/}
                                {/*            Sign Out*/}
                                {/*        </Button>*/}
                                {/*    </>*/}
                                {/*)}*/}
                            </Stack>
                        </>
                    </Card>
                </GridItem>
                <GridItem colSpan={statusInfo}>
                    <Card w="100%" h="100%">
                        <Stack spacing={5} justifyContent="space-between" direction={isSmallScreen ? 'row' : 'column'}>
                            <Stack spacing={5} alignItems="center" flexGrow={1}>
                                <Heading fontSize="2xl">Status</Heading>
                                <Line maxW="7rem" />
                                <StatusTable
                                    played={userInfo?.games_played}
                                    wins={userInfo?.games_won}
                                    losses={userInfo?.games_lost}
                                    draws={userInfo?.games_drawn}
                                />
                            </Stack>

                            <Stack spacing={5} alignItems="center" flexGrow={1}>
                                <Heading fontSize="2xl">Matches History</Heading>
                                <Line maxW="7rem" />
                                <Stack maxH="25rem" overflow="auto" w="100%" alignItems="center">
                                    <MatchesHistory history={matchHistory} />
                                </Stack>
                            </Stack>
                        </Stack>
                    </Card>
                </GridItem>
            </Grid>
        </>
    );
};

export default ProfilePage;
