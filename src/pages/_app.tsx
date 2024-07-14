import { TrackerProvider } from "@/TrackerContext";
import "@/styles/globals.css";
import theme from "@/styles/theme";

import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <TrackerProvider>
        <Component {...pageProps} />
      </TrackerProvider>
    </ChakraProvider>
  );
}
