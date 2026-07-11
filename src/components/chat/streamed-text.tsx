/**
 * ChatGPT-style reveal. Each word is a keyed span with a mount animation:
 * as the streamed text grows, React keeps the already-rendered spans (stable
 * keys) and mounts only the new ones — so only the words that just arrived
 * animate in. No state, no refs.
 */
export function StreamedText({ text }: { text: string }) {
  // Alternating word / whitespace tokens; spaces stay plain text nodes so
  // the inline-block animation never eats the spacing.
  const tokens = text.split(/(\s+)/);

  return (
    <>
      {tokens.map((token, i) =>
        /^\s+$/.test(token) ? (
          token
        ) : (
          <span key={i} className="word-in">
            {token}
          </span>
        ),
      )}
    </>
  );
}
