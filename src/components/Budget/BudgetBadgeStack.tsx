import React, { FC } from "react";
import {
  Stack,
  Badge,
  Skeleton,
  Text,
  useBreakpointValue,
  HStack,
  CircularProgress,
  VStack,
  Circle,
  Box,
} from "@chakra-ui/react";
import { useBudgetData } from "@/hooks/useBudgetData";
import { getBadgeColor } from "@/components/Budget/utilsBudget";
import { MoneyBagIcon } from "@/icons/MoneyBagIcon";
import { TrackSection } from "@/components/shared/TrackSection";

// Interface for BudgetBadge props
interface BudgetBadgeProps {
  isLoading: boolean;
  trackColor: string;
  color: string;
  label: string;
  total: number;
  value: number;
}

const BudgetBadge: FC<BudgetBadgeProps> = ({
  isLoading,
  trackColor,
  color,
  label,
  total,
  value,
}) => {
  if (isLoading) {
    return (
      <HStack w="full">
        <CircularProgress
          trackColor={trackColor}
          color={color}
          value={100}
          sx={{ opacity: 0.75 }}
        />
        <VStack alignItems="flex-start" spacing={0}>
          <Text fontWeight="bold" fontSize="md">
            {label}
          </Text>
          <Skeleton
            borderRadius="md"
            mt={1}
            height="18px"
            width="min(100%, 120px)"
          />
        </VStack>
      </HStack>
    );
  }

  return (
    <HStack w="full">
      <CircularProgress
        trackColor={trackColor}
        color={color}
        value={Math.floor((value / total) * 100)}
        sx={{ opacity: 0.75 }}
      />
      <VStack alignItems="flex-start" spacing={0}>
        <Text fontWeight="bold" fontSize="md">
          {label}
        </Text>
        <Text fontSize="sm">
          <Text as="span" color={color}>
            €{value.toFixed(2)}
          </Text>{" "}
          / {total.toFixed(2)}
        </Text>
      </VStack>
    </HStack>
  );
};

export const BudgetBadgeStack = () => {
  const { data, isLoading, error } = useBudgetData();

  if (error) {
    return (
      <Box
        as="pre"
        borderColor="red.500"
        borderWidth="1px"
        p={4}
        borderRadius="8px"
      >
        {JSON.stringify(error, null, 2)}
      </Box>
    );
  }

  return (
    <TrackSection title="">
      <Stack direction="column" w="100%" spacing={4} color="gray.300">
        <HStack alignItems="flex-start">
          <Circle bg="rgba(255, 255, 255, 0.07)" p={2}>
            <MoneyBagIcon color="#68D391" width="32px" height="32px" />
          </Circle>
          <VStack alignItems="flex-start" spacing={0}>
            <Text fontSize="md">Total expenses</Text>

            {isLoading ? (
              <Skeleton
                borderRadius="md"
                height="30px"
                width="min(100%, 92px)"
              />
            ) : (
              <Text fontWeight="bold" color="white" fontSize="xl">
                €{data?.totalExpenses.toFixed(2)}
              </Text>
            )}
          </VStack>
        </HStack>

        <Stack direction="row" justifyContent="space-between">
          <BudgetBadge
            isLoading={isLoading}
            trackColor="rgba(74, 222, 128, 0.15)"
            color="rgba(74, 222, 128, 1)"
            label="Necessities"
            total={data?.necessitiesBudget || 0}
            value={data?.necessitiesExpense || 0}
          />

          <BudgetBadge
            isLoading={isLoading}
            trackColor="rgba(96, 165, 250, 0.15)"
            color="rgba(96, 165, 250, 1)"
            label="Wants"
            total={data?.wantsBudget || 0}
            value={data?.wantsExpense || 0}
          />
        </Stack>
      </Stack>
    </TrackSection>
  );
};
