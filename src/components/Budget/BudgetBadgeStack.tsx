import React, { FC } from "react";
import {
  Stack,
  Badge,
  Skeleton,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useBudgetData } from "@/hooks/useBudgetData";
import { getBadgeColor } from "@/components/Budget/utilsBudget";

// Interface for BudgetBadge props
interface BudgetBadgeProps {
  isLoading: boolean;
  colorScheme: string;
  label: string;
  value: string;
}

const BudgetBadge: FC<BudgetBadgeProps> = ({
  isLoading,
  colorScheme,
  label,
  value,
}) => {
  // Responsive font size with max size of 16px
  const responsiveFontSize = useBreakpointValue({
    base: "8px",
    sm: "12px",
    md: "14px",
  });

  if (isLoading) {
    return <Skeleton p={2} height="34px" width="100px" />;
  }

  return (
    <Badge p={2} colorScheme={colorScheme}>
      <Text color="white">
        {label}:
      </Text>
      <span style={{ fontSize: responsiveFontSize }}>{value}</span>
    </Badge>
  );
};

export const BudgetBadgeStack = () => {
  const { data, isLoading, error } = useBudgetData();

  const necessitiesColor = data
    ? getBadgeColor(data.necessitiesExpense, data.necessitiesBudget)
    : "gray";
  const wantsColor = data
    ? getBadgeColor(data.wantsExpense, data.wantsBudget)
    : "gray";

  return (
    <Stack direction="row">
      <BudgetBadge
        isLoading={isLoading}
        colorScheme={necessitiesColor}
        label="Necessities"
        value={`€${data?.necessitiesExpense.toFixed(
          2
        )} / €${data?.necessitiesBudget.toFixed(2)}`}
      />

      <BudgetBadge
        isLoading={isLoading}
        colorScheme={wantsColor}
        label="Wants"
        value={`€${data?.wantsExpense.toFixed(
          2
        )} / €${data?.wantsBudget.toFixed(2)}`}
      />

      <BudgetBadge
        isLoading={isLoading}
        colorScheme="green"
        label="Total"
        value={`€${data?.totalExpenses.toFixed(2)}`}
      />
    </Stack>
  );
};
