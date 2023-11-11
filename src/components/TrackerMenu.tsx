import { MenuIcon } from "@/icons/MenuIcon";
import {
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorMode,
} from "@chakra-ui/react";
import { useSWRConfig } from "swr";

export const TrackerMenu = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { mutate } = useSWRConfig();

  const refreshData = async () => {
    const newData = await fetch("api/data").then((response) => response.json());

    localStorage.setItem("api/data", JSON.stringify(newData));

    mutate("api/data", newData);
  };

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        colorScheme="blue"
        aria-label="Options"
        icon={<MenuIcon />}
        variant="outline"
        size="sm"
      />
      <MenuList alignItems="flex-start">
        <MenuItem
          justifyContent="flex-start"
          as={Button}
          onClick={toggleColorMode}
        >
          Toggle Color Mode
        </MenuItem>
        <MenuItem justifyContent="flex-start" as={Button} onClick={refreshData}>
          Refresh data
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
