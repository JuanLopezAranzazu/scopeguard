import {
  Box,
  Container,
  Flex,
  HStack,
  Icon,
  Select,
  Text,
} from "@chakra-ui/react";
import { ShieldCheck } from "lucide-react";
import type { Health } from "../types";

export function Header({
  health,
  model,
  onModel,
}: {
  health: Health | null;
  model: string;
  onModel: (m: string) => void;
}) {
  const online = !!health?.ollama;
  const models = health?.models ?? [];
  const current = model || health?.default_model || "";
  const options =
    models.includes(current) || !current ? models : [current, ...models];

  return (
    <Box bg="brand.700" color="white">
      <Container maxW="6xl" px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }}>
        <Flex
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={{ base: 3, md: 4 }}
        >
          <HStack spacing={3}>
            <Icon as={ShieldCheck} boxSize={7} />
            <Box>
              <Text
                fontFamily="heading"
                fontWeight={600}
                fontSize="xl"
                lineHeight={1.1}
              >
                ScopeGuard
              </Text>
              <Text fontSize={{ base: "xs", md: "sm" }} color="brand.100">
                Protect your time. Keep projects on track.
              </Text>
            </Box>
          </HStack>

          <Flex
            direction={{ base: "column", sm: "row" }}
            align={{ base: "stretch", sm: "center" }}
            gap={3}
            minW={{ base: "100%", md: "340px" }}
          >
            <HStack spacing={2} flexShrink={0}>
              <Box
                boxSize="8px"
                borderRadius="full"
                flexShrink={0}
                bg={online ? "#4ADE80" : "#F87171"}
                aria-hidden
              />
              <Text fontSize="sm" color="brand.100">
                {online ? "Ollama connected" : "Ollama offline"}
              </Text>
            </HStack>

            <Box flex="1" minW={0}>
              <Select
                value={current}
                onChange={(e) => onModel(e.target.value)}
                aria-label="Select AI model"
                isDisabled={!online || models.length === 0}
                placeholder={!online ? "Ollama unavailable" : "Select a model"}
                bg="white"
                color="ink"
                borderColor="line"
              >
                {options.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </Box>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
