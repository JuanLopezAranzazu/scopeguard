import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  config: { initialColorMode: "light", useSystemColorMode: false },
  fonts: {
    heading: `'IBM Plex Serif', Georgia, serif`,
    body: `'IBM Plex Sans', system-ui, -apple-system, sans-serif`,
  },
  colors: {
    paper: "#EBEEF2",
    ink: "#12182B",
    muted: "#566075",
    line: "#CFD5DE",
    mark: "#FFE45C",
    brand: {
      50: "#EEF0FA",
      100: "#D6DBF2",
      200: "#B0B9E4",
      300: "#8791D2",
      400: "#5A66B8",
      500: "#27337A",
      600: "#1F2963",
      700: "#18204F",
      800: "#11173A",
      900: "#0A0F26",
    },
    verdict: {
      in: "#1B7F4B",
      out: "#B42318",
      partial: "#B9540B",
      ambiguous: "#7C5A00",
    },
  },
  radii: { sm: "3px", md: "5px", lg: "8px" },
  styles: {
    global: {
      body: { bg: "paper", color: "ink", lineHeight: 1.55, overflowWrap: "anywhere", overflowX: "hidden" },
    },
  },
  components: {
    Button: {
      defaultProps: { colorScheme: "brand" },
      baseStyle: { fontWeight: 500, borderRadius: "sm" },
    },
    Input: { defaultProps: { focusBorderColor: "brand.500" } },
    Textarea: { defaultProps: { focusBorderColor: "brand.500" } },
    Select: { defaultProps: { focusBorderColor: "brand.500" } },
    FormLabel: { baseStyle: { fontWeight: 600, fontSize: "sm", mb: 1 } },
    Heading: { baseStyle: { fontWeight: 600, letterSpacing: "-0.01em" } },
    Tabs: {
      defaultProps: { colorScheme: "brand" },
    },
  },
});
