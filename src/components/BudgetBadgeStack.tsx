import React from "react";
import { Stack, Badge, Skeleton } from "@chakra-ui/react";
import { useBudgetData } from "@/hooks/useBudgetData";

export const BudgetBadgeStack = () => {
  const { data, isLoading, error } = useBudgetData();

  const getBadgeColor = (expense: number, limit: number) => {
    const percentage = (expense / limit) * 100;
    if (percentage < 50) {
      return "green";
    } else if (percentage < 75) {
      return "yellow";
    } else if (percentage < 100) {
      return "orange";
    } else {
      return "red";
    }
  };

  const necessitiesColor = data
    ? getBadgeColor(data.necessitiesExpense, data.necessitiesBudget)
    : "gray";
  const wantsColor = data
    ? getBadgeColor(data.wantsExpense, data.wantsBudget)
    : "gray";

  return (
    <Stack direction="row">
      <Badge p={2} variant="outline" colorScheme={necessitiesColor}>
        Necessities:
      </Badge>
      {isLoading ? (
        <Skeleton p={2} height="34px" width="100px" />
      ) : (
        <Badge p={2} colorScheme={necessitiesColor}>
          €{data!.necessitiesExpense.toFixed(2)} /{" "}
          €{data!.necessitiesBudget.toFixed(2)}
        </Badge>
      )}
      <Badge p={2} variant="outline" colorScheme={wantsColor}>
        Wants
      </Badge>
      {isLoading ? (
        <Skeleton p={2} height="34px" width="100px" />
      ) : (
        <Badge p={2} colorScheme={wantsColor}>
          €{data!.wantsExpense.toFixed(2)} / €{data!.wantsBudget.toFixed(2)}
        </Badge>
      )}
      {isLoading ? (
        <Skeleton p={2} height="34px" width="100px" />
      ) : (
        <Badge p={2} colorScheme={wantsColor}>
          Total: €{data!.totalExpenses.toFixed(2)}
        </Badge>
      )}
    </Stack>
  );
};
