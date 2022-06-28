import type { NextPage } from 'next';
import { Grid, InputBase, Theme } from '@mui/material';
import { styled } from '@mui/material/styles';

// docs: https://mui.com/system/basics/#the-sx-prop

export const StyledBox = styled(Grid)({
  // root selector (.MuiBox-root)
  background: 'red',

  '&': {
    // '&' points to the root selector which is the same as the above (.MuiBox-root)
    background: 'red',
  },
  '&&': {
    // also a root selector but with higher CSS specificity (.MuiBox-root.MuiBox-root)
    background: 'red',
  },
  '& .ChildSelector': {
    // child selector (.MuiBox-root .ChildSelector)
    background: 'orange',

    // this '&' points to the current selector which is '.MuiBox-root .ChildSelector'
    '& .NestedChildSelector': {
      // nested child selector (.MuiBox-root .ChildSelector .NestedChildSelector) (#1)
      background: 'yellow',
    },
  },
  '& .ChildSelector .NestedChildSelector': {
    // same as (#1) (.MuiBox-root .ChildSelector .NestedChildSelector)
    background: 'yellow',
  },
});

const StyledInput = styled(InputBase)(({ theme }) => ({
  color: 'blue',
  'label + &': {
    marginTop: theme.spacing(3),
  },
  '& .MuiInputBase-input': {
    borderRadius: '24px',
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '10px 26px 10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"'].join(','),
    '&:focus': {
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
    },
  },
}));

const sxStyle = {
  color: 'blue',
  'label + &': {
    marginTop: 3,
  },
  '& .MuiInputBase-input': {
    borderRadius: 6,
    position: 'relative',
    backgroundColor: 'background.paper',
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '10px 26px 10px 12px',
    transition: (theme: Theme) =>
      theme.transitions.create(['border-color', 'box-shadow']),
    fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"'].join(','),
    '&:focus': {
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
    },
  },
};

const MuiCustomPage: NextPage = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <InputBase placeholder="no customization" />
      </Grid>
      <Grid item xs={12}>
        <StyledInput placeholder="styled" />
      </Grid>
      <Grid item xs={12}>
        <InputBase sx={sxStyle} placeholder="sx style" />
      </Grid>
    </Grid>
  );
};

export default MuiCustomPage;
