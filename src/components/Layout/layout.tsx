import { Divider } from "@chakra-ui/react";

import { useSaveExpense } from "@/hooks/useSaveExpense";

import { Tracker } from "@/components/Tracker/Tracker";
import { Unverified } from "@/components/Unverified/Unverified";

export const Layout = () => {
  const { isLoading, saveExpense, reset } = useSaveExpense();

  return (
    <>
      <Tracker key={reset} isLoading={isLoading} onSave={saveExpense} />
      <Divider py={2} />
      <Unverified isLoading={isLoading} onSave={saveExpense} />
    </>
  );
};
