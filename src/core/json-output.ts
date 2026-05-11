export function printJson(value: unknown) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

export function printTextLines(lines: string[]) {
  process.stdout.write(`${lines.join("\n")}\n`);
}
