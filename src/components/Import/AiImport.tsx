import { LoadingButton } from "@/components/core/LoadingButton";
import { TrackSection } from "@/components/shared/TrackSection";
import { GeminiImportEntry } from "@/types/import";
import { addEntriesToUnverified, extractStatements } from "@/utils/importClient";
import {
  Checkbox,
  Flex,
  Heading,
  Input,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useRef, useState } from "react";

const currentMonth = () => new Date().toISOString().slice(0, 7); // YYYY-MM

// this is an expense tracker — income, own-account transfers and ATM cash
// withdrawals ("isplata bez kartice") are not recorded
const isImportable = (entry: GeminiImportEntry) =>
  entry.type !== "income" &&
  entry.type !== "transfer" &&
  entry.type !== "cash_withdrawal" &&
  !/isplata bez kartice/i.test(entry.description);

type StepStatus = "pending" | "active" | "done" | "error";

interface Step {
  key: string;
  label: string;
  status: StepStatus;
  detail?: string;
}

const INITIAL_STEPS: Step[] = [
  { key: "prepare", label: "Preparing statement files", status: "pending" },
  { key: "extract", label: "Extracting transactions with Gemini", status: "pending" },
  { key: "queue", label: "Queueing expenses for review", status: "pending" },
  { key: "refresh", label: "Refreshing pending expenses", status: "pending" },
];

export const AiImport = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [statementMonth, setStatementMonth] = useState(currentMonth());
  const [files, setFiles] = useState<File[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [importError, setImportError] = useState<{
    message: string;
    detail?: string;
  } | null>(null);

  const setStep = (key: string, status: StepStatus, detail?: string) => {
    setSteps((prev) =>
      (prev ?? INITIAL_STEPS).map((step) =>
        step.key === key
          ? { ...step, status, detail: detail ?? step.detail }
          : step
      )
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files ?? []));
    setSteps(null);
    setImportError(null);
  };

  const handleSubmit = async () => {
    if (files.length === 0 || isRunning) return;

    setIsRunning(true);
    setImportError(null);
    setSteps(INITIAL_STEPS.map((step) => ({ ...step, detail: undefined })));

    let failedStep = "prepare";
    try {
      // 1. prepare + 2. extract — extractStatements reads the files (base64)
      // and posts them to the API, which strips the PDFs down to their
      // transaction tables and sends the slimmed text to Gemini with the
      // extraction prompt (built server-side from localData categories).
      setStep("prepare", "active");
      setStep("prepare", "done", `${files.length} file(s)`);

      failedStep = "extract";
      setStep("extract", "active");
      const result = await extractStatements(files, statementMonth);
      const importable = result.entries.filter(isImportable);
      const skipped = result.entries.length - importable.length;
      setStep(
        "extract",
        "done",
        `${result.entries.length} transactions found` +
          (skipped ? `, ${skipped} skipped (income/transfers/ATM)` : "")
      );

      if (importable.length === 0) {
        setStep("queue", "error", "Nothing to import");
        toast({
          title: "No expenses to import",
          description:
            result.warnings.join(" · ") ||
            "The statements produced no importable transactions.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // 3. queue into the unverified sheet → "Pending auto expenses"
      failedStep = "queue";
      setStep("queue", "active");
      await addEntriesToUnverified(importable);
      setStep("queue", "done", `${importable.length} queued`);

      // 4. refresh the pending list + budget
      failedStep = "refresh";
      setStep("refresh", "active");
      await queryClient.invalidateQueries({ queryKey: ["unverified"] });
      await queryClient.invalidateQueries({ queryKey: ["api/budget"] });
      setStep("refresh", "done");

      toast({
        title: "Import complete",
        description: `🤖 ${importable.length} expenses queued in Pending auto expenses — review and confirm them there.`,
        status: "success",
        duration: 6000,
        isClosable: true,
      });

      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      setStep(failedStep, "error", error?.message);
      setImportError({
        message: error?.message || "Import failed",
        detail:
          typeof error?.error === "string"
            ? error.error
            : error?.error
            ? JSON.stringify(error.error)
            : undefined,
      });
      toast({
        title: error?.message || "Import failed",
        description: error?.error || "Check the console for details.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <TrackSection
      title={
        <Heading as="h2" size="md" py={2}>
          AI Statement Import
        </Heading>
      }
    >
      <VStack alignItems="stretch" spacing={4} w="100%">
        <Flex gap={3} flexWrap="wrap" alignItems="center">
          <Input
            type="month"
            value={statementMonth}
            onChange={(e) => setStatementMonth(e.target.value)}
            size="sm"
            w="auto"
            isDisabled={isRunning}
          />
          <Input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.csv,application/pdf,text/csv"
            multiple
            onChange={handleFileChange}
            size="sm"
            w="auto"
            isDisabled={isRunning}
            sx={{ "::file-selector-button": { mr: 2, mt: 0.5 } }}
          />
          <LoadingButton
            text={`Submit${files.length ? ` (${files.length})` : ""}`}
            loadingText="Importing"
            isLoading={isRunning}
            onClick={handleSubmit}
            isDisabled={files.length === 0}
          />
        </Flex>

        {steps && (
          <VStack
            alignItems="stretch"
            spacing={2}
            p={3}
            borderRadius="12px"
            bg="rgba(255,255,255,0.03)"
          >
            {steps.map((step) => (
              <Flex key={step.key} alignItems="center" gap={2}>
                <Checkbox
                  isChecked={step.status === "done"}
                  isDisabled
                  colorScheme={step.status === "error" ? "red" : "green"}
                />
                <Text
                  fontSize={14}
                  color={
                    step.status === "error"
                      ? "red.300"
                      : step.status === "done"
                      ? "green.300"
                      : step.status === "active"
                      ? "white"
                      : "gray.500"
                  }
                >
                  {step.label}
                  {step.detail ? ` — ${step.detail}` : ""}
                </Text>
                {step.status === "active" && <Spinner size="xs" />}
              </Flex>
            ))}
          </VStack>
        )}

        {importError && (
          <VStack
            alignItems="stretch"
            spacing={1}
            p={3}
            borderRadius="12px"
            bg="rgba(229,62,62,0.08)"
            borderWidth="1px"
            borderColor="red.400"
          >
            <Text fontSize={14} fontWeight="bold" color="red.300">
              AI submission error
            </Text>
            <Text fontSize={14} color="red.200">
              {importError.message}
            </Text>
            {importError.detail && (
              <Text
                fontSize={12}
                color="red.200"
                fontFamily="mono"
                whiteSpace="pre-wrap"
                wordBreak="break-word"
              >
                {importError.detail}
              </Text>
            )}
          </VStack>
        )}

        {!steps && files.length === 0 && (
          <Text fontSize={14} color="gray.400">
            Upload Revolut / PBZ statements (PDF or CSV). Extracted expenses
            land in Pending auto expenses for review.
          </Text>
        )}
      </VStack>
    </TrackSection>
  );
};
