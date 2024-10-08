import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  StackProps,
  VStack,
  forwardRef,
  useToast,
} from "@chakra-ui/react";

import { useTrackerContext } from "@/TrackerContext";
import { Category } from "@/types";
import { deleteUnverifiedData } from "@/utils/apiLocal";
import { getFirstEmoji } from "@/utils/misc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, MutableRefObject } from "react";

interface ITrackerHeaderProps extends StackProps {
  isLoading: boolean;
  selectedCategory: Category | null;
  onSave: (category: Category, description: string, expense: number) => void;
  ref: MutableRefObject<HTMLInputElement | undefined>;
}

export const TrackerHeader: FC<ITrackerHeaderProps> = forwardRef(
  ({ selectedCategory, isLoading, onSave }, ref) => {
    const borderColor = Boolean(selectedCategory)
      ? selectedCategory?.color || "blue.200"
      : "red.200";

    const {
      inputValue,
      setInputValue: setInputValue,
      description,
      setDescription,
      setSelectedUnverifiedExpenseId,
      selectedUnverifiedId,
      resetInputs,
    } = useTrackerContext();

    const queryClient = useQueryClient();

    const toast = useToast();

    const mutation = useMutation({
      mutationFn: deleteUnverifiedData,
      onSuccess: () => {
        setSelectedUnverifiedExpenseId(undefined);
        queryClient.invalidateQueries({ queryKey: ["unverified"] });
      },
      onError: (error) => {
        console.error("Error deleting data:", error);

        toast({
          title: "Error deleting data",
          description: "An error occurred while deleting data",
          status: "error",
          duration: 1000,
        });
      },
      onSettled: () => {
        setSelectedUnverifiedExpenseId(undefined);
        queryClient.invalidateQueries({ queryKey: ["unverified"] });
      },
    });

    return (
      <Flex gap={3} flexDir="row" w="min(100%, 800px)">
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
            >
              $
            </InputLeftElement>
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
          bg={borderColor}
          isDisabled={!selectedCategory?.name || !inputValue}
          isLoading={isLoading}
          onClick={() => {
            if (!selectedCategory?.name || !inputValue) return;

            onSave(selectedCategory, description || "", inputValue);

            if (selectedUnverifiedId) {
              mutation.mutate(selectedUnverifiedId);
            }

            resetInputs();
          }}
        >
          Add record
        </Button>
      </Flex>
    );
  }
);
