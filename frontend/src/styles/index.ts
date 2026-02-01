import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

// PINTARTS Design Tokens
export const colors = {
  primary: '#AC322D',
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Common styles
export const layout = StyleSheet.create({
  flex1: { flex: 1 },
  row: { flexDirection: 'row' },
  center: { alignItems: 'center', justifyContent: 'center' },
  itemsCenter: { alignItems: 'center' },
  justifyCenter: { justifyContent: 'center' },
  justifyBetween: { justifyContent: 'space-between' },
  flexWrap: { flexWrap: 'wrap' },
  absolute: { position: 'absolute' },
  relative: { position: 'relative' },
  inset0: { top: 0, right: 0, bottom: 0, left: 0 },
});

export const spacing = StyleSheet.create({
  p3: { padding: 12 },
  p4: { padding: 16 },
  p6: { padding: 24 },
  px4: { paddingHorizontal: 16 },
  px6: { paddingHorizontal: 24 },
  px8: { paddingHorizontal: 32 },
  py2: { paddingVertical: 8 },
  py3: { paddingVertical: 12 },
  py4: { paddingVertical: 16 },
  pt14: { paddingTop: 56 },
  pt16: { paddingTop: 64 },
  pb4: { paddingBottom: 16 },
  pb6: { paddingBottom: 24 },
  pb10: { paddingBottom: 40 },
  m2: { margin: 8 },
  m3: { margin: 12 },
  m4: { margin: 16 },
  mb1: { marginBottom: 4 },
  mb2: { marginBottom: 8 },
  mb3: { marginBottom: 12 },
  mb4: { marginBottom: 16 },
  mb6: { marginBottom: 24 },
  mb8: { marginBottom: 32 },
  ml1: { marginLeft: 4 },
  ml2: { marginLeft: 8 },
  ml3: { marginLeft: 12 },
  ml4: { marginLeft: 16 },
  mr2: { marginRight: 8 },
  mr3: { marginRight: 12 },
  mr4: { marginRight: 16 },
  mt1: { marginTop: 4 },
  mt2: { marginTop: 8 },
  mt3: { marginTop: 12 },
  mt4: { marginTop: 16 },
});

export const sizing = StyleSheet.create({
  w6: { width: 24 },
  w8: { width: 32 },
  w10: { width: 40 },
  w12: { width: 48 },
  w20: { width: 80 },
  w24: { width: 96 },
  wFull: { width: '100%' },
  h6: { height: 24 },
  h8: { height: 32 },
  h10: { height: 40 },
  h12: { height: 48 },
  h24: { height: 96 },
  hFull: { height: '100%' },
});

export const borders = StyleSheet.create({
  rounded: { borderRadius: 4 },
  roundedLg: { borderRadius: 8 },
  roundedXl: { borderRadius: 12 },
  rounded2xl: { borderRadius: 16 },
  roundedFull: { borderRadius: 9999 },
  border: { borderWidth: 1 },
  border2: { borderWidth: 2 },
  borderB: { borderBottomWidth: 1 },
  borderDashed: { borderStyle: 'dashed' },
});

export const backgrounds = StyleSheet.create({
  bgWhite: { backgroundColor: colors.white },
  bgBlack: { backgroundColor: colors.black },
  bgPrimary: { backgroundColor: colors.primary },
  bgGray50: { backgroundColor: colors.gray[50] },
  bgGray100: { backgroundColor: colors.gray[100] },
  bgGray200: { backgroundColor: colors.gray[200] },
  bgTransparent: { backgroundColor: 'transparent' },
  bgPrimaryLight: { backgroundColor: 'rgba(172, 50, 45, 0.1)' },
  bgWhite90: { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
  bgBlack20: { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
});

export const text = StyleSheet.create({
  textXs: { fontSize: 10 },
  textSm: { fontSize: 12 },
  textBase: { fontSize: 14 },
  textLg: { fontSize: 16 },
  textXl: { fontSize: 18 },
  text2xl: { fontSize: 22 },
  text3xl: { fontSize: 28 },
  fontLight: { fontWeight: '300' },
  fontNormal: { fontWeight: '400' },
  fontMedium: { fontWeight: '500' },
  fontSemibold: { fontWeight: '600' },
  fontBold: { fontWeight: '700' },
  textCenter: { textAlign: 'center' },
  textWhite: { color: colors.white },
  textBlack: { color: colors.black },
  textPrimary: { color: colors.primary },
  textGray400: { color: colors.gray[400] },
  textGray500: { color: colors.gray[500] },
  textGray600: { color: colors.gray[600] },
  textGray700: { color: colors.gray[700] },
  tracking: { letterSpacing: 1 },
  leading6: { lineHeight: 24 },
});

export const borderColors = StyleSheet.create({
  borderGray100: { borderColor: colors.gray[100] },
  borderGray200: { borderColor: colors.gray[200] },
  borderGray300: { borderColor: colors.gray[300] },
  borderPrimary: { borderColor: colors.primary },
});

export const effects = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  overflow: { overflow: 'hidden' },
});
