import { Box, Divider, useDisclosure, VStack } from "@chakra-ui/react";

import { useSaveExpense } from "@/hooks/useSaveExpense";

import { Tracker } from "@/components/Tracker/Tracker";
import { Unverified } from "@/components/Unverified/Unverified";
import { BudgetBadgeStack } from "@/components/Budget/BudgetBadgeStack";
import { TrackSection } from "@/components/shared/TrackSection";
import TrackerTitle from "@/components/Tracker/TrackerTitle";

import packageJson from "../../../package.json";
import { TrackerHeader } from "@/components/Tracker/TrackerHeader";
import { useRef } from "react";
import { useTrackerContext } from "@/TrackerContext";

export const Layout = () => {
  const { isLoading, saveExpense, reset } = useSaveExpense();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const inputRef = useRef<HTMLInputElement | undefined>(undefined);

  const { selectedCategory } = useTrackerContext();

  return (
    <VStack
      bg="rgba(14, 17, 23, 1)"
      w="100%"
      maxW="800px"
      mx="auto"
      px={8}
      py={6}
      alignItems="flex-start"
      justifyContent="center"
      minW="400px"
      spacing={6}
    >
      <TrackerTitle
        version={packageJson.version}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
      />

      <BudgetBadgeStack />
      <Divider py={2} />
      <TrackerHeader
        selectedCategory={selectedCategory}
        onSave={saveExpense}
        isLoading={isLoading}
        key={reset}
        ref={inputRef}
      />

      <Tracker key={reset} isLoading={isLoading} onSave={saveExpense} />
      <Divider py={2} />
      <Unverified isLoading={isLoading} onSave={saveExpense} />
    </VStack>
  );
};
