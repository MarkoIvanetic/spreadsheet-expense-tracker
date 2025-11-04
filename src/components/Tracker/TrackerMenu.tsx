import { useTrackerContext } from "@/TrackerContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useStats } from "@/hooks/useStats";
import { MenuIcon } from "@/icons/MenuIcon";
import { Category } from "@/types";
import {
  Button,
  IconButton,
  Link,
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

const SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/1m4qUwDiDhWZHYNmWT3kD3ka7Eb9SWogQ0_QWyVssyw0/edit?gid=2041952472#gid=2041952472";

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
        border="1px solid white"
        bg="green.500"
        aria-label="Options"
        icon={<MenuIcon color="white" />}
        variant="outline"
        size="sm"
      />
      <MenuList alignItems="flex-start">
        <MenuItem as={Link} href={SPREADSHEET_URL} isExternal color="green.300">
          Spreadsheet
        </MenuItem>
        <MenuItem
          justifyContent="flex-start"
          as={Button}
          colorScheme="green"
          onClick={toggleColorMode}
        >
          Toggle Color Mode
        </MenuItem>
        <MenuItem
          justifyContent="flex-start"
          as={Button}
          colorScheme="green"
          onClick={toggleGrid}
        >
          Switch to {viewMode === TrackerViewState.Grid ? "List" : "Grid"} view
        </MenuItem>
        <MenuItem
          justifyContent="flex-start"
          as={Button}
          colorScheme="green"
          onClick={onTestModalOpen}
        >
          Test category detection
        </MenuItem>

        <MenuItem
          justifyContent="flex-start"
          as={Button}
          colorScheme="green"
          onClick={refreshData}
        >
          Reset data
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
