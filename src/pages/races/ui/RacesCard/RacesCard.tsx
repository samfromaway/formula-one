import { Box, Typography, Grid } from '@mui/material';
import Image from 'next/image';
import { useTheme } from '@mui/system';
import PublicIcon from '@mui/icons-material/Public';
import { RaceEvent, RaceStatus } from '../../lib/getRaces';
import { styled } from '@mui/material/styles';
import RacesCardDates from './RacesCardDates';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import { Spacer } from '@/components/layout';

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
}));

const RaceCard = styled(Box)(({ theme }) => ({ position: 'relative' }));

const RaceCardContent = styled(Box)(({ theme }) => ({
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(3),
  paddingLeft: theme.spacing(1),
}));

const BACKGROUND_IMG = 'url("/grid.svg")';

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
          <Grid container spacing={1}>
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
                  isUserTime={isUserTime}
                  expandedByDefault={expandedByDefault}
                />
              </Grid>
            )}

            {!isCompleted && (
              <Grid item xs={12}>
                <Typography gutterBottom>{circuit}</Typography>
                <Box position="relative" borderRadius={2}>
                  <Box
                    borderRadius={2}
                    height="100%"
                    width="100%"
                    sx={{
                      backgroundImage:
                        'linear-gradient(to right, #d5ab63 , #952626)',
                    }}
                    position="absolute"
                  />
                  <Box
                    borderRadius={2}
                    height="100%"
                    width="100%"
                    position="absolute"
                    sx={{
                      backgroundImage: BACKGROUND_IMG,
                      borderRadius: 2,
                    }}
                    //  bgcolor={palette.mode === 'dark' ? '#ffffffcc' : '#f4f4f4cc'} DOES WORK
                    // backgroundImage={BACKGROUND_IMG} DOES NOT WORK
                    // borderRadius={2} DOES NOT WORK
                  />
                  <Image
                    src={img}
                    height="40px"
                    width="100%"
                    alt={circuit}
                    layout="responsive"
                    objectFit="contain"
                  />
                </Box>
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
