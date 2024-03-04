import { Tracker } from "@/components/Tracker";
import { Box, Flex } from "@chakra-ui/react";
import { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { SWRConfig } from "swr";

import { Category } from "@/components/CategoryItem";
import { useStats } from "@/hooks/useStats";
import NoSSR from "@/utils/NoSSR";

const fetcher = async (url: string, options: Record<any, any>) => {
  const res = await fetch(url, options);
  const data = await res.json();

  if (res.status !== 200) {
    throw new Error(data.message);
  }
  return data;
};

const Home: NextPage<{ fallback: Record<string, any> }> = ({ fallback }) => {
  const [reset, setReset] = useState(0);

  const [stats, setStats] = useStats();

  const saveExpense = async (
    category: Category,
    description: string,
    expense: number
  ) => {
    await fetcher("api/track", {
      method: "POST",
      body: JSON.stringify({
        category: category.name,
        description: description || "",
        value: expense,
      }),
    });
    setStats({
      ...stats,
      [category.id]: (stats[category.id] || 0) + 1,
    });
    setReset((x) => x + 1);
  };

  return (
    <SWRConfig>
      <Head>
        <title>Expense tracker</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <NoSSR>
          <Tracker key={reset} onSave={saveExpense} />
        </NoSSR>
        <Flex as="footer" mt="10vh" px="10px" py={4} justifyContent="center">
          <Box w="min(100%, 800px)"></Box>
        </Flex>
      </main>
    </SWRConfig>
  );
};

export default Home;

// export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
//   res.setHeader(
//     "Cache-Control",
//     "private, s-maxage=3600, stale-while-revalidate=2400"
//   );

//   // ************************************
//   const data = await getSheetData();
//   // ************************************

//   return {
//     props: {
//       fallback: {
//         // "api/data": data,
//       },
//     },
//   };
// };
