import type { NextPage } from 'next';
import { Box, Grid, Typography } from '@mui/material';
import { DynamicGrid } from '@/components/ui';

const FlexGrid = () => {
  return (
    <Box display="flex">
      <Box
        bgcolor="primary.main"
        color="white"
        width="100%"
        height="100%"
        m="20px"
      >
        Box
      </Box>
      <Box
        bgcolor="primary.main"
        color="white"
        width="100%"
        height="100%"
        m="20px"
      >
        Box
      </Box>
    </Box>
  );
};

const SimpleGrid = () => {
  return (
    <Grid
      container
      spacing="20px"
      // rowSpacing="20px"
      // columnSpacing="20px"
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
    <Grid container spacing="20px">
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
      <Box bgcolor="gray" color="white">
        Full Width Box
      </Box>
      <FlexGrid />
      <Box p={2} />
      <Typography variant="h5">SimpleGrid</Typography>
      <SimpleGrid />
      <Box p={2} />
      <Typography variant="h5">MappedGrid</Typography>
      <MappedGrid />
      <Box p={2} />
      <Typography variant="h5">DynamicGrid</Typography>
      <DynamicGrid
        maxColumns={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}
        spacing="20px"
      >
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
