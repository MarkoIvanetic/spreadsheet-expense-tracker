import { Box, Flex } from "@chakra-ui/react";
import { NextPage } from "next";
import Head from "next/head";
import { SWRConfig } from "swr";

import { Layout } from "@/components/Layout/layout";
import NoSSR from "@/utils/NoSSR";
import trackerConfig from "../../tracker.config";

import OfflineAlert from "@/components/shared/OfflineAlert";

try {
  window.trackerConfig = trackerConfig;
} catch (error) {}

const Home: NextPage<{ fallback: Record<string, any> }> = ({ fallback }) => {
  return (
    <SWRConfig>
      <Head>
        <title>Expense tracker</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <NoSSR>
          <OfflineAlert />
          <Layout />
        </NoSSR>
        <Flex as="footer" mt="10vh" px="10px" py={4} justifyContent="center">
          <Box w="min(100%, 800px)" />
        </Flex>
      </main>
    </SWRConfig>
  );
};

export default Home;
