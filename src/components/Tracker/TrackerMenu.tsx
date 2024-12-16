import { useTrackerContext } from "@/TrackerContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useStats } from "@/hooks/useStats";
import { MenuIcon } from "@/icons/MenuIcon";
import { Category } from "@/types";
import {
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorMode,
} from "@chakra-ui/react";
import { FC } from "react";

// create an enum value called TrackerViewState containing values for grid view mode: Grid or List
export enum TrackerViewState {
  Grid = 1,
  List = 2,
}

export const TrackerMenu: FC<{ onTestModalOpen: () => void }> = ({
  onTestModalOpen,
}) => {
  const { toggleColorMode } = useColorMode();
  const [_stats, setStats] = useStats();
  const [viewMode, setViewMode] = useLocalStorage("et-view", 1);

  const [_data, setData] = useLocalStorage<Array<Category>>("api/data", []);

  const { selectedCategory } = useTrackerContext();

  const refreshData = async () => {
    setData([]);
    setStats({});

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const toggleGrid = async () => {
    setViewMode(
      viewMode === TrackerViewState.Grid
        ? TrackerViewState.List
        : TrackerViewState.Grid
    );
  };

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        border="2px solid white"
        bg={selectedCategory ? selectedCategory.color : "red.200"}
        aria-label="Options"
        icon={<MenuIcon color="white" />}
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
        <MenuItem justifyContent="flex-start" as={Button} onClick={toggleGrid}>
          Switch to {viewMode === TrackerViewState.Grid ? "List" : "Grid"} view
        </MenuItem>
        <MenuItem
          justifyContent="flex-start"
          as={Button}
          colorScheme="red"
          onClick={onTestModalOpen}
        >
          Test category detection
        </MenuItem>
        <MenuItem
          justifyContent="flex-start"
          as={Button}
          colorScheme="red"
          onClick={refreshData}
        >
          Reset data
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
