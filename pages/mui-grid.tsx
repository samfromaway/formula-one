import type { NextPage } from 'next';
import { Box, Grid, Typography } from '@mui/material';
import { DynamicGrid } from '@/components/ui';

const SimpleGrid = () => {
  return (
    <Grid
      container
      spacing={3}
      // rowSpacing={1}
      // columnSpacing={1}
    >
      <Grid item xs={12} md={6}>
        <Box bgcolor="primary.main" color="white">
          Box
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box bgcolor="primary.main" color="white">
          Box
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box bgcolor="primary.main" color="white">
          Box
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box bgcolor="primary.main" color="white">
          Box
        </Box>
      </Grid>
    </Grid>
  );
};

const items = [
  { id: 1, name: 'Box' },
  { id: 2, name: 'Box' },
  { id: 3, name: 'Box' },
  { id: 4, name: 'Box' },
];

const MappedGrid = () => {
  return (
    <Grid container spacing={3}>
      {items.map((e) => (
        <Grid key={e.id} item xs={12} md={6}>
          <Box bgcolor="primary.main" color="white">
            {e.name}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

const MuiGridPage: NextPage = () => {
  return (
    <>
      <Typography variant="h5">SimpleGrid</Typography>
      <SimpleGrid />
      <Box p={2} />
      <Typography variant="h5">MappedGrid</Typography>
      <MappedGrid />
      <Box p={2} />
      <Typography variant="h5">DynamicGrid</Typography>
      <DynamicGrid maxColumns={{ xs: 1, sm: 1, md: 2, lg: 2 }} spacing={3}>
        {items.map((e) => (
          <Box key={e.id} bgcolor="primary.main" color="white">
            {e.name}
          </Box>
        ))}
      </DynamicGrid>
    </>
  );
};

export default MuiGridPage;
