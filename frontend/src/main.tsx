import 'ace-builds/src-noconflict/ace';

import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-dracula";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster"
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        <Toaster />
        <App />
      </ThemeProvider>
    </ChakraProvider>
  </StrictMode>,
);
