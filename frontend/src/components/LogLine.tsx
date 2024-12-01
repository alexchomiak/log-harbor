import { Box, Code, Collapsible } from "@chakra-ui/react";
import { useState, memo} from "react";
import { DataListItem, DataListRoot } from "@/components/ui/data-list"
import { internalFieldKey } from "./provider/ContainerLogProvider";
import { hashStringDarkToColor } from "@/util/color";
import { truncateStringPastLength } from "@/util/truncate";

export const LogLine = memo(function LogLine(props: { log: any, index: number }) {
  const [show, setShow] = useState(false);
  const color = props.log[`${internalFieldKey}containerColor`]
  let logMessage = props.log[`${internalFieldKey}log`]
  let tag = "🏷️ " + props.log[`${internalFieldKey}containerName`]
  let filterInternalFields = true
  if(logMessage == undefined) {
    tag = "🔎 Filter Result"
    filterInternalFields = false
  }

  if(props.log[`${internalFieldKey}json`] == true || logMessage == undefined) {
    
    logMessage = <div style={{"display": "inline"}}> {Object.entries(props.log)
      .filter(entry => !filterInternalFields || !entry[0].includes(internalFieldKey))
      .map((entry: any) => {
      const [key, value] = entry
      return (<Code style={{"background": hashStringDarkToColor(key.replace(internalFieldKey, "@")), "margin": "0 0.25rem", "marginBottom": "0.2rem"}}>◆ {key.replace(internalFieldKey, "@")}: {truncateStringPastLength(value.toString(), 24)} </Code>)
    })} </div>
  }


  return <Box className={show ? "logLine expandedLog" : "logLine"}
    data-state="open"
    _open={{
      animation: "fade-in 250ms ease-out",
    }}
    background={props.index % 2 == 0 ? "#1f0228": "#2c0638"}
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
