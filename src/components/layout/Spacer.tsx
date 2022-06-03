import { Box, BoxProps } from '@mui/material';

type SpacerProps = { space: BoxProps['p'] };

export default function Spacer({ space }: SpacerProps) {
  return <Box p={space} />;
}
