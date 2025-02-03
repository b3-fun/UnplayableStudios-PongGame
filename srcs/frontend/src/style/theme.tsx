import { extendTheme, theme as base } from '@chakra-ui/react';
import '@fontsource/jersey-10';

const fonts = {
  // Update font names to use Jersey 10 as primary font with fallbacks
  heading: `"Jersey 10", ${base.fonts?.heading}`,
  body: `"Jersey 10", ${base.fonts?.body}`,
};
const colors = {
  // white: '#E0E0E0',
  white: '#FFF',
  black: '#000',
  green: '#A2CE73',
  yellow: '#FFFF25',
  red: '#EF9795',
  lightGreen: 'rgb(242,254,225)',
  darkGreen: 'rgb(117,179,102)',
  lightBlack: 'rgb(33,33,33)',
  customPurple: 'rgb(132,119,218)',
  customRed: '#FF5C5C',
};

const styles = {
  global: {
    body: {
      bg: '#FFFF25', // or any specific yellow color like '#FFFF00'
    },
  },
};

const config = {
  initialColorMode: 'dark',
};

const Card = {
  baseStyle: {
    display: 'flex',
    flexDirection: 'column',
    background: 'white',
    alignItems: 'center',
    gap: 6,
  },
  variants: {
    rounded: {
      padding: 8,
      borderRadius: 'xl',
      boxShadow: 'xl',
    },
    smooth: {
      padding: 6,
      borderRadius: 'base',
      boxShadow: 'md',
    },
  },
  defaultProps: {
    variant: 'smooth',
  },
};

const components = {
  Card,
};
const theme = extendTheme({ fonts, colors, config, components, styles });

export default theme;
