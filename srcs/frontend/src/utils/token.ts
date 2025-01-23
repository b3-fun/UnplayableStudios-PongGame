export const getJwtToken = () => {
    try {
        console.log('All cookies:', document.cookie); // Debug line
        const jwtCookie = document.cookie
            .split(';')
            .find(c => c.trim().startsWith('jwt='));

        console.log('JWT Cookie found:', jwtCookie); // Debug line

        if (!jwtCookie) return null;

        const encodedJwt = jwtCookie.split('=')[1];
        console.log('Encoded JWT:', encodedJwt); // Debug line

        if (!encodedJwt) return null;

        const decodedJwt = decodeURIComponent(encodedJwt).replace('j:', '');
        console.log('Decoded JWT:', decodedJwt); // Debug line

        const parsedJwt = JSON.parse(decodedJwt);
        return parsedJwt.access_token;
    } catch (error) {
        console.error('Error parsing JWT token:', error);
        return null;
    }
};