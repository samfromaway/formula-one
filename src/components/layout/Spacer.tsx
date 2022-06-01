import { Box } from '@mui/material';

type SpacerProps = { space: number };

export default function Spacer({ space }: SpacerProps) {
  return <Box p={space} />;
}
