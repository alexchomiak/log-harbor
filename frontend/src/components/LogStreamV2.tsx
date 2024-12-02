import { memo, useEffect, useMemo, useRef, useState } from "react";
import { LogLine } from "./LogLine";
import { Box, Button, Float, Spinner } from "@chakra-ui/react";
import alasql from "alasql";
import { internalFieldKey } from "./provider/ContainerLogProvider";
import { toaster } from "./ui/toaster";
interface LogStreamProps {
  filterType: "text" | "sql";
  filterExpression: string
  buffer: any
}
import { VList } from "virtua";



function extractInternalFieldsFromQueryString(str: string) {
  // Using a for loop
  const escapeQueue: string[] = []

  const escapeCharacters = ["'", "\"", "%"]
  const tokens: string[] = []
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    escapeCharacters.forEach((escapeChar) => {
      if (char == escapeChar && (escapeQueue.length == 0 || escapeQueue[escapeQueue.length - 1] != escapeChar)) {
        escapeQueue.push(char)
      }
      else if (char == escapeChar && escapeQueue.length > 0 && escapeQueue[escapeQueue.length - 1] == escapeChar) {
        escapeQueue.pop()
      }
    })

    if (escapeQueue.length == 0 && char == "@") {
      let j = i + 1
      let field = ""
      while (j < str.length && str[j] != " " && str[j] != "\n") {
        field += str[j]
        j++
      }

      if (field == "stream") {
        tokens.push("?")
      } else {
        tokens.push(internalFieldKey + field)
      }

      i = j - 1
    }
    else {
      tokens.push(char)
    }

  }
  return tokens.join("")
}

let lastScroll = 0
let positiveInARow = 0
export const LogStreamV2 = memo(function LogStreamV2Comp(props: LogStreamProps) {

  const buffer = props.buffer.sort((a: any, b: any) => {
    return a[internalFieldKey + "time"] > b[internalFieldKey + "time"] ? 1 : -1
  })
  const tailRef = useRef<any>(null);
  const boxRef = useRef<any>(null);
  const parentRef = useRef<any>(null);
  const scrollRef = useRef<any>(null);
  const pctRef = useRef<any>(null)
  const [tailLogs, setTailLogs ] = useState(false)

  const updateScrollBarPosition = () => {
    const pct = boxRef.current.scrollSize < boxRef.current.viewportSize ? 100 :
    ((boxRef.current.scrollOffset) / (boxRef.current.scrollSize - boxRef.current.viewportSize))
    
    if(isNaN(pct)) {
      scrollRef.current.style.top = `-100rem`

    } else {
      scrollRef.current.style.top = `${pct * (boxRef.current.viewportSize - 50)}px`
    }
    pctRef.current.innerHTML = `${(pct * 100).toFixed(2)}%`
  }

  let queriedBuffer = buffer
  useEffect(() => {

    if(tailLogs) {
      boxRef.current.scrollToIndex(boxRef.current.scrollSize, {smooth: false} )
    }
    updateScrollBarPosition()
  }, [buffer])

  if (props.filterType == "sql" && props.filterExpression.length > 0) {
    try {
      console.log(extractInternalFieldsFromQueryString(props.filterExpression))
      const res = alasql(extractInternalFieldsFromQueryString(props.filterExpression), [buffer])
      queriedBuffer = res
    } catch (e) {
      if(props.filterExpression != null && props.filterExpression.length > 0) {
        toaster.create({
          title: "⚠️ Failure Querying Logs",
          description: (e as Error).message,
          duration: 2500
        })
      }
    }
  } else if (props.filterType == "text") {
    queriedBuffer = buffer.filter((m: any) => m[`${internalFieldKey}log`].includes(props.filterExpression))
  }

  const logLines = useMemo(() => {
    return queriedBuffer.map((log: any, index: number) => (
      <LogLine key={index} index={index} log={log} />
    ));
  }, [queriedBuffer])

  return (
    <div>
      <div style={{ "position": "absolute", "width": !tailLogs ? "50%" : "0px","opacity":  !tailLogs ? "1" : "0" ,bottom: "1rem", "transition": "all ease-in-out 500ms","transform": "translate(-50%,0%)", "left": "50%", "zIndex": "100" }}>
        <Button onClick={() => {
          let smooth = false
          if(boxRef.current.scrollSize - boxRef.current.scrollOffset - boxRef.current.viewportSize < 5 * boxRef.current.viewportSize) {
            smooth = true
          }
          boxRef.current.scrollToIndex(boxRef.current.scrollSize, {smooth} )
          setTailLogs(true)
          lastScroll = boxRef.current.scrollSize
        }} colorPalette={"purple"} variant={"surface"}  width={"100%"}>⬇️ Tail logs</Button>
      </div>
      {buffer.length == 0 && <Float style={{width: "15rem"}} placement={"middle-center"}>
        <Box style={{ "textAlign": "center", width: "15rem" }}><Spinner/></Box>
        </Float>}

      <div className="logStreamV2" ref={parentRef}>

        <VList className="logStreamList" ref={boxRef} onScrollEnd={() => {
          scrollRef.current.style.opacity = "0.25"
          updateScrollBarPosition()
        }} onScroll={(_) => {
          if(tailLogs && lastScroll - boxRef.current.scrollOffset > 0) {
            positiveInARow += 1
            // setTailLogs(false)
          } else {
            positiveInARow = 0
          }
          scrollRef.current.style.opacity = "0.9"
          updateScrollBarPosition()
          // * Really hacky way to detect if the user has scrolled up
          // * Since we cannot differentiate between user scroll and programmatic scroll
          if(positiveInARow > 2) {
            setTailLogs(false)
          }
          
          lastScroll = boxRef.current.scrollOffset
        }}>
          {logLines}
          </VList>
        
        <div className="scrollContainer" ref={scrollRef}>
          <div className="text" ref={pctRef}></div>
        </div>
        <div ref={tailRef} />
      </div>
    </div>

  );
})
