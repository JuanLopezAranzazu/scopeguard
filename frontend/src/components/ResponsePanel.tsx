import { useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Sparkles } from "lucide-react";
import { respond } from "../api";
import type { Analysis, Approach, Project, Replies, Tone } from "../types";
import { CopyButton } from "./CopyButton";
import { Surface } from "./Surface";

const approaches: { id: Approach; label: string; blurb: string }[] = [
  {
    id: "negotiate",
    label: "Negotiate",
    blurb: "Proposes including it as additional paid work.",
  },
  {
    id: "clarify",
    label: "Clarify",
    blurb: "Asks concrete questions before you commit.",
  },
  {
    id: "decline",
    label: "Decline",
    blurb: "Declines politely and offers a future phase.",
  },
];

export function ResponsePanel({
  project,
  request,
  analysis,
  model,
  replies,
  onReplies,
}: {
  project: Project;
  request: string;
  analysis: Analysis | null;
  model: string;
  replies: Replies;
  onReplies: (r: Replies) => void;
}) {
  const [tone, setTone] = useState<Tone>("friendly");
  const [loading, setLoading] = useState<Approach | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!analysis) {
    return (
      <Surface>
        <Heading size="md" fontFamily="heading">
          Reply
        </Heading>
        <Text color="muted" mt={2}>
          Analyze a request first so a reply can be drafted.
        </Text>
      </Surface>
    );
  }

  const generate = async (approach: Approach) => {
    setLoading(approach);
    setError(null);
    try {
      const r = await respond(project, request, analysis, approach, tone, model);
      onReplies({ ...replies, [approach]: r });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(null);
    }
  };

  const edit = (approach: Approach, patch: { subject?: string; body?: string }) => {
    const cur = replies[approach];
    if (cur) onReplies({ ...replies, [approach]: { ...cur, ...patch } });
  };

  const suggested: Approach =
    analysis.verdict === "partial" || analysis.verdict === "out_of_scope"
      ? "negotiate"
      : "clarify";

  return (
    <Surface>
      <Flex justify="space-between" align={{ base: "stretch", md: "flex-end" }} direction={{ base: "column", md: "row" }} gap={4} mb={4}>
        <div>
          <Heading size="md" fontFamily="heading">
            Reply to the client
          </Heading>
          <Text color="muted" fontSize="sm" mt={1}>
            Generate each approach, edit it and copy it.
          </Text>
        </div>
        <FormControl w={{ base: "100%", md: "200px" }}>
          <FormLabel>Tone</FormLabel>
          <Select value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
            <option value="friendly">Friendly</option>
            <option value="formal">Formal</option>
            <option value="firm">Firm</option>
          </Select>
        </FormControl>
      </Flex>

      <Tabs variant="line" isFitted isLazy={false} defaultIndex={approaches.findIndex((a) => a.id === suggested)}>
        <TabList>
          {approaches.map((a) => (
            <Tab key={a.id}>{a.label}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {approaches.map((a) => {
            const r = replies[a.id];
            return (
              <TabPanel key={a.id} px={0} pt={5}>
                <Text color="muted" fontSize="sm" mb={4}>
                  {a.blurb}
                  {a.id === suggested && " This is the approach that best fits this analysis."}
                </Text>

                <Button
                  w={{ base: "100%", md: "auto" }}
                  leftIcon={<Sparkles size={16} />}
                  onClick={() => generate(a.id)}
                  isLoading={loading === a.id}
                  loadingText="Drafting"
                  isDisabled={loading !== null && loading !== a.id}
                  variant={r ? "outline" : "solid"}
                >
                  {r ? "Generate another version" : "Generate reply"}
                </Button>

                {r && (
                  <Box mt={5}>
                    <FormControl mb={3}>
                      <FormLabel>Subject</FormLabel>
                      <Flex gap={2} direction={{ base: "column", sm: "row" }}>
                        <Input
                          minW={0}
                          value={r.subject}
                          onChange={(e) => edit(a.id, { subject: e.target.value })}
                        />
                        <CopyButton text={r.subject} w={{ base: "100%", sm: "auto" }} />
                      </Flex>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Message</FormLabel>
                      <Textarea
                        value={r.body}
                        onChange={(e) => edit(a.id, { body: e.target.value })}
                        rows={11}
                        lineHeight={1.6}
                      />
                    </FormControl>
                    <Flex justify="space-between" align={{ base: "stretch", md: "center" }} direction={{ base: "column-reverse", md: "row" }} mt={3} gap={3}>
                      <Text fontSize="xs" color="muted">
                        Drafted by {r.model}. Review it before sending.
                      </Text>
                      <CopyButton
                        text={`Subject: ${r.subject}\n\n${r.body}`}
                        label="Copy full message"
                        variant="solid"
                        w={{ base: "100%", md: "auto" }}
                      />
                    </Flex>
                  </Box>
                )}
              </TabPanel>
            );
          })}
        </TabPanels>
      </Tabs>

      {error && (
        <Alert status="error" mt={4} borderRadius="sm" alignItems="flex-start">
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </Surface>
  );
}
