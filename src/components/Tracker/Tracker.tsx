import {
  Box,
  Flex,
  HStack,
  Heading,
  StackProps,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";

import { useTrackerContext } from "@/TrackerContext";
import { useCategories } from "@/hooks/useCategories";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useStats } from "@/hooks/useStats";
import { Category } from "@/types";
import { FC, useRef } from "react";
import { TrackerHeader } from "./TrackerHeader";
import { TrackerMenu, TrackerViewState } from "./TrackerMenu";
import { BudgetBadgeStack } from "@/components/Budget/BudgetBadgeStack";
import { TrackerCategoryItem } from "@/components/Tracker/TrackerCategoryItem";
import CategoryDetectionTestModal from "@/components/Unverified/CategoryDetectionTestModal";

import packageJson from "../../../package.json";


interface ITrackerProps extends StackProps {
  isLoading: boolean;
  onSave: (category: Category, description: string, expense: number) => void;
}

export const Tracker: FC<ITrackerProps> = ({ onSave, isLoading, ...rest }) => {
  const inputRef = useRef<HTMLInputElement | undefined>(undefined);

  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [stats] = useStats();

  const [viewMode] = useLocalStorage("et-view", TrackerViewState.Grid);

  const categorySortFunction = (a: Category, b: Category) => {
    const aId = a.id;
    const bId = b.id;

    const occurrenceA = stats[aId] || 0;
    const occurrenceB = stats[bId] || 0;

    return occurrenceB - occurrenceA;
  };

  const { selectedCategory, setSelectedCategory } = useTrackerContext();

  return (
    <VStack
      alignItems="flex-start"
      justifyContent="center"
      py="12px"
      px="12px"
      minW="400px"
      spacing={4}
      {...rest}
    >
      <HStack justify="space-between" w="100%" p="40px 6px 20px 0px">
        <Heading as="h1">GS Expense Tracker v{packageJson.version}</Heading>
        <Box w="24px">
          <CategoryDetectionTestModal isOpen={isOpen} onClose={onClose} />
          <TrackerMenu onTestModalOpen={onOpen} />
        </Box>
      </HStack>
      <TrackerHeader
        selectedCategory={selectedCategory}
        onSave={onSave}
        isLoading={isLoading}
        ref={inputRef}
      />
      <BudgetBadgeStack />
      <Flex
        direction={viewMode === TrackerViewState.Grid ? "row" : "column"}
        alignItems={viewMode === TrackerViewState.Grid ? "center" : "stretch"}
        justifyContent="flex-start"
        color="white"
        flexWrap="wrap"
        gap="10px"
        w="min(100%, 800px)"
      >
        {categories?.sort(categorySortFunction)?.map((item: Category, i: number) => {
          return (
            <TrackerCategoryItem
              onClick={() => {
                setSelectedCategory(item);
                setTimeout(() => {
                  inputRef.current?.focus?.();
                });
              }}
              isSelected={selectedCategory?.name === item.name}
              key={item.id + i}
              category={item}
              color={item.color}
            />
          );
        })}
      </Flex>
    </VStack>
  );
};
