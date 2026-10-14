import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  List,
  ListIcon,
  ListItem,
  Stack,
  Text,
} from "@chakra-ui/react";
import { AlertTriangle, BadgeCheck, FileJson, FileText, MessageSquareText } from "lucide-react";
import { download, slug, toMarkdown } from "../export";
import type { Analysis, Project, Replies } from "../types";
import { CopyButton } from "./CopyButton";
import { Surface } from "./Surface";
import { statusMeta } from "./status";

export function EvidencePanel({
  project,
  request,
  analysis,
  replies,
  onNext,
}: {
  project: Project;
  request: string;
  analysis: Analysis | null;
  replies: Replies;
  onNext: () => void;
}) {
  if (!analysis) {
    return (
      <Surface>
        <Heading size="md" fontFamily="heading">
          Evidence & gaps
        </Heading>
        <Text color="muted" mt={2}>
          No analysis yet. Paste a client request and press
          “Analyze request”.
        </Text>
      </Surface>
    );
  }

  const md = toMarkdown(project, request, analysis, replies);
  const base = `scopeguard-${slug(project.name)}`;

  return (
    <Stack spacing={5}>
      <Surface>
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap={4} mb={4}>
          <div>
            <Heading size="md" fontFamily="heading">
              Evidence
            </Heading>
            <Text color="muted" fontSize="sm" mt={1} maxW="60ch">
              Every quote is checked against the text of your agreement. If the model
              makes up a phrase, it is flagged as unverified.
            </Text>
          </div>
          <Flex gap={2} wrap="wrap">
            <CopyButton text={md} label="Copy" />
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FileText size={14} />}
              onClick={() => download(`${base}.md`, md, "text/markdown")}
            >
              Markdown
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FileJson size={14} />}
              onClick={() =>
                download(
                  `${base}.json`,
                  JSON.stringify({ project, request, analysis, replies }, null, 2),
                  "application/json"
                )
              }
            >
              JSON
            </Button>
          </Flex>
        </Flex>

        <Stack spacing={0} divider={<Box borderTop="1px solid" borderColor="line" />}>
          {analysis.items.map((it, i) => {
            const m = statusMeta[it.status];
            return (
              <Box key={i} py={4}>
                <HStack color={m.color} spacing={2} mb={1}>
                  <Icon as={m.Icon} boxSize={4} />
                  <Text fontWeight={600} fontSize="sm">
                    {m.label}
                  </Text>
                </HStack>
                <Text fontWeight={600} fontSize="lg" fontFamily="heading">
                  {it.request_part}
                </Text>
                {it.reason && <Text mt={1}>{it.reason}</Text>}

                {it.evidence && (
                  <Box mt={3} pl={4} borderLeft="3px solid" borderColor="line">
                    <Text fontSize="xs" color="muted" mb={1}>
                      Quote from the agreement
                    </Text>
                    <Text>
                      <Box as="mark" bg="mark" color="ink" px={1}>
                        {it.evidence}
                      </Box>
                    </Text>
                    <HStack
                      mt={1}
                      spacing={1}
                      fontSize="xs"
                      color={it.evidence_verified ? "verdict.in" : "verdict.partial"}
                    >
                      <Icon
                        as={it.evidence_verified ? BadgeCheck : AlertTriangle}
                        boxSize={3.5}
                      />
                      <Text>
                        {it.evidence_verified
                          ? "Quote verified in the agreement"
                          : "Unverified quote: not found in the agreement"}
                      </Text>
                    </HStack>
                  </Box>
                )}
                {it.downgraded && (
                  <Text mt={3} fontSize="sm" color="verdict.partial">
                    The model marked it as included but could not back it with a
                    real quote, so it was downgraded to ambiguous.
                  </Text>
                )}
              </Box>
            );
          })}
        </Stack>
      </Surface>

      <Surface>
        <Heading size="sm" fontFamily="heading" mb={3}>
          What still needs clarifying
        </Heading>
        {analysis.gaps.length === 0 ? (
          <Text color="muted">The agreement covers what is needed to decide.</Text>
        ) : (
          <List spacing={2}>
            {analysis.gaps.map((g, i) => (
              <ListItem key={i} display="flex">
                <ListIcon as={AlertTriangle} color="verdict.ambiguous" mt={1} />
                <Text>{g}</Text>
              </ListItem>
            ))}
          </List>
        )}
        <Flex justify="flex-end" mt={5}>
          <Button w={{ base: "100%", md: "auto" }} leftIcon={<MessageSquareText size={16} />} onClick={onNext}>
            Draft reply
          </Button>
        </Flex>
      </Surface>
    </Stack>
  );
}
