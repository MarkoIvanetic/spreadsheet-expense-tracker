import { performManualCategoryMatching } from "@/utils/misc";
import {
    Button,
    Flex,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text
} from "@chakra-ui/react";
import React from "react";

interface CategoryDetectionTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoryDetectionTestModal: React.FC<CategoryDetectionTestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [inputValue, setInputValue] = React.useState("");
  const [dectectedCategory, setDetectedCategory] = React.useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleTestClick = () => {
    setDetectedCategory(
      performManualCategoryMatching(inputValue) || "None detected!"
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Category Detection Test</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={2}>
            Enter vendor name to test category detection:
          </Text>
          <Input
            placeholder="Konzum"
            value={inputValue}
            onChange={handleInputChange}
          />
          <Flex pt={4} gap={2}>
            <Text>Detected category:</Text>
            <Text fontWeight="bold">{dectectedCategory}</Text>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleTestClick} isDisabled={!inputValue}>
            Test
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CategoryDetectionTestModal;
