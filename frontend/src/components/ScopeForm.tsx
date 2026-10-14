import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";
import type { Project } from "../types";
import { ListEditor } from "./ListEditor";
import { Surface } from "./Surface";

export function ScopeForm({
  project,
  onChange,
  onNext,
}: {
  project: Project;
  onChange: (p: Project) => void;
  onNext: () => void;
}) {
  const set = <K extends keyof Project>(k: K, v: Project[K]) =>
    onChange({ ...project, [k]: v });
  const num = (s: string) => (s.trim() === "" ? null : Number(s));
  const ready = project.deliverables.length + project.features.length > 0;

  return (
    <Surface>
      <Stack spacing={{ base: 5, md: 6 }}>
        <div>
          <Heading size="md" fontFamily="heading">
            Agreed scope
          </Heading>
          <Text color="muted" fontSize="sm" mt={1} maxW="60ch">
            Write down what you promised, in the same words as your contract or
            quote. The analysis can only quote what you enter here.
          </Text>
        </div>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <FormControl>
            <FormLabel>Project</FormLabel>
            <Input
              value={project.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Enter project name"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Client</FormLabel>
            <Input
              value={project.client}
              onChange={(e) => set("client", e.target.value)}
              placeholder="Enter client name"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Your name (for the signature)</FormLabel>
            <Input
              value={project.owner}
              onChange={(e) => set("owner", e.target.value)}
              placeholder="Enter your name"
            />
          </FormControl>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <ListEditor
            label="Deliverables"
            help="What you will hand over at the end."
            placeholder="Enter a deliverable"
            items={project.deliverables}
            onChange={(v) => set("deliverables", v)}
          />
          <ListEditor
            label="Features"
            help="What it must be able to do."
            placeholder="Enter a feature"
            items={project.features}
            onChange={(v) => set("features", v)}
          />
        </SimpleGrid>

        <ListEditor
          label="Explicit exclusions"
          help="What you left out in writing. This helps a lot."
          placeholder="Enter an exclusion"
          items={project.exclusions}
          onChange={(v) => set("exclusions", v)}
        />

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <FormControl>
            <FormLabel>Budget</FormLabel>
            <NumberInput min={0} value={project.budget ?? ""} onChange={(s) => set("budget", num(s))}>
              <NumberInputField placeholder="Enter budget" />
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel>Currency</FormLabel>
            <Select value={project.currency} onChange={(e) => set("currency", e.target.value)}>
              {["USD", "EUR", "COP", "MXN", "ARS", "CLP", "PEN"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Hourly rate</FormLabel>
            <NumberInput min={0} value={project.hourly_rate ?? ""} onChange={(s) => set("hourly_rate", num(s))}>
              <NumberInputField placeholder="Enter hourly rate" />
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel>Deadline</FormLabel>
            <Input
              value={project.deadline}
              onChange={(e) => set("deadline", e.target.value)}
              placeholder="Enter deadline"
            />
          </FormControl>
        </SimpleGrid>

        <FormControl>
          <FormLabel>Agreement notes</FormLabel>
          <Textarea
            value={project.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder="Enter any additional notes about the agreement"
          />
        </FormControl>

        <HStack justify="flex-end">
          <Button w={{ base: "100%", md: "auto" }} rightIcon={<ArrowRight size={16} />} onClick={onNext} isDisabled={!ready}>
            Paste client request
          </Button>
        </HStack>
      </Stack>
    </Surface>
  );
}
