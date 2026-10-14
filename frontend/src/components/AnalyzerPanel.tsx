import { useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Tag,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { ArrowRight, ScanSearch } from "lucide-react";
import { analyze } from "../api";
import type { Analysis, Project } from "../types";
import { Surface } from "./Surface";
import { verdictMeta } from "./status";

export function VerdictStamp({ analysis }: { analysis: Analysis }) {
  const v = verdictMeta[analysis.verdict];
  return (
    <Box
      role="status"
      display="inline-block"
      color={v.color}
      border="3px double"
      borderColor={v.color}
      borderRadius="sm"
      px={{ base: 4, md: 5 }}
      py={2}
      transform="rotate(-2deg)"
      bg="white"
    >
      <Text fontFamily="heading" fontWeight={600} fontSize={{ base: "xl", md: "2xl" }} lineHeight={1.2} textAlign="center">
        {v.label}
      </Text>
    </Box>
  );
}

export function AnalyzerPanel({
  project,
  request,
  onRequest,
  analysis,
  model,
  onAnalysis,
  onNext,
}: {
  project: Project;
  request: string;
  onRequest: (s: string) => void;
  analysis: Analysis | null;
  model: string;
  onAnalysis: (a: Analysis) => void;
  onNext: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      onAnalysis(await analyze(project, request, model));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const counts = analysis
    ? {
        in: analysis.items.filter((i) => i.status === "in").length,
        out: analysis.items.filter((i) => i.status === "out").length,
        ambiguous: analysis.items.filter((i) => i.status === "ambiguous").length,
      }
    : null;

  return (
    <Surface>
      <Heading size="md" fontFamily="heading">
        Client request
      </Heading>
      <Text color="muted" fontSize="sm" mt={1} mb={4} maxW="60ch">
        Paste the message as it arrived. It is split into individual requests and
        each one is compared with your agreement.
      </Text>

      <Textarea
        value={request}
        onChange={(e) => onRequest(e.target.value)}
        rows={8}
        placeholder="Hi, could you also add…?"
        aria-label="Client message"
      />

      <Flex mt={4} gap={3} align={{ base: "stretch", md: "center" }} direction={{ base: "column", md: "row" }}>
        <Button
          w={{ base: "100%", md: "auto" }}
          leftIcon={<ScanSearch size={16} />}
          onClick={run}
          isLoading={loading}
          loadingText={`Analyzing with ${model || "the local model"}`}
          isDisabled={!request.trim()}
        >
          Analyze request
        </Button>
        {loading && (
          <Text fontSize="sm" color="muted">
            The model runs on your machine, so this can take a few seconds.
          </Text>
        )}
      </Flex>

      {error && (
        <Alert status="error" mt={4} borderRadius="sm" alignItems="flex-start">
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysis && counts && !loading && (
        <Box mt={8} pt={6} borderTop="1px solid" borderColor="line">
          <Flex gap={{ base: 5, md: 6 }} align={{ base: "stretch", md: "center" }} direction={{ base: "column", md: "row" }}>
            <Box alignSelf={{ base: "center", md: "auto" }} py={1}>
              <VerdictStamp analysis={analysis} />
            </Box>
            <Box flex={1} minW={0}>
              <Text>{verdictMeta[analysis.verdict].hint}</Text>
              <HStack mt={2} spacing={2} wrap="wrap">
                {counts.in > 0 && <Tag colorScheme="green">{counts.in} in scope</Tag>}
                {counts.out > 0 && <Tag colorScheme="red">{counts.out} out of scope</Tag>}
                {counts.ambiguous > 0 && (
                  <Tag colorScheme="yellow">{counts.ambiguous} to clarify</Tag>
                )}
              </HStack>
              <Text fontSize="xs" color="muted" mt={2}>
                {analysis.verified_count} of {analysis.total_items} requests with a
                verified quote. Model {analysis.model}, {analysis.elapsed_s} s.
              </Text>
            </Box>
            <Button
              w={{ base: "100%", md: "auto" }}
              variant="outline"
              rightIcon={<ArrowRight size={16} />}
              onClick={onNext}
            >
              View evidence
            </Button>
          </Flex>
        </Box>
      )}
    </Surface>
  );
}
