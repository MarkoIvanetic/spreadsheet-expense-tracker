import { LoadingButton } from "@/components/core/LoadingButton";

import {
  UnverifiedItem,
  UnverifiedItemSkeleton,
} from "@/components/Unverified/UnverifiedItem";
import { useTrackerContext } from "@/TrackerContext";
import { Category, RowData } from "@/types";
import {
  addAllExpenses,
  deleteBulkUnverifiedData,
  fetchUnverifiedData,
} from "@/utils/apiLocal";
import { focusInputById } from "@/utils/misc";
import {
  Button,
  Flex,
  Heading,
  StackProps,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useState } from "react";

interface IUnverifiedProps extends StackProps {
  isLoading: boolean;
  onSave: (category: Category, description: string, expense: number) => void;
}

export const Unverified: FC<IUnverifiedProps> = ({
  onSave,
  isLoading,
  ...rest
}) => {
  const {
    setSelectedCategory,
    setInputValue,
    setDescription,
    setSelectedUnverifiedExpenseId,
  } = useTrackerContext();
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    data: unverified,
    error,
    isPending,
    isError,
  } = useQuery<Array<RowData>>({
    queryKey: ["unverified"],
    queryFn: fetchUnverifiedData,
    staleTime: Infinity,
  });

  const [isBulkLoading, setBulkLoading] = useState(false);

  const deleteBulkMutation = useMutation({
    mutationFn: (rowIndices: number[]) => deleteBulkUnverifiedData(rowIndices),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Unverified data cleansed! 🧼",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setBulkLoading(false);
      queryClient.invalidateQueries({ queryKey: ["unverified"] });
    },
    onError: (error: any) => {
      toast({
        title: error.message,
        description: error.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setBulkLoading(false);
    },
  });

  const addAllMutation = useMutation({
    mutationFn: (rows: RowData[]) => addAllExpenses(rows),
    onSuccess: (data, variables) => {
      toast({
        title: "Info",
        description: "💯 Expenses registered ⌛⌛ Purging unverified data...",
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      // After successfully adding all expenses, delete them from the unverified sheet
      const rowIndices = variables.map((row) => row.id); // Assuming `id` is the row index
      deleteBulkMutation.mutate(rowIndices);
    },
    onError: (error: any) => {
      toast({
        title: error.message,
        description: error.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setBulkLoading(false);
    },
    onSettled: () => {
      // setBulkLoading(false);
    },
  });

  const handleAddAll = () => {
    if (unverified && unverified.length > 0) {
      setBulkLoading(true);
      addAllMutation.mutate(unverified);
    }
  };

  const handleOnClick = (item: RowData, category: Category) => {
    const [categoryName, price, description] = item.row;

    setSelectedCategory(category);
    setSelectedUnverifiedExpenseId(item.id);
    setInputValue(price);
    setDescription(description);

    focusInputById("expense-input");
  };

  if (isPending) {
    return (
      <VStack
        alignItems="flex-start"
        justifyContent="center"
        py="12px"
        px="12px"
        minW="400px"
        {...rest}
      >
        <Heading as="h2" size="md" py={2}>
          Pending auto expenses
        </Heading>
        {[...Array(4)].map((_, index) => (
          <UnverifiedItemSkeleton key={index} />
        ))}
      </VStack>
    );
  }

  if (isError) return <div>{JSON.stringify(error, null, 2)}</div>;

  return (
    <VStack
      alignItems="flex-start"
      justifyContent="center"
      py="12px"
      px="12px"
      minW="400px"
      {...rest}
    >
      <Flex alignItems="center" gap="12">
        <Heading as="h2" size="md" py={2}>
          Pending auto expenses
        </Heading>
        <Button
          colorScheme="blue"
          size="sm"
          isLoading={isBulkLoading}
          onClick={handleAddAll}
        >
          Add all
        </Button>
      </Flex>
      {unverified.length === 0 && (
        <Text fontSize={14} color="gray.400">
          No unverified expenses
        </Text>
      )}

      {unverified.map((item: RowData) => (
        <UnverifiedItem key={item.id} item={item} onClick={handleOnClick} />
      ))}
    </VStack>
  );
};
