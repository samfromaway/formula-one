import { Box, Typography, Grid } from '@mui/material';
import { useTheme } from '@mui/system';
import PublicIcon from '@mui/icons-material/Public';
import { Race } from '../../lib/getRaces';
import { styled } from '@mui/material/styles';
import RacesCardDates from './RacesCardDates';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import { Spacer } from '@/components/layout';

type RacesCardProps = {
  round: string;
  dateRange: string;
  country: string;
  circuit: string;
  timezone: string;
  events: Race['events'];
  isNext: boolean;
  expandedByDefault?: boolean;
};

const makeBorderGradient = (color: string) =>
  `linear-gradient(to left, ${color}, transparent)`;

const RaceCardBorder = styled(Box)(({ theme }) => ({
  background: makeBorderGradient(theme.palette.text.primary),
  padding: '4px',
  borderRadius: 12,
}));

const RaceCard = styled(Box)(({ theme }) => ({ position: 'relative' }));

const RaceCardContent = styled(Box)(({ theme }) => ({
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(3),
  paddingLeft: theme.spacing(1),
}));

export default function RacesCard({
  round,
  dateRange,
  country,
  circuit,
  timezone,
  events,
  isNext,
  expandedByDefault,
}: RacesCardProps) {
  const { palette } = useTheme();
  const isCompleted = status === 'Completed';
  const textColor = isCompleted ? 'text.secondary' : undefined;

  return (
    <RaceCard>
      <Typography
        px={2}
        bgcolor="background.paper"
        gutterBottom
        fontWeight="700"
        fontSize="1.25rem"
        position="absolute"
        top={-13}
        left={-12}
        zIndex={2}
        color={textColor}
      >
        Round: {round}
      </Typography>

      <RaceCardBorder
        sx={{
          background: isNext
            ? makeBorderGradient(palette.primary.main)
            : undefined,
          opacity: isCompleted ? 0.5 : undefined,
        }}
      >
        <RaceCardContent>
          <Spacer space="3px" />
          <Grid container spacing={2}>
            <Grid item xs={12} display="flex" alignItems="center">
              <PublicIcon sx={{ marginRight: 2 }} />
              <Typography fontSize="1.125rem" color={textColor}>
                {country}
              </Typography>
            </Grid>
            {isCompleted && (
              <Grid item xs={12} display="flex" alignItems="center">
                <AccessTimeIcon sx={{ marginRight: 2 }} />
                <Typography fontSize="1.125rem" color={textColor}>
                  {dateRange}
                </Typography>
              </Grid>
            )}
            {!isCompleted && (
              <Grid item xs={12}>
                <RacesCardDates
                  dateRange={dateRange}
                  timezone={timezone}
                  events={events}
                  expandedByDefault={expandedByDefault}
                />
              </Grid>
            )}

            {!isCompleted && (
              <Grid item xs={12}>
                <Typography gutterBottom>{circuit}</Typography>
              </Grid>
            )}
          </Grid>
        </RaceCardContent>
      </RaceCardBorder>
      {isCompleted && (
        <SportsScoreIcon
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2,
            transform: 'rotate(20deg)',
            color: textColor,
          }}
          fontSize="large"
        />
      )}
    </RaceCard>
  );
}
