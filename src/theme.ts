// Palette ported from the Paw Patrol app's lib/res/app_style.dart
export const colors = {
  bg: "#E4E4E4", // AppStyle.bgColor
  appBar: "#1A3A66", // AppStyle.bgColor2
  card: "#FFFFFF", // AppStyle.searchtab3
  cardAlt: "#F7F7F7", // AppStyle.busrouteBG
  primary: "#189999", // AppStyle.busrouteBG2Des (main action / buttons)
  primaryDark: "#357E8E", // AppStyle.ticketDeepTeal
  teal: "#4EB5B9", // AppStyle.icyTeal
  steelBlue: "#4682B4", // AppStyle.steelBlue
  ticketBlue: "#526799", // AppStyle.ticketBlue
  accentOrange: "#EC6545", // AppStyle.busrouteBG3 (taken seats / ready-for-departure)
  text: "#000000", // AppStyle.textColor2
  textSecondary: "#3b3b3b", // AppStyle.textColor
  textOnDark: "#FFFFFF", // AppStyle.textColor3
  muted: "#B0BEC5", // AppStyle.coolLightGray
  border: "#E0E0E0",
  success: "#2E7D32",
  successBg: "#C8E6C9",
  warning: "#EF6C00",
  warningBg: "#FFE0B2",
  danger: "#D32F2F",
  dangerBg: "#FFCDD2",
};

export const textStyles = {
  goodMorning: { fontSize: 13, fontWeight: "500" as const, color: colors.text },
  bookTickets: { fontSize: 22, fontWeight: "bold" as const, color: colors.text },
  headline1: { fontSize: 22, fontWeight: "bold" as const, color: colors.textSecondary },
  headline2: { fontSize: 17, fontWeight: "500" as const, color: colors.text },
  headline3: { fontSize: 12, fontWeight: "400" as const, color: colors.textSecondary },
  routeAndPrice: { fontSize: 17, fontWeight: "500" as const, color: colors.text },
  small: { fontSize: 11, fontWeight: "500" as const, color: colors.text },
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 25 };
