import { TrackerProvider } from "@/TrackerContext";
import "@/styles/globals.css";
import theme from "@/styles/theme";
import { ChakraProvider } from "@chakra-ui/react";

import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";

import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();

  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <TrackerProvider>
          <Component {...pageProps} />
        </TrackerProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}
