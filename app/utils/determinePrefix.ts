export const determinePrefix = (arr: string[]) => {
  const charList: string[] = [];

  console.log(arr.length);

  const [shortestString, ...stringList] = [...arr].sort(
    (a, b) => a.length - b.length
  );

  const shortestCharacters = shortestString.split("");

  for (let i = 0; i < shortestCharacters.length; i++) {
    const char = shortestCharacters[i];
    const isValid = stringList.every((str) => str.charAt(i) === char);

    if (isValid) {
      charList.push(char);
    }
  }

  return charList.join("");
};
