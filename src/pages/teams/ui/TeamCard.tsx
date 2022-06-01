import { Card, CardContent, CardMedia, Typography } from '@mui/material';

type TeamCardProps = { img: string; name: string };

export default function TeamCard({ img, name }: TeamCardProps) {
  return (
    <Card>
      <CardMedia
        component="img"
        height="80px"
        image={img}
        alt={name}
        sx={{ backgroundColor: 'white' }}
      />
      <CardContent>
        <Typography component="div">{name}</Typography>
      </CardContent>
    </Card>
  );
}
