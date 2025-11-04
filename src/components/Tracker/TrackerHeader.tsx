import { TrackSection } from "@/components/shared/TrackSection";
import { useTrackerContext } from "@/TrackerContext";
import { Category } from "@/types";
import { deleteUnverifiedData } from "@/utils/apiLocal";
import { getFirstEmoji } from "@/utils/misc";
import { AddIcon, InfoOutlineIcon, PhoneIcon } from "@chakra-ui/icons";
import {
  Button,
  forwardRef,
  Input,
  InputGroup,
  InputLeftElement,
  StackProps,
  useToast,
  VStack,
} from "@chakra-ui/react";
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
    // Context values
    const {
      inputValue,
      setInputValue,
      description,
      setDescription,
      setSelectedUnverifiedExpenseId,
      selectedUnverifiedId,
      resetInputs,
    } = useTrackerContext();

    // Query Client and Toast hooks
    const queryClient = useQueryClient();
    const toast = useToast();

    // Simplified layout: no dynamic border colors needed

    // Mutation for deleting unverified data
    const mutation = useMutation({
      mutationFn: deleteUnverifiedData,
      onSuccess: () => {
        setSelectedUnverifiedExpenseId(undefined);
        queryClient.invalidateQueries({ queryKey: ["unverified"] });
        queryClient.invalidateQueries({ queryKey: ["api/budget"] });
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

    // Handle save button click
    const handleSaveClick = () => {
      if (!selectedCategory?.name || !inputValue) return;

      onSave(selectedCategory, description || "", inputValue);

      if (selectedUnverifiedId) {
        mutation.mutate(selectedUnverifiedId);
      }

      resetInputs();
    };

    return (
      <TrackSection title="Add Expense">
        <VStack align="stretch" spacing={4}>
          {/* Amount Field */}
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              {getFirstEmoji(selectedCategory?.name || "🤷")}
            </InputLeftElement>
            <Input
              id="expense-input"
              ref={ref}
              type="number"
              value={inputValue}
              bg="rgba(255, 255, 255, 0.07)"
              onChange={(e) => setInputValue(+e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="Amount"
              aria-label="Expense amount"
            />
          </InputGroup>

          {/* Description Field */}
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <InfoOutlineIcon color="green.300" />
            </InputLeftElement>
            <Input
              type="text"
              value={description}
              bg="rgba(255, 255, 255, 0.07)"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              aria-label="Expense description"
            />
          </InputGroup>

          <Button
            colorScheme="green"
            isDisabled={!selectedCategory?.name || !inputValue}
            isLoading={isLoading}
            onClick={handleSaveClick}
            leftIcon={<AddIcon />}
            aria-label="Add expense"
          >
            Add Expense
          </Button>
        </VStack>
      </TrackSection>
    );
  }
);

TrackerHeader.displayName = "TrackerHeader";
