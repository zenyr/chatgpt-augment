import { useCoder } from "@/lib/hooks/useCoder2";
import { Button, Stack } from "@mantine/core";
import { IconCodeDots, IconJson, IconZip } from "@tabler/icons-react";

export const Coder2Exporter = () => {
  const [handleExportJson, handleExportZipClick] = useCoder((s) => [
    s.handlers.handleExportJsonClick,
    s.handlers.handleExportZipClick,
  ]);
  return (
    <Stack align="center">
      <Button leftIcon={<IconJson />} onClick={() => handleExportJson(false)}>
        Download as a JSON file
      </Button>
      <Button
        leftIcon={<IconCodeDots />}
        onClick={() => handleExportJson(true)}
      >
        Download as a JSON5 file
      </Button>
      <Button leftIcon={<IconZip />} onClick={handleExportZipClick}>
        Download as a zip file
      </Button>
    </Stack>
  );
};
