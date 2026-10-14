import { Box, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { Check, Globe, Palette, ShoppingBag } from "lucide-react";
import { samples, type Sample } from "../samples";

const icons: Record<string, typeof Globe> = {
  web: Globe,
  brand: Palette,
  inscope: ShoppingBag,
};

export function ExampleCards({
  loadedId,
  onLoad,
}: {
  loadedId: string | null;
  onLoad: (s: Sample) => void;
}) {
  return (
    <Box as="section" aria-labelledby="examples-title" mb={5}>
      <Flex align="baseline" justify="space-between" gap={3} mb={2}>
        <Heading id="examples-title" as="h2" size="sm" fontFamily="heading">
          Try an example
        </Heading>
        <Text fontSize="xs" color="muted">
          Loads a project and a client message
        </Text>
      </Flex>

      <Box
        display={{ base: "flex", md: "grid" }}
        gridTemplateColumns={{ md: "repeat(3, 1fr)" }}
        gap={3}
        overflowX={{ base: "auto", md: "visible" }}
        sx={{ scrollSnapType: "x mandatory", scrollbarWidth: "thin" }}
        pb={{ base: 2, md: 0 }}
      >
        {samples.map((s) => {
          const active = loadedId === s.id;
          return (
            <Box
              key={s.id}
              as="button"
              type="button"
              onClick={() => onLoad(s)}
              aria-pressed={active}
              textAlign="left"
              flex={{ base: "0 0 78%", sm: "0 0 55%", md: "initial" }}
              sx={{ scrollSnapAlign: "start" }}
              bg={active ? "brand.50" : "white"}
              border="1px solid"
              borderColor={active ? "brand.500" : "line"}
              borderRadius="md"
              p={4}
              transition="border-color 0.15s, background 0.15s"
              _hover={{ borderColor: "brand.500" }}
              _focusVisible={{ boxShadow: "outline", outline: "none" }}
            >
              <Flex align="center" gap={2} mb={1} color="brand.600">
                <Icon as={icons[s.id] ?? Globe} boxSize={4} />
                <Text
                  as="span"
                  fontFamily="heading"
                  fontWeight={600}
                  fontSize="md"
                  color="ink"
                  flex={1}
                >
                  {s.title}
                </Text>
                {active && <Icon as={Check} boxSize={4} aria-label="Loaded" />}
              </Flex>
              <Text fontSize="sm" color="muted" mb={3}>
                {s.blurb}
              </Text>
              <Text fontSize="xs" fontWeight={600} color="brand.600">
                {s.tests}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
