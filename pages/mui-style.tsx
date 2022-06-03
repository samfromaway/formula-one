import type { NextPage } from 'next';
import { Box, Grid, Theme } from '@mui/material';
import { styled } from '@mui/material/styles';

const sxStyle = {
  fontSize: '2rem',
  backgroundColor: '#f5f5dc',
  width: 200,
  height: 100,
  border: 'solid 10px orange',
  color: ['blue', 'primary.main'],
  paddingLeft: 2,
  '&:hover': { borderColor: 'blue' },
  transition: (theme: Theme) => theme.transitions.create(['border-color']),
};

const StyledBox = styled(Box)(({ theme }) => ({
  fontSize: '2rem',
  backgroundColor: '#f5f5dc',
  width: 200,
  height: 100,
  border: 'solid 10px orange',
  //  color: 'primary.main', does not work
  color: theme.palette.primary.main,
  [theme.breakpoints.down('sm')]: {
    color: 'blue',
  },
  //  paddingLeft: 2, will be in pixel and not reference the theme
  paddingLeft: theme.spacing(2),
  '&:hover': { borderColor: 'blue' },
  transition: theme.transitions.create(['border-color']),
}));

const inlineStyle = {
  fontSize: '2rem',
  backgroundColor: '#f5f5dc',
  width: 200,
  height: 100,
  border: 'solid 10px orange',
  // color: 'primary.main', does not work and no breakpoints possible
  paddingLeft: 2, // will be in pixel and not reference the theme
  // '&:hover': { backgroundColor: 'blue' }, does not work
  // transition: (theme: Theme) => theme.transitions.create(['border-color']), does not work
};

const MuiStylePage: NextPage = () => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Box
          fontSize="2rem"
          bgcolor="#f5f5dc"
          width={200}
          height={100}
          border="solid 10px orange"
          color={['blue', 'primary.main']}
          paddingLeft={2}
          // '&:hover': { backgroundColor: 'blue' }, does not work
          // transition: (theme: Theme) => theme.transitions.create(['border-color']), does not work
        >
          direct
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box sx={sxStyle}>sxStyle</Box>
      </Grid>
      <Grid item xs={12}>
        <StyledBox>AStyledBox</StyledBox>
      </Grid>
      <Grid item xs={12}>
        <Box style={inlineStyle}>inlineStyle</Box>
      </Grid>
    </Grid>
  );
};

export default MuiStylePage;
