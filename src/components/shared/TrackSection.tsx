import { Card, CardBody, CardHeader, Heading } from "@chakra-ui/react";
import { ReactNode, FC } from "react";

export interface TrackSectionProps {
  title: string | ReactNode;

  children?: ReactNode;
}

export const TrackSection: FC<TrackSectionProps> = ({ title, children }) => {
  return (
    <Card
      w="100%"
      // maxW="480px"
      bg="rgba(255,255,255,0.05)"
      backdropFilter="blur(12px)"
      border="1px solid"
      borderColor="rgba(255,255,255,0.08)"
      borderRadius="24px"
      pt={title ? 0 : 4}
    >
      {title && (
        <CardHeader pb={4}>
          <Heading as="h2" size="md">
            {title}
          </Heading>
        </CardHeader>
      )}
      <CardBody pt={0}>{children}</CardBody>
    </Card>
  );
};
