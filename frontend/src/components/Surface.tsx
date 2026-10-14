import { Box, type BoxProps } from "@chakra-ui/react";

export function Surface(props: BoxProps) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="line"
      borderRadius="md"
      p={{ base: 4, md: 6 }}
      {...props}
    />
  );
}
