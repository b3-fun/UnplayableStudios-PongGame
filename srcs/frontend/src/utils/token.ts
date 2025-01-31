export const getJwtToken = (): string => {
  try {
    const token = localStorage.getItem('jwt');
    if (!token) throw new Error('No token found');
    return token;
  } catch (error) {
    console.error('Error getting JWT token:', error);
    return '';
  }
};
