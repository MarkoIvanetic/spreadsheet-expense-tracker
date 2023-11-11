import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  StackProps,
  VStack,
} from "@chakra-ui/react";

import { CategoryItem } from "@/components/CategoryItem";
import { getFirstEmoji } from "@/utils/misc";
import { FC, useRef, useState } from "react";
import { TrackerMenu } from "./TrackerMenu";

interface ITrackerProps extends StackProps {
  data: Array<Array<string>>;
  onSave: (category: string, description: string, expense: number) => void;
}

export const Tracker: FC<ITrackerProps> = ({ onSave, data, ...rest }) => {
  const inputRef = useRef<HTMLInputElement | undefined>();

  let localData = (() => {
    if (data) {
      return data;
    }

    try {
      const local = JSON.parse(window?.localStorage?.getItem("api/data") || "");

      if (Array.isArray(local)) {
        return local;
      }

      return [];
    } catch (error) {

      return [];

    }
  })();

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
            <InputLeftElement pointerEvents="none" fontSize="1.2em">
              {getFirstEmoji(selectedCategory) || "🤷‍♂️"}
            </InputLeftElement>
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
        <Box w="24px">
          <TrackerMenu />
        </Box>
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
        {localData?.map((item: Array<string>, i: number) => {
          const [category, color] = item;

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
              category={category}
              color={color}
            />
          );
        })}
      </Flex>
    </VStack>
  );
};
