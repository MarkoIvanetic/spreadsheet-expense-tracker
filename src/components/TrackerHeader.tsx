import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  StackProps,
  VStack,
  forwardRef,
} from "@chakra-ui/react";

import { useTrackerContext } from "@/TrackerContext";
import { getFirstEmoji } from "@/utils/misc";
import { FC, MutableRefObject, useState } from "react";
import { Category } from "./CategoryItem";
import { TrackerMenu } from "./TrackerMenu";

interface ITrackerHeaderProps extends StackProps {
  isLoading: boolean;
  selectedCategory: Category | null;
  onSave: (category: Category, description: string, expense: number) => void;
  ref: MutableRefObject<HTMLInputElement | undefined>;
}

export const TrackerHeader: FC<ITrackerHeaderProps> = forwardRef(
  ({ selectedCategory, isLoading, onSave }, ref) => {
    const borderColor = Boolean(selectedCategory) ? "blue.200" : "red.200";

    const { description, setDescription } = useTrackerContext();

    const { inputValue, setInputValue: setInputValue } =
      useTrackerContext();

    return (
      <Flex mb={5} gap={3} flexDir="row" w="min(90%, 800px)" px="16px">
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
              id="expense-input"
              _focusVisible={{
                borderColor: borderColor,
              }}
              ref={ref}
              value={inputValue}
              p="10px 4.5rem 10px 40px"
              type="number"
              placeholder="Enter expense"
              onChange={(e) => setInputValue(+e.target.value)}
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
              {getFirstEmoji(selectedCategory?.name) || "🤷‍♂️"}
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
          isDisabled={!selectedCategory?.name || !inputValue}
          isLoading={isLoading}
          onClick={() => {
            if (!selectedCategory?.name || !inputValue) return;

            onSave(selectedCategory, description || "", inputValue);
          }}
        >
          Add record
        </Button>
        <Box w="24px">
          <TrackerMenu />
        </Box>
      </Flex>
    );
  }
);
