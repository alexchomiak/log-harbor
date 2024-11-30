import { useEffect } from "react";
import "./App.css";
import { Box, Button, Code, Flex, Float, Separator } from "@chakra-ui/react";
import { StreamView } from "./components/StreamView";
import { hashStringToColor } from "./util/color";
import useStateRef from "react-usestateref";
function App() {
  const [containers, setContainers, containersRef] = useStateRef([] as any);

  const [selectedContainers, setSelectedContainers, selectedContainersRef] = useStateRef([] as any);

  useEffect(() => {
    if (JSON.stringify(containers) == "[]") {
      fetch("/api/container/list").then(async (res) => {
        const containers = await res.json()
        const mapped = containers.map((c: any, idx: number) => {
          return { ...c, idx, color: hashStringToColor(c.Id) }
        })
        setContainers([...mapped]);
      });
    }

    const handler = (e: any) => {
      if(selectedContainersRef.current.length > 1 || selectedContainersRef.current.length == 0) return;
      const container = selectedContainersRef.current[0]
      const containerIdx = containersRef.current.findIndex((c: any) => c.Id == container.Id)


      if (e.shiftKey && e.key == "ArrowDown") {
        
        if (containerIdx < containers.length - 1) {
          setSelectedContainers([containersRef.current[containerIdx + 1]])
          e.preventDefault()
        }
      }
      else if (e.shiftKey && e.key == "ArrowUp") {
        if (containerIdx > 0) {
          setSelectedContainers([containersRef.current[containerIdx - 1]])
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
            
            <h1 style={{ margin: "1rem auto", "width": "100%", "textAlign": "center", fontWeight: "700" }} color={"white.500"}>🐳 Running Containers</h1>

          </Box>
          <Separator />
          <div className="containerList">
            {containers.map((c: any) => {
              return (
                <Box style={{ "margin": "0.2rem" }}>
                  <Button className="prevent-select" variant={selectedContainers.includes(c) ? "subtle": "solid"}  style={{ "width": "100%", "textWrap": "wrap", "wordBreak": "break-all"}} colorPalette={"purple"} onClick={() => {
                    if(!selectedContainers.includes(c))
                      setSelectedContainers([...selectedContainers, c])
                    else {
                      setSelectedContainers(selectedContainers.filter((sc: any) => sc != c))
                    }
                  }}>
                    <Code style={{"color": c.color}}>
                    🏷️ {c.Name}

                    </Code>
                  </Button>
                </Box>

              );
            })}
          </div>



        </Box>

        {/* Main Content Area */}
        <Box flex="1" p={4} className="content"  style={{"position": "relative"}}    >
          {selectedContainers.length > 0 && (
            <StreamView containers={selectedContainers} />
          )}
          {selectedContainers.length == 0 && (
            <Float placement="middle-center" style={{width: "100%"}}>
                🙏 Select a Container to monitor & analyze logs
            </Float>
            )}
        </Box>
      </Flex>

      {/* Footer */}
      <Box className="footer" color="white" textAlign="center"  >
        <Flex gap={6} justify={"center"}>
          {/* @ts-expect-error casting to link */}
          <Button size={"sm"} variant={"ghost"} as={"a"} href="https://github.com/alexchomiak" target="_blank">🐣 Created by Alex Chomiak</Button>
          {!window.location.host.toLowerCase().includes("amazon") && <>
              {/* @ts-expect-error casting to link */}
              <Button size={"sm"} variant={"ghost"} as={"a"} href="https://buymeacoffee.com/alexchomiak" target="_blank">☕️ Buy me a Coffee</Button>
          </>}
      
        </Flex>

      </Box>
    </Flex>

  );
}

export default App;
