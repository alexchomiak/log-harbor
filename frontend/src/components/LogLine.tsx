import { Box, Code, Collapsible } from "@chakra-ui/react";
import { useState, memo} from "react";
import { DataListItem, DataListRoot } from "@/components/ui/data-list"
import { internalFieldKey } from "./provider/ContainerLogProvider";

export const LogLine = memo(function LogLine(props: { log: any }) {
  const [show, setShow] = useState(false);
  const color = props.log[`${internalFieldKey}containerColor`]
  let logMessage = props.log[`${internalFieldKey}log`]
  let tag = "🏷️ " + props.log[`${internalFieldKey}containerName`]
  if(logMessage == undefined) {
    logMessage = JSON.stringify(props.log).replace(internalFieldKey, "@")
    tag = "🔎 Filter Result"
  }
  return <Box className={show ? "logLine expandedLog" : "logLine"}
    data-state="open"
    _open={{
      animation: "fade-in 250ms ease-out",
    }}
  >
    <Collapsible.Root open={show} style={{ "margin": "0", "padding": "0", "textAlign": "left" }}>
      <Box onClick={() => setShow(!show)} style={{"cursor": "pointer"}}>
      
        <Code style={{"color": color}} fontSize={"0.8rem"} fontWeight={900}>{tag}</Code> {show ? "▼" : "▶"} {logMessage}
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
})
