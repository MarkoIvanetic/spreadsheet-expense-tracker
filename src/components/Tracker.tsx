import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  StackProps,
  VStack,
} from "@chakra-ui/react";

import { CategoryItem } from "@/components/CategoryItem";
import { FC, useRef, useState } from "react";

interface ITrackerProps extends StackProps {
  data: Array<Array<string>>;
  onSave: (category: string, description: string, expense: number) => void;
}

export const Tracker: FC<ITrackerProps> = ({ onSave, data, ...rest }) => {
  const inputRef = useRef<HTMLInputElement | undefined>();

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    ""
  );
  const [description, setDescription] = useState<string | undefined>("");

  const [expense, setExpense] = useState<number>();

  return (
    <VStack alignItems="flex-start" {...rest}>
      <Flex
        flexDir="column"
        w="min(100%, 400px)"
        justifyContent="flex-start"
        bg={selectedCategory ? "blue.200" : "red.200"}
      >
        <InputGroup size="md" w="100%">
          <Input
            w="100%"
            // @ts-ignore
            ref={inputRef}
            value={expense}
            isDisabled={!selectedCategory}
            p="10px 4.5rem 10px 20px"
            type="number"
            placeholder="Enter expense"
            onChange={(e) => setExpense(+e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={() => {
                if (!selectedCategory || !expense) return;

                onSave(selectedCategory, description || "", expense);
              }}
            >
              Save
            </Button>
          </InputRightElement>
        </InputGroup>
        <InputGroup size="md" w="100%">
          <Input
            w="100%"
            value={description}
            isDisabled={!selectedCategory}
            p="10px 4.5rem 10px 20px"
            type="text"
            placeholder="Enter description"
            onChange={(e) => setDescription(e.target.value)}
          />
        </InputGroup>
      </Flex>
      <Flex
        alignItems="center"
        textAlign="center"
        color="white"
        flexWrap="wrap"
        gap="20px"
      >
        {data.map((item: Array<string>, i: number) => {
          return (
            <CategoryItem
              onClick={() => {
                setSelectedCategory(item[0]);
                setTimeout(() => {
                  inputRef.current?.focus?.();
                });
              }}
              isSelected={selectedCategory === item?.[0]}
              key={i}
              category={item}
            />
          );
        })}
      </Flex>
    </VStack>
  );
};
