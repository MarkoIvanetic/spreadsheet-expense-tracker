import { Category } from "@/types";
import {
  Button,
  ButtonProps,
  Circle,
  SkeletonCircle,
  Text,
} from "@chakra-ui/react";
import { FC } from "react";

interface CategoryItemProps extends ButtonProps {
  category: Category;
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
    // @ts-ignore
    return <SkeletonCircle {...rest} />;
  }

  return (
    // @ts-ignore
    <Circle
      as={Button}
      bg={color}
      border={isSelected ? "2px solid gold" : "2px solid transparent"}
      _hover={{
        bg: color,
        border: "2px solid white",
      }}
      {...rest}
    >
      <Text whiteSpace="break-spaces" fontSize={12} color="white">
        {" "}
        {category.name}
      </Text>
    </Circle>
  );
};
