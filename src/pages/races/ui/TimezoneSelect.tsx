import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';

type TimezoneSelectProps = {
  value: string;
  handleChange: (event: SelectChangeEvent<string>) => void;
};

const OPTIONS = [
  'UTC',
  'Europe/Zurich',
  'Europe/London',
  'Africa/Sao_Tome',
  'America/Bogota',
  'America/Los_Angeles',
  'America/New_York',
];

const TimezoneSelect = ({ value, handleChange }: TimezoneSelectProps) => {
  return (
    <FormControl sx={{ minWidth: 260 }}>
      <InputLabel id="timezone-select-label">Timezone</InputLabel>
      <Select
        labelId="timezone-select-label"
        id="timezone-select"
        value={value}
        label="Timezone"
        onChange={handleChange}
      >
        {OPTIONS.map((e) => (
          <MenuItem key={e} value={e}>
            {e}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TimezoneSelect;
