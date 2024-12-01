import { Box, Code, Collapsible } from "@chakra-ui/react";
import { useState, memo} from "react";
import { DataListItem, DataListRoot } from "@/components/ui/data-list"
import { internalFieldKey } from "./provider/ContainerLogProvider";
import { hashStringDarkToColor } from "@/util/color";
import { truncateStringPastLength } from "@/util/truncate";
import { toaster } from "./ui/toaster";

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


  const entrySortFunc = (a: any, b: any) => {
    const ak = a[0]
        const bk = b[0]

        const strictFieldOrder = [
          `${internalFieldKey}time`,
          "level",
          "message",
          `${internalFieldKey}log`
        ]

        if (strictFieldOrder.includes(ak) && strictFieldOrder.includes(bk)) {
          return strictFieldOrder.indexOf(ak) - strictFieldOrder.indexOf(bk)
        }

        if(strictFieldOrder.includes(ak)) {
          return -1
        }
        if(strictFieldOrder.includes(bk)) {
          return 1
        }


        return ak > bk ? 1 : -1;
      }

  if(props.log[`${internalFieldKey}json`] == true || logMessage == undefined) {
    
    logMessage = <div style={{"display": "inline"}}> {Object.entries(props.log)
      .filter(entry => {
        if(entry[0] == `${internalFieldKey}time`) return true
        return !filterInternalFields || !entry[0].includes(internalFieldKey)
      })
      .sort(entrySortFunc)
      .map((entry: any) => {
      const [key, val] = entry

      let value = val
      if(key == `${internalFieldKey}time`) {
        value = new Date(val).toISOString()
      }
      return (<Code className="prevent-select" style={{"background": hashStringDarkToColor(key.replace(internalFieldKey, "@"), value), "margin": "0 0.25rem", "marginBottom": "0.2rem"}}>◆ {key.replace(internalFieldKey, "@")}: {truncateStringPastLength(value.toString(), 24)} </Code>)
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
      <Box style={{"cursor": "pointer"}} onClick={(_) => setShow(!show)} >
      
        <Code style={{"color": color}} fontSize={"0.8rem"} fontWeight={900}>{tag}</Code> {show ? "▼" : "▶"} {logMessage}
      </Box>

      <Collapsible.Content>
        <Box className="expandedLogContent" style={{"marginTop": ".8rem"}}>
          <DataListRoot orientation="horizontal" gap={1} >
            {Object.entries(props.log).sort(entrySortFunc).map(([key, value]) => (
              <DataListItem className="prevent-select" style={{"cursor": "text"}} onClick={(e) => {
                e.preventDefault()
              }} key={key} label={ <Code onClick={() => {
                toaster.create({
                  title: "🔗 Copied to Clipboard",
                  description: `Copied 🔑 KEY VALUE ${key.replace(internalFieldKey, "@")} to clipboard`,
                  duration: 2500
                })
                window.navigator.clipboard.writeText(key)
              }} style={{"background": hashStringDarkToColor(key, value as string), "width": "100%", "padding":"0.3rem"
              }}>{key.replace(internalFieldKey, "@")} </Code>} value={<Code onClick={() => {
                const val = typeof value === 'string' ? value : JSON.stringify(value)
                toaster.create({
                  title: "🔗 Copied to Clipboard",
                  description: `Copied 📋 VALUE from ${key.replace(internalFieldKey, "@")} to clipboard`,
                  duration: 2500
                })
                window.navigator.clipboard.writeText(val)
              }} style={{"padding": "0.3rem", "width": "90%"}}> {typeof value === 'string' ? value : JSON.stringify(value)} </Code>} />
            ))}
          </DataListRoot>
        </Box>
      </Collapsible.Content>
    </Collapsible.Root>
  </Box>;
})
