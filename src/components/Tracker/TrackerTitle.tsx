import { FC } from "react";
import { HStack, Flex, Heading, Button, Link, Box } from "@chakra-ui/react";
import CategoryDetectionTestModal from "@/components/Unverified/CategoryDetectionTestModal";
import { TrackerMenu } from "@/components/Tracker/TrackerMenu";

interface TrackerTitleProps {
  version: string | number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const TrackerTitle: FC<TrackerTitleProps> = ({
  version,
  isOpen,
  onOpen,
  onClose,
}) => {
  return (
    <HStack justify="space-between" w="100%" p="40px 6px 20px 0px">
      <Flex gap={6} alignItems="center">
        <Heading fontSize="2xl" as="h1">
          Expense Tracker v{version}
        </Heading>
      </Flex>
      <Box w="24px">
        <CategoryDetectionTestModal isOpen={isOpen} onClose={onClose} />
        <TrackerMenu onTestModalOpen={onOpen} />
      </Box>
    </HStack>
  );
};

export default TrackerTitle;
