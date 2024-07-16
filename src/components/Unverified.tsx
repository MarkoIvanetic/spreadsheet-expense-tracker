import { useTrackerContext } from "@/TrackerContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Category, RowData } from "@/types";
import {
  findBestCategoryMatchByName,
  findBestMatchIndex,
  focusInputById,
} from "@/utils/misc";
import {
  Circle,
  Divider,
  HStack,
  Heading,
  StackDivider,
  StackProps,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FC } from "react";

import { fetchUnverifiedData } from "@/utils/apiLocal";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesLocal, useCategories } from "@/hooks/useCategories";

interface IUnverifiedProps extends StackProps {
  isLoading: boolean;
  onSave: (category: Category, description: string, expense: number) => void;
}

export const Unverified: FC<IUnverifiedProps> = ({
  onSave,
  isLoading,
  ...rest
}) => {
  const {
    setSelectedCategory,
    setInputValue,
    setDescription,
    setSelectedUnverifiedExpenseId,
  } = useTrackerContext();

  const {
    data: unverified,
    error,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["unverified"],
    queryFn: fetchUnverifiedData,
    staleTime: Infinity,
  });

  const handleOnClick = (item: RowData, category: Category) => {
    const [categoryName, price, description, time] = item.row;

    setSelectedCategory(category);
    setSelectedUnverifiedExpenseId(item.id);
    setInputValue(price);
    setDescription(description);

    focusInputById("expense-input");
  };

  if (isPending) return <div>Loading...</div>;

  if (isError) return <div>{JSON.stringify(error, null, 2)}</div>;

  return (
    <VStack
      alignItems="flex-start"
      justifyContent="center"
      py="12px"
      px="12px"
      minW="400px"
      {...rest}
    >
      <Heading as="h2" size="md" py={2}>
        Pending auto expenses
      </Heading>

      {unverified.length === 0 && (
        <Text fontSize={14} color="gray.400">
          No unverified expenses
        </Text>
      )}

      {unverified.map((item: RowData) => {
        const [categoryName, price, description, time] = item.row;

        const category = findBestCategoryMatchByName(categoryName);

        return (
          <Circle
            key={item.id}
            as="button"
            bg={category.color}
            minW="85px"
            p="12px"
            _hover={{
              border: "none",
            }}
          >
            <HStack
              divider={<StackDivider />}
              as="button"
              onClick={() => handleOnClick(item, category)}
            >
              <Text whiteSpace="break-spaces" fontSize={12} color="white">
                {categoryName}
              </Text>
              <Text whiteSpace="break-spaces" fontSize={12} color="white">
                €{price}
              </Text>
              <Text whiteSpace="break-spaces" fontSize={12} color="white">
                {description}
              </Text>
              <Text whiteSpace="break-spaces" fontSize={12} color="white">
                {time}
              </Text>
            </HStack>
          </Circle>
        );
      })}
    </VStack>
  );
};
