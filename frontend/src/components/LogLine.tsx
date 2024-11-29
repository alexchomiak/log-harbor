import { Box, Code, Collapsible } from "@chakra-ui/react";
import { useState } from "react";
import { DataListItem, DataListRoot } from "@/components/ui/data-list"
import { internalFieldKey } from "./LogStreamV2";
export function LogLine(props: { log: any, container: any }) {
  const { log } = props;
  const [show, setShow] = useState(false);
  return <Box className={show ? "logLine expandedLog" : "logLine"}
    data-state="open"
    _open={{
      animation: "fade-in 300ms ease-out",
    }}
  >
    <Collapsible.Root open={show} style={{ "margin": "0", "padding": "0", "textAlign": "left" }}>
      <Box onClick={() => setShow(!show)} style={{"cursor": "pointer"}}>
        <Code fontSize={"0.8rem"} fontWeight={900}> 🏷️ {props.container.Name}</Code> {show ? "▼" : "▶"} {log[`${internalFieldKey}log`]}
      </Box>

      <Collapsible.Content>
        <Box className="expandedLogContent">
          <DataListRoot orientation="horizontal" gap={1}>
            {Object.entries(props.log).map(([key, value]) => (
              <DataListItem key={key} label={key.replace(internalFieldKey, "@")} value={JSON.stringify(value)} />
            ))}
          </DataListRoot>
        </Box>
      </Collapsible.Content>
    </Collapsible.Root>
  </Box>;
}
