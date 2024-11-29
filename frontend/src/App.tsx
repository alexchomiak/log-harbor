import { useEffect, useState } from "react";
import "./App.css";
import { Box, Button, Flex } from "@chakra-ui/react";
import { ContainerView } from "./components/ContainerView";
import useStateRef from "react-usestateref";
function App() {
  const [containers, setContainers] = useState([] as any);
  const [_, setIndex, indexRef] = useStateRef(-1);
  const [container, setContainer, containerRef] = useStateRef<any | null>(null);

  useEffect(() => {
    if (JSON.stringify(containers) == "[]") {
      fetch("/api/container/list").then(async (res) => {
        const containers = await res.json()
        setContainers([...containers]);
      });
    }

    const handler = (e: any) => {
      console.log(indexRef.current, containerRef.current)

      if (e.shiftKey && e.key == "ArrowDown" && containerRef.current != null) {
        if (indexRef.current < containers.length - 1) {
          setContainer(() => {

            return containers[indexRef.current + 1]
          })
          setIndex(indexRef.current + 1)

          e.preventDefault()
        }
      }
      if (e.shiftKey && e.key == "ArrowUp" && containerRef.current != null) {
        if (indexRef.current > 0) {
          setContainer(() => {

            return containers[indexRef.current - 1]
          })
          setIndex(indexRef.current - 1)

          e.preventDefault()
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => {
      window.removeEventListener("keydown", handler)
    }
  }, [containers]);

  return (
    <Flex direction="column" minH={"100vh"} maxH={"100vh"}>
      {/* Main Content Wrapper */}
      <Flex className="container" flex="1" overflow={"auto"}>
        {/* Sidebar */}
        <Box
          className="sidebar"
          w={{ base: "250px" }} // Full width on small screens, 250px on medium and above
          p={4}
        >
          <Box className="sidebarInfo">

          <Box className="logo" width={"100%"} style={{ margin: "0 auto" }}>
            <img draggable={false} src={"/docker.png"} alt="Logo" style={{ "width": "7rem", "margin": "0 auto" }} />
            <h1 style={{ margin: "0rem auto", marginTop: "-1rem", "textAlign": "center", "width": "100%", "fontSize": "1.8rem", "fontWeight": "700", "fontFamily": "Brush Script MT, cursive", "color": "#e817da" }}>Log Harbor</h1>
          </Box>
          <h1 style={{ margin: "1rem auto", "width": "100%", "textAlign": "center", fontWeight: "700" }} color={"white.500"}>💨 Running Containers</h1>
          </Box>

          <div className="containerList">
            {containers.map((c: any, idx: number) => {
              return (
                <Box style={{ "margin": "0.2rem" }}>
                  <Button disabled={idx == indexRef.current} style={{ "width": "100%" }} colorPalette={"purple"} onClick={() => {
                    setContainer(c)
                    setIndex(idx)
                  }}>
                    {c.Name}
                  </Button>
                </Box>

              );
            })}
          </div>



        </Box>

        {/* Main Content Area */}
        <Box flex="1" p={4} className="content"          >
          {container != null && (
            <ContainerView container={container} />
          )}
        </Box>
      </Flex>

      {/* Footer */}
      <Box className="footer" color="white" textAlign="center"  >
        <Flex gap={6} justify={"center"}>
          {/* @ts-expect-error casting to link */}
          <Button size={"sm"} variant={"ghost"} as={"a"} href="https://github.com/alexchomiak" target="_blank">🐣 Created by Alex Chomiak</Button>
          {/* @ts-expect-error casting to link */}
          <Button size={"sm"} variant={"ghost"} as={"a"} href="https://buymeacoffee.com/alexchomiak" target="_blank">☕️ Buy me a Coffee</Button>
        </Flex>

      </Box>
    </Flex>

  );
}

export default App;
