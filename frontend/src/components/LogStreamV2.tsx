import { memo, useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { LogLine } from "./LogLine";
import { Box, Button, Float, Spinner, Text } from "@chakra-ui/react";
import alasql from "alasql";
import { internalFieldKey } from "./provider/ContainerLogProvider";
import useStateRef from "react-usestateref";
import { toaster } from "./ui/toaster";
interface LogStreamProps {
  windowSize?: number;
  filterType: "text" | "sql";
  filterExpression: string
  buffer: any
  setBuffer: (any: any) => void
  bufferRef: any
}
import { VList } from "virtua";


const VIEW_BUFFER = 256


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

export const LogStreamV2 = memo(function LogStreamV2Comp(props: LogStreamProps) {

  const { buffer } = props
  const tailRef = useRef<any>(null);
  const boxRef = useRef<any>(null);
  const [showTailPrompt, setShowTailPrompt, tailPromptRef] = useStateRef(true)
  const [scrolling, setScrolling] = useState(false)

  let queriedBuffer = buffer
  useEffect(() => {
    if(!showTailPrompt && !scrolling) {
      boxRef.current.scrollToIndex(boxRef.current.scrollSize, {smooth: false} )
    }
    const scrollEventHandler = () => {
      // console.log(boxRef.current.scrollHeight, boxRef.current.scrollTop + boxRef.current.clientHeight)
      if (tailPromptRef.current != null && tailPromptRef.current == false && boxRef.current.scrollHeight != boxRef.current.scrollTop + boxRef.current.clientHeight) {
        setShowTailPrompt(true)
      }

      if (tailPromptRef.current != null && tailPromptRef.current == true && boxRef.current.scrollHeight - 10 <= boxRef.current.scrollTop + boxRef.current.clientHeight) {
        setShowTailPrompt(false)
      }
    }
   
  }, [buffer])

  if (props.filterType == "sql") {
    try {
      console.log(extractInternalFieldsFromQueryString(props.filterExpression))
      const res = alasql(extractInternalFieldsFromQueryString(props.filterExpression), [buffer])
      queriedBuffer = res
    } catch (e) {
      if(props.filterExpression != null && props.filterExpression.length > 0) {
        toaster.create({
          title: "⚠️ Failure Querying Logs",
          description: e.message,
          duration: 2500
        })
      }
    }
  } else if (props.filterType == "text") {
    queriedBuffer = buffer.filter((m: any) => m[`${internalFieldKey}log`].includes(props.filterExpression))
  }


  return (
    <div>
      <div style={{ "position": "absolute", "width": showTailPrompt ? "90%" : "0px","opacity":  showTailPrompt ? "1" : "0" ,bottom: "1rem", "transition": "all ease-in-out 500ms","transform": "translate(-50%,0%)", "left": "50%", "zIndex": "100" }}>
        <Button onClick={() => {
          let smooth = false
          if(boxRef.current.scrollSize - boxRef.current.scrollOffset - boxRef.current.viewportSize < 5 * boxRef.current.viewportSize) {
            smooth = true
          }
          console.log(boxRef.current.scrollToIndex(boxRef.current.scrollSize, {smooth} ))

        }} colorPalette={"purple"} variant={"surface"}  width={"100%"}>⬇️ Tail logs</Button>
      </div>
      {buffer.length == 0 && <Float style={{width: "15rem"}} placement={"middle-center"}>
        <Box style={{ "textAlign": "center", width: "15rem" }}><Spinner/></Box>
        </Float>}

      <div className="logStreamV2">

        <VList ref={boxRef} onScrollEnd={(e) => {
          if(boxRef.current.scrollSize - boxRef.current.scrollOffset - boxRef.current.viewportSize < 10) {
            setShowTailPrompt(false)
          } else {
            setShowTailPrompt(true)
          }
          setScrolling(false)
        }} onScroll={(e) => {
          setScrolling(true)
        }}>
        {queriedBuffer.slice(-VIEW_BUFFER).map((log: any, index: number) => (
          <LogLine key={index} log={log} />
        ))}
          </VList>
        
        <div ref={tailRef} />
      </div>
    </div>

  );
})
