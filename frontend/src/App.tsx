import { useEffect, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Code,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { FolderOpen, MessageSquareText, Quote, ScanSearch } from "lucide-react";
import { getHealth } from "./api";
import { AnalyzerPanel } from "./components/AnalyzerPanel";
import { EvidencePanel } from "./components/EvidencePanel";
import { ExampleCards } from "./components/ExampleCards";
import { Header } from "./components/Header";
import { ResponsePanel } from "./components/ResponsePanel";
import { ScopeForm } from "./components/ScopeForm";
import type { Sample } from "./samples";
import { usePersistentState } from "./storage";
import { emptyProject, type Analysis, type Health, type Project, type Replies } from "./types";

const tabProps = {
  flex: { base: 1, md: "initial" },
  flexDirection: { base: "column", md: "row" },
  gap: { base: 1, md: 2 },
  fontSize: { base: "xs", md: "md" },
  minH: "52px",
  py: { base: 2, md: 3 },
  px: { base: 1, md: 4 },
  borderBottomWidth: { base: 0, md: "2px" },
} as const;

export default function App() {
  const [project, setProject] = usePersistentState<Project>("sg.project", emptyProject);
  const [request, setRequest] = usePersistentState("sg.request", "");
  const [analysis, setAnalysis] = usePersistentState<Analysis | null>("sg.analysis", null);
  const [replies, setReplies] = usePersistentState<Replies>("sg.replies", {});
  const [model, setModel] = usePersistentState("sg.model", "");
  const [health, setHealth] = useState<Health | null>(null);
  const [tab, setTab] = useState(0);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const poll = () =>
      getHealth()
        .then((h) => alive && setHealth(h))
        .catch(() => alive && setHealth(null));
    poll();
    const id = setInterval(poll, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const effectiveModel = model || health?.default_model || "";

  const loadSample = (s: Sample) => {
    setProject(s.project);
    setRequest(s.request);
    setAnalysis(null);
    setReplies({});
    setLoadedId(s.id);
    setTab(1);
  };

  const onAnalysis = (a: Analysis) => {
    setAnalysis(a);
    setReplies({});
  };

  const missingModel = health?.ollama && !health.default_installed && !model;

  return (
    <Box minH="100vh">
      <Header health={health} model={effectiveModel} onModel={setModel} />

      <Container maxW="6xl" px={{ base: 3, md: 6 }} pt={{ base: 4, md: 8 }} pb={{ base: "calc(88px + env(safe-area-inset-bottom))", md: 8 }}>
        {health && !health.ollama && (
          <Alert status="warning" mb={5} borderRadius="sm">
            <AlertIcon />
            <AlertDescription>
              Ollama is not responding. Start it with <Code>ollama serve</Code> to run analyses.
            </AlertDescription>
          </Alert>
        )}
        {!health && (
          <Alert status="warning" mb={5} borderRadius="sm">
            <AlertIcon />
            <AlertDescription>
              Cannot reach the backend. Start it with{" "}
              <Code>uvicorn app.main:app --port 8000</Code>.
            </AlertDescription>
          </Alert>
        )}
        {missingModel && (
          <Alert status="warning" mb={5} borderRadius="sm">
            <AlertIcon />
            <AlertDescription>
              Model <Code>{health?.default_model}</Code> is not installed. Run{" "}
              <Code>ollama pull {health?.default_model}</Code>.
            </AlertDescription>
          </Alert>
        )}

        <ExampleCards loadedId={loadedId} onLoad={loadSample} />

        <Tabs index={tab} onChange={setTab} isLazy={false}>
          <TabList
            position={{ base: "fixed", md: "static" }}
            bottom={{ base: 0, md: "auto" }}
            left={{ base: 0, md: "auto" }}
            right={{ base: 0, md: "auto" }}
            zIndex={10}
            bg={{ base: "white", md: "transparent" }}
            pb={{ base: "env(safe-area-inset-bottom)", md: 0 }}
          >
            <Tab {...tabProps}>
              <FolderOpen size={18} /> Scope
            </Tab>
            <Tab {...tabProps}>
              <ScanSearch size={18} /> Request
            </Tab>
            <Tab {...tabProps}>
              <Quote size={18} /> Evidence
            </Tab>
            <Tab {...tabProps}>
              <MessageSquareText size={18} /> Reply
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0} pt={5}>
              <ScopeForm project={project} onChange={setProject} onNext={() => setTab(1)} />
            </TabPanel>
            <TabPanel px={0} pt={5}>
              <AnalyzerPanel
                project={project}
                request={request}
                onRequest={setRequest}
                analysis={analysis}
                model={effectiveModel}
                onAnalysis={onAnalysis}
                onNext={() => setTab(2)}
              />
            </TabPanel>
            <TabPanel px={0} pt={5}>
              <EvidencePanel
                project={project}
                request={request}
                analysis={analysis}
                replies={replies}
                onNext={() => setTab(3)}
              />
            </TabPanel>
            <TabPanel px={0} pt={5}>
              <ResponsePanel
                project={project}
                request={request}
                analysis={analysis}
                model={effectiveModel}
                replies={replies}
                onReplies={setReplies}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
}
