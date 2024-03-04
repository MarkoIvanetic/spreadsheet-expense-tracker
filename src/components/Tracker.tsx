import { Flex, StackProps, VStack } from "@chakra-ui/react";

import { Category, CategoryItem } from "@/components/CategoryItem";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { FC, useEffect, useRef, useState } from "react";
import { TrackerHeader } from "./TrackerHeader";
import { TrackerViewState } from "./TrackerMenu";
import { useStats } from "@/hooks/useStats";

interface ITrackerProps extends StackProps {
  onSave: (category: Category, description: string, expense: number) => void;
}

export const Tracker: FC<ITrackerProps> = ({ onSave, ...rest }) => {
  const inputRef = useRef<HTMLInputElement | undefined>();

  const [localData, setData] = useLocalStorage<Array<Category>>("api/data", []);
  const [stats] = useStats()
  const [viewMode, setViewMode] = useLocalStorage(
    "et-view",
    TrackerViewState.Grid
  );

  const categorySortFunction = (a: Category, b: Category) => {
    const aId = a.id;
    const bId = b.id;

    const occurrenceA = stats[aId] || 0;
    const occurrenceB = stats[bId] || 0;

    return occurrenceB - occurrenceA;
  };

  useEffect(() => {
    fetch("api/data")
      .then((response) => response.json())
      .then((response) => {
        setData(response);
      });
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >(undefined);

  return (
    <VStack
      alignItems="flex-start"
      justifyContent="center"
      py="12px"
      px="12px"
      minW="400px"
      {...rest}
    >
      <TrackerHeader
        selectedCategory={selectedCategory}
        onSave={onSave}
        ref={inputRef}
      />
      <Flex
        direction={viewMode === TrackerViewState.Grid ? "row" : "column"}
        alignItems={viewMode === TrackerViewState.Grid ? "center" : "stretch"}
        justifyContent="flex-start"
        color="white"
        flexWrap="wrap"
        gap="10px"
        w="min(100%, 800px)"
      >
        {localData?.sort(categorySortFunction)?.map((item: Category) => {
          return (
            <CategoryItem
              onClick={() => {
                setSelectedCategory(item);
                setTimeout(() => {
                  inputRef.current?.focus?.();
                });
              }}
              isSelected={selectedCategory?.name === item.name}
              key={item.id}
              category={item}
              color={item.color}
            />
          );
        })}
      </Flex>
    </VStack>
  );
};
