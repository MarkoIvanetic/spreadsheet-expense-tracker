import { Category, RowData } from "@/types";
import { findBestCategoryMatchByName } from "@/utils/misc";
import {
  Box,
  Circle,
  HStack,
  Skeleton,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { FC } from "react";

interface IUnverifiedItemProps {
  item: RowData;
  onClick: (item: RowData, category: Category) => void;
}

export const UnverifiedItem: FC<IUnverifiedItemProps> = ({ item, onClick }) => {
  const [categoryName, price, description, time] = item.row;
  const category = findBestCategoryMatchByName(categoryName);

  return (
    <Box
      key={item.id}
      as="button"
      bg={category.color}
      minW="85px"
      flex="1"
      borderRadius="12px"
      p="12px"
      _hover={{
        border: "none",
      }}
    >
      <HStack
        divider={<StackDivider />}
        fontSize="sm"
        color="white"
        whiteSpace="break-spaces"
        onClick={() => onClick(item, category)}
      >
        <Text>{categoryName}</Text>
        <Text>€{price}</Text>
        <Text>{description}</Text>
        <Text>{time}</Text>
      </HStack>
    </Box>
  );
};

export const UnverifiedItemSkeleton: FC = () => {
  return (
    <Box
      minW="85px"
      flex="1"
      borderRadius="12px"
      p="4px"
      _hover={{
        border: "none",
      }}
    >
      <Skeleton height="42px" borderRadius="12px" />
    </Box>
  );
};
