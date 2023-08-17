import {
  Button,
  ButtonProps,
  Circle,
  SkeletonCircle,
  Text,
} from "@chakra-ui/react";
import { FC } from "react";

interface CategoryItemProps extends ButtonProps {
  category: string;
  isSelected?: boolean;
  color?: string;
}

export const CategoryItem: FC<CategoryItemProps> = ({
  category,
  color,
  isSelected,
  ...rest
}) => {

  if (category === undefined) {
    return <SkeletonCircle w="120px" h="120px" />;
  }

  return (
    // @ts-ignore
    <Circle
      as={Button}
      size="120px"
      bg={color}
      border={isSelected ? "4px solid blue" : "4px solid transparent"}
      _hover={{
        bg: color,
        border: '4px solid blue'
      }}
      {...rest}
    >
      <Text whiteSpace="break-spaces" color="white"> {category}</Text>
    </Circle>
  );
};
