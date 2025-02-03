import React from 'react';

import { Image } from '@chakra-ui/react';
// Assuming you'll create an assets folder in src
import logoImage from '../assets/logo.png';

export default function Logo() {
  return (
    <Image
      src={logoImage}
      alt="Pong Logo"
      h="40px" // Adjust height as needed
      w="auto"
      _dark={{ filter: 'brightness(1.2)' }} // Optional: adjust brightness in dark mode
    />
  );
}
