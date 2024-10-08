import {
  UnverifiedItem,
  UnverifiedItemSkeleton,
} from "@/components/Unverified/UnverifiedItem";
import { useTrackerContext } from "@/TrackerContext";
import { Category, RowData } from "@/types";
import { fetchUnverifiedData } from "@/utils/apiLocal";
import { focusInputById } from "@/utils/misc";
import { Heading, StackProps, Text, VStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";

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

  const {
    data: unverified,
    error,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["unverified"],
    queryFn: fetchUnverifiedData,
    staleTime: Infinity,
  });

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
      <Heading as="h2" size="md" py={2}>
        Pending auto expenses
      </Heading>

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
