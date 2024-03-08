// Bad words
const badWords = ["fag", "fuck", "nigg"]

function containsBadWord(name) {
  // Remove all non-alphabetic characters
  const onlyLetters = name.replace(/[^a-zA-Z]/g, "").toLowerCase()

  // Create a regex expression using the badWords array
  const regex = new RegExp(`(${badWords.join("|")})`, "g")

  return regex.test(onlyLetters)
}

export default containsBadWord
