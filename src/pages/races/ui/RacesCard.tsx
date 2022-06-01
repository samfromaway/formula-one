import {
  Box,
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Grid,
} from '@mui/material';
import Image from 'next/image';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/system';
import PublicIcon from '@mui/icons-material/Public';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
  formatDateFromISOString,
  formatTimeFromISOString,
} from '@/utils/dates';
import { RaceEvent, RaceStatus } from '../lib/getRaces';
import { styled } from '@mui/material/styles';

type RacesCardProps = {
  round: number;
  dateRange: string;
  country: string;
  circuit: string;
  img: string;
  timezone: string;
  events: RaceEvent[];
  status: RaceStatus;
  isNext: boolean;
  isUserTime: boolean;
  expandedByDefault?: boolean;
};

const makeBorderGradient = (color: string) =>
  `linear-gradient(to left, ${color}, transparent)`;

const RaceCardBorder = styled(Box)(({ theme }) => ({
  background: makeBorderGradient(theme.palette.text.primary),
  padding: '4px',
  borderRadius: 12,
  // transition: theme.transitions.create(['box-shadow']),
  // '&:hover': {},
  // '&:focus': {},
}));

const RaceCard = styled(Box)(({ theme }) => ({}));

const RaceCardContent = styled(Box)(({ theme }) => ({
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(3),
}));

const accordionStyle = {
  padding: 0,
  marginRight: -3, // to offset RaceCardContent padding
  marginLeft: -2, // to offset RaceCardContent padding
  boxShadow: 'none',
  '&:before': {
    display: 'none',
  },
};

const DARK_MODE_GRADIENT = 'linear-gradient(140deg, #ffffff 30%, #e85858 100%)';
const BASE_GRADIENT = 'linear-gradient(140deg, #ffffff34 30%, #dc7a7a 100%)';

export default function RacesCard({
  round,
  dateRange,
  country,
  circuit,
  img,
  timezone,
  events,
  status,
  isNext,
  isUserTime,
  expandedByDefault,
}: RacesCardProps) {
  const { palette } = useTheme();
  const isCompleted = status === 'Completed';
  const background = isCompleted ? '0.6' : undefined;

  return (
    <RaceCard>
      <Typography
        sx={{ paddingLeft: 2 }}
        gutterBottom
        fontWeight="700"
        fontSize="1.25rem"
      >
        Round: {round}
      </Typography>
      <RaceCardBorder
        sx={{
          background: isNext
            ? makeBorderGradient(palette.primary.main)
            : undefined,
        }}
      >
        <RaceCardContent sx={{ opacity: background }}>
          <Grid container spacing={2}>
            <Grid item xs={12} display="flex">
              <PublicIcon sx={{ marginRight: 2 }} />
              <Typography fontSize="1.125rem">{country}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Accordion
                disableGutters
                sx={accordionStyle}
                defaultExpanded={expandedByDefault}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <AccessTimeIcon sx={{ marginRight: 2 }} />
                  <Typography fontSize="1.125rem">
                    {dateRange} ({timezone})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1}>
                    {events.map((e) => (
                      <Grid container item key={e.type} xs={12}>
                        <Grid item xs={5}>
                          <Typography color="text.secondary" flex={1}>
                            {e.type}:
                          </Typography>
                        </Grid>
                        <Grid item xs={7}>
                          <Typography>
                            {formatDateFromISOString(e.date, isUserTime)}
                            {' - '}
                            {formatTimeFromISOString(e.date, isUserTime)}
                          </Typography>
                        </Grid>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {!isCompleted && (
              <Grid item xs={12}>
                <Typography gutterBottom>{circuit}</Typography>
                <Box
                  sx={{
                    background:
                      palette.mode === 'dark'
                        ? DARK_MODE_GRADIENT
                        : BASE_GRADIENT,
                  }}
                >
                  <Image
                    src={img}
                    height="50px"
                    width="100%"
                    alt={circuit}
                    layout="responsive"
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </RaceCardContent>
      </RaceCardBorder>
    </RaceCard>
  );
}
