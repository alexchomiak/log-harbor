import { memo, useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";
import { LogLine } from "./LogLine";
import { Box, Button, Float } from "@chakra-ui/react";
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

const VIEW_BUFFER = 128


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
  const [showTailPrompt, setShowTailPrompt, tailPromptRef] = useStateRef(false)

  let queriedBuffer = buffer
  useEffect(() => {
    if(!showTailPrompt) {
      tailRef.current.scrollIntoView();
    }
    const scrollEventHandler = () => {
      console.log(boxRef.current.scrollHeight, boxRef.current.scrollTop + boxRef.current.clientHeight)
      if (tailPromptRef.current != null && tailPromptRef.current == false && boxRef.current.scrollHeight != boxRef.current.scrollTop + boxRef.current.clientHeight) {
        setShowTailPrompt(true)
      }

      if (tailPromptRef.current != null && tailPromptRef.current == true && boxRef.current.scrollHeight - 10 <= boxRef.current.scrollTop + boxRef.current.clientHeight) {
        setShowTailPrompt(false)
      }
    }
    boxRef.current.addEventListener("scroll", scrollEventHandler);
    return () => {
      boxRef.current.removeEventListener("scroll", scrollEventHandler);
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
      <div style={{ "position": "absolute", "opacity":  showTailPrompt ? "1" : "0" ,bottom: "1rem", "transition": "opacity ease-in-out 250ms","transform": "translate(-50%,0%)", "left": "50%", "width": "90%" }}>
        <Button onClick={() => {
          tailRef.current.scrollIntoView({ behavior: "smooth" });

        }} colorPalette={"purple"} variant={"surface"}  width={"100%"}>⬇️ Tail logs</Button>
      </div>
      
      <div className="logStreamV2" ref={boxRef}>

        {queriedBuffer.slice(-VIEW_BUFFER).map((log: any, index: number) => (
          <LogLine key={index} log={log} />
        ))}
        <div ref={tailRef} />
      </div>
    </div>

  );
})
