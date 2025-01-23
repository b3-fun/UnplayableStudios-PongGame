export const getJwtToken = () => {
    try {
        const jwtCookie = document.cookie
            .split(';')
            .find(c => c.trim().startsWith('jwt='));
        
        if (!jwtCookie) return null;
        
        const encodedJwt = jwtCookie.split('=')[1];
        if (!encodedJwt) return null;
        
        const decodedJwt = decodeURIComponent(encodedJwt).replace('j:', '');
        const parsedJwt = JSON.parse(decodedJwt);
        
        return parsedJwt.access_token;
    } catch (error) {
        console.error('Error parsing JWT token:', error);
        return null;
    }
}; 