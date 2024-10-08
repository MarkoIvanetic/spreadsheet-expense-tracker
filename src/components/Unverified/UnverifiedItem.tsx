import { Category, RowData } from "@/types";
import { findBestCategoryMatchByName } from "@/utils/misc";
import { Circle, HStack, Skeleton, StackDivider, Text } from "@chakra-ui/react";
import { FC } from "react";

interface IUnverifiedItemProps {
  item: RowData;
  onClick: (item: RowData, category: Category) => void;
}

export const UnverifiedItem: FC<IUnverifiedItemProps> = ({ item, onClick }) => {
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
        onClick={() => onClick(item, category)}
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
};

export const UnverifiedItemSkeleton: FC = () => {
  return (
    <Circle minW="85px">
      <HStack divider={<StackDivider />} spacing={1}>
        <Skeleton height="42px" width="320px" borderRadius="12px"/>
      </HStack>
    </Circle>
  );
};
