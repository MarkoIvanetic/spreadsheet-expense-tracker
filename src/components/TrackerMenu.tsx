import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useStats } from "@/hooks/useStats";
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
import { Category } from "./CategoryItem";
import { runSysCheck } from "@/utils/misc";

// create an enum value called TrackerViewState containing values for grid view mode: Grid or List
export enum TrackerViewState {
  Grid = 1,
  List = 2,
}

export const TrackerMenu = () => {
  const { toggleColorMode } = useColorMode();
  const [_stats, setStats] = useStats();
  const [viewMode, setViewMode] = useLocalStorage("et-view", 1);

  const [_data, setData] = useLocalStorage<Array<Category>>("api/data", []);

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
        <MenuItem justifyContent="flex-start" as={Button} onClick={toggleGrid}>
          Switch to {viewMode === TrackerViewState.Grid ? "List" : "Grid"} view
        </MenuItem>
        <MenuItem justifyContent="flex-start" as={Button} onClick={runSysCheck}>
          Run sys check
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
