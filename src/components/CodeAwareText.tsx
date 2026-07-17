import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type Segment = { type: 'text'; content: string } | { type: 'code'; content: string; lang: string };

function splitCodeSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  const fenceRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fenceRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'code', content: match[2], lang: match[1] });
    lastIndex = fenceRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }
  return segments;
}

/** Renders text that may contain fenced code blocks (e.g. a model answer) with monospace formatting. */
export function CodeAwareText({ text }: { text: string }) {
  const segments = splitCodeSegments(text);

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'code') {
          return (
            <Box
              key={index}
              component="pre"
              sx={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                bgcolor: 'background.default',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                overflowX: 'auto',
                my: 1.5,
              }}
            >
              <code>{segment.content}</code>
            </Box>
          );
        }

        const trimmed = segment.content.trim();
        if (!trimmed) {
          return null;
        }
        return (
          <Typography key={index} variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
            {trimmed}
          </Typography>
        );
      })}
    </>
  );
}
