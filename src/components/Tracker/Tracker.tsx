import { Box, Flex, StackProps } from "@chakra-ui/react";

import { useTrackerContext } from "@/TrackerContext";
import { TrackerCategoryItem } from "@/components/Tracker/TrackerCategoryItem";
import { useCategories } from "@/hooks/useCategories";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useStats } from "@/hooks/useStats";
import { Category } from "@/types";
import { FC, useRef } from "react";
import { TrackerViewState } from "./TrackerMenu";

interface ITrackerProps extends StackProps {
  isLoading: boolean;
  onSave: (category: Category, description: string, expense: number) => void;
}

export const Tracker: FC<ITrackerProps> = ({ onSave, isLoading, ...rest }) => {
  const inputRef = useRef<HTMLInputElement | undefined>(undefined);

  const { data: categories } = useCategories();

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
    <Flex
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      wrap="wrap"
      gap="10px"
      w="min(100%, 800px)"
    >
      {categories.sort(categorySortFunction).map((item, i) => (
        <Box key={item.id + i} flex="1 1 130px" minW="max-content">
          <TrackerCategoryItem
            onClick={() => {
              setSelectedCategory(item);
              setTimeout(() => inputRef.current?.focus?.());
            }}
            isSelected={selectedCategory?.name === item.name}
            category={item}
            color={item.color}
            // style={{ width: "100%" }}
            w="100%"
            maxW="250px"
          />
        </Box>
      ))}
    </Flex>
  );
};
