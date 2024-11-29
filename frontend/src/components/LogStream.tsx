import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { useXTerm, UseXTermProps } from "react-xtermjs";
import { FitAddon } from "xterm-addon-fit";

const xtermProps: UseXTermProps = {
  options: {
    cursorBlink: true,
    cursorStyle: "block",
    fontSize: 12,
    fontFamily: "monospace",
    lineHeight: 1.1,
    disableStdin: true,
  },
};
interface LogStreamProps {
  containerId: string;
}

export function LogStream(props: LogStreamProps) {
  const { containerId } = props;
  const { instance, ref } = useXTerm(xtermProps);
  const [message, setMessage] = useState({});

  useEffect(() => {
    instance?.clear();
  }, [containerId]);

  const socketUrl = "ws://ws/logs/" + containerId;
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    socketUrl,
    {
      onClose: () => {},
    },
  );

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

  useEffect(() => {
    if (instance) {
      instance.loadAddon(fitAddon); // Load the fit addon
      fitAddon.fit(); // Initial fit to the container
      instance?.onKey((ev) => {
        ev.domEvent.stopPropagation();
        ev.domEvent.preventDefault();
        if (ev.domEvent.key == "Enter") {
          instance.write("\r\n");
        } else if (ev.domEvent.key == "Backspace") {
          instance.write("\b \b");
        } else {
          instance.write(ev.key);
        }
      });
    }
  }, [instance]);

  // Handle dynamic resizing
  const fitAddon = new FitAddon();
  useEffect(() => {
    const handleResize = () => {
      if (instance) {
        fitAddon.fit(); // Adjust terminal size
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [instance]);

  useEffect(() => {
    if (lastMessage !== null && lastMessage !== message) {
      instance?.write(lastMessage.data.replace("\n", "\r\n"));
      setMessage(lastMessage);
    }
  }, [lastMessage]);
  instance?.onData((data) => instance?.write(data));
  return (
    <div
      className="term"
      ref={ref}
      style={{
        width: "100%",
        height: "25rem",
        textAlign: "left",
      }}
    />
  );
}
