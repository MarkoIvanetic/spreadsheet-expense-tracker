import { useTrackerContext } from "@/TrackerContext";
import { Category } from "@/components/CategoryItem";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RowData } from "@/types";
import { findBestMatchIndex, focusInputById } from "@/utils/misc";
import {
  Circle,
  HStack,
  StackProps,
  Text,
  VStack
} from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";

interface IUnverifiedProps extends StackProps {
  isLoading: boolean;
  onSave: (category: Category, description: string, expense: number) => void;
}

export const Unverified: FC<IUnverifiedProps> = ({
  onSave,
  isLoading,
  ...rest
}) => {
  const [unverified, setUnverified] = useState<Array<RowData>>([]);

  const [localData] = useLocalStorage<Array<Category>>("api/data", []);

  const allCategoryNames = localData.map((category) => category.name);

  const { setSelectedCategory, setInputValue, setDescription } =
    useTrackerContext();

  useEffect(() => {
    fetch("api/unverified")
      .then((response) => response.json())
      .then((response: Array<RowData>) => {
        setUnverified(response);
      });
  }, []);

  const handleOnClick = (item: RowData) => {
    const [categoryName, price, description, time] = item.row;

    const bestMatchCategoryIndex = findBestMatchIndex(
      categoryName,
      allCategoryNames
    );

    const category = localData[bestMatchCategoryIndex];

    setSelectedCategory(category);
    setInputValue(price);
    setDescription(description);

    fetch("api/unverified", {
      method: "DELETE",
      body: JSON.stringify({ rowIndex: item.id }),
    });

    focusInputById("expense-input");
  };

  return (
    <VStack
      alignItems="flex-start"
      justifyContent="center"
      py="12px"
      px="12px"
      minW="400px"
      {...rest}
    >
      {unverified.map((item: RowData) => {
        const [category, price, description, time] = item.row;

        return (
          <HStack as="button" onClick={() => handleOnClick(item)}>
            <Circle
              bg="#97266D"
              // border={isSelected ? "2px solid gold" : "2px solid transparent"}
              minW="85px"
              py="12px"
              _hover={{
                bg: "#97266D",
                border: "2px solid white",
              }}
            >
              <Text whiteSpace="break-spaces" fontSize={12} color="white">
                {category}
              </Text>
            </Circle>
            <Text whiteSpace="break-spaces" fontSize={12} color="white">
              {price + " " + description + " " + time}{" "}
            </Text>
          </HStack>
        );
      })}
    </VStack>
  );
};
