import { Box, Button, ButtonProps } from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";

interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean;
  onClick: () => void;
  text: string;
  loadingText?: string;
  colorScheme?: string;
  size?: string;
}

export const LoadingButton: FC<LoadingButtonProps> = ({
  isLoading,
  onClick,
  text,
  loadingText = "Loading",
  colorScheme = "purple",
  size = "sm",
  ...rest
}) => {
  const [dynamicText, setDynamicText] = useState(loadingText);
  const [colorSchemeLocal, setColorScheme] = useState(colorScheme);

  useEffect(() => {
    if (!isLoading) {
      setDynamicText(loadingText);
      setColorScheme(colorScheme);
      return;
    }
  }, [isLoading, loadingText, colorScheme]);

  return (
    <Button
      {...rest}
      border="1px solid white"
      colorScheme={colorSchemeLocal}
      color="white"
      size={size}
      onClick={onClick}
      isLoading={isLoading}
      loadingText={dynamicText}
    >
      {text}
    </Button>
  );
};
