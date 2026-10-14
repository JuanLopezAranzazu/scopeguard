import { useState } from "react";
import {
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Plus, X } from "lucide-react";

export function ListEditor({
  label,
  help,
  placeholder,
  items,
  onChange,
}: {
  label: string;
  help?: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft("");
  };
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      {help && (
        <FormHelperText mt={0} mb={2} color="muted">
          {help}
        </FormHelperText>
      )}
      {items.length > 0 && (
        <VStack align="stretch" spacing={1} mb={2}>
          {items.map((it, i) => (
            <HStack
              key={`${it}-${i}`}
              border="1px solid"
              borderColor="line"
              borderRadius="sm"
              pl={3}
              pr={1}
              py={1}
              bg="paper"
              alignItems="center"
            >
              <Text flex={1} fontSize="sm" minW={0}>
                {it}
              </Text>
              <IconButton
                aria-label={`Remove: ${it}`}
                icon={<X size={14} />}
                size="sm"
                variant="ghost"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
              />
            </HStack>
          ))}
        </VStack>
      )}
      <HStack>
        <Input
          minW={0}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <IconButton
          aria-label={`Add to ${label}`}
          icon={<Plus size={16} />}
          onClick={add}
          variant="outline"
        />
      </HStack>
    </FormControl>
  );
}
