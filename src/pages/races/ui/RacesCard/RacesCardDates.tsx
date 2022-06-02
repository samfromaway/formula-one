import {
  formatDateFromISOString,
  formatTimeFromISOString,
} from '@/utils/dates';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { RaceEvent } from '../../lib/getRaces';

type RacesCardDatesProps = {
  dateRange: string;
  timezone: string;
  events: RaceEvent[];
  isUserTime: boolean;
  expandedByDefault?: boolean;
};

const accordionStyle = {
  padding: 0,
  marginRight: -3, // to offset RaceCardContent padding
  marginLeft: -2, // to offset RaceCardContent padding
  boxShadow: 'none',
  '&:before': {
    display: 'none',
  },
};

const defaultProps = {};

const RacesCardDates = ({
  dateRange,
  timezone,
  events,
  isUserTime,
  expandedByDefault,
}: RacesCardDatesProps) => {
  return (
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
  );
};

RacesCardDates.defaultProps = defaultProps;

export default RacesCardDates;
