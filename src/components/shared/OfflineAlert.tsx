import React, { useState, useEffect } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { OfflineIcon } from "@/icons/OfflineIcon";

const OfflineAlert: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {isOffline && (
        <Flex
          position="fixed"
          top="0"
          left="0"
          width="100%"
          bg="gray.900"
          color="white"
          textAlign="center"
          alignItems="center"
          gap={4}
          p={2}
          zIndex={1000}
        >
          <OfflineIcon color="white" />
          You are offline. Some features may not work.
        </Flex>
      )}
    </>
  );
};

export default OfflineAlert;
