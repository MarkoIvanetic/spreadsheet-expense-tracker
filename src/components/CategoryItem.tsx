import {
  Button,
  ButtonProps,
  Circle,
  SkeletonCircle,
  Text,
} from "@chakra-ui/react";
import { FC } from "react";

interface CategoryItemProps extends ButtonProps {
  category: Array<string>;
  isSelected?: boolean;
}

export const CategoryItem: FC<CategoryItemProps> = ({
  category,
  isSelected,
  ...rest
}) => {
  if (category === undefined) {
    return <SkeletonCircle w="140px" h="140px" />;
  }

  const [name, color] = category;

  return (
    // @ts-ignore
    <Circle
      as={Button}
      size="140px"
      bg={color}
      border={isSelected ? "4px solid blue" : "4px solid transparent"}
      _hover={{
        bg: color,
        border: '4px solid blue'
      }}
      {...rest}
    >
      <Text whiteSpace="break-spaces" color="white"> {name}</Text>
    </Circle>
  );
};
