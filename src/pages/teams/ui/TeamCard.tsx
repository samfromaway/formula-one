import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';
import Image from 'next/image';

type TeamCardProps = { img: string; name: string };

export default function TeamCard({ img, name }: TeamCardProps) {
  return (
    <Card>
      <Box bgcolor="white">
        <Image
          src={img}
          layout="responsive"
          height="60px"
          width="100%"
          alt={name}
          objectFit="contain"
        />
      </Box>
      <CardContent>
        <Typography>{name}</Typography>
      </CardContent>
    </Card>
  );
}
