export type ParsedArgs = {
  command: string;
  positionals: string[];
  flags: Map<string, string | boolean>;
};

export function parseArgs(argv = process.argv.slice(2)): ParsedArgs {
  const [command = "help", ...rest] = argv;
  const positionals: string[] = [];
  const flags = new Map<string, string | boolean>();

  for (let i = 0; i < rest.length; i += 1) {
    const item = rest[i];
    if (item.startsWith("--")) {
      const [key, inline] = item.slice(2).split("=", 2);
      if (inline !== undefined) flags.set(key, inline);
      else if (rest[i + 1] && !rest[i + 1].startsWith("-")) flags.set(key, rest[++i]);
      else flags.set(key, true);
    } else if (item.startsWith("-") && item.length > 1) {
      const key = item.slice(1);
      if (rest[i + 1] && !rest[i + 1].startsWith("-")) flags.set(key, rest[++i]);
      else flags.set(key, true);
    } else {
      positionals.push(item);
    }
  }

  return { command, positionals, flags };
}

export function hasJson(flags: Map<string, string | boolean>) {
  return flags.has("json");
}

export function flagValue(flags: Map<string, string | boolean>, names: string[], fallback?: string) {
  for (const name of names) {
    const value = flags.get(name);
    if (typeof value === "string") return value;
  }
  return fallback;
}
