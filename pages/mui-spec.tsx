import type { NextPage } from 'next';
import { Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledBox = styled(Box)(() => ({
  backgroundColor: 'green',
}));

const sxStyle = {
  backgroundColor: 'red',
};

const inlineStyle = {
  backgroundColor: 'blue',
};

const MuiSpecificityPage: NextPage = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <StyledBox
          height="300px"
          width="300px"
          bgcolor="orange"
          placeholder="styled"
          sx={sxStyle}
          style={inlineStyle}
        />
      </Grid>
    </Grid>
  );
};

export default MuiSpecificityPage;
