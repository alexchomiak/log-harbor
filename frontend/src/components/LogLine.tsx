import { useState, memo, useMemo} from "react";
import { internalFieldKey } from "./provider/ContainerLogProvider";
import { hashStringDarkToColor } from "@/util/color";
import { truncateStringPastLength } from "@/util/truncate";

export const LogLine = memo(function LogLine(props: { log: any, index: number }) {
  const [show, setShow] = useState(false);
  const color = props.log[`${internalFieldKey}containerColor`]
  let tag = "🏷️ " + props.log[`${internalFieldKey}containerName`]
  let filterInternalFields = true 
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

  const displayFields = useMemo(() => {
    return Object.entries(props.log).sort(entrySortFunc)
  }, [props.log])

  
  let logMessage = props.log[`${internalFieldKey}log`]
  if(logMessage == undefined) {
    tag = "🔎 Filter Result"
    filterInternalFields = false
  }
  if(props.log[`${internalFieldKey}json`] == true || logMessage == undefined) {
    
    logMessage = <div style={{"display": "inline"}}> {displayFields
      .filter(entry => {
        if(entry[0] == `${internalFieldKey}time`) return true
        return !filterInternalFields || !entry[0].includes(internalFieldKey)
      })
      .map((entry: any) => {
      const [key, val] = entry

      let value = val
      if(key == `${internalFieldKey}time`) {
        value = new Date(val).toISOString()
      }
      if(value == undefined) {
        value = "undefined"
      }
      return (<p className="logLine-fieldTag prevent-select" style={{"background": hashStringDarkToColor(key.replace(internalFieldKey, "@"), value), "margin": "0 0.25rem", "marginBottom": "0.2rem"}}>◆ {key.replace(internalFieldKey, "@")}: {truncateStringPastLength(value.toString(), 24)} </p>)
    })} </div>
  }

  return <div className={show ? "logLine expandedLogLine" : "logLine"} >
    <div className="logLine-main" onClick={() => setShow(!show)}>
    <p  style={{color}} className="logLine-tag"> {tag} </p>  {show ? "▼" : "▶" } {logMessage}
    </div>
    {show && <div className="expandedLogContent">
      {displayFields.map(([key, value]) => (
        <div className="expandedLogField" key={key}>
            <div style={{"background": hashStringDarkToColor(key.replace(internalFieldKey, "@"), value as string)}} className="expandedLogFieldKey"> 
              {key.replace(internalFieldKey, "@")}:
            </div> 
            
            <div className="expandedLogFieldValue" onClick={(e) => {
              console.log(e.nativeEvent.target)
              if(window.getSelection()) {
                const range = document.createRange()
                range.selectNode(e.target as Node)
                window.getSelection()?.removeAllRanges()
                window.getSelection()?.addRange(range)
              }
            }}> 
              {typeof value == "object" || typeof value == "string" ? value as any : (value as any).toString()} 
            </div>
        </div>
      ))}
      </div>}
  </div>

})
