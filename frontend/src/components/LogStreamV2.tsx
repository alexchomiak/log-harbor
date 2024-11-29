import { memo, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { LogLine } from "./LogLine";
import { Box } from "@chakra-ui/react";
import alasql from "alasql";
interface LogStreamProps {
  container: any;
  windowSize?: number;
  filterType: "text" | "sql";
  filterExpression: string
  buffer: any
  setBuffer: (any: any) => void
  bufferRef: any
}


export const internalFieldKey = "ui_internal_field_"

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
   
    if(escapeQueue.length == 0 && char == "@") {
      let j = i + 1
      let field = ""
      while(j < str.length && str[j] != " " && str[j] != "\n") {
        field += str[j]
        j++
      }

      if(field == "stream") {
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
  const { container } = props;
  const containerId = container.Id;
  const {buffer, setBuffer, bufferRef} = props
  const ref = bufferRef
  

  const host = import.meta.env.MODE == "development" ? "localhost:3000" : window.location.host
  const socketUrl = `ws://${host}/ws/logs/` + containerId;
  console.log(socketUrl)

  const { sendMessage, readyState } = useWebSocket(socketUrl, {
    onClose: () => {
    },
    onMessage: (m) => {
      setBuffer(() => {
        let fields = {}
        try {
          fields = JSON.parse(m.data)
        } catch (e) {}

        const logKey = `${internalFieldKey}log`
        const ingestionKey = `${internalFieldKey}ingestionTime`
        const containerFields: any = {
          [`${internalFieldKey}containerId`]: containerId,
          [`${internalFieldKey}containerName`]: container.Name,
          [`${internalFieldKey}containerImage`]: container.Config.Image,
        }
        
        const buf = [...ref.current, { [logKey]: m.data, [ingestionKey]: new Date(), ...containerFields, ...fields }];
        return buf
      });
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (readyState == 1) {
        sendMessage(JSON.stringify({ interval: 5 }));
      } 
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [readyState]);


 
  let queriedBuffer = buffer 

  if(props.filterType == "sql") {
    try {
      console.log(extractInternalFieldsFromQueryString(props.filterExpression))
      const res = alasql(extractInternalFieldsFromQueryString(props.filterExpression), [buffer])
      console.log(res)
      queriedBuffer = res
    } catch (e) {
      console.warn(e)
    }
  } else if (props.filterType == "text") {
    queriedBuffer = buffer.filter((m: any) => m[`${internalFieldKey}log`].includes(props.filterExpression))
  }

  return (
    <Box>
      {queriedBuffer.map((log: any, index: number) => (
        <LogLine key={index} log={log} container={container} />
      ))}
    </Box>
  );
})
