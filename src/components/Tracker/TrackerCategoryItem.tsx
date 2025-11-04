import { Category } from "@/types";
import {
  Box,
  Button,
  ButtonProps,
  Circle,
  SkeletonCircle,
  Text,
} from "@chakra-ui/react";
import { FC } from "react";

interface TrackerCategoryItemProps extends ButtonProps {
  category: Category;
  isSelected?: boolean;
  color?: string;
}

export const TrackerCategoryItem: FC<TrackerCategoryItemProps> = ({
  category,
  color,
  isSelected,
  ...rest
}) => {
  if (category === undefined) {
    // @ts-ignore
    return <SkeletonCircle {...rest} />;
  }

  return (
    // @ts-ignore
    <Box
      as={Button}
      bg={isSelected ? color : "rgba(255, 255, 255, 0.07)"}
      border={isSelected ? "2px solid transparent" : "2px solid transparent"}
      py={6}
      borderRadius="12px"
      _hover={{
        // bg: color,
        border: `2px solid ${color}`,
      }}
      {...rest}
    >
      <Text whiteSpace="break-spaces" fontSize={14} color="white">
        {category.name}
      </Text>
    </Box>
  );
};
