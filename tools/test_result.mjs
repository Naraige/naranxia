const failure = /^Traceback|^EXC|FIRST DIVERGENCE|"ds"\s*:\s*true/m;

function errorListsAreEmpty(line) {
  let rest = line.slice(4).trim();
  let lists = 0;
  while (rest.startsWith("[]")) {
    lists++;
    rest = rest.slice(2).trimStart();
  }
  return lists > 0 && rest === "";
}

function outputIsClean(output) {
  if (failure.test(output)) return false;
  return output.split(/\r?\n/).every((line) => !/^ERRS(?:\s|$)/.test(line) || errorListsAreEmpty(line));
}

export function testPassed(code, timedOut, output, passPattern) {
  if (timedOut || code !== 0 || !outputIsClean(output)) return false;
  passPattern.lastIndex = 0;
  return passPattern.test(output);
}
