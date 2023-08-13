import {
  Button,
  Flex,
  FormHelperText,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  StackProps,
  Text,
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

  const borderColor = selectedCategory ? "blue.200" : "red.200";

  return (
    <VStack
      alignItems="center"
      justifyContent="center"
      py={3}
      minW="400px"
      {...rest}
    >
      <Flex mb={5} gap={3} flexDir="row" w="min(100%, 800px)">
        <VStack
          flexDir="column"
          w="100%"
          justifyContent="flex-start"
          spacing={4}
        >
          <InputGroup
            borderRadius="10px"
            borderWidth="2px"
            borderColor={borderColor}
            size="md"
            w="100%"
          >
            <InputLeftElement
              pointerEvents="none"
              color="gray.300"
              fontSize="1.2em"
              children="$"
            />
            <Input
              w="100%"
              _focusVisible={{
                borderColor: borderColor,
              }}
              // @ts-ignore
              ref={inputRef}
              value={expense}
              p="10px 4.5rem 10px 40px"
              type="number"
              placeholder="Enter expense"
              onChange={(e) => setExpense(+e.target.value)}
            />
          </InputGroup>
          <InputGroup
            borderRadius="10px"
            borderWidth="2px"
            borderColor={borderColor}
            size="md"
            w="100%"
          >
            <InputLeftElement
              pointerEvents="none"
              fontSize="1.2em"
              children="🤷‍♂️"
            />
            <Input
              w="100%"
              _focusVisible={{
                borderColor: borderColor,
              }}
              value={description}
              p="10px 4.5rem 10px 40px"
              type="text"
              placeholder="Enter description"
              onChange={(e) => setDescription(e.target.value)}
            />
          </InputGroup>
        </VStack>
        <Button
          w="200px"
          height="auto"
          colorScheme="blue"
          isDisabled={!selectedCategory || !expense}
          onClick={() => {
            if (!selectedCategory || !expense) return;

            onSave(selectedCategory, description || "", expense);
          }}
        >
          Add record
        </Button>
      </Flex>
      <Flex
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        color="white"
        flexWrap="wrap"
        gap="10px"
        w="min(100%, 800px)"
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
