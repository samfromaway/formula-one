import { CircularProgress, Typography } from '@mui/material';
import { Box } from '@mui/material';
import Spacer from './Spacer';

type PageFallbackProps = {
  isLoading: boolean;
  errors: string | null;
  children: React.ReactNode;
};

export default function PageFallback({
  isLoading,
  errors,
  children,
}: PageFallbackProps) {
  return (
    <>
      {isLoading && <CircularProgress />}
      {!isLoading && errors && (
        <Box>
          <Typography variant="h4" gutterBottom>
            Error:
          </Typography>
          {JSON.stringify(errors)}
        </Box>
      )}
      <Spacer space={4} />
      {!isLoading && children}
    </>
  );
}
