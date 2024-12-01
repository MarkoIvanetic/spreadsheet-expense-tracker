import { Button, ButtonProps } from "@chakra-ui/react";
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
  colorScheme = "pink",
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

    let emojiCount = 0;
    const interval = setInterval(() => {
      emojiCount++;
      if (emojiCount < 5) {
        setDynamicText(`${loadingText}${"🔥".repeat(emojiCount)}`);
      }
      if (emojiCount === 5) {
        setColorScheme("yellow");
      } else if (emojiCount === 8) {
        setColorScheme("red");
        setDynamicText(`Suffering... 🥵🥵🥵`);
      }
      if (emojiCount === 12) {
        setDynamicText(`Oh boy... 💀💀💀`);
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isLoading, loadingText, colorScheme]);

  return (
    <Button
      {...rest}
      colorScheme={colorSchemeLocal}
      size={size}
      onClick={onClick}
      isLoading={isLoading}
      loadingText={dynamicText}
    >
      {text}
    </Button>
  );
};
