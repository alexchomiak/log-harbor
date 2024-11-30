import { Badge, Box, Button, Code, Flex, Float, Tabs } from "@chakra-ui/react";
import { LogStreamV2 } from "./LogStreamV2";
import "./LogStreamV2.css";
import AceEditor from "react-ace"
import { useEffect, useRef, useState } from "react";
import useStateRef from "react-usestateref";
import { LogProvider } from "./provider/LogProvider";
import { containerLogProvider } from "./provider/ContainerLogProvider";
import { getContainerWorker } from "./provider/WorkerProvider";

interface StreamViewProps {
    containers: any[];
}


export function StreamView(props: StreamViewProps) {
    const { containers } = props;


    const [filterOpen, setFilterOpen] = useState(false)
    const [filterType, setFilterType] = useState<"text" | "sql">("text")
    const [filterExpression, setFilterExpression] = useState("")
    const [editorText, setEditorText] = useState("")
    const editorRef = useRef<any>(null)

    useEffect(() => {
        if (editorText.length == 0) {
            setFilterExpression("")
        }
    }, [editorText])

    const [buffer, setBuffer, ref] = useStateRef<any>({
        [containers[0].Id]: []
    });

    const worker = getContainerWorker()
    useEffect(() => {
        const providers = containers.map((container) => {
            return containerLogProvider(container)
        });

        const newBuf: any = {}
        containers.forEach((container) => {
            newBuf[container.Id] = []
        })
        setBuffer({
            ...newBuf
        })
       
        return () => {
            providers.forEach((provider: LogProvider) => {
                provider.cleanup()
            })
            
        }
    }, [containers])

    useEffect(() => {
        worker.onmessage = (e: any) => {
            const data = e.data;
            const event = JSON.parse(data);
            if(event.type == "update") {
                const { buffer, id } = event
                setBuffer({
                    ...ref.current,
                    [id]: buffer
                })
            }
        }
        return () => {
            worker.onmessage = () => {}
        }
    }, [])

    useEffect(() => {
        const handler = (e: any) => {
            if(e.key == "Enter" && !filterOpen) {
                e.preventDefault()
                setFilterOpen(true)
                if(editorRef.current) {
                    editorRef.current.editor.focus()
                }
            }
            else if(e.key == "Escape" && !e.shiftKey && filterOpen) {
                e.preventDefault()
                setFilterOpen(false)
            }
        }
        window.addEventListener("keydown", handler)
        return () => {
            window.removeEventListener("keydown", handler)
        }
    }, [filterOpen])


    return <div><Box height={"100%"}  >
        <Box className="containerInfo" position={"relative"}>
            <Flex gap={5} justify={"flex-start"} height={"3rem"}>
            {containers.length == 1 && <>

                <Flex direction={"column"} justify={"center"} height={"100%"}>
                    <Code style={{"color": containers[0].color}} fontSize={"1rem"} fontWeight={900}> 🏷️ {containers[0].Name}</Code>
                </Flex>
                <Flex direction={"column"} justify={"center"} height={"100%"}>
                    <Code colorPalette={"purple"} fontSize={"1rem"} fontWeight={500}>🌠 {containers[0].Config.Image}</Code>
                </Flex>
                </>
            } 
            {containers.length > 1 && <>
                <Flex direction={"column"} justify={"center"} height={"100%"}>
                    <Code colorPalette={"purple"} fontSize={"1rem"} fontWeight={500}>🔦 Multi-Container Stream</Code>
                </Flex>
            </>}
            </Flex>
            <div
                className="filterEditor"
                style={{ "opacity": filterOpen ? 1 : 0, transform: filterOpen ? undefined : "translateY(-20rem) translateX(20rem) scale(0.0)", "zIndex": filterOpen ? 100 : -1 }}

                onKeyDownCapture={(e) => {
                    if (e.key == "Escape" && e.shiftKey) {
                        setFilterExpression("")
                        setEditorText("")
                        e.preventDefault()
                    }
                    if (e.shiftKey && e.key == "Enter") {
                        e.preventDefault()
                        setFilterExpression(editorText)
                    }

                    if (e.shiftKey && e.key == "ArrowRight") {
                        e.preventDefault()
                        setFilterType("sql")
                    }

                    if (e.shiftKey && e.key == "ArrowLeft") {
                        e.preventDefault()
                        setFilterType("text")
                    }

                    

                    if (e.shiftKey && e.key == "Delete") {
                        e.preventDefault()
                        setFilterExpression("")
                        setEditorText("")
                    }
                    if (e.key == "Enter" && filterType == "text") {
                        e.preventDefault()
                    }
                }}
            >
                <Tabs.Root fitted defaultValue="text" onValueChange={(e) => {
                    setFilterType(e.value as "sql" | "text")
                    setEditorText("")
                }} value={filterType}>
                    <Tabs.List>
                        <Tabs.Trigger value="text">
                            📄 Text Filter
                        </Tabs.Trigger>
                        <Tabs.Trigger value="sql">
                            💾 SQL
                        </Tabs.Trigger>
                        <Button colorPalette={"orange"} onClick={() => {
                            setFilterExpression("")
                            setEditorText("")
                        }}>
                            💣 Clear Filter (Shift + Esc)
                        </Button>
                    </Tabs.List>

                </Tabs.Root>
                <AceEditor
                    ref={editorRef}
                    mode={filterType == "sql" ? "sql" : "text"}
                    theme="dracula"
                    width="40rem"
                    height="30rem"
                    fontSize={18}
                    onChange={(e) => {
                        setEditorText(e)
                    }}
                    placeholder={filterType == "sql" ? "SELECT * FROM @stream WHERE @log LIKE '%error%'" : "Filter Text"}
                    value={editorText}
                />
                <div style={{ zIndex: 100, position: "absolute", "right": "0.5rem", "bottom": "1rem" }}>
                    <Flex gap={2}>
                        <Badge colorPalette={"yellow"} style={{ "padding": "0.5rem 1rem", "transition": "all 0.2s ease-in-out", "opacity": filterType == "sql" ? 1 : 0 }}>ℹ️ Query JSON Fields or text data using "@log" field</Badge>
                        <Badge colorPalette={"blue"} style={{ "padding": "0.5rem 1rem" }}>📩 Press Shift + Enter to Apply Filter</Badge>

                    </Flex>
                </div>
            </div>
            <Float placement={"middle-end"} offsetX="5rem">

                <Box style={{ "width": "10rem", "padding": "1rem" }}>
                    <Flex gap={4} justifyContent={"flex-end"}>

                        <Button style={{ "transition": "all 0.2s ease-in-out", "width": filterOpen ? "10rem" : "15rem" }} colorPalette={!filterOpen ? "purple" : "red"} onClick={() => {
                            if (!filterOpen && editorRef.current) {
                                editorRef.current.editor.focus()
                            }
                            setFilterOpen(!filterOpen)
                        }}> {!filterOpen ? "📁 Filter Logs (Enter)" : "🅧 Close (Esc)"} </Button>
                    </Flex>
                </Box>
            </Float>

        </Box>

        <Box position={"relative"} style={{"overflow": "hidden"}}>
            <LogStreamV2 buffer={buffer}  filterExpression={filterExpression} filterType={filterType}/>
        </Box>
    </Box>
    </div>
}